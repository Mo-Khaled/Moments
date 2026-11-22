"""Remove the long dash (—) from product descriptions, English body and Arabic translation (owner request 2026-11-22).
usage:
  python scripts/remove-em-dash.py --scan       read everything, save live-before.json + a preview, write nothing
  python scripts/remove-em-dash.py --apply      write the changes from the scan, verify each product
  python scripts/remove-em-dash.py --rollback   put back live-before.json
Only descriptionHtml and the Arabic body_html translation are written.
"""
import json, os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
import importlib
ad = importlib.import_module('apply-descriptions')
gql = ad.gql
norm = lambda t: re.sub(r'\s+', '', ad.norm(t))  # Shopify re-spaces HTML between tags when it saves; compare without whitespace
D = os.path.join(ad.OUT, 'em-dash-2026-11-22')
BEFORE = os.path.join(D, 'live-before.json')
LOG = os.path.join(D, 'apply-log.jsonl')
DASH = '—'


def fix_en(s):
    s = re.sub(r'\s*—\s*(?=[.,;:!?)]|</)', '', s)       # a dash right before punctuation or a closing tag: drop it
    s = re.sub(r'(<(?!/)[^>]*>|\()\s*—\s*', r'\1', s)   # right after an opening tag or bracket: drop it
    return re.sub(r'\s*—\s*', ', ', s)                   # between words: a comma


def fix_ar(s):
    s = re.sub(r'\s*—\s*(?=[.,،؛:!؟)]|</)', '', s)
    s = re.sub(r'(<(?!/)[^>]*>|\()\s*—\s*', r'\1', s)   # right after an opening tag or bracket: drop it
    return re.sub(r'\s*—\s*', '، ', s)


def scan():
    out, after = {}, None
    while True:
        q = ('query($a: String) { translatableResources(resourceType: PRODUCT, first: 200, after: $a) { pageInfo { hasNextPage endCursor } '
             'nodes { resourceId translatableContent { key value digest } translations(locale: "ar") { key value } } } }')
        r = gql(q, {'a': after})['translatableResources']
        for n in r['nodes']:
            en = next((c['value'] for c in n['translatableContent'] if c['key'] == 'body_html'), '') or ''
            ar = next((c['value'] for c in n['translations'] if c['key'] == 'body_html'), '') or ''
            if DASH in en or DASH in ar:
                out[n['resourceId']] = {'en': en, 'ar': ar}
        if not r['pageInfo']['hasNextPage']:
            break
        after = r['pageInfo']['endCursor']
    json.dump(out, open(BEFORE, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    prev = []
    for pid, v in out.items():
        for m in re.finditer(r'.{0,40}—.{0,40}', v['en']):
            prev.append(f"EN {pid.split('/')[-1]}: {m.group(0)}  ->  {fix_en(m.group(0))}")
        for m in re.finditer(r'.{0,40}—.{0,40}', v['ar']):
            prev.append(f"AR {pid.split('/')[-1]}: {m.group(0)}  ->  {fix_ar(m.group(0))}")
    open(os.path.join(D, 'preview.txt'), 'w', encoding='utf-8').write('\n'.join(prev))
    print(f"{len(out)} products have a dash; {sum(DASH in v['en'] for v in out.values())} English, {sum(DASH in v['ar'] for v in out.values())} Arabic; {len(prev)} places")


def put(pid, en, ar, old_en):
    if en != old_en:
        r = gql('mutation($p: ProductUpdateInput!) { productUpdate(product: $p) { userErrors { field message } } }',
                {'p': {'id': pid, 'descriptionHtml': en}}, mutation=True)['productUpdate']
        if r['userErrors']:
            raise RuntimeError(r['userErrors'])
    if ar:
        c = gql('query($id: ID!) { translatableResource(resourceId: $id) { translatableContent { key digest } } }', {'id': pid})
        dg = next(x['digest'] for x in c['translatableResource']['translatableContent'] if x['key'] == 'body_html')
        r = gql('mutation($id: ID!, $t: [TranslationInput!]!) { translationsRegister(resourceId: $id, translations: $t) { userErrors { message } } }',
                {'id': pid, 't': [{'key': 'body_html', 'locale': 'ar', 'value': ar, 'translatableContentDigest': dg}]}, mutation=True)['translationsRegister']
        if r['userErrors']:
            raise RuntimeError(r['userErrors'])


def live(pid):
    n = gql('query($id: ID!) { translatableResource(resourceId: $id) { translatableContent { key value } translations(locale: "ar") { key value } } }', {'id': pid})['translatableResource']
    return (next((c['value'] for c in n['translatableContent'] if c['key'] == 'body_html'), '') or '',
            next((c['value'] for c in n['translations'] if c['key'] == 'body_html'), '') or '')


def apply():
    before = json.load(open(BEFORE, encoding='utf-8'))
    log = open(LOG, 'a', encoding='utf-8')
    done = 0
    for pid, v in before.items():
        en, ar = fix_en(v['en']), fix_ar(v['ar'])
        now_en, now_ar = live(pid)
        if norm(now_en) == norm(en) and norm(now_ar) == norm(ar):
            continue
        if norm(now_en) != norm(v['en']):
            log.write(json.dumps({'id': pid, 'outcome': 'skipped: changed since scan'}) + '\n'); continue
        put(pid, en, ar, v['en'])
        a_en, a_ar = live(pid)
        if DASH in a_en or DASH in a_ar or norm(a_en) != norm(en):
            put(pid, v['en'], v['ar'], a_en)
            sys.exit(f'stop: {pid} did not verify; restored')
        log.write(json.dumps({'id': pid, 'outcome': 'written and verified'}) + '\n'); log.flush()
        done += 1
        if done % 25 == 0:
            print(done, 'done', flush=True)
    print(f'{done} products updated')


def rollback():
    before = json.load(open(BEFORE, encoding='utf-8'))
    for pid, v in before.items():
        now_en, _ = live(pid)
        put(pid, v['en'], v['ar'], now_en)
    print(len(before), 'rolled back')


if __name__ == '__main__':
    {'--scan': scan, '--apply': apply, '--rollback': rollback}[sys.argv[1]]()
