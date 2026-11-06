"""Fills the filter fields the Search & Discovery filters read, from the same data as the product pages (owner 2026-11-06):
  filter.family   Primary + Secondary scent families (data/scent-scores.csv)
  filter.notes    the perfume's notes (top, heart, base; the same reading as its description)
  filter.moment   the moment collections the product is in (the six collections the product cards use)
plus their Arabic translations. A product without a value keeps what it has (nothing is erased).

usage:
  python scripts/apply-filter-data.py --create-moment-definition   # once: the filter.moment field (list of text)
  python scripts/apply-filter-data.py --dry-run                    # counts and samples, nothing written
  python scripts/apply-filter-data.py                              # back up, write, verify, translate
  python scripts/apply-filter-data.py --rollback <backup.json>     # put back the values from a backup

Safety: the product count must be 821 before and after; every current value is saved to
data/backups/filter-metafields-<time>.json before the first write; each batch is read back and must match.
"""
import csv
import importlib.util
import json
import os
import sys
import time

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, os.path.join(ROOT, "scripts"))


def load(name, file):
    spec = importlib.util.spec_from_file_location(name, os.path.join(ROOT, "scripts", file))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


ad = load("apply_descriptions", "apply-descriptions.py")
bd = load("build_descriptions", "build-descriptions.py")
gql, EXPECTED = ad.gql, ad.EXPECTED_COUNT

MOMENTS = {  # collection handle -> (English, Arabic), the names the product cards show (locales moments.*)
    "occasions-moment": ("Weddings & Eid", "الأفراح والأعياد"), "love-moment": ("Date night", "ليلة رومانسية"),
    "night-moment": ("Evening out", "سهرة"), "winter-moment": ("Winter nights", "ليالي الشتاء"),
    "fresh-moment": ("Summer heat", "حر الصيف"), "daily-moment": ("Office", "العمل")}
KEYS = ("family", "notes", "moment")
# Key notes: the 30 notes already approved in the store's filter.notes definition (its "choices"), a list a shopper
# recognises. A product is filed under each of them its notes contain; variants count as the note.
KEY_NOTES = ["Vanilla", "Oud", "Rose", "Musk", "Amber", "Saffron", "Jasmine", "Sandalwood", "Patchouli", "Tonka Bean", "Tobacco",
             "Leather", "Coffee", "Caramel", "Honey", "Lavender", "Incense", "Iris", "Coconut", "Cherry", "Chocolate", "Pistachio",
             "Orange Blossom", "Citrus", "Marine", "Vetiver", "Apple", "Berries", "Pineapple", "Cinnamon"]
KEY_VARIANTS = {"White Musk": "Musk", "White Musks": "Musk", "Ambergris": "Amber", "Amber Notes": "Amber", "Amberwood": "Amber",
                "Agarwood": "Oud", "Oud Wood": "Oud", "Damask Rose": "Rose", "Turkish Rose": "Rose", "Taif Rose": "Rose",
                "Jasmine Sambac": "Jasmine", "Bourbon Vanilla": "Vanilla", "Madagascar Vanilla": "Vanilla", "Olibanum": "Incense",
                "Frankincense": "Incense", "Roasted Coffee": "Coffee", "Coffee Notes": "Coffee", "Tonka": "Tonka Bean",
                "Tobacco Leaf": "Tobacco", "Orris": "Iris", "Green Apple": "Apple", "Black Cherry": "Cherry", "Dark Chocolate": "Chocolate",
                "Cacao": "Chocolate", "Aquatic Notes": "Marine", "Sea Notes": "Marine", "Sea Salt": "Marine", "Water Notes": "Marine",
                "Marine Accords": "Marine", "Aquatic Accords": "Marine", "Neroli": "Orange Blossom",
                **{c: "Citrus" for c in ("Bergamot", "Lemon", "Mandarin", "Mandarin Orange", "Grapefruit", "Orange", "Lime",
                                         "Blood Orange", "Yuzu", "Tangerine", "Italian Bergamot", "Italian Lemon", "Sicilian Lemon",
                                         "Pink Grapefruit", "Sweet Lemon", "Citrus")},
                **{b: "Berries" for b in ("Red Berries", "Raspberry", "Strawberry", "Blackcurrant", "Black Currant", "Blackberries",
                                          "Blueberry", "Pink Berry")}}
# the store's filter.family choices have no "Patchouli": patchouli sits with the woods on the fragrance wheel
FAMILY_FOR_FILTER = {"Patchouli": "Woody"}


def all_products():
    out, cursor = [], None
    while True:
        q = ("query($c: String) { products(first: 100, after: $c) { pageInfo { hasNextPage endCursor } nodes { id handle "
             + " ".join(f'{k}: metafield(namespace: "filter", key: "{k}") {{ id value }}' for k in KEYS) + " } } }")
        d = gql(q, {"c": cursor})["products"]
        out += d["nodes"]
        if not d["pageInfo"]["hasNextPage"]:
            return out
        cursor = d["pageInfo"]["endCursor"]


def moment_members():
    members = {}
    for handle, (en, _) in MOMENTS.items():
        cursor = None
        while True:
            d = gql("query($h: String!, $c: String) { collectionByIdentifier(identifier: {handle: $h}) { products(first: 250, after: $c) "
                    "{ pageInfo { hasNextPage endCursor } nodes { handle } } } }", {"h": handle, "c": cursor})["collectionByIdentifier"]
            if not d:
                break
            for n in d["products"]["nodes"]:
                members.setdefault(n["handle"], []).append(handle)
            if not d["products"]["pageInfo"]["hasNextPage"]:
                break
            cursor = d["products"]["pageInfo"]["endCursor"]
    return members


def wanted_values():
    """handle -> {key: (english list, arabic list)}"""
    export, _, sheet, facts, note_ar, _, vocab, _ = bd.load()
    fam_ar = bd.fdb.FAMILY_AR
    scores = {r["handle"]: r for r in csv.DictReader(open(os.path.join(ROOT, "data", "scent-scores.csv"), encoding="utf-8-sig"))}
    out = {}
    for p in export:
        h, v = p["Handle"], {}
        s = scores.get(h)
        if s and s["primary family"]:
            fams = []
            for f in [s["primary family"]] + [f for f in s["secondary families"].split(", ") if f]:
                f = FAMILY_FOR_FILTER.get(f, f)
                if f not in fams:
                    fams.append(f)
            v["family"] = (fams, [fam_ar.get(f, f) for f in fams])
        notes, _, _ = bd.read_notes(p, sheet, facts)
        found = {KEY_VARIANTS.get(n, n) for layer in ("top", "heart", "base", "note") for n in notes.get(layer, [])}
        names = [k for k in KEY_NOTES if k in found]
        if names:
            v["notes"] = (names, [note_ar.get(n, n) for n in names])
        out[h] = v
    return out


def plan():
    products = all_products()
    members = moment_members()
    want = wanted_values()
    changes = []
    for p in products:
        w = dict(want.get(p["handle"], {}))
        if p["handle"] in members:
            ms = [MOMENTS[c] for c in MOMENTS if c in members[p["handle"]]]
            w["moment"] = ([m[0] for m in ms], [m[1] for m in ms])
        for key, (en, ar) in w.items():
            current = json.loads(p[key]["value"]) if p.get(key) else None
            if current != en:
                changes.append({"id": p["id"], "handle": p["handle"], "key": key, "old": current, "en": en, "ar": ar})
    return products, changes


def write(changes):
    for i in range(0, len(changes), 25):
        chunk = changes[i:i + 25]
        r = gql("mutation($m: [MetafieldsSetInput!]!) { metafieldsSet(metafields: $m) { metafields { id key owner { ... on Product { id } } } "
                "userErrors { field message } } }",
                {"m": [{"ownerId": c["id"], "namespace": "filter", "key": c["key"], "type": "list.single_line_text_field",
                        "value": json.dumps(c["en"], ensure_ascii=False)} for c in chunk]}, mutation=True)["metafieldsSet"]
        if r["userErrors"]:
            raise RuntimeError(r["userErrors"])
        ids = {(m["owner"]["id"], m["key"]): m["id"] for m in r["metafields"]}
        for c in chunk:
            c["metafield_id"] = ids[(c["id"], c["key"])]
        translate(chunk)
        print(f"  {min(i + 25, len(changes))}/{len(changes)}", flush=True)


def translate(chunk):
    d = gql("query($ids: [ID!]!) { translatableResourcesByIds(first: 25, resourceIds: $ids) { nodes { resourceId "
            "translatableContent { key digest } } } }", {"ids": [c["metafield_id"] for c in chunk]})
    digest = {n["resourceId"]: next(t["digest"] for t in n["translatableContent"] if t["key"] == "value")
              for n in d["translatableResourcesByIds"]["nodes"]}
    parts, variables = [], {}
    for j, c in enumerate(chunk):
        parts.append(f"t{j}: translationsRegister(resourceId: $r{j}, translations: $v{j}) {{ userErrors {{ message }} }}")
        variables[f"r{j}"] = c["metafield_id"]
        variables[f"v{j}"] = [{"key": "value", "locale": "ar", "value": json.dumps(c["ar"], ensure_ascii=False),
                               "translatableContentDigest": digest[c["metafield_id"]]}]
    decl = ", ".join(f"$r{j}: ID!, $v{j}: [TranslationInput!]!" for j in range(len(chunk)))
    r = gql(f"mutation({decl}) {{ " + " ".join(parts) + " }", variables, mutation=True)
    errors = [e for v in r.values() for e in v["userErrors"]]
    if errors:
        raise RuntimeError(errors)


def verify(changes):
    after = {p["handle"]: p for p in all_products()}
    bad = [c["handle"] + "/" + c["key"] for c in changes
           if not after[c["handle"]].get(c["key"]) or json.loads(after[c["handle"]][c["key"]]["value"]) != c["en"]]
    return bad


def main():
    if "--create-moment-definition" in sys.argv:
        r = gql('mutation { metafieldDefinitionCreate(definition: {name: "Moment", namespace: "filter", key: "moment", '
                'type: "list.single_line_text_field", ownerType: PRODUCT, description: "Moment collections the product is in '
                '(filled by scripts/apply-filter-data.py)"}) { createdDefinition { id } userErrors { field message code } } }',
                mutation=True)["metafieldDefinitionCreate"]
        print(r)
        return
    if "--rollback" in sys.argv:
        backup = json.load(open(sys.argv[sys.argv.index("--rollback") + 1], encoding="utf-8"))
        sets, deletes = [], []
        for c in backup["changes"]:
            if c["old"] is None:
                deletes.append({"ownerId": c["id"], "namespace": "filter", "key": c["key"]})
            else:
                sets.append({"ownerId": c["id"], "namespace": "filter", "key": c["key"], "type": "list.single_line_text_field",
                             "value": json.dumps(c["old"], ensure_ascii=False)})
        for i in range(0, len(sets), 25):
            gql("mutation($m: [MetafieldsSetInput!]!) { metafieldsSet(metafields: $m) { userErrors { message } } }",
                {"m": sets[i:i + 25]}, mutation=True)
        for i in range(0, len(deletes), 25):
            gql("mutation($m: [MetafieldIdentifierInput!]!) { metafieldsDelete(metafields: $m) { userErrors { message } } }",
                {"m": deletes[i:i + 25]}, mutation=True)
        print(f"rolled back: {len(sets)} restored, {len(deletes)} removed")
        return
    products, changes = plan()
    if len(products) != EXPECTED:
        sys.exit(f"stop: {len(products)} products, expected {EXPECTED}")
    by_key = {k: sum(1 for c in changes if c["key"] == k) for k in KEYS}
    print(f"{len(products)} products; changes: {by_key}")
    if "--dry-run" in sys.argv:
        for c in changes[:12]:
            print(c["handle"], c["key"], c["old"], "->", c["en"], "|", c["ar"])
        return
    os.makedirs(os.path.join(ROOT, "data", "backups"), exist_ok=True)
    path = os.path.join(ROOT, "data", "backups", time.strftime("filter-metafields-%Y-%m-%d-%H%M.json"))
    json.dump({"products": products, "changes": changes}, open(path, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("backup:", path)
    write(changes)
    bad = verify(changes)
    count = len(all_products())
    print(f"verified: {len(changes) - len(bad)} of {len(changes)}; product count {count}")
    if bad or count != EXPECTED:
        sys.exit(f"stop: mismatches {bad[:20]} count {count}; roll back with --rollback {path}")


if __name__ == "__main__":
    main()
