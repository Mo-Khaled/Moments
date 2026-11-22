"""Home & Bakhoor data changes (owner approved 2026-11-22, HOME_BAKHOOR_CHANGES.csv items 1-4 + 3 'Perfume' items -> Incense).
usage:
  python scripts/home-bakhoor-apply.py backup     export current values to bakhoor/BACKUP_BEFORE_APPLY.csv (+ .json used by rollback)
  python scripts/home-bakhoor-apply.py apply      apply in small batches (20), then verify
  python scripts/home-bakhoor-apply.py verify     counts only
  python scripts/home-bakhoor-apply.py rollback   put everything back from the .json backup
Touches only: home-and-ambiance (members, title, description, AR translations), membership of the moment collections that hold
these products, the filter.moment metafield of the 79 products, productType of the 3 'Perfume' items. Nothing else.
"""
import csv, importlib, json, os, sys, time
sys.path.insert(0, os.path.dirname(__file__))
ad = importlib.import_module('apply-descriptions')
gql = ad.gql
D = 'D:/MOMENTS_Content/06_Website/bakhoor'
BK_CSV, BK_JSON = D + '/BACKUP_BEFORE_APPLY.csv', D + '/BACKUP_BEFORE_APPLY.json'
LOG = D + '/apply-log.jsonl'
HOME = 'home-and-ambiance'
EXTRA = ['al-bahaar-gold-55gm', 'sougah-55gm', 'taiba-58gm']
MOMENTS = ['fresh-moment', 'winter-moment', 'love-moment', 'night-moment', 'gift-moment', 'self-care-moment']
ALL_M = MOMENTS + [m + s for m in MOMENTS for s in ('-for-him', '-for-her', '-unisex')]
NEW_TITLE_EN = 'Home & Bakhoor'
NEW_TITLE_AR = 'البيت والبخور'
NEW_DESC_EN = '<p>Bakhoor, oud chips, mamoul and home air fresheners from Nabeel, Khadlaj, Almas and more. 100% original, with cash on delivery across Egypt.</p>'
NEW_DESC_AR = '<p>بخور وعود ومعمول ومعطرات جو للبيت من نبيل وخدلج والماس وغيرها. أصلية ١٠٠٪ مع الدفع عند الاستلام في كل مصر.</p>'
TQ = 'status:active AND (product_type:Incense OR product_type:"Air Freshener")'
PF = 'id handle title productType m: metafield(namespace:"filter", key:"moment"){ id value type }'


def coll(handle):
    return gql('query($h:String!){ collectionByIdentifier(identifier:{handle:$h}){ id handle title descriptionHtml sortOrder templateSuffix ruleSet { appliedDisjunctively } seo { title description } } }', {'h': handle})['collectionByIdentifier']


def count(cid):
    return gql('query($id:ID!){ collection(id:$id){ productsCount{ count } } }', {'id': cid})['collection']['productsCount']['count']


def members(cid):
    out, after = [], None
    while True:
        d = gql('query($id:ID!,$a:String){ collection(id:$id){ products(first:250, after:$a){ pageInfo{hasNextPage endCursor} nodes{ id handle } } } }', {'id': cid, 'a': after})['collection']['products']
        out += d['nodes']
        if not d['pageInfo']['hasNextPage']:
            return out
        after = d['pageInfo']['endCursor']


def targets():
    prods, after = [], None
    while True:
        d = gql('query($a:String,$q:String!){ products(first:250, after:$a, query:$q){ pageInfo{hasNextPage endCursor} nodes{ ' + PF + ' } } }', {'a': after, 'q': TQ})['products']
        prods += d['nodes']
        if not d['pageInfo']['hasNextPage']:
            break
        after = d['pageInfo']['endCursor']
    seen = {x['handle'] for x in prods}
    for h in EXTRA:
        p = gql('query($h:String!){ productByIdentifier(identifier:{handle:$h}){ ' + PF + ' } }', {'h': h})['productByIdentifier']
        if p and p['handle'] not in seen:
            prods.append(p)
    return prods


def translations(rid):
    return gql('query($id:ID!){ translatableResource(resourceId:$id){ translatableContent{ key value digest } translations(locale:"ar"){ key value } } }', {'id': rid})['translatableResource']


def backup():
    os.makedirs(D, exist_ok=True)
    c = coll(HOME)
    data = {'collection': c, 'collection_ar': translations(c['id']), 'members': {}, 'products': targets()}
    for h in [HOME] + ALL_M:
        x = coll(h)
        if x:
            data['members'][h] = {'id': x['id'], 'products': members(x['id'])}
    json.dump(data, open(BK_JSON, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    rows = [['kind', 'target', 'key', 'value']]
    for k in ('handle', 'title', 'descriptionHtml', 'sortOrder', 'templateSuffix'):
        rows.append(['collection', HOME, k, c[k]])
    rows.append(['collection', HOME, 'rule', 'manual (no rules)' if not c['ruleSet'] else json.dumps(c['ruleSet'])])
    rows.append(['collection', HOME, 'seo', json.dumps(c['seo'], ensure_ascii=False)])
    for t in data['collection_ar']['translations']:
        rows.append(['collection translation ar', HOME, t['key'], t['value']])
    for h, v in data['members'].items():
        for p in v['products']:
            rows.append(['membership', h, p['handle'], p['id']])
    for p in data['products']:
        rows.append(['product', p['handle'], 'productType', p['productType']])
        rows.append(['product', p['handle'], 'filter.moment', p['m']['value'] if p['m'] else ''])
    with open(BK_CSV, 'w', newline='', encoding='utf-8-sig') as f:
        csv.writer(f).writerows(rows)
    print('backup:', len(data['products']), 'products;', {h: len(v['products']) for h, v in data['members'].items()})


def log(**k):
    open(LOG, 'a', encoding='utf-8').write(json.dumps(k, ensure_ascii=False) + '\n')


def batches(xs, n):
    for i in range(0, len(xs), n):
        yield xs[i:i + n]


def must(r, name):
    if r.get('userErrors'):
        sys.exit(f'{name}: {r["userErrors"]}')


def apply():
    bk = json.load(open(BK_JSON, encoding='utf-8'))
    prods = bk['products']
    ids = [p['id'] for p in prods]
    # the 3 items typed 'Perfume': only their product type changes and they join Home & Bakhoor (owner: no other field)
    idset = {p['id'] for p in prods if p['handle'] not in EXTRA}
    home = bk['members'][HOME]
    have = {p['id'] for p in members(home['id'])}
    for b in batches([i for i in ids if i not in have], 20):
        must(gql('mutation($id:ID!,$p:[ID!]!){ collectionAddProducts(id:$id, productIds:$p){ userErrors{ message } } }', {'id': home['id'], 'p': b}, mutation=True)['collectionAddProducts'], 'add')
        log(step='add to home', n=len(b))
        time.sleep(2)
    smart = {'winter-moment'}  # rule-based (tag season:Winter): left for the owner's decision, not changed here
    # gift-moment and self-care-moment are built from their For Him / For Her / Unisex sub-collections: products leave the
    # sub-collections and the parent follows by itself
    smart |= {'gift-moment', 'self-care-moment', 'fresh-moment', 'love-moment', 'night-moment'}
    for h, v in bk['members'].items():
        if h == HOME or h in smart:
            continue
        for b in batches([p['id'] for p in v['products'] if p['id'] in idset], 20):
            must(gql('mutation($id:ID!,$p:[ID!]!){ collectionRemoveProducts(id:$id, productIds:$p){ job { id } userErrors{ message } } }', {'id': v['id'], 'p': b}, mutation=True)['collectionRemoveProducts'], 'remove')
            log(step='remove from', collection=h, n=len(b))
            time.sleep(2)
    for p in prods:
        if p['m'] and p['handle'] not in EXTRA:
            must(gql('mutation($m:[MetafieldIdentifierInput!]!){ metafieldsDelete(metafields:$m){ userErrors{ message } } }', {'m': [{'ownerId': p['id'], 'namespace': 'filter', 'key': 'moment'}]}, mutation=True)['metafieldsDelete'], 'metafield')
        if p['handle'] in EXTRA and p['productType'] != 'Incense':
            must(gql('mutation($p:ProductUpdateInput!){ productUpdate(product:$p){ userErrors{ message } } }', {'p': {'id': p['id'], 'productType': 'Incense'}}, mutation=True)['productUpdate'], 'type')
        log(step='product', handle=p['handle'])
    must(gql('mutation($c:CollectionUpdateInput!){ collectionUpdate(collection:$c){ userErrors{ message } } }', {'c': {'id': home['id'], 'title': NEW_TITLE_EN, 'descriptionHtml': NEW_DESC_EN}}, mutation=True)['collectionUpdate'], 'collection')
    t = translations(home['id'])
    dg = {c['key']: c['digest'] for c in t['translatableContent']}
    tr = [{'key': 'title', 'locale': 'ar', 'value': NEW_TITLE_AR, 'translatableContentDigest': dg['title']},
          {'key': 'body_html', 'locale': 'ar', 'value': NEW_DESC_AR, 'translatableContentDigest': dg['body_html']}]
    must(gql('mutation($id:ID!,$t:[TranslationInput!]!){ translationsRegister(resourceId:$id, translations:$t){ userErrors{ message } } }', {'id': home['id'], 't': tr}, mutation=True)['translationsRegister'], 'translation')
    log(step='collection title/description + ar')
    verify()


def verify():
    bk = json.load(open(BK_JSON, encoding='utf-8'))
    idset = {p['id'] for p in bk['products'] if p['handle'] not in EXTRA}
    out = {h: count(coll(h)['id']) for h in [HOME, 'self-care-moment', 'gift-moment', 'winter-moment']}
    left = 0
    for h in ALL_M:
        c = coll(h)
        if c:
            left += len([p for p in members(c['id']) if p['id'] in idset])
    still, types = 0, {}
    for b in batches(list(idset), 50):
        d = gql('query($ids:[ID!]!){ nodes(ids:$ids){ ... on Product { m: metafield(namespace:"filter", key:"moment"){ value } productType } } }', {'ids': b})
        for n in d['nodes']:
            if n:
                still += bool(n['m'])
                types[n['productType']] = types.get(n['productType'], 0) + 1
    c = coll(HOME)
    print(json.dumps({'counts': out, 'title': c['title'], 'targets in a moment collection': left, 'targets with a moment field': still, 'types': types}, ensure_ascii=False))


def rollback():
    bk = json.load(open(BK_JSON, encoding='utf-8'))
    c = bk['collection']
    gql('mutation($c:CollectionUpdateInput!){ collectionUpdate(collection:$c){ userErrors{ message } } }', {'c': {'id': c['id'], 'title': c['title'], 'descriptionHtml': c['descriptionHtml']}}, mutation=True)
    t = translations(c['id'])
    dg = {x['key']: x['digest'] for x in t['translatableContent']}
    old = {x['key']: x['value'] for x in bk['collection_ar']['translations']}
    reg = [{'key': k, 'locale': 'ar', 'value': old[k], 'translatableContentDigest': dg[k]} for k in ('title', 'body_html') if old.get(k)]
    if reg:
        gql('mutation($id:ID!,$t:[TranslationInput!]!){ translationsRegister(resourceId:$id, translations:$t){ userErrors{ message } } }', {'id': c['id'], 't': reg}, mutation=True)
    rm = [k for k in ('title', 'body_html') if not old.get(k)]
    if rm:
        gql('mutation($id:ID!,$k:[String!]!){ translationsRemove(resourceId:$id, translationKeys:$k, locales:["ar"]){ userErrors{ message } } }', {'id': c['id'], 'k': rm}, mutation=True)
    for h, v in bk['members'].items():
        now = {p['id'] for p in members(v['id'])}
        was = {p['id'] for p in v['products']}
        for b in batches(list(was - now), 20):
            gql('mutation($id:ID!,$p:[ID!]!){ collectionAddProducts(id:$id, productIds:$p){ userErrors{ message } } }', {'id': v['id'], 'p': b}, mutation=True)
        for b in batches(list(now - was), 20):
            gql('mutation($id:ID!,$p:[ID!]!){ collectionRemoveProducts(id:$id, productIds:$p){ userErrors{ message } } }', {'id': v['id'], 'p': b}, mutation=True)
    for p in bk['products']:
        if p['m'] and p['handle'] not in EXTRA:
            gql('mutation($m:[MetafieldsSetInput!]!){ metafieldsSet(metafields:$m){ userErrors{ message } } }', {'m': [{'ownerId': p['id'], 'namespace': 'filter', 'key': 'moment', 'type': p['m']['type'], 'value': p['m']['value']}]}, mutation=True)
        if p['handle'] in EXTRA:
            gql('mutation($p:ProductUpdateInput!){ productUpdate(product:$p){ userErrors{ message } } }', {'p': {'id': p['id'], 'productType': p['productType']}}, mutation=True)
    print('rolled back')
    verify()


if __name__ == '__main__':
    {'backup': backup, 'apply': apply, 'verify': verify, 'rollback': rollback}[sys.argv[1]]()
