// One tonal recipe for the six moments (OKLCH): the same lightness and chroma steps for every moment, only the hue changes, with one
// deliberate exception: All day is a LIGHT golden sand with dark ink (the others are deep fields with pearl ink), so it no longer reads
// as a second brown next to Daily. Prints the CSS tokens, checks text contrast and the minimum colour distance between the six fields.
// usage: node scripts/moment-palette.mjs [--css]   (--css prints the token block that goes into assets/moments.css)
const STEPS = { field: [0.5, 0.12], deep: [0.4, 0.1], soft: [0.93, 0.035], ink: [0.3, 0.07] };
const HUES = { night: 300, gift: 338, allday: 88, daily: 42, fresh: 152, love: 10 };
// small per-moment offsets (lightness, chroma) so neighbouring rose and clay hues stay apart: same family, not the same coordinates
const NUDGE = { night: [-0.05, -0.01], gift: [0.05, 0.02], daily: [0.02, -0.01], love: [-0.06, 0.03] };
// All day: light sand field, dark ink. field/deep stay a gradient from sand to a deeper gold; ink is the brand plum.
const SAND = { field: [0.84, 0.1], deep: [0.76, 0.115], soft: [0.95, 0.03], ink: [0.3, 0.07] };
const toSrgb = (L, C, h) => {
  const a = C * Math.cos((h * Math.PI) / 180), b = C * Math.sin((h * Math.PI) / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3, m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3, s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const lin = [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s];
  return lin.map((v) => { v = Math.min(1, Math.max(0, v)); return Math.round(255 * (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055)); });
};
const hex = (c) => '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
const cr = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const oklab = (L, C, h) => [L, C * Math.cos((h * Math.PI) / 180), C * Math.sin((h * Math.PI) / 180)];
const PEARL = [250, 246, 242], PLUM = [59, 30, 58], MIN_DIST = 10;
const out = {}; let bad = 0;
for (const [name, h] of Object.entries(HUES)) {
  const nd = NUDGE[name] || [0, 0];
  const st = name === 'allday' ? SAND : Object.fromEntries(Object.entries(STEPS).map(([k, [L, C]]) => [k, k === 'soft' || k === 'ink' ? [L, C] : [L + nd[0], C + nd[1]]]));
  const t = Object.fromEntries(Object.entries(st).map(([k, [L, C]]) => [k, toSrgb(L, C, h)]));
  const light = name === 'allday';
  const textOnField = light ? cr(PLUM, t.field) : cr(PEARL, t.field);
  const textOnDeep = light ? cr(PLUM, t.deep) : cr(PEARL, t.deep);
  const checks = [[light ? 'plum on field' : 'pearl on field', textOnField], [light ? 'plum on deep' : 'pearl on deep', textOnDeep], ['ink on soft', cr(t.ink, t.soft)]];
  const fail = checks.filter(([, v]) => v < 4.5); if (fail.length) bad++;
  out[name] = { t, h, light, lab: oklab(st.field[0], st.field[1], h) };
  console.log(`${name.padEnd(7)} h${h}  field ${hex(t.field)}  deep ${hex(t.deep)}  soft ${hex(t.soft)}  ink ${hex(t.ink)}  | ${checks.map(([n, v]) => n + ' ' + v.toFixed(1)).join(', ')} ${fail.length ? 'FAIL' : ''}`);
}
// colour distance between the six field colours (OKLab x100) and between each field and the plum and pearl surfaces
const names = Object.keys(out); let min = 1e9, pair = '';
for (let i = 0; i < names.length; i++) for (let j = i + 1; j < names.length; j++) {
  const a = out[names[i]].lab, b = out[names[j]].lab;
  const d = 100 * Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  if (d < min) { min = d; pair = names[i] + ' / ' + names[j]; }
}
console.log(`closest pair of moment colours: ${pair}, dE ${min.toFixed(1)} (needs ${MIN_DIST}) ${min >= MIN_DIST ? 'ok' : 'FAIL'}`);
if (min < MIN_DIST) bad++;
if (process.argv.includes('--css')) {
  const lines = ['html:root {'];
  for (const [k, v] of Object.entries(out)) {
    const ink = v.light ? 'var(--m-plum)' : 'var(--m-pearl)';
    lines.push(`  --moment-${k}: linear-gradient(155deg, ${hex(v.t.field)}, ${hex(v.t.deep)});`, `  --moment-${k}-field: ${hex(v.t.field)};`, `  --moment-${k}-deep: ${hex(v.t.deep)};`, `  --moment-${k}-soft: ${hex(v.t.soft)};`, `  --moment-${k}-soft-ink: ${hex(v.t.ink)};`, `  --moment-${k}-ink: ${ink};`,
      `  --moment-${k}-body: color-mix(in oklab, ${hex(v.t.field)} 62%, ${v.light ? 'var(--m-pearl)' : 'var(--m-pearl)'});`, `  --moment-${k}-accent: ${v.light ? 'var(--m-berry-ink)' : 'var(--m-gold-light)'};`, `  --moment-${k}-gold: ${v.light ? 'var(--m-berry-ink)' : 'var(--m-gold-light)'};`, '');
  }
  lines.pop(); lines.push('}');
  console.log(lines.join('\n'));
}
process.exit(bad ? 1 : 0);
