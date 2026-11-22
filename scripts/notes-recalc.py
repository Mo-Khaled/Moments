"""Recalculate the Notes page data (metaobject type "note") from our catalogue. PREVIEW by default; writes only with --apply.

What it computes per note (the 37 approved notes, merges approved 2026-11-20):
  - perfume_count, season_share, gender_share, moment_share (Moments from the six *-moment COLLECTIONS, not filter.moment),
  - filter_tags (winter / summer / men / women / unisex / <moment handles>), by the rules below,
  - top_products: up to 6 perfumes (strength first, in stock, full pyramid, at most 2 per brand; real sales replace this
    ranking automatically once the store has a year of sales: pass --sales sales.csv with columns handle,units),
  and per product: the note strength (star / supporting / touch), an estimate shown as dots, never a percentage.

Inputs:
  --export DIR   Admin API product pages (page*.json: handle, title, vendor, productType, status, custom.top/heart/base_notes_1..6
                 as t1..t6/h1..h6/b1..b6, filter.notes as fnotes, filter.season as fseason, filter.gender as gender).
  storefront     https://momentseg.com/collections/<handle>/products.json (public): moment membership and availability.
Outputs (--out DIR): notes-preview.json, notes-preview.csv, product-strength.csv.
--apply needs SHOPIFY_ADMIN_TOKEN (a custom-app Admin API token; allowed on Basic) and writes ONLY the CALC fields of each note.

Rules
  Strength points = layer (base +2, heart +1, top +1; owner 2026-11-20) + order in that layer (1st +2, 2nd +1) + note in the product name (+3)
                    + note in our key notes filter.notes (+2). 5+ = star, 3-4 = supporting, 0-2 = touch.
  Season tag   : winter (or summer) when it is >= 50% of the note's perfumes and >= 15 points above the other season.
  Gender tag   : men / women when that gender is >= 45%; otherwise unisex.
  Moment tags  : the two moment collections with the largest share (ties broken by count).
"""
import argparse, collections, csv, glob, json, os, re, sys, time, urllib.error, urllib.request

NOTES = ['Musk', 'Vanilla', 'Amber', 'Patchouli', 'Bergamot', 'Jasmine', 'Sandalwood', 'Rose', 'Cedarwood', 'Oud', 'Tonka Bean', 'Saffron',
         'Lavender', 'Vetiver', 'Leather', 'Cinnamon', 'Orange Blossom', 'Cardamom', 'Pink Pepper', 'Incense', 'Apple', 'Lemon', 'Geranium',
         'Mandarin', 'Caramel', 'Lily of the Valley', 'Orange', 'Ambergris', 'Pineapple', 'Raspberry', 'Oakmoss', 'Grapefruit', 'Iris',
         'Nutmeg', 'Ginger', 'Black Pepper', 'Pear']
ALIAS = {
    'agarwood': 'Oud', 'oud wood': 'Oud', 'white musk': 'Musk', 'cedar': 'Cedarwood', 'virginia cedar': 'Cedarwood', 'oak moss': 'Oakmoss',
    'moss': 'Oakmoss', 'pepper': 'Black Pepper', 'damask rose': 'Rose', 'bulgarian rose': 'Rose', 'turkish rose': 'Rose', 'red rose': 'Rose',
    'frankincense': 'Incense', 'olibanum': 'Incense', 'orris': 'Iris', 'orange flower': 'Orange Blossom', 'mandarin orange': 'Mandarin',
    'tangerine': 'Mandarin', 'green mandarin': 'Mandarin', 'jasmine sambac': 'Jasmine', 'suede': 'Leather', 'leather accord': 'Leather',
    'bourbon vanilla': 'Vanilla', 'madagascar vanilla': 'Vanilla', 'vanilla bean': 'Vanilla', 'vanilla absolute': 'Vanilla',
    'green apple': 'Apple', 'red apple': 'Apple', 'muguet': 'Lily of the Valley', 'calabrian bergamot': 'Bergamot',
    'italian bergamot': 'Bergamot', 'tonka': 'Tonka Bean', 'pink peppercorn': 'Pink Pepper', 'indonesian patchouli': 'Patchouli',
    'patchouli leaf': 'Patchouli', 'haitian vetiver': 'Vetiver', 'sicilian lemon': 'Lemon', 'lavandin': 'Lavender',
    'guaiacwood': 'Guaiac Wood', 'grey amber': 'Ambergris', 'geranium accord': 'Geranium', 'siam benzoin': 'Benzoin',
}
# the 79 notes added on 2026-11-22 (texts in scripts/notes_new_content.py); their tag spellings map to one display name
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import notes_new_content as _new
for _h, _names in _new.tags().items():
    NOTES.append(_names[0])
    for _n in _names:
        ALIAS[_n.lower()] = _names[0]
MOMENTS = ['fresh-moment', 'winter-moment', 'love-moment', 'night-moment', 'gift-moment', 'self-care-moment']
FRAG = {'Perfume', 'Extrait de Parfum', 'Perfume Oil', 'Perfume Mist', 'Body Spray', 'Perfume Set', 'Eau de Parfum', 'Gift Set', 'Deodorant'}
EMO = re.compile('[\U0001F000-\U0001FFFF☀-➿️‍]')


def norm(raw):
    c = re.sub(r'\s+', ' ', EMO.sub('', raw or '')).strip(' .')
    if not c:
        return None
    k = c.lower()
    return ALIAS.get(k) or ' '.join(w if w in ('of', 'the', 'de') else w[:1].upper() + w[1:] for w in k.split())


def val(n, k):
    x = n.get(k)
    return x.get('value') if isinstance(x, dict) else None


def storefront(base, handle):
    """All product handles (and availability) of a collection, from the public products.json."""
    out, page = {}, 1
    while True:
        url = '%s/collections/%s/products.json?limit=250&page=%d' % (base, handle, page)
        for attempt in range(8):
            try:
                with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'notes-recalc'}), timeout=60) as r:
                    ps = json.load(r)['products']
                break
            except urllib.error.HTTPError as e:
                if e.code != 429 or attempt == 7:
                    raise
                time.sleep(int(e.headers.get('Retry-After') or 0) or 5 * (attempt + 1))
        for p in ps:
            out[p['handle']] = any(v.get('available') for v in p.get('variants', []))
        if len(ps) < 250:
            return out
        page += 1
        time.sleep(2)


# "Famous" shortlist (owner, 2026-11-20): handle -> line. Within a line the list order is the "better-known" order; only one perfume
# per line is shown in a note's list. Matched by product title against the catalogue; sold-out / non-perfume items are skipped at runtime.
SHORTLIST = [
    ('khamrah', 'khamrah'), ('khamrah-qahwa', 'khamrah'), ('yara-pink', 'yara'), ('bara-yellow', 'yara'), ('asad', 'asad'),
    ('fakhar-black-fakhar-lattafa-black', 'fakhar'), ('fakhar-lattafa-white', 'fakhar'), ('ana-abiyedh-black-60-ml', 'ana-abiyedh'),
    ('qaoed-al-forsan-gold', 'qaed-al-fursan'), ('badee-al-oud-white', 'badee'), ('badee-al-oud-amethyst', 'badee'),
    ('badee-al-oud-red', 'badee'), ('badee-al-oud-oud-for-glory', 'badee'), ('oud-mood-yellow', 'oud-mood'), ('raghba-women', 'raghba'),
    ('tariq-perfume', 'teriaq'), ('eclair', 'eclaire'), ('hayati-black', 'hayaati'), ('angham-lattafa', 'angham'),
    ('ramz-lattafa-gold', 'ramz'), ('nebras-pride', 'nebras'), ('his-confession-black', 'his-confession'),
    ('her-confession-white', 'her-confession'),
    ('club-de-nuit-intense-man', 'cdn-intense-man'), ('club-de-nuit-iconic', 'cdn-iconic'), ('club-de-nuit-milestone', 'cdn-milestone'),
    ('club-de-nuit-sillage', 'cdn-sillage'), ('club-de-nuit-sillage-1', 'cdn-sillage'), ('club-de-nuit-woman-1', 'cdn-woman'),
    ('club-de-nuit-woman', 'cdn-woman'), ('club-de-nuit-urban-man-elixir', 'cdn-urban-elixir'),
    ('odyssey-mandarin-sky-man', 'mandarin-sky'),
    ('pm-9-black', '9pm'), ('9pm-elixir', '9pm'), ('bm-9-rebel-red', '9pm'), ('supremacy-silver-1', 'supremacy'),
    ('supremacy-silver', 'supremacy'), ('supremacy-noir', 'supremacy'),
    ('hawas-men', 'hawas'), ('hawas-ice', 'hawas'), ('hawas-elixir', 'hawas'), ('hawas-black', 'hawas'),
    ('shiyaaka-blue', 'shiyaaka-blue'), ('island-vanilla-dunes-100ml', 'island-vanilla-dunes'),
    ('ameer-al-oud-gold', 'ameer-al-oud'), ('liquid-brun', 'liquid-brun'),
]
LIST_TYPES = {'Perfume', 'Extrait de Parfum', 'Perfume Oil', 'Eau de Parfum'}
NOT_A_BOTTLE = re.compile(r'set|perfumed spray|gift|mist|deodorant', re.I)
LEVEL_RANK = {'star': 0, 'supporting': 1, 'touch': 2}


def famous_lists(per_note, count=6):
    """note handle -> ordered product handles: shortlist (strongest note first, one per line) then calculated fill (max 2 per brand)."""
    order = {h: i for i, (h, _) in enumerate(SHORTLIST)}
    line = dict(SHORTLIST)
    out, detail = {}, {}
    for note in NOTES:
        rs = [r for r in per_note.get(note, []) if r['available'] and r['type'] in LIST_TYPES and not NOT_A_BOTTLE.search(r['title'])]
        fam = sorted((r for r in rs if r['handle'] in line), key=lambda r: (LEVEL_RANK[r['level']], -r['points'], order[r['handle']]))
        picked, used_lines = [], set()
        for r in fam:
            if line[r['handle']] in used_lines:
                continue
            used_lines.add(line[r['handle']])
            picked.append(dict(r, badge=True))
            if len(picked) == count:
                break
        per_brand = collections.Counter(r['brand'] for r in picked)
        fill = sorted((r for r in rs if r['handle'] not in line and r['level'] in ('star', 'supporting')),
                      key=lambda r: (-r['sales'], -r['points'], not r['full'], r['handle']))
        for r in fill:
            if len(picked) == count:
                break
            if per_brand[r['brand']] >= 2 or any(p['handle'] == r['handle'] for p in picked):
                continue
            picked.append(dict(r, badge=False))
            per_brand[r['brand']] += 1
        # a note no perfume carries strongly still shows up to 3 perfumes where it is "a touch" (2026-11-22, so no card is empty)
        if len(picked) < 3:
            touch = sorted((r for r in rs if r['handle'] not in line and r['level'] == 'touch' and not any(p['handle'] == r['handle'] for p in picked)),
                           key=lambda r: (-r['sales'], -r['points'], not r['full'], r['handle']))
            for r in touch:
                if len(picked) >= 3:
                    break
                if per_brand[r['brand']] >= 2:
                    continue
                picked.append(dict(r, badge=False))
                per_brand[r['brand']] += 1
        key = re.sub(r'[^a-z0-9]+', '-', note.lower()).strip('-')
        out[key] = [r['handle'] for r in picked]
        detail[key] = [(r['title'], r['level'], 'Most loved' if r['badge'] else 'calculated') for r in picked]
    return out, detail


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--export', required=True)
    ap.add_argument('--out', required=True)
    ap.add_argument('--base', default='https://momentseg.com')
    ap.add_argument('--sales', help='optional CSV handle,units (last 365 days)')
    ap.add_argument('--members', help='optional JSON {collection: {product handle: available}} from the Admin API')
    ap.add_argument('--exclude-unconfirmed', help='NOTES_FILL_REVIEW.csv: products whose status starts with UNCONFIRMED are left out of every list and count (owner decision 2026-11-20)')
    ap.add_argument('--apply', action='store_true')
    a = ap.parse_args()

    prods = {}
    for f in sorted(glob.glob(os.path.join(a.export, 'page*.json'))):
        for n in json.load(open(f, encoding='utf-8'))['data']['products']['nodes']:
            prods.setdefault(n['handle'], n)
    if a.members:
        # Admin API export {collection_handle: {product_handle: available}} (the public products.json is rate limited)
        mem = json.load(open(a.members, encoding='utf-8'))
        member = {m: mem.get(m, {}) for m in MOMENTS}
        avail = mem.get('bundle-perfumes', {})
    else:
        member = {m: storefront(a.base, m) for m in MOMENTS}
        avail = storefront(a.base, 'bundle-perfumes')
    sales = {}
    if a.sales:
        sales = {r['handle']: float(r['units']) for r in csv.DictReader(open(a.sales, encoding='utf-8'))}

    skip = set()
    if a.exclude_unconfirmed:
        skip = {r['handle'] for r in csv.DictReader(open(a.exclude_unconfirmed, encoding='utf-8-sig')) if r['status'].upper().startswith('UNCONFIRMED')}
        print('excluded UNCONFIRMED products:', len(skip))
    per_note = collections.defaultdict(list)
    strength_rows = []
    for h, n in prods.items():
        if n['status'] != 'ACTIVE' or n['productType'] not in FRAG or h in skip:
            continue
        layers = {L: [x for x in (norm(val(n, '%s%d' % (L[0], i))) for i in range(1, 7)) if x] for L in ('top', 'heart', 'base')}
        try:
            key = [x for x in (norm(y) for y in json.loads(val(n, 'fnotes') or '[]')) if x]
        except ValueError:
            key = []
        full = all(layers.values())
        present = set(sum(layers.values(), [])) or set(key)
        title = n['title'].lower()
        for note in NOTES:
            if note not in present:
                continue
            pts = 0
            for L, w in (('base', 2), ('heart', 1), ('top', 1)):
                if note in layers[L]:
                    pts = max(pts, w + {0: 2, 1: 1}.get(layers[L].index(note), 0))
            pts += 3 if re.search(r'\b%s\b' % re.escape(note.lower()), title) else 0
            pts += 2 if note in key else 0
            level = 'star' if pts >= 5 else 'supporting' if pts >= 3 else 'touch'
            moms = [m for m in MOMENTS if h in member[m]]
            rec = {'handle': h, 'title': n['title'], 'type': n['productType'], 'brand': n['vendor'].upper(), 'points': pts, 'level': level, 'full': full,
                   'available': avail.get(h, False), 'season': val(n, 'fseason') or '', 'gender': val(n, 'gender') or '', 'moments': moms,
                   'sales': sales.get(h, 0)}
            per_note[note].append(rec)
            strength_rows.append({'note': note, 'handle': h, 'title': n['title'], 'points': pts, 'level': level})

    preview = {}
    for note in NOTES:
        rs = per_note.get(note, [])
        n = len(rs) or 1
        season = collections.Counter(r['season'] or 'unknown' for r in rs)
        gender = collections.Counter(r['gender'] or 'unknown' for r in rs)
        moment = collections.Counter(m for r in rs for m in r['moments'])
        pct = lambda c: {k: round(100 * v / n) for k, v in c.most_common()}
        sp, gp = pct(season), pct(gender)
        tags = []
        w, s = sp.get('Winter', 0), sp.get('Summer', 0)
        if w >= 50 and w - s >= 15:
            tags.append('winter')
        elif s >= 50 and s - w >= 15:
            tags.append('summer')
        if gp.get('For Him', 0) >= 45:
            tags.append('men')
        if gp.get('For Her', 0) >= 45:
            tags.append('women')
        if 'men' not in tags and 'women' not in tags:
            tags.append('unisex')
        tags += [m for m, _ in moment.most_common(2)]
        cands = [r for r in rs if r['available'] and r['level'] in ('star', 'supporting')]
        cands.sort(key=lambda r: (-r['sales'], -r['points'], not r['full'], r['handle']))
        top, per_brand = [], collections.Counter()
        for r in cands:
            if per_brand[r['brand']] >= 2:
                continue
            top.append(r)
            per_brand[r['brand']] += 1
            if len(top) == 6:
                break
        preview[note] = {'perfume_count': len(rs), 'season_share': sp, 'gender_share': gp, 'moment_share': pct(moment),
                         'filter_tags': tags, 'top_products': [(r['title'], r['brand'], r['level']) for r in top],
                         'levels': dict(collections.Counter(r['level'] for r in rs))}

    os.makedirs(a.out, exist_ok=True)
    json.dump(preview, open(os.path.join(a.out, 'notes-preview.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    with open(os.path.join(a.out, 'notes-preview.csv'), 'w', newline='', encoding='utf-8-sig') as f:
        w = csv.writer(f)
        w.writerow(['note', 'perfumes', 'season %', 'gender %', 'moment %', 'filter tags', 'top 6'])
        for k, p in preview.items():
            w.writerow([k, p['perfume_count'], p['season_share'], p['gender_share'], p['moment_share'], ' '.join(p['filter_tags']),
                        ' | '.join('%s (%s, %s)' % t for t in p['top_products'])])
    with open(os.path.join(a.out, 'product-strength.csv'), 'w', newline='', encoding='utf-8-sig') as f:
        w = csv.DictWriter(f, fieldnames=['note', 'handle', 'title', 'points', 'level'])
        w.writeheader()
        w.writerows(strength_rows)
    fam, fam_detail = famous_lists(per_note)
    json.dump(fam, open(os.path.join(a.out, 'notes_famous.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    json.dump(fam_detail, open(os.path.join(a.out, 'notes_famous_preview.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('preview written to', a.out, '| notes:', len(preview), '| moment members:', {m: len(v) for m, v in member.items()})
    if a.apply:
        sys.exit('--apply is not enabled yet: the owner has not approved writing (2026-11-20). Nothing was written.')


if __name__ == '__main__':
    main()
