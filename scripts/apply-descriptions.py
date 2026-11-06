"""Write one batch of descriptions (English body + Arabic translation) to the store, verify, and log. Or roll a batch back.

Needs the Shopify CLI store login once (it opens a browser):
  shopify store auth --store dezrva-2z.myshopify.com --scopes read_products,write_products,read_translations,write_translations

usage:
  python scripts/apply-descriptions.py batch-01              # write batch 01
  python scripts/apply-descriptions.py batch-01 --dry-run    # show what would change, call nothing
  python scripts/apply-descriptions.py batch-01 --rollback   # put back what the batch's live backup holds

Per batch (owner rules 2026-11-06):
  1. product count must be 821 before and after, or the batch stops
  2. every product is read live first and saved to data/descriptions/<batch>/live-before.json (the rollback source)
  3. a product whose live description differs from the 2026-11-06 export is skipped (someone changed it since), never overwritten
  4. only descriptionHtml and the Arabic body_html translation are written
  5. the product is read again: the description and the Arabic must match, every other field must be unchanged;
     if anything else changed, the description is restored from live-before.json at once and the batch stops
  6. data/descriptions/<batch>/apply-log.jsonl records each handle and outcome
"""
import csv
import html
import json
import os
import subprocess
import sys
import time

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUT = os.path.join(ROOT, "data", "descriptions")
EXPORT = os.path.join(ROOT, "data", "backups", "products_export-2026-11-06.csv")
STORE = "dezrva-2z.myshopify.com"
API = "2025-07"
EXPECTED_COUNT = 821

PRODUCT_FIELDS = """id handle title status vendor productType tags descriptionHtml updatedAt
  seo { title description } totalInventory
  variants(first: 100) { nodes { id price compareAtPrice sku inventoryQuantity } }
  media(first: 1) { nodes { id } }"""


def gql(query, variables=None, mutation=False):
    cmd = ["shopify", "store", "execute", "-s", STORE, "--version", API, "--no-input", "-j", "-q", query]
    if variables:
        cmd += ["-v", json.dumps(variables)]
    if mutation:
        cmd.append("--allow-mutations")
    for attempt in range(6):
        res = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", shell=(os.name == "nt"))
        lines = [l for l in res.stdout.splitlines() if l.strip().startswith("{")]
        data = json.loads(lines[-1]) if lines else {}
        text = json.dumps(data)
        if "THROTTLED" in text or "429" in text:
            time.sleep(20 * (attempt + 1))  # rate-limited: back off and resume, never hammer
            continue
        if res.returncode != 0 or "error" in data and "data" not in data:
            raise RuntimeError(f"store execute failed: {res.stdout[-500:]} {res.stderr[-500:]}")
        return data.get("data", data)
    raise RuntimeError("still rate-limited after 6 tries; resume this batch later")


def count():
    return gql("{ productsCount(limit: null) { count } }")["productsCount"]["count"]


def read(handle):
    q = "query($h: String!) { productByIdentifier(identifier: {handle: $h}) { " + PRODUCT_FIELDS + " } }"
    p = gql(q, {"h": handle})["productByIdentifier"]
    if p:
        t = gql("query($id: ID!) { translatableResource(resourceId: $id) { translatableContent { key digest value } "
                "translations(locale: \"ar\") { key value } } }", {"id": p["id"]})["translatableResource"]
        p["_digest"] = next((c["digest"] for c in t["translatableContent"] if c["key"] == "body_html"), None)
        p["_ar"] = next((c["value"] for c in t["translations"] if c["key"] == "body_html"), "")
    return p


def same_except_description(a, b):
    keep = lambda p: {k: v for k, v in p.items() if k not in ("descriptionHtml", "updatedAt", "_digest", "_ar")}
    return keep(a) == keep(b)


def norm(text):
    """compare what a shopper reads: Shopify may re-encode entities (&amp;) or self-close <br>"""
    text = html.unescape(text or "").replace("<br/>", "<br>").replace("<br />", "<br>")
    return " ".join(text.split())


def write(p, en, ar):
    r = gql("mutation($p: ProductUpdateInput!) { productUpdate(product: $p) { userErrors { field message } } }",
            {"p": {"id": p["id"], "descriptionHtml": en}}, mutation=True)["productUpdate"]
    if r["userErrors"]:
        raise RuntimeError(r["userErrors"])
    digest = gql("query($id: ID!) { translatableResource(resourceId: $id) { translatableContent { key digest } } }",
                 {"id": p["id"]})["translatableResource"]["translatableContent"]
    digest = next(c["digest"] for c in digest if c["key"] == "body_html")
    if ar:
        r = gql("mutation($id: ID!, $t: [TranslationInput!]!) { translationsRegister(resourceId: $id, translations: $t) "
                "{ userErrors { field message } } }",
                {"id": p["id"], "t": [{"key": "body_html", "locale": "ar", "value": ar, "translatableContentDigest": digest}]},
                mutation=True)["translationsRegister"]
        if r["userErrors"]:
            raise RuntimeError(r["userErrors"])


def remove_ar(pid):
    gql("mutation($id: ID!) { translationsRemove(resourceId: $id, translationKeys: [\"body_html\"], locales: [\"ar\"]) "
        "{ userErrors { message } } }", {"id": pid}, mutation=True)


def load_batch(batch):
    d = os.path.join(OUT, batch)
    en = {r["Handle"]: r["Body (HTML)"] for r in csv.DictReader(open(os.path.join(d, "products-import.csv"), encoding="utf-8"))}
    ar_rows = list(csv.DictReader(open(os.path.join(d, "translations-ar-import.csv"), encoding="utf-8")))
    titles = {r["Handle"]: r["Title"] for r in csv.DictReader(open(os.path.join(d, "products-import.csv"), encoding="utf-8"))}
    ar_by_body = {}
    for r in ar_rows:
        ar_by_body[r["Default content"]] = r["Translated content"]
    return d, {h: (en[h], ar_by_body.get(en[h], ""), titles[h]) for h in en}


def apply(batch, dry):
    d, items = load_batch(batch)
    export = {r["Handle"]: r["Body (HTML)"] for r in csv.DictReader(open(EXPORT, encoding="utf-8-sig", newline="")) if r["Title"].strip()}
    if dry:
        for h, (en, ar, _) in items.items():
            print(f"{h}\n  EN: {en}\n  AR: {ar}")
        print(f"{len(items)} products would change; nothing was called")
        return
    before_count = count()
    if before_count != EXPECTED_COUNT:
        sys.exit(f"stop: the store has {before_count} products, expected {EXPECTED_COUNT}")
    backup_path = os.path.join(d, "live-before.json")
    backup = json.load(open(backup_path, encoding="utf-8")) if os.path.exists(backup_path) else {}
    log = open(os.path.join(d, "apply-log.jsonl"), "a", encoding="utf-8")
    for h, (en, ar, _) in items.items():
        p = read(h)
        if not p:
            log.write(json.dumps({"handle": h, "outcome": "not found"}) + "\n")
            continue
        if h not in backup:
            backup[h] = p
            json.dump(backup, open(backup_path, "w", encoding="utf-8"), ensure_ascii=False, indent=1)  # back up before every write
        if norm(p["descriptionHtml"]) == norm(en):
            log.write(json.dumps({"handle": h, "outcome": "already written"}) + "\n")
            continue
        if norm(p["descriptionHtml"]) != norm(export.get(h, "")):
            log.write(json.dumps({"handle": h, "outcome": "skipped: live description differs from the 2026-11-06 export"}) + "\n")
            continue
        write(p, en, ar)
        after = read(h)
        ok = norm(after["descriptionHtml"]) == norm(en) and (not ar or norm(after["_ar"]) == norm(ar)) and same_except_description(p, after)
        if not ok:
            write(after, backup[h]["descriptionHtml"], backup[h]["_ar"])  # restore at once
            log.write(json.dumps({"handle": h, "outcome": "verify failed, restored", "after": after}, ensure_ascii=False) + "\n")
            sys.exit(f"stop: {h} did not verify; restored from {backup_path}")
        log.write(json.dumps({"handle": h, "outcome": "written and verified"}) + "\n")
        log.flush()
    after_count = count()
    log.write(json.dumps({"batch": batch, "count_before": before_count, "count_after": after_count}) + "\n")
    if after_count != EXPECTED_COUNT:
        sys.exit(f"stop: product count is {after_count} after the batch")
    print(f"{batch}: done, product count {after_count}")


def rollback(batch):
    d = os.path.join(OUT, batch)
    backup = json.load(open(os.path.join(d, "live-before.json"), encoding="utf-8"))
    log = open(os.path.join(d, "apply-log.jsonl"), "a", encoding="utf-8")
    for h, before in backup.items():
        now = read(h)
        if norm(now["descriptionHtml"]) != norm(before["descriptionHtml"]):
            gql("mutation($p: ProductUpdateInput!) { productUpdate(product: $p) { userErrors { message } } }",
                {"p": {"id": before["id"], "descriptionHtml": before["descriptionHtml"]}}, mutation=True)
        if before["_ar"]:
            write({"id": before["id"]}, before["descriptionHtml"], before["_ar"])
        else:
            remove_ar(before["id"])
        log.write(json.dumps({"handle": h, "outcome": "rolled back"}) + "\n")
    print(f"{batch}: {len(backup)} products rolled back")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    if "--rollback" in sys.argv:
        rollback(sys.argv[1])
    else:
        apply(sys.argv[1], "--dry-run" in sys.argv)
