"""Build assets/notes-data.json for the Notes page (owner texts + calculated data). Re-runnable; reads only local files.

Inputs (D:\\MOMENTS_Content\\06_Website\\notes\\):
  notes_content.json            owner-approved texts (EN/AR). NOT rewritten here, copied as is.
  preview\\notes-preview.json    season / gender / moment shares and filter tags (scripts/notes-recalc.py)
  preview\\product-strength.csv  note strength per perfume (star / supporting / touch)
  notes_famous.json + preview\\notes_famous_preview.json  the perfume lists (shortlist first, calculated fill)
Output: assets/notes-data.json (theme asset, fetched by sections/moments-notes.liquid).
"""
import csv, json, os, re, sys

SRC = sys.argv[1] if len(sys.argv) > 1 else r'D:/MOMENTS_Content/06_Website/notes'
OUT = sys.argv[2] if len(sys.argv) > 2 else os.path.join(os.path.dirname(__file__), '..', 'assets', 'notes-data.json')

content = json.load(open(os.path.join(SRC, 'notes_content.json'), encoding='utf-8'))['notes']
preview = json.load(open(os.path.join(SRC, 'preview', 'notes-preview.json'), encoding='utf-8'))
famous = json.load(open(os.path.join(SRC, 'notes_famous.json'), encoding='utf-8'))
famous_detail = json.load(open(os.path.join(SRC, 'preview', 'notes_famous_preview.json'), encoding='utf-8'))
key = lambda s: re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')
strength = {}
for r in csv.DictReader(open(os.path.join(SRC, 'preview', 'product-strength.csv'), encoding='utf-8-sig')):
    strength[(key(r['note']), r['handle'])] = r['level']
by_name = {key(k): v for k, v in preview.items()}

notes = []
for c in content:
    h = c['handle']
    p = by_name.get(h, {})
    tags = p.get('filter_tags', [])
    fam = famous.get(h, [])
    det = famous_detail.get(h, [])
    notes.append({
        **c,
        'season': next((t for t in tags if t in ('winter', 'summer')), ''),
        'gender': next((t for t in tags if t in ('men', 'women', 'unisex')), ''),
        'moments': [t for t in tags if t.endswith('-moment')],
        'count': p.get('perfume_count', 0),
        'perfumes': [{'h': ph, 'level': strength.get((h, ph), 'touch')}
                  for i, ph in enumerate(fam)],
    })
notes = [n for n in notes if n['count'] > 0]  # a note no perfume carries is left off the page
json.dump({'version': 1, 'notes': notes}, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
# the handles that have a note card, for Liquid (product page note tiles are only clickable for these); one line, commas around
HANDLES = os.path.join(os.path.dirname(OUT), '..', 'snippets', 'notes-card-handles.liquid')
open(HANDLES, 'w', encoding='utf-8').write(',' + ','.join(sorted(n['handle'] for n in notes)) + ',')
print('wrote', OUT, len(notes), 'notes', os.path.getsize(OUT), 'bytes')
