"""List theme text (template and section-group settings) visible to shoppers that has no Arabic translation. Read-only.
usage: python scripts/audit-ar-theme-text.py <theme id>   -> data/translations/ar-theme-text-<id>.json
"""
import json
import os
import re
import sys
from importlib import import_module

sys.path.insert(0, os.path.dirname(__file__))
gql = import_module("apply-descriptions").gql
OUT = os.path.join(os.path.dirname(__file__), "..", "data", "translations")
THEME = sys.argv[1]
ARABIC = re.compile(r"[؀-ۿ]")
TYPES = ["ONLINE_STORE_THEME_JSON_TEMPLATE", "ONLINE_STORE_THEME_SECTION_GROUP", "ONLINE_STORE_THEME_SETTINGS_DATA_SECTIONS"]
Q = """query($after: String, $t: TranslatableResourceType!) { translatableResources(first: 50, after: $after, resourceType: $t) {
  pageInfo { hasNextPage endCursor }
  nodes { resourceId translatableContent { key value digest } translations(locale: "ar") { key value outdated } } } }"""

rows = []
for t in TYPES:
    after = None
    while True:
        d = gql(Q, {"after": after, "t": t})["translatableResources"]
        for n in d["nodes"]:
            if f"/{THEME}" not in n["resourceId"] and THEME not in n["resourceId"]:
                continue
            ar = {x["key"]: x for x in n["translations"]}
            for c in n["translatableContent"]:
                v = (c["value"] or "").strip()
                text = re.sub(r"<[^>]+>|\{\{.*?\}\}|\{%.*?%\}", " ", v)
                if not re.search(r"[A-Za-z]{3}", text) or ARABIC.search(text):
                    continue
                if c["key"].endswith((".link", ".url", ".image", ".video", ".icon", ".handle")) or v.startswith(("shopify://", "http", "#", "/")):
                    continue
                tr = ar.get(c["key"])
                if tr and ARABIC.search(tr["value"] or "") and not tr["outdated"]:
                    continue
                rows.append({"resource": n["resourceId"], "key": c["key"], "digest": c["digest"], "en": v,
                             "ar": tr["value"] if tr else "", "outdated": bool(tr and tr["outdated"])})
        if not d["pageInfo"]["hasNextPage"]:
            break
        after = d["pageInfo"]["endCursor"]
os.makedirs(OUT, exist_ok=True)
json.dump(rows, open(os.path.join(OUT, f"ar-theme-text-{THEME}.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(len(rows), "theme texts without Arabic on theme", THEME)
for r in rows:
    print(f"  {r['key'][:90]} | {r['en'][:70]}")
