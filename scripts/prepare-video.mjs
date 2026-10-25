// Build hero loop videos for the theme (dev tool, not part of the theme). Needs ffmpeg on the PATH.
// If ffmpeg is missing it says so and stops; it never installs anything.
//
//   node scripts/prepare-video.mjs --in <image-or-clip> --slug allday [--out build/video] [--seconds 11] [--loop boomerang|crossfade]
//
// Input is either a still photograph (a seamless 10-12 s loop is made from it: slow push-in and drift, warm light shimmer,
// subtle grain, vignette, boomerang loop) or a raw clip (it is conditioned the same way, then looped by a crossfade).
// Outputs in <out>/<slug>/ : <slug>-1080.mp4 (H.264, under 4 MB), <slug>-720.mp4 (under 2 MB), <slug>.webm (VP9, under 3 MB),
// <slug>-poster.jpg (frame 0, 1920 px). Each is re-encoded at a higher CRF until it fits its budget.
// Upload the mp4 to the hero slide's "Video" setting and the poster to "Poster image". Drop in your own clip later and run the
// same command: dropping a clip into a slot is all that is needed.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);
const opt = (name, fallback) => { const i = argv.indexOf(`--${name}`); return i >= 0 ? argv[i + 1] : fallback; };
const input = opt('in');
const slug = opt('slug', 'hero');
const outRoot = opt('out', 'build/video');
const seconds = Number(opt('seconds', 11));
const stillExt = /\.(png|jpe?g|webp|tiff?)$/i;

const probe = spawnSync('ffmpeg', ['-version'], { encoding: 'utf8', shell: process.platform === 'win32' });
if (probe.error || probe.status !== 0) {
  console.error('ffmpeg was not found on the PATH. Install it yourself (for example from https://ffmpeg.org/download.html), then run this again. Nothing was installed or changed.');
  process.exit(2);
}
if (!input || !fs.existsSync(input)) {
  console.error('Pass --in <path to a photograph or a clip>.');
  process.exit(1);
}

const dir = path.join(outRoot, slug);
fs.mkdirSync(dir, { recursive: true });
const isStill = stillExt.test(input);
const loop = opt('loop', isStill ? 'boomerang' : 'crossfade');
const half = seconds / 2;
const fps = 30;

// Conditioning shared by both inputs: warm shimmer (a slow brightness and warmth wave), grain, vignette.
const look = "eq=brightness='0.025*sin(2*PI*t/5.5)':saturation=1.05:eval=frame,noise=alls=5:allf=t,vignette=PI/5";

function chain(height) {
  const scale = `scale=-2:${height},setsar=1`;
  if (isStill) {
    // Slow push-in and drift on an oversized canvas, forward then reversed (boomerang), so the loop has no seam.
    const frames = Math.round(half * fps);
    const zoom = `zoompan=z='1+0.07*on/${frames}':x='iw/2-(iw/zoom/2)+on*0.15':y='ih/2-(ih/zoom/2)-on*0.10':d=${frames}:s=1920x1080:fps=${fps}`;
    return `[0:v]scale=3840:-2,${zoom},${look},${scale},split[a][b];[b]reverse[r];[a][r]concat=n=2:v=1:a=0,format=yuv420p[v]`;
  }
  if (loop === 'crossfade') {
    const fade = 1;
    return `[0:v]scale=-2:${height},fps=${fps},${look},setsar=1,trim=duration=${seconds},setpts=PTS-STARTPTS,split[a][b];` +
      `[a]trim=0:${seconds - fade},setpts=PTS-STARTPTS[main];[b]trim=${seconds - fade}:${seconds},setpts=PTS-STARTPTS[tail];` +
      `[main][tail]xfade=transition=fade:duration=${fade}:offset=${seconds - 2 * fade},format=yuv420p[v]`;
  }
  return `[0:v]scale=-2:${height},fps=${fps},${look},setsar=1,trim=duration=${half},setpts=PTS-STARTPTS,split[a][b];[b]reverse[r];[a][r]concat=n=2:v=1:a=0,format=yuv420p[v]`;
}

function encode(height, codec, file, budgetMb) {
  for (let crf = codec === 'vp9' ? 34 : 26; crf <= 46; crf += 2) {
    const inArgs = isStill ? ['-loop', '1', '-framerate', String(fps), '-t', String(half), '-i', input] : ['-i', input];
    const codecArgs = codec === 'vp9'
      ? ['-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', String(crf), '-row-mt', '1']
      : ['-c:v', 'libx264', '-preset', 'slow', '-crf', String(crf), '-profile:v', 'high', '-movflags', '+faststart'];
    const r = spawnSync('ffmpeg', ['-y', ...inArgs, '-filter_complex', chain(height), '-map', '[v]', '-an', ...codecArgs, file], { encoding: 'utf8', shell: process.platform === 'win32' });
    if (r.status !== 0) { console.error(r.stderr.slice(-800)); process.exit(1); }
    const mb = fs.statSync(file).size / 1048576;
    if (mb <= budgetMb) { console.log(`${path.basename(file)}: ${mb.toFixed(2)} MB at crf ${crf} (budget ${budgetMb} MB)`); return; }
  }
  console.error(`${path.basename(file)} still over ${budgetMb} MB at the highest CRF: shorten the clip.`);
  process.exit(1);
}

encode(1080, 'h264', path.join(dir, `${slug}-1080.mp4`), 4);
encode(720, 'h264', path.join(dir, `${slug}-720.mp4`), 2);
encode(1080, 'vp9', path.join(dir, `${slug}.webm`), 3);
const poster = spawnSync('ffmpeg', ['-y', '-i', path.join(dir, `${slug}-1080.mp4`), '-frames:v', '1', '-vf', 'scale=1920:-2', '-q:v', '3', path.join(dir, `${slug}-poster.jpg`)], { encoding: 'utf8', shell: process.platform === 'win32' });
if (poster.status !== 0) { console.error(poster.stderr.slice(-400)); process.exit(1); }
console.log(`done: ${dir}`);
