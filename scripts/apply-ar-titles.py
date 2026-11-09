"""Add Arabic title translations for products that have none (owner approved 2026-11-09). Only the ar "title"
translation is written; English titles and every other field are untouched. Backs up first, reads back after.
usage: python scripts/apply-ar-titles.py            -> write
       python scripts/apply-ar-titles.py --rollback -> remove the ar titles this script added
"""
import json
import os
import sys
from importlib import import_module

sys.path.insert(0, os.path.dirname(__file__))
gql = import_module("apply-descriptions").gql
OUT = os.path.join(os.path.dirname(__file__), "..", "data", "translations")
BACKUP = os.path.join(OUT, "ar-titles-before.json")

# spelled as the Arabic descriptions already write them
NAMES = {"STARDUST": "ستاردست", "FRANKEL COLLECTION": "فرانكل كولكشن", "LADY COLLECTION": "ليدي كولكشن"}

READ = """query($id: ID!) { translatableResource(resourceId: $id) { translatableContent { key value digest }
  translations(locale: "ar") { key value } } }"""


def state(pid):
    r = gql(READ, {"id": pid})["translatableResource"]
    c = next(x for x in r["translatableContent"] if x["key"] == "title")
    ar = next((t["value"] for t in r["translations"] if t["key"] == "title"), "")
    return c["value"], c["digest"], ar


rows = json.load(open(os.path.join(OUT, "ar-title-audit.json"), encoding="utf-8"))
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
