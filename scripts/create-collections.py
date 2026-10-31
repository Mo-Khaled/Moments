"""Create the scent collections from data/collections-plan.csv (built by fragrance-db.py). DRY RUN unless --apply.

Each collection is rule-based on the filter tags (family:, note:, gender:, season:, time:, type:), so it fills itself once
data/shopify-tags-import.csv has been imported, and keeps itself current when tags change.
Collections are created UNPUBLISHED (Shopify's default for the API); --publish puts them on the Online Store too.
Existing handles are skipped, nothing is ever deleted. Arabic titles are registered as the "ar" translation.

Needs an Admin API token from a custom app (Settings > Apps > Develop apps) with the scopes
write_products, write_translations and, for --publish, write_publications:
  set SHOPIFY_STORE=dezrva-2z.myshopify.com
  set SHOPIFY_ADMIN_TOKEN=shpat_...
  python scripts/create-collections.py                 (prints what would be created)
  python scripts/create-collections.py --apply [--publish] [--only note-]   (--only: handle prefix)
"""
import csv
import json
import os
import sys
import time
import urllib.request

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
API_VERSION = os.environ.get("SHOPIFY_API_VERSION", "2026-07")

def gql(query, variables=None):
    url = f"https://{os.environ['SHOPIFY_STORE']}/admin/api/{API_VERSION}/graphql.json"
    req = urllib.request.Request(url, data=json.dumps({"query": query, "variables": variables or {}}).encode(),
                                 headers={"Content-Type": "application/json", "X-Shopify-Access-Token": os.environ["SHOPIFY_ADMIN_TOKEN"]})
    out = json.load(urllib.request.urlopen(req, timeout=60))
    if out.get("errors"):
        raise RuntimeError(out["errors"])
    time.sleep(0.5)  # stays well inside the Admin API rate limit
    return out["data"]

EXISTS = "query($q: String!) { collections(first: 1, query: $q) { nodes { id handle } } }"
CREATE = """mutation($input: CollectionInput!) {
  collectionCreate(input: $input) { collection { id handle } userErrors { field message } } }"""
DIGEST = "query($id: ID!) { translatableResource(resourceId: $id) { translatableContent { key digest } } }"
TRANSLATE = """mutation($id: ID!, $t: [TranslationInput!]!) {
  translationsRegister(resourceId: $id, translations: $t) { userErrors { field message } } }"""
PUBLICATIONS = "{ publications(first: 20) { nodes { id name } } }"
PUBLISH = """mutation($id: ID!, $p: ID!) {
  publishablePublish(id: $id, input: [{ publicationId: $p }]) { userErrors { field message } } }"""

def rules(rule):
    return [{"column": "TAG", "relation": "EQUALS", "condition": tag.strip()} for tag in rule.split(" + ")]

def main():
    apply, publish = "--apply" in sys.argv, "--publish" in sys.argv
    only = sys.argv[sys.argv.index("--only") + 1] if "--only" in sys.argv else ""
    plan = [r for r in csv.DictReader(open(os.path.join(ROOT, "data", "collections-plan.csv"), encoding="utf-8-sig"))
            if r["handle"].startswith(only)]
    if not apply:
        for r in plan:
            print(f"would create {r['handle']:<40} {r['title']:<45} rule: {r['rule (all tags must match)']}  ({r['products']} products)")
        print(f"\n{len(plan)} collections. Run again with --apply to create them (unpublished).")
        return
    online = None
    if publish:
        online = next(p["id"] for p in gql(PUBLICATIONS)["publications"]["nodes"] if p["name"] == "Online Store")
    made = skipped = 0
    for r in plan:
        if gql(EXISTS, {"q": f"handle:{r['handle']}"})["collections"]["nodes"]:
            skipped += 1
            continue
        res = gql(CREATE, {"input": {"title": r["title"], "handle": r["handle"],
                                     "ruleSet": {"appliedDisjunctively": False, "rules": rules(r["rule (all tags must match)"])}}})["collectionCreate"]
        if res["userErrors"]:
            print("ERROR", r["handle"], res["userErrors"])
            continue
        cid = res["collection"]["id"]
        digest = next(c["digest"] for c in gql(DIGEST, {"id": cid})["translatableResource"]["translatableContent"] if c["key"] == "title")
        err = gql(TRANSLATE, {"id": cid, "t": [{"key": "title", "locale": "ar", "value": r["title_ar"], "translatableContentDigest": digest}]})
        if err["translationsRegister"]["userErrors"]:
            print("Arabic title not saved", r["handle"], err["translationsRegister"]["userErrors"])
        if online:
            gql(PUBLISH, {"id": cid, "p": online})
        made += 1
        print("created", r["handle"])
    print(f"\ncreated {made}, skipped {skipped} (already there)")

if __name__ == "__main__":
    main()
