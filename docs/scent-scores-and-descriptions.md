# Scent scores and the description standard (2026-11-06)

Nothing here is written to the store. Drafts for the owner's review.

## Description standard (owner choice: short story + note lines)

```
<one or two sentences: the character of the perfume>

Top: <notes>
Heart: <notes>
Base: <notes>
```

Body in English; the Arabic goes in through the store's translations (as every other product already does).
`scripts/fragrance-db.py` already reads "Top: / Heart: / Base:" lines first, so the filters and the scent guide get cleaner data from this format.

### Lady Collection (ASSAF, /products/lady-collection): draft

Today its body is Arabic only, without notes. Proposed English body (the Arabic as its translation):

```
Lady Collection by Assaf: three women's eaux de parfum in one gift box.

Miss Flora: a soft, elegant floral with a classic touch.
Top: Orange Blossom, Almond
Heart: Jasmine, Violet, Apricot
Base: Sandalwood, Musk

Pink Lady: warmer and more seductive, for a confident personality.
Notes: Orange Blossom Bud, White Florals, Bergamot, Patchouli, Vanilla

Miss Sakura: light and flowery, inspired by Japanese cherry blossom.
Top: Bergamot, Mandarin, Cherry
Heart: Cherry Blossom, Rose, Jasmine
Base: White Musk, Vanilla, Sandalwood

300 ml (3 x 100 ml) · Eau de Parfum · Pour Femme
```

Notes come from data/fragrance-notes.csv (Miss Flora's layers from its own description; Pink Lady's source gives no layers, hence one "Notes:" line).

### Catalogue state (data/fragrance-notes.csv, 767 products)
- Almost every description is one prose paragraph (about 245 of the first 250 in the public feed); none uses the note lines except 3 Khadlaj products.
- 405 products have all three layers known, 597 have top notes, 427 heart, 512 base.
- 132 products are not perfumes (incense, deodorant, air freshener, bags) and have no notes.

## Scores: Primary / Secondary threshold

Scale: the same as Fragrantica's bars, where each perfume's strongest accord is 100 and the others are relative to it.

| | Primary | Secondary |
| --- | --- | --- |
| Family | the highest score (100) | every other family scoring **50 or more** |
| Moment | the highest score | every other moment scoring **60 or more** |

Why relative, not absolute: the bars are already scaled to the strongest one, so an absolute 30 means something different on a perfume with one loud accord than on a balanced one. 50 keeps a clear second character (for example Aromatic 100, Woody 65: Woody counts) and drops a nuance (Woody 30 does not). Moments are stricter (60) because a perfume listed under too many moments stops helping the shopper choose.
Reliability: community scores count only from about 70 votes (the Fragrantica study); below that, the perfume falls back to scores derived from its notes (top/heart/base weighted by layer, Perfumery Radar style).

### Where the scores can come from (researched)
- Fragrantica has no official export, and its terms forbid scraping.
- **FragDB** (fragdb.net): a commercial Fragrantica-based database, 143,855 perfumes; its API returns main accords with strength and vote blocks. Full data from $200; free sample only 10 rows.
- **Fragella API**: has a "main accords percentage" field, but as labels (Dominant, Prominent), not numbers.
- Apify scrapers export Fragrantica accords with a 0 to 100 strength (paid, and they scrape).
- Parfumo's Kaggle dataset: accord names without strengths.
- Free route: the owner's sheet (data/fragrantica-perfumes.csv) filled by hand from Fragrantica pages, about 620 perfumes.
