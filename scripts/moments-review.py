"""Moments review (owner request 2026-11-22): does every product sit in the right moments?
Read-only. Uses the export from scripts/notes-export.py (pages + the six moment collections) and writes a sheet for the owner:
  D:/MOMENTS_Content/06_Website/moments/MOMENTS_REVIEW.csv   one row per active product: now / suggested / add / remove / why
  D:/MOMENTS_Content/06_Website/moments/MOMENTS_REVIEW_SUMMARY.md
Nothing is written to the store. After the owner approves (or edits the "suggested" column), a separate apply step moves products.

usage: python scripts/moments-review.py <export_dir>

How a moment is suggested (scent data on the product: filter.family, filter.season, gender, product type):
  Evening out (night-moment)   deep and warm: oud, amber & oriental, leather & tobacco, spicy; not for summer-only scents
  Date night  (love-moment)    soft and close: floral, gourmand, musky, fruity
  Summer heat (fresh-moment)   light: citrus, fresh & aquatic, fruity; summer or all-year
  Winter      (winter-moment)  winter season, or rich families (oud, amber, gourmand, spicy, leather)
  Gift        (gift-moment)    gift sets and perfume sets always; perfumes keep their gift place; never deodorant, air freshener, bag
  Self-care   (self-care-moment) body and home care (deodorant, body spray, mist, air freshener) and clean musky everyday perfumes
Careful by default: a perfume keeps its moments; one is removed only when its scent clearly contradicts it (a summer
scent in Winter, an oud or winter scent in Summer heat, a light summer scent in Evening out); one is added only on a
strong match (score 4+), at most 3 scent moments; products without scent data are kept as they are.
Incense (bakhoor) is listed for the planned bakhoor page and keeps its current moments until that page exists.
"""
import csv, json, os, sys

EXPORT = sys.argv[1]
OUT = 'D:/MOMENTS_Content/06_Website/moments'
MOM = {'night': 'Evening out', 'love': 'Date night', 'fresh': 'Summer heat', 'winter': 'Winter', 'gift': 'Gift', 'selfcare': 'Self-care'}
SCENT = ['night', 'love', 'fresh', 'winter']
BODY = {'Deodorant', 'Body Spray', 'Perfume Mist', 'Air Freshener'}
SETS = {'Gift Set', 'Perfume Set'}
NONE = {'Bag'}


def vals(p, k):
    m = p.get(k)
    if not m or not m.get('value'):
        return []
    v = m['value']
    return json.loads(v) if v.startswith('[') else [v]


def score(p):
    fam = set(vals(p, 'family'))
    season = (vals(p, 'fseason') or vals(p, 'cseason') or [''])[0]
    s, why = {k: 0 for k in SCENT}, {k: [] for k in SCENT}

    def add(k, n, r):
        s[k] += n
        if n > 0:
            why[k].append(r)

    for f, n in (('Oud', 2), ('Amber & Oriental', 2), ('Leather & Tobacco', 2), ('Spicy', 1), ('Woody', 1), ('Gourmand', 1)):
        if f in fam:
            add('night', n, f.lower())
    for f, n in (('Floral', 2), ('Gourmand', 2), ('Musky', 2), ('Fruity', 1), ('Amber & Oriental', 1)):
        if f in fam:
            add('love', n, f.lower())
    for f, n in (('Citrus', 3), ('Fresh & Aquatic', 3), ('Fruity', 2)):
        if f in fam:
            add('fresh', n, f.lower())
    rich = [f for f in ('Oud', 'Amber & Oriental', 'Gourmand', 'Spicy', 'Leather & Tobacco') if f in fam]
    add('winter', min(len(rich), 2), ', '.join(r.lower() for r in rich))
    if season == 'Winter':
        add('winter', 3, 'winter scent'); add('fresh', -3, ''); add('night', 1, 'winter scent')
    elif season == 'Summer':
        add('fresh', 2, 'summer scent'); add('winter', -3, ''); add('night', -2, '')
    if 'Oud' in fam or 'Leather & Tobacco' in fam:
        add('fresh', -2, '')
    if 'Citrus' in fam or 'Fresh & Aquatic' in fam:
        add('night', -1, ''); add('winter', -1, '')
    return s, why, season, fam


def suggest(p):
    t = p['productType'] or ''
    now = [k for k in MOM if p.get(k)]
    if t == '':
        return now, 'no product type set: kept as is (set the type in Shopify)'
    if t in NONE:
        return [], 'not a perfume: no moment'
    if t in SETS:
        return sorted(set(now) | {'gift'}, key=list(MOM).index), 'set: gift'
    if t in BODY:
        keep = ['selfcare']
        return keep, f'{t.lower()}: self-care only'
    if t == 'Incense':
        return now, 'incense: kept as is, for the bakhoor page'
    s, why, season, fam = score(p)
    if not fam and not season:
        return now, 'no scent data on the product: kept as is'
    out, notes = set(now), []
    # remove only what the scent clearly contradicts
    contra = {
        'fresh': season == 'Winter' or bool(fam & {'Oud', 'Leather & Tobacco'}),
        'winter': season == 'Summer' and not fam & {'Oud', 'Amber & Oriental', 'Leather & Tobacco'},
        'night': season == 'Summer' and bool(fam) and fam <= {'Citrus', 'Fresh & Aquatic', 'Fruity', 'Floral'},
    }
    for k, bad in contra.items():
        if bad and k in out:
            out.discard(k)
            notes.append(f"remove {MOM[k]}: " + {'fresh': 'a winter / oud / leather scent', 'winter': 'a summer scent',
                                                  'night': 'a light summer scent'}[k])
    # add only strong matches that are missing
    for k in SCENT:
        if k not in out and s[k] >= 4 and len([m for m in out if m in SCENT]) < 3:
            out.add(k)
            notes.append(f"add {MOM[k]}: " + ', '.join(dict.fromkeys(why[k])))
    if not [m for m in out if m in SCENT]:
        best = max(SCENT, key=lambda k: s[k])
        out.add(best)
        notes.append(f"add {MOM[best]} (its best match): " + ', '.join(dict.fromkeys(why[best])))
    reason = '; '.join(notes) or 'fits its moments'
    return sorted(out, key=list(MOM).index), reason


def main():
    P = []
    for f in sorted(os.listdir(EXPORT)):
        if f.startswith('page') and f.endswith('.json'):
            j = json.load(open(os.path.join(EXPORT, f), encoding='utf-8'))
            P += (j.get('products') or j.get('data', {}).get('products'))['nodes']
    os.makedirs(OUT, exist_ok=True)
    rows, adds, rems, changed = [], {k: 0 for k in MOM}, {k: 0 for k in MOM}, 0
    for p in P:
        if p['status'] != 'ACTIVE':
            continue
        now = [k for k in MOM if p.get(k)]
        new, reason = suggest(p)
        a, r = [k for k in new if k not in now], [k for k in now if k not in new]
        for k in a: adds[k] += 1
        for k in r: rems[k] += 1
        changed += bool(a or r)
        rows.append({'handle': p['handle'], 'title': p['title'], 'brand': p['vendor'], 'type': p['productType'],
                     'gender': ', '.join(vals(p, 'gender')), 'families': ', '.join(vals(p, 'family')),
                     'season': ', '.join(vals(p, 'fseason')), 'moments now': ' | '.join(MOM[k] for k in now),
                     'suggested': ' | '.join(MOM[k] for k in new), 'add': ' | '.join(MOM[k] for k in a),
                     'remove': ' | '.join(MOM[k] for k in r), 'why': reason, 'approve (yes/no/edit)': ''})
    rows.sort(key=lambda x: (not (x['add'] or x['remove']), x['type'], x['brand'], x['title']))
    with open(OUT + '/MOMENTS_REVIEW.csv', 'w', newline='', encoding='utf-8-sig') as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0]))
        w.writeheader(); w.writerows(rows)
    after = {k: sum(1 for x in rows if MOM[k] in x['suggested'].split(' | ')) for k in MOM}
    before = {k: sum(1 for x in rows if MOM[k] in x['moments now'].split(' | ')) for k in MOM}
    md = ['# Moments review (2026-11-22)', '', f'{len(rows)} active products; {changed} would change. Nothing is written to the store yet.', '',
          '| Moment | now | suggested | added | removed |', '|---|---|---|---|---|']
    md += [f'| {MOM[k]} | {before[k]} | {after[k]} | {adds[k]} | {rems[k]} |' for k in MOM]
    open(OUT + '/MOMENTS_REVIEW_SUMMARY.md', 'w', encoding='utf-8').write('\n'.join(md) + '\n')
    print('\n'.join(md))


if __name__ == '__main__':
    main()
