"""Import the new note pictures after they were generated in the Higgsfield web app (Unlimited mode).
Put the PNGs (note-<slug>.png, 2048x2048) in D:/MOMENTS_Content/06_Website/notes/images, then run:
    python scripts/notes-import-pictures.py            (or pass another folder as the first argument)
What it does (nothing is published, nothing is written to products):
  1. finds note-<slug>.png for every slug in notes/NOTE_PICTURES_TODO.csv
  2. checks it (square; any other size is centre-cropped to a square and scaled), writes
     notes/images/web/note-<slug>-512.webp and -1024.webp (same as the 37 existing pictures)
  3. copies both WebP files into the theme (assets/)
  4. adds the slug, and the other tag names that share the picture, to snippets/scent-guide-panel.liquid
  5. prints the exact files to push (staging first, then live after the owner says push)
Notes without a picture keep their current look (no picture, text only).
"""
import csv, os, re, shutil, sys
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NOTES_DIR = 'D:/MOMENTS_Content/06_Website/notes'
SRC = sys.argv[1] if len(sys.argv) > 1 else NOTES_DIR + '/images'
WEB = NOTES_DIR + '/images/web'
PANEL = os.path.join(ROOT, 'snippets', 'scent-guide-panel.liquid')


def to_webp(png, slug):
    im = Image.open(png).convert('RGB')
    w, h = im.size
    if w != h:
        s = min(w, h)
        im = im.crop(((w - s) // 2, (h - s) // 2, (w - s) // 2 + s, (h - s) // 2 + s))
    out = []
    for size in (512, 1024):
        dst = f'{WEB}/note-{slug}-{size}.webp'
        im.resize((size, size), Image.LANCZOS).save(dst, 'WEBP', quality=82, method=6)
        shutil.copy(dst, os.path.join(ROOT, 'assets', f'note-{slug}-{size}.webp'))
        out.append(f'assets/note-{slug}-{size}.webp')
    return out


def main():
    rows = list(csv.DictReader(open(NOTES_DIR + '/NOTE_PICTURES_TODO.csv', encoding='utf-8-sig')))
    os.makedirs(WEB, exist_ok=True)
    done, missing, files = [], [], []
    for r in rows:
        png = f"{SRC}/{r['target file']}"
        if os.path.exists(png):
            files += to_webp(png, r['slug'])
            done.append(r)
        else:
            missing.append(r['slug'])
    if not done:
        print('no new pictures found in', SRC)
        return
    s = open(PANEL, encoding='utf-8', newline='').read()
    nl = '\r\n' if '\r\n' in s else '\n'
    m = re.search(r"assign note_known = ',([^']*),'", s)
    known = set(m.group(1).split(','))
    known |= {r['slug'] for r in done}
    s = s.replace(m.group(0), "assign note_known = '," + ','.join(sorted(known)) + ",'", 1)
    a = re.search(r"assign note_aliases = '([^']*)' \| split: ','", s)
    pairs = [p for p in a.group(1).split(',') if p]
    have = {p.split(':')[0] for p in pairs}
    for r in done:
        for tag in r['also used for tags'].split():
            if tag not in have:
                pairs.append(f"{tag}:{r['slug']}")
                have.add(tag)
    s = s.replace(a.group(0), "assign note_aliases = '" + ','.join(pairs) + "' | split: ','", 1)
    open(PANEL, 'w', encoding='utf-8', newline='').write(s.replace('\r\n', '\n').replace('\n', nl))
    files.append('snippets/scent-guide-panel.liquid')
    print(f'imported {len(done)} pictures; still missing {len(missing)}: {" ".join(missing)}')
    print('push to staging first:')
    print('  shopify theme push --theme 162401091775 --allow-live ' + ' '.join('--only ' + f for f in files))


if __name__ == '__main__':
    main()
