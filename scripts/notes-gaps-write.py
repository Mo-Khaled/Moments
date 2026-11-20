"""Write the owner-approved note pyramids (32 confirmed rows + 4 sets) to products, through the Shopify CLI (shopify store execute).

Safety: reads the live values first and compares them with the backup (notes\\backups\\notes-pyramid-before-2026-11-20.csv); a product whose
live values differ from the backup is SKIPPED and reported. Writes only custom.top_notes_1..6 / heart_notes_1..6 / base_notes_1..6.
Default is a dry run; pass --apply to write. After writing it re-reads and verifies, and saves an "after" CSV.
usage: python scripts/notes-gaps-write.py [--apply]
"""
import csv, json, os, re, shutil, subprocess, sys

N = r'D:/MOMENTS_Content/06_Website/notes/backups/'
STORE = 'dezrva-2z.myshopify.com'
SH = shutil.which('shopify') or shutil.which('shopify.cmd')
KEYS = [f'{L}_{i}' for L in ('top_notes', 'heart_notes', 'base_notes') for i in range(1, 7)]
apply = '--apply' in sys.argv


def run(query, mutate=False):
    cmd = [SH, 'store', 'execute', '--store', STORE, '--no-input', '--json', '--query', query]
    if mutate:
        cmd.append('--allow-mutations')
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
    out = r.stdout
    i = out.find('{')
    if i < 0:
        raise SystemExit('CLI error: ' + (r.stderr or out)[:400])
    return json.loads(out[i:])


plan = {}
for r in csv.DictReader(open(N + 'notes-pyramid-DRYRUN-2026-11-20.csv', encoding='utf-8-sig')):
    layers = [[x.strip() for x in r[k].split(',') if x.strip()] for k in ('top after', 'heart after', 'base after')]
    new = {}
    for li, name in enumerate(('top_notes', 'heart_notes', 'base_notes')):
        for i in range(1, 7):
            new[f'{name}_{i}'] = layers[li][i - 1] if i <= len(layers[li]) else ''
    plan[r['handle']] = new
backup = {}
for r in csv.DictReader(open(N + 'notes-pyramid-before-2026-11-20.csv', encoding='utf-8-sig')):
    backup[r['handle']] = {k: r['custom.' + k] for k in KEYS}

handles = list(plan)
live, ids = {}, {}
for s in range(0, len(handles), 12):
    chunk = handles[s:s + 12]
    q = '{ ' + ' '.join(f'p{i}: productByIdentifier(identifier: {{handle: "{h}"}}) {{ id handle metafields(first: 30, namespace: "custom") {{ nodes {{ key value }} }} }}' for i, h in enumerate(chunk)) + ' }'
    d = run(q)
    for i, h in enumerate(chunk):
        p = d.get(f'p{i}')
        if not p:
            print('NOT FOUND', h)
            continue
        ids[h] = p['id']
        m = {n['key']: n['value'] for n in p['metafields']['nodes']}
        live[h] = {k: m.get(k, '') for k in KEYS}

ok, skip = [], []
for h in handles:
    if h not in live:
        skip.append((h, 'not found'))
    elif live[h] != backup[h]:
        diff = [k for k in KEYS if live[h][k] != backup[h][k]]
        skip.append((h, 'live differs from backup: ' + ', '.join(diff)))
    else:
        ok.append(h)
changes = sum(1 for h in ok for k in KEYS if plan[h][k] != live[h][k])
print(f'{len(handles)} planned, {len(ok)} safe to write, {len(skip)} skipped, {changes} field changes')
for h, why in skip:
    print('  SKIP', h, '|', why)
if not apply:
    print('dry run only (no --apply)')
    sys.exit(0)

written, failed = [], []
for h in ok:
    sets = [(k, v) for k, v in plan[h].items() if v and v != live[h][k]]
    clears = [k for k, v in plan[h].items() if not v and live[h][k]]
    parts = []
    if sets:
        arr = ', '.join('{ownerId: "%s", namespace: "custom", key: "%s", type: "single_line_text_field", value: %s}' % (ids[h], k, json.dumps(v)) for k, v in sets)
        parts.append('s: metafieldsSet(metafields: [%s]) { userErrors { field message } }' % arr)
    if clears:
        arr = ', '.join('{ownerId: "%s", namespace: "custom", key: "%s"}' % (ids[h], k) for k in clears)
        parts.append('c: metafieldsDelete(metafields: [%s]) { userErrors { field message } }' % arr)
    if not parts:
        continue
    d = run('mutation { ' + ' '.join(parts) + ' }', mutate=True)
    errs = [e for blk in d.values() for e in (blk or {}).get('userErrors', [])]
    (failed if errs else written).append((h, errs))
    print('wrote' if not errs else 'ERRORS', h, errs[:2] if errs else '')

# verify
bad = []
after = {}
for s in range(0, len(written), 12):
    chunk = [h for h, _ in written][s:s + 12]
    q = '{ ' + ' '.join(f'p{i}: productByIdentifier(identifier: {{handle: "{h}"}}) {{ metafields(first: 30, namespace: "custom") {{ nodes {{ key value }} }} }}' for i, h in enumerate(chunk)) + ' }'
    d = run(q)
    for i, h in enumerate(chunk):
        m = {n['key']: n['value'] for n in d[f'p{i}']['metafields']['nodes']}
        after[h] = {k: m.get(k, '') for k in KEYS}
        if after[h] != plan[h]:
            bad.append(h)
with open(N + 'notes-pyramid-after-2026-11-20.csv', 'w', newline='', encoding='utf-8-sig') as f:
    w = csv.writer(f)
    w.writerow(['handle'] + ['custom.' + k for k in KEYS])
    for h, v in after.items():
        w.writerow([h] + [v[k] for k in KEYS])
print(f'written {len(written)}, failed {len(failed)}, verify mismatches {bad}')
