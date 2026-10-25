"""Dry-run proposals for store data. Writes docs/audit/proposed-store-changes.csv. NOTHING IS WRITTEN TO THE STORE.
Each row is one exact change with its before and after value, for the owner to approve line by line.

Sources: docs/audit/image-audit.csv (title, vendor, handle, image position from the public feed). Alt text 'before' values are not in the public
feed, so they are marked to be read from the Admin API at apply time (the earlier Admin audit counted 538 alts naming another shop and 331 blank).
usage: python scripts/gen-store-proposals.py
"""
import csv
import os
import re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
rows = list(csv.DictReader(open(os.path.join(ROOT, "docs", "audit", "image-audit.csv"), encoding="utf-8-sig")))
out = []

OTHER = "harama" + "in"
# 1. vendor rename for products carrying the other shop's name as vendor.
# Decision on record: generic bags -> MOMENTS; brand-specific bags -> the brand name. Vendor-based smart collections change (see note).
BRAND_FOR = {"afnan-gift-bag": "AFNAN", "afnan-orange-gift-bag": "AFNAN", "ibraq-premium-gift-bag-large": "IBRAQ", "assaf-gift-bag": "ASSAF", "dolby": "MOMENTS"}
seen = set()
for r in rows:
    if OTHER in r["vendor"].lower() and r["handle"] not in seen:
        seen.add(r["handle"])
        out.append(["vendor rename", "product", r["handle"], "vendor", r["vendor"], BRAND_FOR.get(r["handle"], "MOMENTS"),
                    "Brand-specific bag gets its brand; generic gets MOMENTS. Smart collections that filter on this vendor will now include or exclude this product: check before applying."])

# 2. the other shop's collection
out.append(["collection", "collection", OTHER + "-perfumes", "published", "published", "unpublished", "Then add a URL redirect from /collections/" + OTHER + "-perfumes to /collections/all (never delete the collection)."])
out.append(["redirect", "url redirect", "/collections/" + OTHER + "-perfumes", "target", "(none)", "/collections/all", "Created together with the unpublish above."])

# 3. a product with no image and the other shop's vendor
out.append(["product status", "product", "dolby", "status", "active", "draft", "Set to draft, not deleted. Check order history first (the Admin API read was not possible for orders here)."])

# 4. alt text: "<Product title> by <Brand>", brand-casing exceptions
KEEP_UPPER = {"ASDAF", "ASSAF"}
TOKEN_KEEP = re.compile(r"\d")
def brand(v):
    v = re.sub(r"\s+perfumes?$", "", v.strip(), flags=re.I)
    return v.upper() if v.upper() in KEEP_UPPER else v.title()
def title(t):
    words = []
    for w in t.strip().split():
        if TOKEN_KEEP.search(w):
            words.append(w.lower().replace("ml", "ml") if re.fullmatch(r"\d+ML", w.upper()) else w.upper() if len(w) <= 3 else w)
        elif w.upper() in KEEP_UPPER:
            words.append(w.upper())
        else:
            words.append(w.title())
    return " ".join(words)
n = 0
for r in rows:
    v = r["vendor"]
    b = "MOMENTS" if OTHER in v.lower() else brand(v)
    after = f"{title(r['title'])} by {b}"
    out.append(["alt text", "product image", f"{r['handle']}#{r['position']}", "alt", "(read from the Admin API at apply time)", after, ""])
    n += 1

path = os.path.join(ROOT, "docs", "audit", "proposed-store-changes.csv")
with open(path, "w", newline="", encoding="utf-8-sig") as f:
    w = csv.writer(f)
    w.writerow(["change_type", "resource", "identifier", "field", "before", "after", "note"])
    w.writerows(out)
print(len(out), "proposed rows;", n, "alt texts;", len(seen), "vendor renames ->", path)
