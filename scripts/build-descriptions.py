"""Standard product descriptions (owner format 2026-11-06): a short story, then Top / Heart / Base lines, then size, type, for.
NOTHING IS WRITTEN TO THE STORE. Reads the backups only; writes import files per batch for review and for scripts/apply-descriptions.py.

Rules (docs/decisions-log.md, 2026-11-06):
- The story is the current description's own sentences that do not list notes (at most two), never new claims.
- Notes come from the current description: its "Top: / Heart: / Base:" lines when present, otherwise its prose, where a clause
  is given a layer only when the sentence says so (opens with -> top, heart / middle -> heart, base / settles into / rests on -> base,
  a clause between an opening and a base -> heart). A layer that is not known is left out, never filled in.
  Notes whose layer the text does not give go on one "Notes:" line.
- The owner's Fragrantica sheet (data/fragrantica-perfumes.csv) wins when it has layers for the product.
- Products without notes get only a scent character line (data/descriptions/no-notes.csv, from web search), no pyramid.
- Arabic: the story comes from the product's current Arabic translation (same sentence rule); note names from the store's own
  Arabic note names (data/fragrance.db), then data/descriptions/notes-ar.csv. Anything still missing is listed, not guessed.

Batches: 01 Lady Collection (built by hand, approved), then partial notes, then no notes, then full notes, 100 products each.

usage: python scripts/build-descriptions.py
"""
import csv
import html
import importlib.util
import json
import os
import re
import sqlite3
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DATA = os.path.join(ROOT, "data")
OUT = os.path.join(DATA, "descriptions")
EXPORT = os.path.join(DATA, "backups", "products_export-2026-11-06.csv")
AR_EXPORT = os.path.join(DATA, "backups", "translations-ar-2026-11-06.csv")
BATCH_SIZE = 100
DONE = set()  # every product goes through the batches; sets (batch 01) come from sets.json

sys.path.insert(0, os.path.join(ROOT, "scripts"))
spec = importlib.util.spec_from_file_location("fragrance_db", os.path.join(ROOT, "scripts", "fragrance-db.py"))
fdb = importlib.util.module_from_spec(spec)
spec.loader.exec_module(fdb)

# ---------------------------------------------------------------- reading the current text
NOTE_CUE = re.compile(r"\b(opens? (?:with|on)|opening (?:of|with)|begins? with|starts? with|bursts? (?:of|with)|kicks off|heart|middle|base|settles?|rests? on|dries? down|"
                      r"transitions?|deepens?|blooms?|unfolds?|reveals?|develops?|gives way|moves into|followed by|notes?|accords?)\b", re.I)
AR_NOTE_CUE = re.compile(r"(يبدأ|تبدأ|يفتتح|تفتتح|ينفتح|افتتاحية|المقدمة|مقدمة|القلب|قلب|القاعدة|قاعدة|يستقر|تستقر|ليستقر|ينتقل|يتطور|تتطور|"
                         r"يتفتح|يكشف|نفحات|نوتات|المكونات|يتعمق)")


def plain(body):
    return re.sub(r"[ \t]+", " ", fdb.text(body)).strip()


def sentences(t, arabic=False):
    parts = re.split(r"(?<=[.!؟?])\s+|\n+", t)
    return [p.strip() for p in parts if p.strip()]


HEADER = re.compile(r"^\S.{0,60}\b(by|من)\b.{0,40}[—-]\s*\d+\s*(ML|مل)\s*$", re.I)  # "BLU by Ajmal — 90 ML"
SPEC = re.compile(r"^(size|type|for|also available|الحجم|النوع|لمن|متوفر أيضا|متوفر أيضاً)\s*:|(fragrance notes|المكونات العطرية)\s*:?$|^(top|heart|base|المقدمة|القلب|القاعدة)\s*:", re.I)


def story(body, arabic=False):
    """the description's own sentences that list no notes: the opening one(s) and a closing line, at most two"""
    cue = AR_NOTE_CUE if arabic else NOTE_CUE
    opening = (re.compile(r"(?:\s|،)*(?:و?(?:يبدأ|تبدأ|يفتتح|تفتتح|ينفتح))") if arabic
               else re.compile(r"\b(?:that|which|with|where)?\s*(?:opens? (?:with|on)|begins? with|starts? with|bursts? (?:of|with))\b", re.I))
    keep = []
    for s in sentences(plain(body), arabic):
        if HEADER.match(s) or SPEC.search(s) or "|" in s:
            continue
        if not re.search(r"[.!؟?…]$", s) and len(s.split()) <= 5:  # a title line ("Nabeel Incense") or a label
            continue
        if not keep:
            # the first sentence is the story even when it names a note in passing; it is only cut where the note list starts:
            # "A powerful, spicy masculine that opens with saffron, ..." -> "A powerful, spicy masculine."
            m = opening.search(s)
            if m:
                head = re.sub(r"[\s,،;:—–-]+$", "", s[:m.start()])
                if len(head.split()) >= 3:
                    keep.append(head + ".")
                continue
            keep.append(s)
            continue
        if cue.search(s):
            continue
        keep.append(s)
    if len(keep) > 2:
        keep = [keep[0], keep[-1]]
    return " ".join(keep)


# notes from "Top: ..." lines
def structured(body):
    t = plain(body)
    # "Top Notes: a, b Middle Notes: c Base Notes: d" on one line -> one layer per line
    t = re.sub(r"\s+(?=(?:top|heart|middle|base)(?: notes?)?\s*:)", "\n", t, flags=re.I)
    t = t.replace("middle notes:", "heart notes:").replace("Middle Notes:", "Heart Notes:").replace("Middle notes:", "Heart notes:")
    got = {}
    for layer, rx in fdb.LAYER.items():
        m = re.search(r"(?im)^\s*[-•*]?\s*(?:" + rx + r")\s*[:\-–|]\s*(.+)$", t)
        if m:
            # a note line can run on into a description after a dash: "Base: musk, and incense — dark, commanding"
            got[layer] = clean_list(re.split(r"\s[—–]\s|\|", m.group(1))[0])
    return {k: v for k, v in got.items() if v}


def clean_list(s):
    out = []
    for n in fdb.split_list(re.sub(r"\s+[-–]\s+", ", ", s)):
        if n not in out:
            out.append(n)
    return out


# notes from prose
LEAD = re.compile(r"^(?:.*?\b(?:with|of|into|on|to|by|reveals?|features?))\s+", re.I)
BUILT = re.compile(r"^.*?\b(?:built on|built around|blends?|combines?|features?|made with|centered on|centred on)\s+", re.I)
TRAIL = re.compile(r"\s+(?:base|heart|dry[ -]?down|finish|trail|warmth|energy|burst|brightness|freshness|depth|accord|undertones?)$", re.I)
# words that describe the scent but are not notes: dropped from note lists
DESCRIPTOR = re.compile(r"^(?:(?:long-lasting|lasting|beautifully|surprisingly|bright|brightness|crisp|smooth|rich|bold|sharp|juicy|sensual|"
                        r"elegant|comforting|commanding|feminine|masculine|skin-close|skin-like|skin|dry|heat|warmth|depth|energy|ease|"
                        r"finish|trail|heart|base|burst|explosive|intensity|sophisticated|unforgettable|slightly|smoky|spiced|freshness|"
                        r"oriental|herbal|dessert-like|dry-down|dry down)\s*)+$", re.I)
FILLER = re.compile(r"^(?:(?:a|an|the|its|this|some|subtle|soft|smooth|warm|deep|rich|clean|lively|bright|fresh|sweet|creamy|velvety|"
                    r"elegant|sensual|luminous|radiant|dark|sparkling|juicy|zesty|crisp|vibrant|delicate|powdery|woody|floral|spicy|"
                    r"generous|gentle|lasting|long-lasting|cozy|refined|mysterious|intense|bold|burst|touch|hint|hints|trail|blend|"
                    r"energy|freshness|accord|accords|heart|base|notes?|mix|splash|whisper|embrace|combination|layer|layers|foundation|"
                    r"of|with)\s+)+", re.I)
CLAUSE_SPLIT = re.compile(r";|,\s*(?:and\s+)?(?=(?:then|soften(?:s|ed|ing)?|before|and then|while|followed|transitions?|deepens?|blooms?|unfolds?|reveals?|develops?|"
                          r"settles?|rests?|moves?|gives?|dries?|leading|evolving|finishing|ending|with|the heart|the base)\b)"
                          r"|\.\s+(?=(?:the heart|the base|its heart|at its heart|then|it then|finally)\b)", re.I)


GENERIC = {"citrus", "aromatic", "floral", "woody", "fruity", "spicy", "oriental", "fresh", "sweet", "musky", "green", "aquatic",
           "powdery", "gourmand", "marine", "florals", "woods", "spices", "fruits", "flowers", "white flowers"}
VOCAB_LOWER = set()  # filled by load(): every known note name, lower case
LAYER_WORDS = re.compile(r"\b(opens?|opening|begins?|starts?|bursts?|kicks off|heart|middle|base|settles?|rests?|dries?|finish(?:es|ing)?|"
                         r"anchored|soften(?:s|ed|ing)?|transitions?|deepens?|blooms?|unfolds?|reveals?|develops?|gives?|moves?|followed)\b", re.I)


def cue_first(c):
    """the layer phrase must open the clause ("transitions into a heart of iris"), not follow the notes
    ("dates and praline sweeten the heart"), or the notes cannot be told apart"""
    m = LAYER_WORDS.search(c)
    if not m:
        return False
    before = c[:m.start()].lower()
    # a list of notes before the layer word ("cinnamon and nutmeg open", "peach, raspberry and citrus lead") means the
    # sentence names its notes first; one word ("a citrus aromatic fragrance that opens with") is only a description
    return sum(1 for n in VOCAB_LOWER if re.search("(?<![a-z])" + re.escape(n) + "s?(?![a-z])", before)) < 2


def clause_layer(c):
    low = c.lower()
    # a layer only when the text names it as one ("heart of", "the base", "settles into") - not "over a rich wood base"
    if re.search(r"\b(heart (?:of|notes?|is|reveals|brings|develops|opens|blooms|follows)|the heart|its heart|middle notes?)\b", low):
        return "heart"
    if re.search(r"\b(base (?:of|notes?|is|brings|reveals|settles|rests)|the base|rests? on|dries? down|anchored by|"
                 r"finish(?:es|ing)? (?:on|with)|(?:vanilla|musk|woody|amber|warm) finish)\b", low):
        return "base"
    if re.match(r"\s*with\b.*\bbase[\s.]*$", low):  # "with a warm patchouli and vanilla base"
        return "base"
    if re.search(r"\b(opens?|opening|begins?|starts?|bursts?|kicks off)\b", low):
        return "top"
    if re.search(r"\bsettles?\b", low):
        return "base?"
    if re.search(r"\b(soften(?:s|ed|ing)?|transitions?|deepens?|blooms?|unfolds?|reveals?|develops?|gives? way|moves? into|followed by)\b", low):
        return "mid?"
    return None


def clause_notes(c):
    c = re.sub(r"\(.*?\)", "", c)
    c = LEAD.sub("", c, 1) if clause_layer(c) else BUILT.sub("", c, 1)
    items = []
    for part in re.split(r",|\band\b|\bwith\b|\bby\b|&|/|\+", c):
        part = TRAIL.sub("", FILLER.sub("", part.strip(" .;:—–-")).strip(" .;:—–-"))
        if not part or DESCRIPTOR.match(part) or len(part.split()) > 4 or re.search(r"\d|\b(that|which|is|are|for|it|you|your|to|into|on)\b", part, re.I):
            continue
        n = fdb.norm(part)
        if n and n not in items:
            items.append(n)
    return items


OPEN_VERB = r"(?:open|opens|lead|leads|start|starts|begin|begins|burst|bursts|kick|kicks)"
MID_VERB = r"(?:add|adds|warm|warms|cool|cools|sweeten|sweetens|soften|softens|bring|brings|fill|fills|shape|shapes|form|forms|follow|follows|bloom|blooms|take|takes|give|gives|join|joins|sit|sits)"
CLOSE_VERB = r"(?:close|closes|settle|settles|deepen|deepens|finish|finishes|dry|dries|anchor|anchors|ground|grounds|round|rounds|linger|lingers|leave|leaves|wrap|wraps|seal|seals|end|ends)"


def notes_first(sentence):
    """"Bergamot, grapefruit, and blackcurrant open sharp, pineapple and cardamom warm the heart, and pink pepper with
    vetiver close it": each part names its notes, then a verb. The opening part is the top, the closing part the base,
    one part between them the heart. Returns {} unless the whole sentence reads that way."""
    parts = []
    for m in re.finditer(r"(?:^|,\s*(?:and\s+)?|;\s*)([^,;]*?(?:,\s*(?:and\s+)?[^,;]*?)*?)\s+(" + OPEN_VERB + "|" + MID_VERB + "|"
                         + CLOSE_VERB + r")\b", sentence, re.I):
        parts.append((m.group(1), m.group(2).lower()))
    if len(parts) < 2 or not re.fullmatch(OPEN_VERB, parts[0][1]) or not re.fullmatch(CLOSE_VERB, parts[-1][1]):
        return {}
    if len(parts) > 3:
        return {}
    got = {}
    for i, (text, _) in enumerate(parts):
        layer = "top" if i == 0 else "base" if i == len(parts) - 1 else "heart"
        names = []
        for piece in re.split(r",|\band\b|\bwith\b|&", text):
            piece = FILLER.sub("", piece.strip(" .;:—–-")).strip(" .;:—–-")
            if not piece:
                continue
            n = fdb.norm(piece)
            if not n or n.lower() not in VOCAB_LOWER | {v.lower() for v in GENERIC_OK}:
                return {}
            names.append(n)
        if not names:
            return {}
        got[layer] = names
    return got


GENERIC_OK = set()


def prose_notes(body):
    t = plain(body)
    sents = [s for s in sentences(t) if NOTE_CUE.search(s) and not SPEC.search(s)]
    clauses = []
    for s in sents:
        for c in CLAUSE_SPLIT.split(s):
            lay = clause_layer(c)
            if lay and not cue_first(c) and not re.match(r"\s*with\b.*\bbase[\s.]*$", c.lower()):
                clauses.append(["uncertain", []])
            elif lay:
                clauses.append([lay, clause_notes(c)])
            elif BUILT.match(c):  # "built on white florals, ..." : notes without a layer
                clauses.append(["note", clause_notes(c)])
    if not clauses:
        return {}
    layers = [c[0] for c in clauses]
    # resolve the uncertain ones by position: between an opening and a base -> heart; a final "settles" -> base
    for i, c in enumerate(clauses):
        if c[0] == "base?":
            c[0] = "base" if i == len(clauses) - 1 or "heart" in layers[:i] or "mid?" in layers[:i] else "note"
        elif c[0] == "mid?":
            after_top = "top" in layers[:i]
            before_base = any(l in ("base", "base?") for l in layers[i + 1:])
            c[0] = "heart" if after_top and before_base else "note"
    got = {}
    if any(lay == "uncertain" for lay, _ in clauses):
        for s in sents:  # the notes-first way of writing, read as a whole sentence
            nf = notes_first(s)
            if nf:
                return nf
        got["uncertain"] = ["?"]
    for lay, ns in clauses:
        if ns:
            got.setdefault(lay, [])
            got[lay] += [n for n in ns if n not in got[lay]]
    return got


# ---------------------------------------------------------------- data
def load():
    export = [r for r in csv.DictReader(open(EXPORT, encoding="utf-8-sig", newline="")) if r["Title"].strip()]
    ar_rows = list(csv.DictReader(open(AR_EXPORT, encoding="utf-8-sig", newline="")))
    # the export has no product id, the translation file has no handle: join on the title (unique for all but 3 products)
    ids_by_title, ar_body_by_id = {}, {}
    for r in ar_rows:
        if r["Type"] == "PRODUCT" and r["Field"] == "title":
            ids_by_title.setdefault(r["Default content"], []).append(r["Identification"])
        if r["Type"] == "PRODUCT" and r["Field"] == "body_html":
            ar_body_by_id[r["Identification"]] = r
    ar_by_title = {t: (ar_body_by_id.get(ids[0]) if len(ids) == 1 else "duplicate") for t, ids in ids_by_title.items()}
    sheet = {}
    for r in csv.DictReader(open(os.path.join(DATA, "fragrantica-perfumes.csv"), encoding="utf-8-sig")):
        if r["Top notes"].strip() or r["Heart notes"].strip() or r["Base notes"].strip():
            for h in re.split(r"[,\s]+", r["Product handles"]):  # the sheet separates handles with spaces
                if h.strip():
                    sheet[h.strip()] = {"top": clean_list(r["Top notes"]), "heart": clean_list(r["Heart notes"]),
                                        "base": clean_list(r["Base notes"])}
    facts = {r["handle"]: r for r in csv.DictReader(open(os.path.join(DATA, "fragrance-notes.csv"), encoding="utf-8-sig"))}
    db = sqlite3.connect(os.path.join(DATA, "fragrance.db"))
    note_ar = {n: a for n, a in db.execute("SELECT note, note_ar FROM product_notes WHERE note_ar != ''")}
    vocab = {n for (n,) in db.execute("SELECT DISTINCT note FROM product_notes")}
    vocab |= {n for ns in fdb.FAMILY.values() for n in ns} | set(fdb.SYN.values())
    # describing words that are also note names in the data (spicy, woody, fresh...) do not count as a note here
    VOCAB_LOWER.update(n.lower() for n in vocab if len(n) > 2 and not FILLER.fullmatch(n + " ") and not DESCRIPTOR.match(n)
                       and n.lower() not in GENERIC)
    extra = os.path.join(OUT, "notes-ar.csv")
    if os.path.exists(extra):
        curated = {r["note"]: r["ar"] for r in csv.DictReader(open(extra, encoding="utf-8-sig")) if r["ar"].strip()}
        note_ar.update(curated)
        vocab |= set(curated)  # curated, translated note names are real notes
    no_notes = {}
    nn = os.path.join(OUT, "no-notes.csv")
    if os.path.exists(nn):
        no_notes = {r["handle"]: r for r in csv.DictReader(open(nn, encoding="utf-8-sig"))}
    hand = {k: v for k, v in json.load(open(os.path.join(OUT, "hand.json"), encoding="utf-8")).items() if not k.startswith("_")}
    return export, ar_by_title, sheet, facts, note_ar, no_notes, vocab, hand


GENDER = {"Women": ("For Women", "للنساء"), "Men": ("For Men", "للرجال"), "Unisex": ("Unisex", "للجنسين")}
CONC_AR = {"Eau de Parfum": "أو دو بارفان", "Eau de Toilette": "أو دو تواليت", "Extrait de Parfum": "إكستريه دو بارفان",
           "Parfum": "بارفان", "Perfume Oil": "زيت عطري", "Eau de Cologne": "أو دو كولونيا", "Body Mist": "بخاخ للجسم"}
LABEL_AR = {"top": "المقدمة", "heart": "القلب", "base": "القاعدة", "note": "المكونات"}
LABEL_EN = {"top": "Top", "heart": "Heart", "base": "Base", "note": "Notes"}


def spec_line(f):
    en, ar = [], []
    if f.get("size_ml"):
        en.append(f"{f['size_ml']} ml")
        ar.append(f"{f['size_ml']} مل")
    if f.get("concentration") and f["concentration"] in CONC_AR:
        en.append(f["concentration"])
        ar.append(CONC_AR[f["concentration"]])
    # gender is left out: in the notes data it is partly guessed (fragrance-db.py gender()), and a guess must not be printed
    return " · ".join(en), " · ".join(ar)


def read_notes(p, sheet, facts):
    """a product's notes from its own text: owner sheet, then note lines, then prose, then the older extraction (layer unknown)"""
    h, body = p["Handle"], p["Body (HTML)"]
    f = facts.get(h, {})
    if h in sheet:
        notes, source = dict(sheet[h]), "owner's Fragrantica sheet"
    else:
        notes, source = structured(body), "description note lines"
        if not notes:
            notes, source = prose_notes(body), "description prose"
        if not any(v for k, v in notes.items() if k != "uncertain") and f:
            # earlier extraction (fragrance-db.py) found notes this reading could not place: all on one "Notes:" line,
            # because its layer guesses are not reliable enough to print
            merged = []
            for col in ("top", "heart", "base", "notes (layer unknown)"):
                merged += [n for n in clean_list(f.get(col, "")) if n not in merged]
            notes, source = ({"note": merged}, "earlier extraction, layers not used") if merged else ({}, "")
    uncertain = bool(notes.pop("uncertain", None))
    return {k: v for k, v in notes.items() if v}, source, uncertain


def note_lines(notes, note_ar, missing):
    lines_en, lines_ar = [], []
    for lay in ("top", "heart", "base", "note"):
        if lay in notes:
            lines_en.append(f"{LABEL_EN[lay]}: " + ", ".join(notes[lay]))
            names = []
            for n in notes[lay]:
                if not note_ar.get(n):
                    missing[n] = missing.get(n, 0) + 1
                names.append(note_ar.get(n, ""))
            lines_ar.append(f"{LABEL_AR[lay]}: " + "، ".join(names) if all(names) else "")
    return lines_en, lines_ar


def build_set(spec, sets, by_handle, sheet, facts, note_ar, vocab, missing):
    """one paragraph per perfume in the set: its name (and the set's own line about it), then its own notes"""
    comps = spec["components"]
    if isinstance(comps, str):
        comps = sets[comps]
    esc = lambda t: html.escape(t, quote=False)
    en, ar, problems, sources = [f"<p>{esc(spec['intro_en'])}</p>"], [f"<p>{esc(spec['intro_ar'])}</p>"], [], []
    for c in comps:
        if "notes" in c:
            notes, uncertain = c["notes"], False
            sources.append(f"{c['name_en']}: {c['source']}")
        else:
            notes, source, uncertain = read_notes(by_handle[c["handle"]], sheet, facts)
            sources.append(f"{c['name_en']}: product {c['handle']} ({source})" + (f"; {c['source']}" if c.get("source") else ""))
            if source == "description prose":
                odd = [n for ns in notes.values() for n in ns if n not in vocab]
                if odd:
                    problems.append(f"{c['name_en']}: unrecognised note words: " + ", ".join(odd))
        if uncertain:
            problems.append(f"{c['name_en']}: layer reading uncertain")
        if not notes:
            problems.append(f"{c['name_en']}: no notes")
        lines_en, lines_ar = note_lines(notes, note_ar, missing)
        if lines_ar and not all(lines_ar):
            problems.append(f"{c['name_en']}: Arabic note name missing")
        head_en = f"<strong>{esc(c['name_en'])}</strong>" + (f": {esc(c['line_en'])}" if c.get("line_en") else "")
        head_ar = f"<strong>{esc(c['name_ar'])}</strong>" + (f": {esc(c['line_ar'])}" if c.get("line_ar") else "")
        en.append("<p>" + "<br>".join([head_en] + [esc(x) for x in lines_en]) + "</p>")
        ar.append("<p>" + "<br>".join([head_ar] + [esc(x) for x in lines_ar]) + "</p>")
    if spec["spec_en"]:
        en.append(f"<p>{spec['spec_en']}</p>")
        ar.append(f"<p>{spec['spec_ar']}</p>")
    return "".join(en), "".join(ar), problems, sources


def build():
    export, ar_by_title, sheet, facts, note_ar, no_notes, vocab, hand = load()
    sets = {k: v for k, v in json.load(open(os.path.join(OUT, "sets.json"), encoding="utf-8")).items() if not k.startswith("_")}
    by_handle = {p["Handle"]: p for p in export}
    rows, missing_ar_notes = [], {}
    for p in export:
        h, body = p["Handle"], p["Body (HTML)"]
        if h in DONE:
            continue
        ar_row = ar_by_title.get(p["Title"])
        if ar_row == "duplicate" or (ar_row and ar_row["Default content"] != body):
            # two products share the title, or the row does not hold this product's current body: never guess which
            rows.append({"handle": h, "title": p["Title"], "type": p["Type"], "status": p["Status"], "group": "held",
                         "notes source": "", "layers": "", "old_body": body, "new_body": "", "ar_identification": "",
                         "old_ar": "", "new_ar": "", "problems": "Arabic row cannot be matched safely (duplicate title or different body)"})
            continue
        ar_body = ar_row["Translated content"] if ar_row else ""
        if h in sets and isinstance(sets[h], dict):
            en, ar, problems, sources = build_set(sets[h], sets, by_handle, sheet, facts, note_ar, vocab, missing_ar_notes)
            if not ar_row:
                problems.append("no Arabic row in the export")
            rows.append({"handle": h, "title": p["Title"], "type": p["Type"], "status": p["Status"], "group": "set",
                         "notes source": " | ".join(sources), "layers": "per perfume", "old_body": body, "new_body": en,
                         "ar_identification": ar_row["Identification"] if ar_row else "", "old_ar": ar_body, "new_ar": ar,
                         "problems": "; ".join(problems)})
            continue
        if h in hand:
            rows.append({"handle": h, "title": p["Title"], "type": p["Type"], "status": p["Status"], "group": "hand",
                         "notes source": "own text, converted by hand", "layers": "", "old_body": body, "new_body": hand[h]["en"],
                         "ar_identification": ar_row["Identification"] if ar_row else "", "old_ar": ar_body,
                         "new_ar": hand[h]["ar"], "problems": "" if ar_row else "no Arabic row in the export"})
            continue
        f = facts.get(h, {})
        notes, source, uncertain = read_notes(p, sheet, facts)
        known =[l for l in ("top", "heart", "base") if l in notes]
        if len(known) == 3:
            group = "full"
        elif notes:
            group = "partial"
        else:
            group = "no notes"
        story_en = story(body)
        story_ar = story(ar_body, arabic=True) if ar_body else ""
        nn = no_notes.get(h)
        if group == "no notes" and nn:
            story_en = story_en or nn["character_en"]
            story_ar = story_ar or nn["character_ar"]
        spec_en, spec_ar = spec_line(f)
        lines_en, lines_ar = [], []
        for lay in ("top", "heart", "base", "note"):
            if lay in notes:
                lines_en.append(f"{LABEL_EN[lay]}: " + ", ".join(notes[lay]))
                ar_names = []
                for n in notes[lay]:
                    a = note_ar.get(n)
                    if not a:
                        missing_ar_notes[n] = missing_ar_notes.get(n, 0) + 1
                        a = ""
                    ar_names.append(a)
                lines_ar.append(f"{LABEL_AR[lay]}: " + "، ".join(ar_names) if all(ar_names) else "")
        if group == "no notes" and nn and nn.get("family_en"):
            lines_en.append("Scent family: " + nn["family_en"])
            lines_ar.append("العائلة العطرية: " + nn["family_ar"])
        lines_en = [html.escape(x, quote=False) for x in lines_en]
        lines_ar = [html.escape(x, quote=False) for x in lines_ar]
        en = "".join(x for x in (f"<p>{html.escape(story_en, quote=False)}</p>" if story_en else "",
                                   "<p>" + "<br>".join(lines_en) + "</p>" if lines_en else "",
                                   f"<p>{spec_en}</p>" if spec_en else ""))
        ar = "".join(x for x in (f"<p>{html.escape(story_ar, quote=False)}</p>" if story_ar else "",
                                   "<p>" + "<br>".join(lines_ar) + "</p>" if lines_ar and all(lines_ar) else "",
                                   f"<p>{spec_ar}</p>" if spec_ar else ""))
        problems = []
        if uncertain:
            problems.append("layer reading uncertain (a layer word follows its notes in the text)")
        if source == "description prose":
            odd = [n for ns in notes.values() for n in ns if n not in vocab]
            if odd:
                problems.append("unrecognised note words: " + ", ".join(odd))
        if story_en and (len(story_en.split()) < 3 or "|" in story_en):
            problems.append("story looks broken: " + story_en)
        if not story_en:
            problems.append("no English story in the current text")
        if group == "no notes" and not nn:
            problems.append("no notes and no web-search character yet")
        if group == "no notes" and nn and nn.get("confidence") == "low":
            problems.append("web-search character is low confidence: " + nn["sources"])
        if not ar_row:
            problems.append("no Arabic row in the export")
        elif not story_ar:
            problems.append("no Arabic story")
        if lines_ar and not all(lines_ar):
            problems.append("Arabic note name missing")
        rows.append({"handle": h, "title": p["Title"], "type": p["Type"], "status": p["Status"], "group": group,
                     "notes source": source if notes else "", "layers": ", ".join(known + (["notes"] if "note" in notes else [])),
                     "old_body": body, "new_body": en, "ar_identification": ar_row["Identification"] if ar_row else "",
                     "old_ar": ar_body, "new_ar": ar, "problems": "; ".join(problems)})
    return rows, missing_ar_notes


def write_batches(rows):
    order = {"set": -1, "hand": 0, "partial": 1, "no notes": 2, "full": 3, "held": 4}
    rows.sort(key=lambda r: (order[r["group"]], r["status"] != "active", r["handle"]))
    ar_fields = list(next(csv.reader(open(AR_EXPORT, encoding="utf-8-sig", newline=""))))
    batches = []
    n = 1
    for group in ("set", "hand", "partial", "no notes", "full"):
        g = [r for r in rows if r["group"] == group and not r["problems"]]
        for i in range(0, len(g), BATCH_SIZE):
            batches.append((f"batch-{n:02d}", group, g[i:i + BATCH_SIZE]))
            n += 1
    for name, group, items in batches:
        d = os.path.join(OUT, name)
        os.makedirs(d, exist_ok=True)
        with open(os.path.join(d, "products-import.csv"), "w", encoding="utf-8", newline="") as f:
            w = csv.writer(f)
            w.writerow(["Handle", "Title", "Body (HTML)"])
            for r in items:
                w.writerow([r["handle"], r["title"], r["new_body"]])
        with open(os.path.join(d, "translations-ar-import.csv"), "w", encoding="utf-8", newline="") as f:
            w = csv.writer(f)
            w.writerow(ar_fields)
            for r in items:
                w.writerow(["PRODUCT", r["ar_identification"], "body_html", "ar", "", "", r["new_body"], r["new_ar"]])
        # rollback through the admin import: the 2026-11-06 backup text for exactly these products
        with open(os.path.join(d, "rollback-products.csv"), "w", encoding="utf-8", newline="") as f:
            w = csv.writer(f)
            w.writerow(["Handle", "Title", "Body (HTML)"])
            for r in items:
                w.writerow([r["handle"], r["title"], r["old_body"]])
        with open(os.path.join(d, "rollback-translations-ar.csv"), "w", encoding="utf-8", newline="") as f:
            w = csv.writer(f)
            w.writerow(ar_fields)
            for r in items:
                w.writerow(["PRODUCT", r["ar_identification"], "body_html", "ar", "", "", r["old_body"], r["old_ar"]])
        with open(os.path.join(d, "handles.txt"), "w", encoding="utf-8") as f:
            f.write("\n".join(r["handle"] for r in items) + "\n")
        with open(os.path.join(d, "review.csv"), "w", encoding="utf-8-sig", newline="") as f:
            w = csv.DictWriter(f, fieldnames=["handle", "title", "type", "status", "group", "notes source", "layers", "old_body",
                                              "new_body", "old_ar", "new_ar"])
            w.writeheader()
            for r in items:
                w.writerow({k: r[k] for k in w.fieldnames})
    held = [r for r in rows if r["problems"]]
    with open(os.path.join(OUT, "held-back.csv"), "w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=["handle", "title", "type", "status", "group", "problems", "old_body", "new_body", "new_ar"])
        w.writeheader()
        for r in held:
            w.writerow({k: r[k] for k in w.fieldnames})
    manifest = [{"batch": n, "group": g, "count": len(items)} for n, g, items in batches]
    json.dump({"batches": manifest, "held_back": len(held)}, open(os.path.join(OUT, "manifest.json"), "w"), indent=1)
    return manifest, held


if __name__ == "__main__":
    rows, missing = build()
    if "--missing-ar" in sys.argv:
        for n, c in sorted(missing.items(), key=lambda x: -x[1]):
            print(f"{n}\t{c}")
        sys.exit()
    manifest, held = write_batches(rows)
    print(json.dumps(manifest))
    print("held back:", len(held))
