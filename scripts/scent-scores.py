"""Scent family scores per product (0-100, strongest = 100), Primary and Secondary, plus PROPOSED moment scores.
NOTHING IS WRITTEN TO THE STORE. Scores stay in data files (owner, 2026-11-06).

Owner decisions: strongest family = 100; Secondary family at 50 or more; moments at 60 or more; community votes count from
about 70 votes, below that the scores come from the notes. No vote data is used (no Fragrantica), so every score is note-based,
or for products without notes, taken from the scent family found by web search (data/descriptions/no-notes.csv).

Method (docs/decisions-log.md, 2026-11-06, "scores: dominance weighting"):
  note weight = layer weight x family strength x list position
    layer weight      top 1.0, heart 1.5, base 2.0 (what stays longest is what people live with), layer unknown 1.25
    family strength   how strongly a material reads in a blend (heavy, long-lasting materials dominate light, volatile ones)
    list position     the first note of a layer 1.0, then -0.1 per place, never below 0.6 (lists lead with the dominant note)
  family score = sum of its note weights, scaled so the strongest family = 100
  Primary = the strongest. Within 5 points of another family it is a close call: the product's own description decides when
  it names exactly one of the close families as its character ("a warm oriental", "a floral feminine"); otherwise "unsure".
  Secondary = other families at 50 or more, at most 3 (the strongest three), so a perfume does not land in every family.

Reads  data/backups/products_export-2026-11-06.csv, data/fragrantica-perfumes.csv (owner sheet), data/fragrance-notes.csv,
       data/descriptions/no-notes.csv, scripts/build-descriptions.py (the same reading of the descriptions)
Writes data/scent-scores.csv            family scores, Primary, Secondary, source, flags
       data/moment-scores-PROPOSED.csv  moment scores from the PROPOSED family -> moment rule below (not approved)

usage: python scripts/scent-scores.py
"""
import csv
import importlib.util
import os
import re
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DATA = os.path.join(ROOT, "data")
SECONDARY = 50
MOMENT_THRESHOLD = 60
MAX_SECONDARY = 3
CLOSE = 5

sys.path.insert(0, os.path.join(ROOT, "scripts"))
spec = importlib.util.spec_from_file_location("build_descriptions", os.path.join(ROOT, "scripts", "build-descriptions.py"))
bd = importlib.util.module_from_spec(spec)
spec.loader.exec_module(bd)
fdb = bd.fdb

LAYER_WEIGHT = {"top": 1.0, "heart": 1.5, "base": 2.0, "note": 1.25}
STRENGTH = {"Oud": 1.5, "Leather & Tobacco": 1.4, "Amber & Oriental": 1.3, "Patchouli": 1.25, "Gourmand": 1.2, "Woody": 1.1,
            "Spicy": 1.05, "Musky": 1.0, "Floral": 1.0, "Fruity": 0.85, "Fresh & Aquatic": 0.8, "Citrus": 0.7}
# words a description uses for a perfume's character -> family
CHARACTER = [(r"\boud|agarwood", "Oud"), (r"\bleather|tobacco", "Leather & Tobacco"), (r"\boriental|\bamber(?!wood)", "Amber & Oriental"),
             (r"\bgourmand|vanilla|sweet", "Gourmand"), (r"\bwoody|\bwoods?\b", "Woody"), (r"\bfloral|flower", "Floral"),
             (r"\bfruity|\bfruit", "Fruity"), (r"\bcitrus", "Citrus"), (r"\baquatic|marine|\bfresh\b", "Fresh & Aquatic"),
             (r"\bspicy|spiced|spice", "Spicy"), (r"\bmusky|\bmusk\b", "Musky"), (r"\bpatchouli", "Patchouli")]

# PROPOSED, NOT APPROVED: how well each family suits each moment (0-1). Moment score = sum(family score x fit), strongest = 100.
CONTRAST = 3
GIFT_DAMP = {"gift": 0.8}  # gifting is not a property of a scent: it only leads when nothing else clearly does
MOMENTS = ["night", "gift", "allday", "daily", "fresh", "love", "occasions", "winter"]
FIT = {
    "Oud":               {"night": 1.0, "gift": 0.6, "allday": 0.3, "daily": 0.1, "fresh": 0.0, "love": 0.6, "occasions": 1.0, "winter": 1.0},
    "Leather & Tobacco": {"night": 1.0, "gift": 0.5, "allday": 0.3, "daily": 0.2, "fresh": 0.0, "love": 0.7, "occasions": 0.6, "winter": 1.0},
    "Amber & Oriental":  {"night": 0.9, "gift": 0.8, "allday": 0.4, "daily": 0.2, "fresh": 0.1, "love": 0.8, "occasions": 0.9, "winter": 1.0},
    "Patchouli":         {"night": 0.8, "gift": 0.5, "allday": 0.4, "daily": 0.3, "fresh": 0.1, "love": 0.6, "occasions": 0.6, "winter": 0.8},
    "Gourmand":          {"night": 0.7, "gift": 0.9, "allday": 0.5, "daily": 0.3, "fresh": 0.1, "love": 1.0, "occasions": 0.6, "winter": 0.9},
    "Woody":             {"night": 0.6, "gift": 0.7, "allday": 0.8, "daily": 0.8, "fresh": 0.4, "love": 0.5, "occasions": 0.6, "winter": 0.7},
    "Spicy":             {"night": 0.8, "gift": 0.5, "allday": 0.4, "daily": 0.3, "fresh": 0.2, "love": 0.6, "occasions": 0.7, "winter": 0.9},
    "Musky":             {"night": 0.5, "gift": 0.8, "allday": 1.0, "daily": 0.9, "fresh": 0.5, "love": 0.7, "occasions": 0.5, "winter": 0.4},
    "Floral":            {"night": 0.4, "gift": 1.0, "allday": 0.8, "daily": 0.7, "fresh": 0.6, "love": 0.9, "occasions": 0.8, "winter": 0.3},
    "Fruity":            {"night": 0.3, "gift": 0.8, "allday": 0.8, "daily": 0.6, "fresh": 0.9, "love": 0.6, "occasions": 0.4, "winter": 0.1},
    "Fresh & Aquatic":   {"night": 0.1, "gift": 0.5, "allday": 0.9, "daily": 1.0, "fresh": 1.0, "love": 0.2, "occasions": 0.2, "winter": 0.0},
    "Citrus":            {"night": 0.1, "gift": 0.5, "allday": 0.9, "daily": 1.0, "fresh": 1.0, "love": 0.2, "occasions": 0.2, "winter": 0.0},
}


def notes_for(p, sheet, facts):
    """the same reading the descriptions use; the older extraction only as layer-unknown notes"""
    h, body = p["Handle"], p["Body (HTML)"]
    if h in sheet:
        return sheet[h], "notes: owner's Fragrantica sheet"
    n = bd.structured(body)
    if n:
        return n, "notes: description note lines"
    n = bd.prose_notes(body)
    n.pop("uncertain", None)
    n = {k: v for k, v in n.items() if v}
    if n:
        return n, "notes: description prose"
    f = facts.get(h, {})
    merged = []
    for col in ("top", "heart", "base", "notes (layer unknown)"):
        merged += [x for x in bd.clean_list(f.get(col, "")) if x not in merged]
    if merged:
        return {"note": merged}, "notes: earlier extraction (layers not used)"
    return {}, ""


# notes the family map in fragrance-db.py does not hold (scoring only; the family: tags are unchanged)
EXTRA_FAMILY = {"chocolate": "Gourmand", "butter": "Gourmand", "cookie": "Gourmand", "pecan": "Gourmand", "cream": "Gourmand",
                "biscuit": "Gourmand", "dates": "Gourmand", "woods": "Woody", "oud wood": "Oud", "florals": "Floral",
                "floral": "Floral", "spices": "Spicy", "marine": "Fresh & Aquatic", "clary sage": "Fresh & Aquatic",
                "oriental notes": "Amber & Oriental", "amber": "Amber & Oriental"}


def family_of(name):
    """the note itself, else its main word: "Warm Musk" -> Musk -> Musky, "Egyptian Jasmine" -> Jasmine -> Floral"""
    low = name.lower()
    for key in (low, " ".join(low.split()[-2:]), low.split()[-1]):
        fam = fdb.NOTE_FAMILY.get(key) or EXTRA_FAMILY.get(key)
        if fam:
            return fam
    return None


def family_scores(notes):
    raw = {}
    for layer, names in notes.items():
        for i, name in enumerate(names):
            fam = family_of(name)
            if not fam:
                continue
            w = LAYER_WEIGHT.get(layer, 1.25) * STRENGTH[fam] * max(0.6, 1.0 - 0.1 * i)
            raw[fam] = raw.get(fam, 0) + w
    if not raw:
        return {}
    top = max(raw.values())
    return {f: round(100 * v / top) for f, v in sorted(raw.items(), key=lambda x: -x[1])}


def described(body):
    """families the description names as the perfume's character, in its first sentence"""
    first = bd.story(body).split(".")[0].lower() if body else ""
    return {fam for rx, fam in CHARACTER if re.search(rx, first)}


def main():
    export = [r for r in csv.DictReader(open(os.path.join(DATA, "backups", "products_export-2026-11-06.csv"), encoding="utf-8-sig",
                                             newline="")) if r["Title"].strip()]
    _, _, sheet, facts, _, no_notes, _, _ = bd.load()
    tb = os.path.join(DATA, "scores-tiebreak-web.csv")
    tiebreak = {r["handle"]: r for r in csv.DictReader(open(tb, encoding="utf-8-sig"))} if os.path.exists(tb) else {}
    out, moments_out = [], []
    for p in export:
        notes, source = notes_for(p, sheet, facts)
        s = family_scores(notes)
        flags = []
        if not s and p["Handle"] in no_notes and no_notes[p["Handle"]].get("family_en") and no_notes[p["Handle"]]["confidence"] != "low":
            fams = [x.strip() for x in no_notes[p["Handle"]]["family_en"].split(",")]
            s = {fams[0]: 100, **{f: 60 for f in fams[1:]}}  # web sources give an order, not strengths: listed second = Secondary
            source = "web search family (" + no_notes[p["Handle"]]["confidence"] + "): " + no_notes[p["Handle"]]["sources"]
        primary = next(iter(s), "")
        close = [f for f, v in s.items() if f != primary and v >= 100 - CLOSE]
        web = tiebreak.get(p["Handle"])
        if close and web and web["primary"] in ({primary} | set(close)):
            if web["primary"] != primary:
                s[web["primary"]], s[primary] = 100, s[web["primary"]]
                s = dict(sorted(s.items(), key=lambda x: -x[1]))
                primary = web["primary"]
            flags.append("close call, decided by web search: " + web["sources"])
        elif close:
            said = described(p["Body (HTML)"]) & ({primary} | set(close))
            if len(said) == 1:
                winner = said.pop()
                if winner != primary:
                    s[winner], s[primary] = 100, s[winner]
                    s = dict(sorted(s.items(), key=lambda x: -x[1]))
                    primary = winner
                flags.append("close call, decided by the description")
            else:
                flags.append("close call, unsure: " + ", ".join([primary] + close))
        secondary = [f for f, v in s.items() if f != primary and v >= SECONDARY]
        if len(secondary) > MAX_SECONDARY:
            flags.append(f"secondary capped at {MAX_SECONDARY} (had {len(secondary)})")
            secondary = secondary[:MAX_SECONDARY]
        if not s:
            why = "no notes and no web-search family" if not notes else "notes match no family"
            source = "unscored: " + why
        out.append({"handle": p["Handle"], "title": p["Title"], "type": p["Type"], "status": p["Status"],
                    "family scores": "; ".join(f"{f} {v}" for f, v in s.items()), "primary family": primary,
                    "secondary families": ", ".join(secondary), "score source": source, "flags": "; ".join(flags)})
        if s:
            m = {k: sum(v * FIT[f][k] * GIFT_DAMP.get(k, 1.0) for f, v in s.items()) for k in MOMENTS}
            top = max(m.values()) or 1
            # cubed so the moments a perfume clearly suits stand apart from the ones it merely tolerates
            m = {k: round(100 * (v / top) ** CONTRAST) for k, v in m.items()}
            ranked = sorted(m.items(), key=lambda x: -x[1])
            sec = [k for k, v in ranked[1:] if v >= MOMENT_THRESHOLD][:MAX_SECONDARY]
            moments_out.append({"handle": p["Handle"], "title": p["Title"], **{f"moment {k}": v for k, v in m.items()},
                                "primary moment": ranked[0][0],
                                "secondary moments": ", ".join(sec),
                                "status": "PROPOSED, NOT APPROVED"})
    with open(os.path.join(DATA, "scent-scores.csv"), "w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(out[0]))
        w.writeheader()
        w.writerows(out)
    with open(os.path.join(DATA, "moment-scores-PROPOSED.csv"), "w", encoding="utf-8-sig", newline="") as f:
        f.write("# PROPOSED, NOT APPROVED: moment scores from the family -> moment rule in scripts/scent-scores.py. Not wired anywhere.\n")
        w = csv.DictWriter(f, fieldnames=list(moments_out[0]))
        w.writeheader()
        w.writerows(moments_out)
    scored = [r for r in out if r["primary family"]]
    n_sec = [len(r["secondary families"].split(", ")) if r["secondary families"] else 0 for r in scored]
    print(f"{len(out)} products, {len(scored)} scored, {len(out) - len(scored)} unscored")
    print(f"secondary per scored product: average {sum(n_sec) / len(n_sec):.2f}, max {max(n_sec)}")
    print("close calls decided by description:", sum("decided" in r["flags"] for r in out),
          "| still unsure:", sum("unsure" in r["flags"] for r in out),
          "| capped:", sum("capped" in r["flags"] for r in out))


if __name__ == "__main__":
    main()
