"""Export the catalogue for scripts/notes-recalc.py through the Shopify CLI (read-only; no connector needed).
usage: python scripts/notes-export.py <out_dir_for_pages> <members_json>
Writes <out_dir>/page1.json.. in the Admin API shape the recalc script reads, and members.json = {collection: {handle: in_stock}}
(the six moment collections + 'bundle-perfumes' = every ACTIVE product, value = total inventory > 0)."""
import json, os, shutil, subprocess, sys

OUT, MEMBERS = sys.argv[1], sys.argv[2]
STORE = 'dezrva-2z.myshopify.com'
SH = shutil.which('shopify') or shutil.which('shopify.cmd')
MOMENTS = {'fresh': 'fresh-moment', 'winter': 'winter-moment', 'love': 'love-moment', 'night': 'night-moment', 'gift': 'gift-moment', 'selfcare': 'self-care-moment'}


def run(q, variables=None):
    cmd = [SH, 'store', 'execute', '--store', STORE, '--no-input', '--json', '--query', q]
    if variables:
        cmd += ['--variables', json.dumps(variables)]
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=600)
    i = r.stdout.find('{')
    if i < 0:
        raise SystemExit('CLI error: ' + (r.stderr or r.stdout)[:400])
    return json.loads(r.stdout[i:])


ids = {}
d = run('{ ' + ' '.join(f'{k}: collectionByIdentifier(identifier: {{handle: "{h}"}}) {{ id }}' for k, h in MOMENTS.items()) + ' }')
for k in MOMENTS:
    ids[k] = d[k]['id']
mf = lambda a, ns, key: f'{a}: metafield(namespace: "{ns}", key: "{key}") {{ value }}'
fields = ' '.join([mf(f'{L[0]}{i}', 'custom', f'{n}_{i}') for L, n in (('t', 'top_notes'), ('h', 'heart_notes'), ('b', 'base_notes')) for i in range(1, 7)]
                  + [mf('fnotes', 'filter', 'notes'), mf('fseason', 'filter', 'season'), mf('cseason', 'custom', 'season'), mf('gender', 'filter', 'gender'),
                     mf('moment', 'filter', 'moment'), mf('family', 'filter', 'family')])
incol = ' '.join(f'{k}: inCollection(id: "{v}")' for k, v in ids.items())
Q = ('query($after: String) { products(first: 100, after: $after) { pageInfo { hasNextPage endCursor } nodes { handle title vendor productType status totalInventory '
     f'descriptionHtml {fields} {incol} }} }} }}')
os.makedirs(OUT, exist_ok=True)
for f in os.listdir(OUT):
    if f.startswith('page') and f.endswith('.json'):
        os.remove(os.path.join(OUT, f))
after, n, total = None, 0, 0
mem = {h: {} for h in MOMENTS.values()}
mem['bundle-perfumes'] = {}
while True:
    d = run(Q, {'after': after} if after else None)
    p = d['products']
    n += 1
    json.dump({'data': {'products': {'nodes': p['nodes']}}}, open(os.path.join(OUT, f'page{n}.json'), 'w', encoding='utf-8'), ensure_ascii=False)
    for x in p['nodes']:
        total += 1
        if x['status'] != 'ACTIVE':
            continue
        av = (x.get('totalInventory') or 0) > 0
        mem['bundle-perfumes'][x['handle']] = av
        for k, h in MOMENTS.items():
            if x.get(k):
                mem[h][x['handle']] = av
    if not p['pageInfo']['hasNextPage']:
        break
    after = p['pageInfo']['endCursor']
json.dump(mem, open(MEMBERS, 'w', encoding='utf-8'))
print(f'{total} products in {n} pages;', {k: len(v) for k, v in mem.items()})
