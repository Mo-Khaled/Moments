"""Fragrance notes database for filters and the product comparison. NOTHING IS WRITTEN TO THE STORE.

Sources, strongest first:
  1. data/fragrantica-perfumes.csv  - the owner's sheet; filled Top/Heart/Base/Main accords columns win
  2. the "Top: / Heart: / Base:" lines in the product descriptions
  3. the description prose ("opens with ..., a heart of ..., settles into a base of ...")
Arabic note names come from the store's own translations export (MOMENTS_translations_*.csv, METAFIELD rows).

Writes:
  data/fragrance.db               SQLite: products, product_notes (layer top/heart/base/note), product_families
  data/fragrance-notes.csv        the same, one row per product, for reading in Excel
  data/shopify-tags-import.csv    Handle,Title,Tags - existing tags kept, filter tags added (Products > Import, overwrite)
  data/collections-plan.csv       one rule-based collection per tag worth filtering by (used by create-collections.py)

usage: python scripts/fragrance-db.py            (reads the live public feed https://momentseg.com/products.json)
"""
import csv
import glob
import html
import json
import os
import re
import sqlite3
import time
import urllib.error
import urllib.request

from arabic_fields import FIX

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DATA = os.path.join(ROOT, "data")
STORE = "https://momentseg.com"
MIN_PER_COLLECTION = 5  # a note collection needs at least this many products to be worth a page

# ---------------------------------------------------------------- feed
def get_json(url):
    """the storefront answers 429 when read too fast; wait and retry"""
    for attempt in range(6):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "moments-fragrance-db"})
            data = json.load(urllib.request.urlopen(req, timeout=60))
            time.sleep(1)
            return data
        except urllib.error.HTTPError as e:
            if e.code != 429:
                raise
            time.sleep(10 * (attempt + 1))
    raise RuntimeError("storefront kept answering 429: " + url)

def feed():
    out, page = [], 1
    while True:
        batch = get_json(f"{STORE}/products.json?limit=250&page={page}")["products"]
        if not batch:
            return out
        out += batch
        page += 1

def collection(handle):
    out, page = set(), 1
    while True:
        batch = get_json(f"{STORE}/collections/{handle}/products.json?limit=250&page={page}").get("products", [])
        if not batch:
            return out
        out |= {p["handle"] for p in batch}
        page += 1

def text(body):
    b = html.unescape(html.unescape(body or ""))  # ten descriptions are stored with escaped tags
    b = re.sub(r"<br\s*/?>|</p>|</li>|</tr>|</h\d>", "\n", b)
    b = re.sub(r"</t[dh]>", " | ", b)
    return re.sub(r"<[^>]+>", "", b).replace("\xa0", " ")

# ---------------------------------------------------------------- notes
SYN = {  # spelling variants -> one note name
    "cedar": "Cedarwood", "cedar wood": "Cedarwood", "sandal": "Sandalwood", "sandal wood": "Sandalwood", "oudh": "Oud",
    "agarwood": "Oud", "agarwood (oud)": "Oud", "tonka": "Tonka Bean", "tonka beans": "Tonka Bean", "vanille": "Vanilla",
    "madagascar vanilla": "Vanilla", "white musk": "White Musk", "musks": "Musk", "ambergris": "Ambergris", "ambroxan": "Ambroxan",
    "patchouli leaf": "Patchouli", "rose petals": "Rose", "turkish rose": "Rose", "bulgarian rose": "Rose", "taif rose": "Rose",
    "damask rose": "Rose", "jasmine sambac": "Jasmine", "orange blossom": "Orange Blossom", "neroli": "Neroli",
    "pink peppercorn": "Pink Pepper", "black pepper": "Black Pepper", "pepper": "Black Pepper", "lemon zest": "Lemon",
    "green apple": "Apple", "apples": "Apple", "red berries": "Red Berries", "berries": "Red Berries", "cherries": "Cherry",
    "tobacco leaf": "Tobacco", "tobacco leaves": "Tobacco", "leathers": "Leather", "coffee bean": "Coffee", "coffee beans": "Coffee",
    "praline": "Praline", "caramelized sugar": "Caramel", "sugar": "Sugar", "honeyed notes": "Honey", "aquatic": "Aquatic Notes",
    "marine notes": "Aquatic Notes", "sea notes": "Aquatic Notes", "ozonic notes": "Aquatic Notes", "woods": "Woody Notes",
    "woody notes": "Woody Notes", "amber": "Amber", "incense": "Incense", "frankincense": "Incense", "olibanum": "Incense",
}
STOP = {"notes", "note", "and", "with", "the", "a", "of", "accord", "accords", "hints", "touch", "blend", "fresh", "warm", "sweet"}

def norm(n):
    n = re.sub(r"\(.*?\)", "", n).strip(" .;:-–—*•").strip()
    n = re.sub(r"^(?:and|with|of|a touch of|hints? of|notes? of)\s+", "", n, flags=re.I)
    if not n or n.lower() in STOP or len(n) > 40 or re.search(r"\d", n) or n.lower() in ("body spray", "body mist", "perfume", "perfume mist", "eau de parfum"):
        return None
    k = n.lower()
    return SYN.get(k, " ".join(w if w.isupper() and len(w) <= 3 else w.capitalize() for w in k.split()))

def split_list(s):
    return [x for x in (norm(p) for p in re.split(r",|،|\band\b|&|/|\+|·", s)) if x]

LAYER = {"top": r"top(?: notes?)?|opening|head notes?", "heart": r"heart(?: notes?)?|middle(?: notes?)?|mid notes?",
         "base": r"base(?: notes?)?|dry ?down"}

def structured(t):
    got = {}
    for layer, rx in LAYER.items():
        m = re.search(r"(?im)^\s*[-•*]?\s*(?:" + rx + r")\s*[:\-–|]\s*(.+)$", t)
        if m:
            got[layer] = split_list(m.group(1).split("|")[0])
    return got

# prose: the clause after a cue word belongs to that layer
CUES = [("top", r"opens? with|opening of|begins? with|starts? with|kicks off with|bursts? with|opens on"),
        ("heart", r"heart of|heart reveals|heart is|at its heart|heart notes? of|moves into|develops into|transitions? into|gives way to|deepens into|then"),
        ("base", r"base of|settles into|settles on|dries down to|dries down into|finish(?:es)? (?:on|with)|rests on|anchored by|foundation of")]

def match(clause, vocab):
    """vocab is longest first; each hit blanks its words so a shorter note inside it can't match again"""
    found = []
    for v in vocab:
        rx = r"\b" + re.escape(v.lower()) + r"s?\b"
        if re.search(rx, clause):
            name = SYN.get(v.lower(), v)
            if name not in found:
                found.append(name)
            clause = re.sub(rx, " # ", clause)
    return found

def prose(t, vocab):
    low = t.lower()
    marks = sorted((m.start(), m.end(), layer) for layer, rx in CUES for m in re.finditer(rx, low))
    got = {}
    for i, (s, e, layer) in enumerate(marks):
        end = marks[i + 1][0] if i + 1 < len(marks) else len(low)
        found = match(low[e:min(end, e + 160)].split(".")[0], vocab)
        if found:
            got.setdefault(layer, [])
            got[layer] += [f for f in found if f not in got[layer]]
    if not got:  # no cue words: every known note mentioned, layer unknown
        found = match(low, vocab)
        if found:
            got["note"] = found
    return got

# ---------------------------------------------------------------- families (scent groups for filters)
FAMILY = {
    "Oud": ["Oud", "Agarwood"], "Woody": ["Cedarwood", "Sandalwood", "Vetiver", "Woody Notes", "Guaiac Wood", "Cashmeran", "Birch", "Cypress", "Oakmoss", "Papyrus"],
    "Amber & Oriental": ["Amber", "Ambergris", "Ambroxan", "Incense", "Benzoin", "Labdanum", "Myrrh", "Resins", "Saffron"],
    "Musky": ["Musk", "White Musk"], "Gourmand": ["Vanilla", "Tonka Bean", "Caramel", "Praline", "Coffee", "Chocolate", "Honey", "Sugar", "Marshmallow", "Cacao", "Almond", "Toffee", "Pistachio", "Milk"],
    "Floral": ["Rose", "Jasmine", "Orange Blossom", "Tuberose", "Iris", "Violet", "Lily Of The Valley", "Peony", "Ylang-ylang", "Freesia", "Magnolia", "Gardenia", "Lavender", "Neroli", "Orchid", "Cherry Blossom", "Lily", "Geranium", "Heliotrope"],
    "Citrus": ["Bergamot", "Lemon", "Mandarin Orange", "Mandarin", "Grapefruit", "Orange", "Lime", "Blood Orange", "Citrus", "Yuzu"],
    "Fruity": ["Apple", "Pear", "Peach", "Pineapple", "Red Berries", "Raspberry", "Strawberry", "Cherry", "Plum", "Blackcurrant", "Coconut", "Mango", "Lychee", "Fig", "Pomegranate", "Apricot", "Melon"],
    "Spicy": ["Pink Pepper", "Black Pepper", "Cardamom", "Cinnamon", "Nutmeg", "Clove", "Ginger", "Saffron", "Cumin"],
    "Fresh & Aquatic": ["Aquatic Notes", "Mint", "Sea Salt", "Green Notes", "Ozonic", "Water Notes", "Sage", "Basil"],
    "Leather & Tobacco": ["Leather", "Tobacco", "Suede"], "Patchouli": ["Patchouli"],
}
FAMILY_AR = {"Oud": "عود", "Woody": "خشبي", "Amber & Oriental": "عنبري وشرقي", "Musky": "مسكي", "Gourmand": "حلو (جورماند)",
             "Floral": "زهري", "Citrus": "حمضي", "Fruity": "فواكه", "Spicy": "توابل", "Fresh & Aquatic": "منعش ومائي",
             "Leather & Tobacco": "جلد وتبغ", "Patchouli": "باتشولي"}
# collection titles: "عطور" + an adjective that agrees with it
FAMILY_TITLE_AR = {"Oud": "عطور عود", "Woody": "عطور خشبية", "Amber & Oriental": "عطور عنبرية وشرقية", "Musky": "عطور مسكية",
                   "Gourmand": "عطور حلوة (جورماند)", "Floral": "عطور زهرية", "Citrus": "عطور حمضية", "Fruity": "عطور فاكهية",
                   "Spicy": "عطور حارة", "Fresh & Aquatic": "عطور منعشة ومائية", "Leather & Tobacco": "عطور جلد وتبغ",
                   "Patchouli": "عطور باتشولي"}
GENDER_TITLE_AR = {"Men": "رجالية", "Women": "نسائية", "Unisex": "للجنسين"}
NOTE_FAMILY = {n.lower(): f for f, ns in FAMILY.items() for n in ns}

def families(notes):
    c = {}
    for layer, ns in notes.items():
        for n in ns:
            f = NOTE_FAMILY.get(n.lower())
            if f:
                c[f] = c.get(f, 0) + (2 if layer == "base" else 1)  # the dry-down is what people live with longest
    return [f for f, _ in sorted(c.items(), key=lambda x: -x[1])][:3]

# ---------------------------------------------------------------- other facts
def gender(title, t, handle="", men=(), women=()):
    """the description's "For:" line, then the title, then the store's own men's/women's collections, then masculine/feminine"""
    s = (title + " " + t).lower()
    m = re.search(r"\bfor:\s*(men|women|unisex|him|her)", s)
    v = m.group(1) if m else ""
    if v in ("men", "him") or re.search(r"\b(pour homme|for (men|him)|homme|man)\b", title.lower()):
        return "Men"
    if v in ("women", "her") or re.search(r"\b(pour femme|for (women|her)|femme|woman|lady|miss|girl)\b", title.lower()):
        return "Women"
    if v == "unisex" or "unisex" in s:
        return "Unisex"
    if handle in men and handle in women:
        return "Unisex"
    if handle in men:
        return "Men"
    if handle in women:
        return "Women"
    if re.search(r"\bmasculine\b", s) and not re.search(r"\bfeminine\b", s):
        return "Men"
    if re.search(r"\bfeminine\b", s) and not re.search(r"\bmasculine\b", s):
        return "Women"
    return ""

def season(fam):
    """Suggested only (the owner can correct the tag): heavy families wear best in winter and at night, light ones in summer and by day."""
    if not fam:
        return "", ""
    heavy = {"Oud", "Amber & Oriental", "Gourmand", "Leather & Tobacco", "Patchouli"}
    light = {"Citrus", "Fresh & Aquatic", "Fruity", "Floral"}
    h = sum(1 for f in fam[:2] if f in heavy)
    l = sum(1 for f in fam[:2] if f in light)
    if h > l:
        return "Winter", "Night"
    if l > h:
        return "Summer", "Day"
    return "All year", "Day & night"

SEASON_AR = {"Winter": "شتوية", "Summer": "صيفية", "All year": "لكل المواسم"}
TIME_AR = {"Night": "مسائية", "Day": "نهارية", "Day & night": "لليل والنهار"}
JUNK = {"Wood", "Blossom", "Notes", "Flower", "Flowers", "Fruits", "Spices", "Woods", "Fresh", "Musky Notes"}

def concentration(t):
    s = t.lower()
    for k, v in (("extrait", "Extrait de Parfum"), ("eau de parfum", "Eau de Parfum"), (" edp", "Eau de Parfum"),
                 ("eau de toilette", "Eau de Toilette"), (" edt", "Eau de Toilette"), ("perfume oil", "Perfume Oil"), ("body mist", "Body Mist")):
        if k in s:
            return v
    return ""

GENDER_AR = {"Men": "رجالي", "Women": "نسائي", "Unisex": "للجنسين"}
CONC_AR = {"Extrait de Parfum": "إكستريه دو بارفان", "Eau de Parfum": "أو دو بارفان", "Eau de Toilette": "أو دو تواليت",
           "Perfume Oil": "عطر زيتي", "Body Mist": "رذاذ جسم"}

def arabic_notes():
    """EN -> AR note names from the store's translations export (METAFIELD rows are the note fields)."""
    out = {}
    for f in glob.glob(os.path.join(ROOT, "MOMENTS_translations_*.csv")):
        for r in csv.DictReader(open(f, encoding="utf-8-sig")):
            if r["Type"] == "METAFIELD" and 0 < len(r["Default content"]) < 40 and r["Translated content"]:
                n = norm(r["Default content"])
                if n:
                    out.setdefault(n, r["Translated content"].strip())
    for n in out:
        if n in FIX:
            out[n] = FIX[n]
    return out

def owner_sheet():
    path = os.path.join(DATA, "fragrantica-perfumes.csv")
    out = {}
    if not os.path.exists(path):
        return out
    for r in csv.DictReader(open(path, encoding="utf-8-sig")):
        got = {k: split_list(r.get(c, "")) for k, c in (("top", "Top notes"), ("heart", "Heart notes"), ("base", "Base notes"))}
        got = {k: v for k, v in got.items() if v}
        acc = split_list(r.get("Main accords", ""))
        if got or acc or r.get("Fragrantica URL"):
            for h in r["Product handles"].split():
                out[h] = (got, acc, r.get("Fragrantica URL", ""))
    return out

PERFUME_TYPES = {"Perfume", "Perfume Mist", "Perfume Oil", "Body Spray", "Gift Set"}

def main():
    products = feed()
    ar = arabic_notes()
    sheet = owner_sheet()
    # vocabulary: every note named in a structured line or in the store's note fields, longest first so "White Musk" beats "Musk"
    struct = {p["handle"]: structured(text(p["body_html"])) for p in products}
    vocab = set(ar) | {n for s in struct.values() for ns in s.values() for n in ns}
    vocab |= set(SYN) | {n for ns in FAMILY.values() for n in ns}
    vocab = sorted((v for v in vocab if len(v) > 2 and v.lower() not in NOTE_STOP_WORDS and v not in JUNK), key=len, reverse=True)
    men = collection("for-him") | collection("mens-perfumes")
    women = collection("for-her") | collection("womens-perfumes")

    db_path = os.path.join(DATA, "fragrance.db")
    if os.path.exists(db_path):
        os.remove(db_path)
    db = sqlite3.connect(db_path)
    db.executescript("""
      CREATE TABLE products (handle TEXT PRIMARY KEY, title TEXT, brand TEXT, product_type TEXT, gender TEXT, concentration TEXT,
                             size_ml INTEGER, price REAL, season TEXT, time_of_day TEXT, source TEXT, fragrantica_url TEXT, accords TEXT);
      CREATE TABLE product_notes (handle TEXT, layer TEXT, position INTEGER, note TEXT, note_ar TEXT);
      CREATE TABLE product_families (handle TEXT, rank INTEGER, family TEXT, family_ar TEXT);
    """)
    flat, tag_rows = [], []
    for p in products:
        t = text(p["body_html"])
        notes, source, accords, url = struct[p["handle"]], "description", [], ""
        if p["handle"] in sheet:
            notes2, accords, url = sheet[p["handle"]]
            if notes2:
                notes, source = notes2, "fragrantica sheet"
        if not notes:
            notes, source = prose(t, vocab), "description prose"
        if not any(notes.values()):
            source = ""
        # a note named in an upper layer is not repeated lower down
        seen = set()
        for layer in ("top", "heart", "base", "note"):
            notes[layer] = [n for n in notes.get(layer, []) if not (n in seen or seen.add(n))]
        fam = families(notes)
        g = gender(p["title"], t, p["handle"], men, women) if p["product_type"] in PERFUME_TYPES else ""
        sea, tod = season(fam)
        conc = concentration(t) if p["product_type"] in PERFUME_TYPES else ""
        m = re.search(r"(\d+)\s*ml", p["title"] + " " + t, re.I)
        size = int(m.group(1)) if m else None
        price = float(p["variants"][0]["price"]) if p["variants"] else None
        db.execute("INSERT INTO products VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
                   (p["handle"], p["title"], p["vendor"], p["product_type"], g, conc, size, price, sea, tod, source, url, ", ".join(accords)))
        for layer in ("top", "heart", "base", "note"):
            for i, n in enumerate(notes[layer]):
                db.execute("INSERT INTO product_notes VALUES (?,?,?,?,?)", (p["handle"], layer, i + 1, n, ar.get(n) or FIX.get(n, "")))
        for i, f in enumerate(fam):
            db.execute("INSERT INTO product_families VALUES (?,?,?,?)", (p["handle"], i + 1, f, FAMILY_AR[f]))
        flat.append([p["handle"], p["title"], p["vendor"], p["product_type"], g, conc, size or "", price or "",
                     ", ".join(notes["top"]), ", ".join(notes["heart"]), ", ".join(notes["base"]), ", ".join(notes["note"]),
                     ", ".join(fam), sea, tod, ", ".join(accords), source])
        # filter tags; existing tags are kept as they are
        new = [f"family:{f}" for f in fam] + [f"note:{n}" for layer in ("top", "heart", "base", "note") for n in notes[layer]]
        if g:
            new.append(f"gender:{g}")
        if conc:
            new.append(f"type:{conc}")
        if sea:
            new += [f"season:{sea}", f"time:{tod}"]
        old = [x.strip() for x in (p["tags"] if isinstance(p["tags"], list) else p["tags"].split(",")) if x.strip()]
        old = [x for x in old if not re.match(r"^(family|note|gender|type|season|time):", x)]
        if new:
            tag_rows.append([p["handle"], p["title"], ", ".join(old + new)])
    db.commit()

    with open(os.path.join(DATA, "fragrance-notes.csv"), "w", encoding="utf-8-sig", newline="") as f:
        w = csv.writer(f)
        w.writerow(["handle", "title", "brand", "type", "gender", "concentration", "size_ml", "price", "top", "heart", "base",
                    "notes (layer unknown)", "families", "season", "time of day", "accords (sheet)", "source"])
        w.writerows(flat)
    with open(os.path.join(DATA, "shopify-tags-import.csv"), "w", encoding="utf-8", newline="") as f:
        w = csv.writer(f)
        w.writerow(["Handle", "Title", "Tags"])
        w.writerows(tag_rows)

    # collections: every family, gender, concentration, family x gender, and every note with enough products
    q = lambda sql: db.execute(sql).fetchall()
    plan = []
    def add(tag, en, ar_title, n):
        handle = "scent-" + re.sub(r"[^a-z0-9]+", "-", tag.lower().split(":", 1)[1]).strip("-")
        plan.append([handle, en, ar_title, tag, n])
    for f, n in q("SELECT family, COUNT(*) FROM product_families GROUP BY family ORDER BY 2 DESC"):
        add(f"family:{f}", f"{f} fragrances", FAMILY_TITLE_AR[f], n)
    for g, n in q("SELECT gender, COUNT(*) FROM products WHERE gender<>'' GROUP BY gender"):
        add(f"gender:{g}", {"Men": "Men's fragrances", "Women": "Women's fragrances", "Unisex": "Unisex fragrances"}[g], f"عطور {GENDER_TITLE_AR[g]}", n)
    for c, n in q("SELECT season, COUNT(*) FROM products WHERE season<>'' GROUP BY 1"):
        add(f"season:{c}", f"{c} fragrances", f"عطور {SEASON_AR[c]}", n)
    for c, n in q("SELECT time_of_day, COUNT(*) FROM products WHERE time_of_day<>'' GROUP BY 1"):
        add(f"time:{c}", f"{c} fragrances", f"عطور {TIME_AR[c]}", n)
    for c, n in q("SELECT concentration, COUNT(*) FROM products WHERE concentration<>'' GROUP BY concentration"):
        add(f"type:{c}", c, CONC_AR[c], n)
    for note, n in q(f"SELECT note, COUNT(DISTINCT handle) FROM product_notes GROUP BY note HAVING COUNT(DISTINCT handle)>={MIN_PER_COLLECTION} ORDER BY 2 DESC"):
        plan.append(["note-" + re.sub(r"[^a-z0-9]+", "-", note.lower()).strip("-"), f"Fragrances with {note}",
                     f"عطور بنفحة {ar.get(note) or FIX.get(note, note)}", f"note:{note}", n])
    for f, g, n in q("SELECT f.family, p.gender, COUNT(*) FROM product_families f JOIN products p USING(handle) WHERE p.gender<>'' GROUP BY 1,2 HAVING COUNT(*)>=" + str(MIN_PER_COLLECTION)):
        en_g = {"Men": "for men", "Women": "for women", "Unisex": "unisex"}[g]
        plan.append([f"scent-{re.sub(r'[^a-z0-9]+', '-', f.lower()).strip('-')}-{g.lower()}", f"{f} fragrances {en_g}",
                     f"{FAMILY_TITLE_AR[f]} {GENDER_TITLE_AR[g]}", f"family:{f} + gender:{g}", n])
    with open(os.path.join(DATA, "collections-plan.csv"), "w", encoding="utf-8-sig", newline="") as f:
        w = csv.writer(f)
        w.writerow(["handle", "title", "title_ar", "rule (all tags must match)", "products"])
        w.writerows(plan)

    total = len(products)
    with_notes = q("SELECT COUNT(DISTINCT handle) FROM product_notes")[0][0]
    print(f"{total} products, {with_notes} with notes, {len(plan)} collections planned")
    for s, n in q("SELECT source, COUNT(*) FROM products GROUP BY source"):
        print(f"  {s or '(no notes found)'}: {n}")
    missing = [n for (n,) in q("SELECT DISTINCT note FROM product_notes WHERE note_ar=''")]
    print(f"{len(missing)} notes without an Arabic name yet")

NOTE_STOP_WORDS = {"daily", "morning", "summer", "winter", "spring", "autumn", "night", "evening", "pour femme", "pour homme",
                   "eau de parfum", "unisex", "men", "women", "office", "date", "day", "fresh", "warm", "sweet", "woody",
                   "floral", "oriental", "spicy", "fruity", "citrus", "gourmand", "powdery", "aromatic", "musky", "leathery",
                   "special occasions", "casual", "formal", "all seasons", "all year", "evening wear", "everyday", "gift"}

if __name__ == "__main__":
    main()
