"""Add Arabic title translations for products that have none (owner approved 2026-11-09). Only the ar "title"
translation is written; English titles and every other field are untouched. Backs up first, reads back after.
usage: python scripts/apply-ar-titles.py [--collections]            -> write (products, or the moment collections)
       python scripts/apply-ar-titles.py [--collections] --rollback -> remove the ar titles this script added
"""
import json
import os
import sys
from importlib import import_module

sys.path.insert(0, os.path.dirname(__file__))
gql = import_module("apply-descriptions").gql
OUT = os.path.join(os.path.dirname(__file__), "..", "data", "translations")
COLLECTIONS = "--collections" in sys.argv

if COLLECTIONS:
    # the moment collections, each name translated as written (owner 2026-11-09: "Translate the names")
    BASE = {"Fresh Moments": "لحظات منعشة", "Everyday Moments": "لحظات كل يوم", "Love Moments": "لحظات الحب",
            "Night Moments": "لحظات المساء", "Gift Moments": "لحظات الهدايا", "Self-Care Moments": "لحظات العناية بالذات"}
    NAMES = {}
    for en, ar in BASE.items():
        NAMES[en] = ar
        NAMES[en + " for Him"] = ar + " للرجال"
        NAMES[en + " for Her"] = ar + " للنساء"
        NAMES["Unisex " + en] = ar + " للجنسين"
    AUDIT, BACKUP = "ar-collection-audit.json", os.path.join(OUT, "ar-collection-titles-before.json")
else:
    # spelled as the Arabic descriptions already write them
    NAMES = {"STARDUST": "ستاردست", "FRANKEL COLLECTION": "فرانكل كولكشن", "LADY COLLECTION": "ليدي كولكشن"}
    AUDIT, BACKUP = "ar-title-audit.json", os.path.join(OUT, "ar-titles-before.json")

READ = """query($id: ID!) { translatableResource(resourceId: $id) { translatableContent { key value digest }
  translations(locale: "ar") { key value } } }"""


def state(pid):
    r = gql(READ, {"id": pid})["translatableResource"]
    c = next(x for x in r["translatableContent"] if x["key"] == "title")
    ar = next((t["value"] for t in r["translations"] if t["key"] == "title"), "")
    return c["value"], c["digest"], ar


rows = json.load(open(os.path.join(OUT, AUDIT), encoding="utf-8"))
if "--rollback" in sys.argv:
    for b in json.load(open(BACKUP, encoding="utf-8")):
        if not b["ar"]:
            gql('mutation($id: ID!) { translationsRemove(resourceId: $id, translationKeys: ["title"], locales: ["ar"]) '
                "{ userErrors { message } } }", {"id": b["id"]}, mutation=True)
        print("rolled back", b["en"])
    sys.exit()

targets = [r for r in rows if r["en"] in NAMES]
backup = []
for r in targets:
    en, digest, ar = state(r["id"])
    backup.append({"id": r["id"], "en": en, "ar": ar})
json.dump(backup, open(BACKUP, "w", encoding="utf-8"), ensure_ascii=False, indent=1)  # back up before any write
for b in backup:
    if b["ar"]:
        print("skip (has Arabic now):", b["en"], b["ar"])
        continue
    _, digest, _ = state(b["id"])
    res = gql("mutation($id: ID!, $t: [TranslationInput!]!) { translationsRegister(resourceId: $id, translations: $t) "
              "{ userErrors { field message } } }",
              {"id": b["id"], "t": [{"key": "title", "locale": "ar", "value": NAMES[b["en"]], "translatableContentDigest": digest}]},
              mutation=True)["translationsRegister"]
    if res["userErrors"]:
        sys.exit(f"stop: {b['en']}: {res['userErrors']}")
    en, _, ar = state(b["id"])
    print("ok" if ar == NAMES[b["en"]] and en == b["en"] else "MISMATCH", b["en"], "->", ar)
