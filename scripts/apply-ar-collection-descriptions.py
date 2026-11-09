"""Arabic descriptions (subtitles) for the 24 moment collections (owner approved the wording 2026-11-09). Only the ar
"body_html" translation is written; the English description and every other field are untouched. Backs up first,
keeps the English HTML wrapping, reads back after.
usage: python scripts/apply-ar-collection-descriptions.py [--rollback]
"""
import json
import os
import re
import sys
from importlib import import_module

sys.path.insert(0, os.path.dirname(__file__))
gql = import_module("apply-descriptions").gql
BACKUP = os.path.join(os.path.dirname(__file__), "..", "data", "translations", "ar-collection-descriptions-before.json")

AR = {
    "Light, clean scents for early mornings, the gym and long summer days.": "روائح خفيفة ونظيفة للصباح الباكر والجيم وأيام الصيف الطويلة.",
    "Easy-going scents for work, uni and the errands in between.": "روائح مريحة للعمل والجامعة وكل المشاوير بينهما.",
    "Soft, warm scents for first dates, engagements and the days you'll remember.": "روائح ناعمة ودافئة للمواعيد الأولى والخطوبة والأيام التي لا تُنسى.",
    "Deeper scents for nights out, weddings and evenings that run late.": "روائح أعمق للسهرات والأفراح والأمسيات الطويلة.",
    "Sets, proven favourites and easy-to-love picks, ready to give.": "أطقم ومفضّلات مضمونة واختيارات يحبها الجميع، جاهزة للإهداء.",
    "Soft scents and home fragrance for the time you keep for yourself.": "روائح ناعمة وعطور للمنزل للوقت الذي تخصّصه لنفسك.",
}
Q = """query($after: String) { translatableResources(first: 100, after: $after, resourceType: COLLECTION) { pageInfo { hasNextPage endCursor }
  nodes { resourceId translatableContent { key value digest } translations(locale: "ar") { key value } } } }"""


def plain(h):
    return " ".join(re.sub(r"<[^>]+>", " ", (h or "").replace("&#39;", "'").replace("&rsquo;", "'").replace("’", "'")).split())


targets, after = [], None
while True:
    d = gql(Q, {"after": after})["translatableResources"]
    for n in d["nodes"]:
        c = {x["key"]: x for x in n["translatableContent"]}
        body = c.get("body_html")
        if body and plain(body["value"]) in AR:
            ar_now = next((t["value"] for t in n["translations"] if t["key"] == "body_html"), "")
            targets.append({"id": n["resourceId"], "title": c["title"]["value"], "en": body["value"], "digest": body["digest"], "ar": ar_now})
    if not d["pageInfo"]["hasNextPage"]:
        break
    after = d["pageInfo"]["endCursor"]

if "--rollback" in sys.argv:
    for b in json.load(open(BACKUP, encoding="utf-8")):
        if not b["ar"]:
            gql('mutation($id: ID!) { translationsRemove(resourceId: $id, translationKeys: ["body_html"], locales: ["ar"]) '
                "{ userErrors { message } } }", {"id": b["id"]}, mutation=True)
        print("rolled back", b["title"])
    sys.exit()

json.dump(targets, open(BACKUP, "w", encoding="utf-8"), ensure_ascii=False, indent=1)  # back up before any write
print(len(targets), "collections found")
for t in targets:
    if re.search(r"[؀-ۿ]", t["ar"] or ""):
        print("skip (has Arabic):", t["title"])
        continue
    sentence = AR[plain(t["en"])]
    # keep the English wrapping (<p>…</p>), swap only the text
    inner = re.sub(r"<[^>]+>", "", t["en"]).strip()
    ar_html = t["en"].replace(inner, sentence) if inner in t["en"] else f"<p>{sentence}</p>"
    r = gql("mutation($id: ID!, $t: [TranslationInput!]!) { translationsRegister(resourceId: $id, translations: $t) "
            "{ userErrors { field message } } }",
            {"id": t["id"], "t": [{"key": "body_html", "locale": "ar", "value": ar_html, "translatableContentDigest": t["digest"]}]},
            mutation=True)["translationsRegister"]
    if r["userErrors"]:
        sys.exit(f"stop: {t['title']}: {r['userErrors']}")
    back = gql('query($id: ID!) { translatableResource(resourceId: $id) { translations(locale: "ar") { key value } } }',
               {"id": t["id"]})["translatableResource"]["translations"]
    ar_back = next((x["value"] for x in back if x["key"] == "body_html"), "")
    print("ok" if sentence in ar_back else "MISMATCH", t["title"], "->", plain(ar_back))
