"""List products whose Arabic title is missing, or is the same Latin text as the English title. Read-only.
usage: python scripts/audit-ar-titles.py   -> data/translations/ar-title-audit.json
"""
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(__file__))
from importlib import import_module

gql = import_module("apply-descriptions").gql
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUT = os.path.join(ROOT, "data", "translations")

Q = """query($after: String) { translatableResources(first: 100, after: $after, resourceType: PRODUCT) {
  pageInfo { hasNextPage endCursor }
  nodes { resourceId translatableContent { key value } translations(locale: "ar") { key value outdated } } } }"""

ARABIC = re.compile(r"[؀-ۿ]")
rows, after = [], None
while True:
    d = gql(Q, {"after": after})["translatableResources"]
    for n in d["nodes"]:
        en = next((c["value"] for c in n["translatableContent"] if c["key"] == "title"), "")
        tr = next((t for t in n["translations"] if t["key"] == "title"), None)
        ar = tr["value"] if tr else ""
        if not ar or not ARABIC.search(ar):
            rows.append({"id": n["resourceId"], "en": en, "ar": ar, "outdated": bool(tr and tr["outdated"])})
    if not d["pageInfo"]["hasNextPage"]:
        break
    after = d["pageInfo"]["endCursor"]
os.makedirs(OUT, exist_ok=True)
json.dump(rows, open(os.path.join(OUT, "ar-title-audit.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(len(rows), "products without an Arabic title")
for r in rows:
    print(" ", r["en"], "|", r["ar"] or "-")
