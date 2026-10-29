# Gift finder

Helps someone buying a gift pick a fragrance without knowing scent notes: three taps (who, occasion, budget), up to three picks in plain words, and a side-by-side comparison.

## Files
| File | What it does |
|---|---|
| `sections/gift-finder.liquid` | One section, two layouts: **strip** (homepage card) and **page** (full finder with results). Pills, settings, the tagged-product list, compare panel, strings for the script. |
| `snippets/gift-pick-card.liquid` | One pick card: image, brand, name, price (+ compare-at), "Easy to like" badge only when `gift_safe` is true, rows Feels / Strength / Best moment / Why this one / Gift-ready. Add to cart is the theme's own product form. |
| `assets/gift-finder.js` | `<gift-finder>` custom element: pills (aria-pressed), filtering, live count, compare table, verdict sentence. 3.4 KB gzipped, no imports. |
| `assets/gift-finder.css` | Styles; theme tokens only, logical properties only. |
| `templates/page.gift-finder.json` | The page template (layout "page"). |
| `templates/index.json` | `gift_strip` section under the moment tiles, **disabled** until products are tagged. |
| `config/settings_schema.json` | Theme settings > MOMENTS > Gift finder: budget limits, Gift-ready toggle. |
| `locales/en.default.json` | All strings under `gift_finder.*` (Arabic can be added in `ar.json` with the same keys). |
| `scripts/gift-metafields-dry-run.mjs` | Prints the metafield definitions and product values it WOULD write. No network, no write mode. |
| `scripts/gift-metafields-template.csv` | 50 products to tag (the 22 active products of the Best Sellers collection in collection order, then 28 active products in store order); values empty. |
| `scripts/check-gift-finder.mjs` | Local test: renders the real Liquid with sample values (never written to the store) and checks every scenario at 390/768/1440, RTL, keyboard, axe, no-JS. Screenshots in `docs/design/gift-finder/`. |

## How it works
1. **Strip**: tapping pills only marks them; "Show picks" opens the results page (setting "Results page", default `/pages/gift-finder`) with the choices in the URL (`?who=wife&occasion=anniversary&budget=b2`, `?safest=1`). The strip embeds no products. Without JavaScript the pills are hidden and a note links to `/collections/all`.
2. **Page**: renders only the **tagged** products of one collection (setting "Tagged products", default handle `gift-finder`), 50 per page; when someone taps "Show picks", any further pages are fetched once with the Section Rendering API (max 6 pages, 300 products). Filtering runs in the browser on the card's data attributes.
3. **Tagged** means: the product is available and has `gift_feel`, `gift_strength` and `gift_why`. Anything missing: the product is not rendered at all. Nothing is guessed.
4. **Matching** (each row can be skipped): Who matches any of its tokens in `gift_who` (Wife = `her` or `partner`, Husband = `him` or `partner`, the others one to one); Occasion must be in `gift_occasion`; Budget is `min <= price < max` (the first variant's price, in LE). "Not sure?" shows only `gift_safe = true`. Order: Easy-to-like first, then collection order (so you control order by sorting the collection manually). At most "Most picks to show" (default 3).
5. **No match**: "We have no match for that combination yet. Try fewer filters." and the safest picks instead.
6. **Compare**: tick 2 or 3 cards, "Compare N picks" opens a table with the same rows in the same order (Price, Feels, Strength, Best moment, Why this one, Gift-ready). The row labels stay visible while the table scrolls sideways on phones. The verdict is one sentence built only from strength and feel:
   - same strength and same feel: "These picks are similar: the same strength and the same feel."
   - same strength, different feel: "They are the same strength; A feels fresh and light, B feels warm and rich."
   - otherwise: "A is the lightest in strength and feels fresh and light; B is the strongest and feels warm and rich." (a third pick in between is "in the middle for strength").
7. **Best moment** uses the same rule as the product cards (first handle of the theme setting "Moment collections" the product is in); the chip takes that moment's soft colour.
8. **Gift-ready** row: only when the theme setting is on AND the product's `gift_ready` is true. Default off.

## Tagging products (after the owner approves the definitions)
Fill `scripts/gift-metafields-template.csv`:

| Column | Values |
|---|---|
| gift_feel | `fresh` (Fresh and light), `warm` (Warm and rich), `sweet` (Sweet and soft), `woody` (Deep and woody), `clean` (Clean and crisp) |
| gift_strength | 1 to 5 (Soft, Light, Medium, Strong, Very strong) |
| gift_who | any of `her`, `him`, `mother`, `father`, `friend`, `colleague`, `partner`, separated with `\|` |
| gift_occasion | any of `birthday`, `anniversary`, `eid`, `thank_you`, `wedding`, `new_baby`, separated with `\|` |
| gift_safe | `true` or `false` ("Easy to like") |
| gift_why | one human reason, at most 90 characters, no scent notes, no "smells like" a designer brand |

Then `node scripts/gift-metafields-dry-run.mjs` validates every row and prints what would be written (output of the empty template: `docs/gift-finder-dry-run-output.txt`). Rows left empty stay out of the finder. Put the tagged products in the `gift-finder` collection (or pick another collection in the section settings).
In the theme editor the page shows "N of M products on this page are tagged" so you can see coverage.

## Adding a new "who" or occasion
1. `sections/gift-finder.liquid`: add it to `who_options` (`key|metafield tokens`, e.g. `sister|her sister`) or `occasion_options` (`key`).
2. `locales/en.default.json` (and `ar.json`): add `gift_finder.who.<key>` or `gift_finder.occasion.<key>`.
3. The metafield definition: add the new token to the `gift_who` / `gift_occasion` choices (a store change: owner approval), and to the lists at the top of `scripts/gift-metafields-dry-run.mjs`.

## Turning it on
1. Owner approves the definitions; they are created; products are tagged and added to the `gift-finder` collection.
2. Create a page "Gift finder" with handle `gift-finder` and template `page.gift-finder` (store change).
3. Theme editor > Home > "MOMENTS gift finder": un-hide the section.
4. Optional, with approval: add the page to the main navigation.

## Rollback
- Hide the homepage strip in the editor (or set `"disabled": true` on `gift_strip` in `templates/index.json`).
- The page only exists once a page uses `page.gift-finder`; switch that page to another template to remove it.
- Files can be restored from git (`git show <commit>^:<file>`) and pushed with `scripts/push.sh --only <file>`; the new files are inert when nothing references them.
