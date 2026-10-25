# Phase 2 store data proposals (NOTHING APPLIED)

All data below was read from the store (Admin API read-only queries, public product feed). No store write has been made. Each section ends with what I need from you.

## 1. Vendor names

Rule from you: title case, no "Perfumes" suffix, applied consistently. ASDAF is a real brand and is not renamed or merged. Only true duplicates are merged (KHADLAJ and Khadlaj).

| Current vendor | Products | Proposed vendor | Note |
|---|---|---|---|
| AFNAN | 50 | Afnan | |
| AFNAN & RASASI | 1 | (no change proposed) | Ambiguous: co-brand or mistake? Needs your call. |
| AJMAL | 6 | Ajmal | |
| Al Ezz for Oud | 5 | Al Ezz for Oud | Already consistent |
| ALMAS PERFUMES | 22 | Almas | suffix dropped |
| AMARAH PERFUMES | 1 | Amarah | suffix dropped |
| Arabiyat Prestige | 1 | Arabiyat Prestige | Already consistent |
| ARABIYAT SUGAR | 15 | Arabiyat Sugar | |
| ARMAF | 50 | Armaf | |
| ASDAF | 8 | **ASDAF (unchanged)** | Real brand, kept as is |
| ASSAF | 49 | Assaf | |
| BANAFA FOR OUD | 4 | Banafa for Oud | |
| Dkhoon Emirates | 9 | Dkhoon Emirates | Already consistent |
| FAAN | 20 | Faan | |
| French Avenue | 2 | French Avenue | Already consistent |
| GULF ORCHID | 1 | Gulf Orchid | |
| Haramain Perfumes | 5 | Haramain | suffix dropped |
| IBRAQ | 25 | Ibraq | |
| JEAN ANTOINE | 7 | Jean Antoine | |
| KHADLAJ + Khadlaj | 127 (combined) | Khadlaj | True duplicate, merged |
| LATTAFA | 138 | Lattafa | |
| LATTAFA PRIDE | 41 | Lattafa Pride | |
| LAVERNE | 3 | Laverne | |
| LE BONHEUR | 17 | Le Bonheur | |
| LE FALCONE | 25 | Le Falcone | |
| MAISON ALHAMBRA | 7 | Maison Alhambra | |
| Maison Asrar | 2 | Maison Asrar | Already consistent |
| NABEEL PERFUMES | 65 | Nabeel | suffix dropped |
| NASEEM | 1 | Naseem | |
| RASASI PERFUMES | 69 | Rasasi | suffix dropped |
| SAINTE VALERE | 1 | Sainte Valere | |
| ZIMAYA | 41 | Zimaya | |

Search counts are case-insensitive, so KHADLAJ and Khadlaj read as 127 together.

**Dependencies you should know before approving.** 34 smart collections (every brand collection, plus `nabeels-incense-collection`, `khadlajs-incense-collection`, `made-in-saudi`, `faan-200ml-buy-2-get-200-off`) use a rule "Vendor is equal to <exact name>". Renaming a vendor empties its collection (and the brand pages, menu and footer links to it) until the rule is updated too. So a rename has to update the product vendor and the collection rule together, per brand. Other places that read vendor strings:
- `snippets/gift-bag-selector.liquid` matches Afnan, Assaf and Ibraq by vendor name (feature currently disabled).
- Menu labels ("AFNAN PERFUMES", "ALMAS", "DKHOON EMIRATES", "IBRAQ PERFUMES", and so on) are separate text and would need the same style.

Needed from you: approve the table (and the ambiguous "AFNAN & RASASI" row), and confirm I may update the matching collection rules in the same step.

## 2. Alt text on product images

Scanned all 767 products and 1,650 product images through the public per-product feed (read-only).

| Finding | Images | Products |
|---|---|---|
| Alt text ends with "الحرمين مصر" (Haramain Egypt, another retailer) | 538 | 519 |
| Blank alt text | 331 | not counted |
| Placeholder alt ("Scale Reference", "3/4 Side Angle", "Lifestyle Flat Lay", "Scent Notes Graphic") | 4 | 1 (`nightly-donna`) |
| Alt text naming another brand ("مستوحى من ...") | 30 | 30 (listed below) |

Haramain-alt products by vendor: Lattafa 120, Khadlaj 102, Afnan 50, Armaf 47, Lattafa Pride 35, Assaf 32, Le Falcone 25, Ibraq 23, Zimaya 20, Le Bonheur 16, Almas 19, plus 1 to 6 each for 13 smaller vendors.

Products with "inspired by" alt text: `supremacy-not-only-intense`, `supremacy-silver`, `am-9`, `cherry-bouquet`, `pm-9-black`, `am-9-pink-womens`, `modest-pour-homme`, `supremacy-gala`, `mystic-bouquet`, `supremacy-collectors-edition`, `modest-deux-womens`, `kayaan-crush`, `la-fleur-bouquet`, `supremacy-gold`, `turathi-purple`, `supremacy-in-sense`, `historic-sahara`, `supremacy-in-heaven`, `violet-bouquet`, `turathi-blue`, `supremacy-in-oud`, `supremacy-silver-1`, `turathi-brown`, `rare-reef`, `turathi-sky-blue`, `souvenir-bouquet`, `historic-olmeida`, `historic-doria`, `9pm-elixir`, `club-de-nuit-intense-woman`.

Placeholder-alt product: `nightly-donna` (Le Bonheur).

Rewriting 519 products' alts is a bulk store write and it is also product copy that came from another store. I will not invent claims. Proposed rule for the rewrite, for your approval: `<Brand> <Product name> <size> <product type>` in English and Arabic (taken from the product's own title and vendor only), nothing about other brands, no store names. The 331 blank alts get the same pattern.

Needed from you: approve the pattern, and whether the 30 "inspired by" products should have that wording removed everywhere (alt, tags, description) or only in alt text.

## 3. Navigation

| Menu item | Now | Proposed |
|---|---|---|
| Gifts (Main menu) | `/pages/wishlist` | `/collections/gift-moment` (16 products). Alternative: `gift-bags` (4 products). |
| Skin & Body (Main menu) | `/pages/daily-care` (page "Daily Care", template `dailyyy`, which is a copy of the incense page) | Create a new page `skin-body` with template `skin-body` (built, in the dev theme), point the menu item at it |
| Empty collections `morning-moments`, `work-moments` (0 products) | Not in any menu and not referenced by theme files | Nothing to hide. Keep them out of nav until filled. |

The Skin & Body template and its "Line has launched" switch (with a collection picker) are in the dev theme. After launch you turn on the switch and pick the collection, and the menu link needn't change.

Needed from you: Gifts target (gift-moment or gift-bags), and OK to create the `skin-body` page and re-point the menu item.

## 4. Apps (Zooomy wishlist, back-in-stock)

Not touched. The decision field in your message was left as a template choice. Current state: the Zooomy wishlist page is live (script on `/pages/wishlist`), while the Zooomy heart snippets and the `da-restock` back-in-stock snippet are not rendered anywhere in the theme. Options: keep as is, restore rendering, or remove the dead snippets and scripts.
