# Final report: unattended run, 2026-11-06

Owner away. Every decision taken on the owner's behalf is in [decisions-log.md](decisions-log.md) under "2026-11-06 (unattended run)".
The live theme was not touched. No filter was changed. No metafield was created. Nothing was bought. Fragrantica was not contacted.
The first unattended run's report is [final-report-2026-10-25.md](final-report-2026-10-25.md).

## The one thing left: store writes
No product description has been written to the store. The Shopify CLI can write product data (`shopify store execute`), but only
after a one-time login that needs a browser approval, which cannot be given from this terminal. Everything else is ready.

1. Log in once (opens a browser; approve):
   `shopify store auth --store dezrva-2z.myshopify.com --scopes read_products,write_products,read_translations,write_translations`
2. Write Lady Collection and check it on the product page (English and /ar):
   `python scripts/apply-descriptions.py batch-01`
3. Then the batches in order, one at a time: `batch-02` ... `batch-10`.

Each run checks the product count (821) before and after, saves every product as it is live to `data/descriptions/<batch>/live-before.json`
before writing it, skips any product whose live description differs from the 2026-11-06 export (someone changed it since), writes only
the description and its Arabic translation, reads the product back (text must match, every other field unchanged, otherwise it restores
the product and stops), and logs each handle to `apply-log.jsonl`. A rate limit (429) makes it wait and retry, never hammer.
`--dry-run` shows the changes without calling the store.

No terminal: the same batches can go through the admin. Products > Import `products-import.csv` with "Overwrite products with matching
handles" ticked (the file has only Handle, Title unchanged and Body, so no other column can change), then Settings > Languages > Import
`translations-ar-import.csv`.

## What was finished
| Task | Result |
| --- | --- |
| 1 Backups | `data/backups/products_export-2026-11-06.csv`: 821 products (770 active + 51 draft), verified byte for byte. `data/backups/translations-ar-2026-11-06.csv`: 25,812 rows, identical row by row, SHA-256 f5db92d8.... |
| 2 Descriptions | 634 products converted and ready in 10 batches, Arabic included; 187 held back with a reason each (`data/descriptions/held-back.csv`). Not yet written (see above). |
| 3 Primary ties | 325 ties became 92 close calls with the new weighting; 31 decided by the product's own description, 8 by web search, 53 marked "unsure". |
| 4 Secondary | 50+ kept, capped at 3. Average 1.60 Secondary families per perfume, maximum 3 (114 products capped). |
| 5 Moments | `data/moment-scores-PROPOSED.csv`, marked "PROPOSED, NOT APPROVED", not wired anywhere. Average 2.07 secondary moments, maximum 3. |
| 6 Unscored | 74 became 35. 752 products are scored from notes, 34 from a web-search scent family. |
| 7 Slider titles | "وصل حديثاً" and "الأكثر مبيعاً" display from `locales/ar.json` (checked on staging), so no extra translation row. Top sellers stays Shopify's best-selling order. |

## Descriptions per batch
| Batch | Group | Products | Drafts |
| --- | --- | --- | --- |
| batch-01 | Lady Collection (approved) | 1 | 0 |
| batch-02 | Sets and Arabic-only bodies, converted by hand like Lady Collection | 4 | 0 |
| batch-03, 04 | Partial notes (only the known layers) | 111 | 0 |
| batch-05 | No notes: scent character and family from web search | 34 | 32 |
| batch-06 to 10 | Full notes | 484 | 1 |
| | **Ready** | **634** | 33 |

Each batch folder holds `products-import.csv`, `translations-ar-import.csv`, `review.csv` (old and new text side by side), `handles.txt`
and the rollback files.

Held back (187), by first reason: the layer cannot be read safely because a layer word follows its notes (94), a "note" that is not a
known note name (58), no story in the current text (20), Arabic row cannot be matched because of a duplicated title (6), Arabic note
name missing (4), no notes and no reliable web result (4), single-source web result (1). By type: 147 perfumes, 20 deodorants,
5 incense, 5 gift sets, 3 bags, 7 other.

## Scores
`data/scent-scores.csv`: per product the family scores (strongest = 100), Primary, up to 3 Secondary, the source of the scores, and flags
("close call, decided by the description", "decided by web search", "unsure", "secondary capped").
Primary families: Gourmand 189, Floral 163, Amber & Oriental 125, Woody 113, Oud 53, Spicy 35, Patchouli 27, Musky 26,
Leather & Tobacco 25, Fruity 19, Citrus 7, Fresh & Aquatic 4.
Still unscored (35): 27 with no notes and no reliable web result (mostly the held-back drafts, bags, sets), 8 whose "notes" are only
describing words. Every one is listed in the file with its reason.

## Uncertain or unfinished
- **Store writes** (all batches), see the top of this report.
- **53 "unsure" Primary families**: two families within 5 points and the description does not settle it. Web search was done for 8 of
  64 close perfumes, then stopped to keep the run within capacity; the rest are flagged in `data/scent-scores.csv`.
- **187 held-back descriptions**: listed with reasons; they need a person's reading (most are prose where notes come before the layer word).
- **Arabic**: the stories are the store's existing Arabic translations; I wrote 110 note names (`data/descriptions/notes-ar.csv`), the
  Arabic for 34 no-notes products and 4 hand conversions. A native read of those is advised.
- **Moment rule**: a proposal only. Gift never leads (damped on purpose); review the fit table in `scripts/scent-scores.py`.
- **Filters**: untouched. State found earlier: live shows both the theme's tag filters and the Search & Discovery filters (duplicates);
  staging shows only Search & Discovery because its filters block is older. No record of a cleanup exists.

## How to roll back a batch
- Written with the script: `python scripts/apply-descriptions.py batch-NN --rollback` restores each product's description and Arabic
  translation from `data/descriptions/batch-NN/live-before.json` (the live state saved just before the write; an Arabic translation that
  did not exist is removed).
- Through the admin: import `data/descriptions/batch-NN/rollback-products.csv` (overwrite ticked) and
  `rollback-translations-ar.csv`. Both hold exactly the 2026-11-06 backup text for the products in `handles.txt`. An Arabic translation
  that did not exist before cannot be deleted by import; remove it in Translate & Adapt.
- Full restore of every description: the backup export `data/backups/products_export-2026-11-06.csv` (Handle, Title, Body columns).

## Files
- Scripts: `scripts/build-descriptions.py` (builds the batches from the backups), `scripts/apply-descriptions.py` (writes, verifies,
  rolls back), `scripts/scent-scores.py` (scores and the moment proposal).
- Data: `data/descriptions/` (batches, held-back list, no-notes web results, hand conversions, Arabic note names),
  `data/scent-scores.csv`, `data/moment-scores-PROPOSED.csv`, `data/scores-tiebreak-web.csv`, `data/backups/`.
