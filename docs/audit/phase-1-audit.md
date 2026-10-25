# MOMENTS Phase 1 audit

Date: 2026-10-25. Dev theme: `moments-redesign` (#161294745791), identical to live "MOMENTS - Homepage v2" (#161251229887) at audit time. No theme files were edited. No store data was written.

## 0. What could and could not be audited

| Item | Status | Why |
|---|---|---|
| Homepage at 768 and 1440 px (EN) | Done | Headless Chrome screenshots |
| Homepage at 375 px | Not reliable | Headless Chrome enforces a minimum window width, so the 375 shot was a cropped wider layout. Not counted as a theme bug. Needs a CDP device-emulation run (see questions). |
| Arabic / RTL | Blocked | `shopLocales` shows only `en` published. `/ar` returns 404. RTL can't be viewed on the store until Arabic is published. |
| Lighthouse mobile baseline | Not run | Lighthouse isn't installed. Running it needs a download (`npx lighthouse`); waiting for approval. |
| Product, collection, cart, search pages | Partial | Status, titles and DOM probed; one product page screenshotted. No full visual pass yet. |
| Add-to-cart click-through | Not done | Would write to a cart session. Needs your OK. |

## 1. Code-level theme-check findings

Baseline: 106 errors, 86 warnings, 85 files (`theme-check-baseline.json`).

### 1.1 Investigated first

**LiquidHTMLSyntaxError (1): `snippets/product-scent-notes.liquid:120`.** Parser reports an unclosed `<script>`. The script is closed with `</script>` before `{% endif %}`, so this looks like a parser limitation (very long object literal line plus Liquid inside the script), not a broken page. The scent-notes block renders on the live site. Verify on a product that uses it before touching.

**UndefinedObject (5)** are all optional or contextual variables, none look like live bugs:
- `cart-icon-component:17` `test_id`: optional param passed through to `cart-bubble`. Not declared in LiquidDoc.
- `blog-comment-form:51` `comment`: only defined inside the `form 'new_comment'` scope. Check is a false positive.
- `slideshow:56, 59` `disabled`: optional param, treated as falsy when absent. Works, but undeclared.
- `localization-form:50` `back`: optional param used as `return_to`. Undeclared.
Fix during the sections' redesign by adding `@param` entries (LiquidDoc).

### 1.2 RemoteAsset (6) and ParserBlockingScript (3): what loads and who owns it

| File | What loads | Owner | Live? |
|---|---|---|---|
| `snippets/stylesheets.liquid:3-5` | Google Fonts preconnects and CSS (Alexandria, Marcellus, Readex Pro) | MOMENTS brand layer | Yes, every page. Not render-blocking-safe: stylesheet link without `media` swap. |
| `sections/zooomy-wishlist.liquid` | `zooomyapps.com/wishlist/ListWishlist.js` (blocking) | Zooomy Wishlist app | Yes, on `/pages/wishlist` only. |
| `snippets/ZooomyListWishlistProduct.liquid` | `zooomyapps.com/wishlist/ListWishlistProduct.js` (blocking) | Zooomy Wishlist app | No. Snippet is not rendered anywhere in the theme. |
| `snippets/da-restock.liquid:16` | `MomentJS.com/downloads/moment.js` (blocking, src has a leading space) | "da-restock" Back in Stock app | No. Snippet is not rendered anywhere in the theme. |

### 1.3 OrphanedSnippet (6): nothing deleted

| Snippet | Referenced by | Finding |
|---|---|---|
| `da-restock` | Nothing in theme. Reads `shop/product/collection.metafields.da-restock.*` | Belongs to a back-in-stock app. Not rendered, so **the back-in-stock form is not shown on the live theme** unless the app injects it another way. Check whether the app is still installed. |
| `ZooomyListWishlistColl` | Nothing | Wishlist heart on collection cards isn't rendered by the theme. Only the `/pages/wishlist` section uses Zooomy. |
| `ZooomyListWishlistProduct` | Nothing | Same, for product pages. |
| `gift-bag-selector`, `gift-bag-option` | `cart-summary.liquid:95` inside a `{% comment %}` block | Intentionally disabled ("temporarily disabled on live"). `assets/gift-bag-selector.js` and the `gift-bags` collection (4 products) are ready. |
| `filters-toggle` | Nothing | Unused stock snippet. |

### 1.4 MatchingTranslations (102): en + ar only

- `en.default.json`: 264 keys. `ar.json`: 3,400 keys.
- 20 en keys are missing in ar (for example `actions.show_all_options`, `blocks.email_signup.placeholder`, `blocks.payment_methods`, `actions.see_items.*`).
- ar has 3,156 extra keys, almost all `customer_accounts.*` entries that don't exist in en.
- `locales/ar.schema.json` does not exist (theme editor labels have no Arabic file).
- The other 100 mismatches are in non-en/ar locale files and are ignored per your instruction.

### 1.5 Remaining checks, grouped by the area they touch (fix during that area's redesign)

| Area | Checks |
|---|---|
| `snippets/da-restock` | VariableName x13 (camelCase) |
| `layout/password`, `sections/password-footer` | ValidScopedCSSClass x13 |
| `snippets/gift-bag-option` | ValidScopedCSSClass x7 |
| `blocks/filters`, `snippets/list-filter`, `snippets/filters-toggle` | ValidScopedCSSClass x8, UnusedDocParam x1 |
| `snippets/variant-swatches`, `variant-quick-add` | ValidScopedCSSClass x5 (product cards) |
| `sections/main-cart`, `snippets/cart-drawer`, `cart-note` | ValidScopedCSSClass x3, UnusedDocParam x2 (cart) |
| `snippets/divider` | UnusedDocParam x4 |
| `snippets/media`, `video` | ValidScopedCSSClass x2, UnusedDocParam x1 |
| `sections/slideshow`, `media-with-content`, `search-results`, `predictive-search`, `product-recommendations` | ValidScopedCSSClass x1 each |
| `sections/product-information`, `snippets/free-shipping-progress` | HardcodedRoutes x2 |
| `snippets/price` | UnusedAssign x1 (`discount_percent`) |
| `snippets/account-popover` | UnusedDocParam x1 |

## 2. The seven listed bugs

| # | Bug | Finding |
|---|---|---|
| 1 | Both hero buttons go to the same URL | **Confirmed.** "Shop Fragrance" and "Find Your Moment" both go to `/collections/all`. Candidate destination: `/pages/moments` (exists, template `moments-core`). Lives in editor-managed `templates/index.json`. |
| 2 | "Add Added" / cart bubble "0 0" | **Not reproduced visually.** On the product page the button shows only "Add to cart". On collection cards the quick-add buttons are 0x0 until hover and the "Added" span has `opacity: 0`. Both strings appear together only in `innerText` / text extraction (both spans exist in the DOM). Same for the cart bubble: "Total items in cart: 0" is a visually-hidden label plus a hidden count. Likely an audit-tool artifact. Needs one click-through to confirm the real state change (see questions). Possible real improvement: the "Added" span is `aria-hidden`, so no screen-reader confirmation. |
| 3 | Skin Moments signup has no submit label | **Confirmed.** The only submit control is an arrow-only button with `aria-label="Sign up"` and no visible text. Form posts to `/contact`. |
| 4 | "Skin & Body" goes to a Coming Soon section | **Confirmed.** Nav link goes to `/pages/daily-care` (title "Daily Care", template `page.dailyyy`). Plan: coming-soon page with brand statement, signup form with visible label, plus a theme setting to switch the link to the real collection. |
| 5 | Stray alt text and raw tag strings | **Confirmed** in product image alts: (a) Arabic SEO alts ending "الحرمين مصر" (Haramain Egypt, another retailer) on MOMENTS products, (b) generic placeholder alts "Scale Reference", "3/4 Side Angle", "Lifestyle Flat Lay", "Scent Notes Graphic", (c) alts naming other brands ("مستوحى من Absolu Aventus", "Pacific Chill"). These are store data (product media alt), not theme code. 62 images on home, 0 missing or empty alt. Raw tag strings were not found in rendered home HTML; a product page showed a bare "Pour Homme" line under the buy buttons that may come from a tag or metafield (to trace). |
| 6 | Inconsistent brand names | **Confirmed in vendors** (see 3.1). |
| 7 | No phone or support email in footer | **Confirmed.** Footer has 3 link columns only. The "10 AM to 10 PM" hours were not found in the footer text; probably elsewhere (to locate, likely `/pages/locations` or the contact page). |

## 3. Store data (read-only queries)

Store confirmed first: MOMENTS, momentseg.com, Basic, EGP.

### 3.1 Vendors (33 distinct)

Proposed normalisation (**nothing changed; waiting for your approval**):
- `AFNAN` vs collection title `AFNAN` vs menu "AFNAN PERFUMES" vs footer "AFNAN PERFUMES" vs `AFNAN & RASASI` (1 product).
- `KHADLAJ` and `Khadlaj` are two separate vendors; footer says "KHADLAJ PERFUMES".
- `ASDAF` (8 products) vs `ASSAF` (49 products): probably a typo of Assaf; confirm.
- `ARABIYAT SUGAR` and `Arabiyat Prestige`: two lines of one brand or two brands?
- `RASASI PERFUMES`, `LATTAFA` / `LATTAFA PRIDE` mix "PERFUMES" suffix and not.
- Menu lists "AFNAN" twice (once in the brands mega menu and once at the end).
- Mixed casing: `Haramain Perfumes`, `Al Ezz for Oud`, `Maison Asrar` vs all-caps elsewhere.

### 3.2 Tags

First 250 of the tag list were read (more exist). Tags are a mix of: reference-fragrance names (e.g. "Baccarat Rouge 540 Maison Francis Kurkdjian", "Aventus Creed"), duplicates by case (`khadlaj`/`Khadlaj`, `lattafa`, `ajmal`), boilerplate ("AUTHENTIC PERFUME BY ..."), sizes (`100ml`), and one Arabic tag. Third-party brand names in tags and alt text are a **trademark and "inspired by" claim risk** that you should decide on; I won't invent or rewrite claims.

### 3.3 Collections and pages

- 71 collections including clutter: `frontpage`, `come wth deodorant`, `offer-1`, `faan-200ml-buy-2-get-200-off`.
- **`morning-moments` and `work-moments` have 0 products.** The homepage copy says "Morning. Work. Night out." but the Shop by Moment grid shows only 6 moments (night, gift, all-day, daily, fresh, love).
- Nav "Gifts" goes to `/pages/wishlist`, not a gift page (`gift-moment`, 16 products, or `gift-bags` exist).

## 4. Templates (nothing deleted)

Cross-checked against `pages` and `collections` templateSuffix values from the store:

| Template | Used by | Verdict |
|---|---|---|
| `page.dailyyy` | Page "Daily Care" (the Skin & Body link) | In use. Rename later, don't delete. |
| `page.perfuems` | Page "Perfumes" | In use (typo in name). |
| `page.for-women-2` | Page "For Women" | In use. |
| `page.oudh` | Page "Oudh" | In use. |
| `collection.asdaf` | Collection ASDAF | In use. |
| `collection.lattaf-pride` | Collection LATTAFA PRIDE | In use (typo in name). |
| `collection.womaaaa` | No collection | **Unused.** |
| `collection.mann` | No collection | **Unused.** |
| `page.oud` | No page (page `oudh` uses `page.oudh`) | **Unused.** |
| `page.json` | Pages `home-page`, `brands` fall back to it (their suffix `page` has no file) | In use as fallback. |
| `page.zooomywishlist` | Page "Wishlist" | In use. |

Renaming a template suffix means re-assigning it in the admin first; do not delete in-use ones.

## 5. Design critique (homepage; from screenshots at 768 and 1440)

1. **Hero is ~1,500 px tall at 1440 px**; buttons sit around 1,150 and 1,500 px, far below the fold, and are stacked with a huge gap. Headline and CTAs don't form one group.
2. **Hero image is a generic flat illustration of two hikers at a lake**, unrelated to fragrance and off-palette (teal, forest green, orange). It reads as a template placeholder.
3. **Headline is a looping marquee** ("Every Moment Deserves Its Scent" repeated), cropped mid-word at every width. The core message is unreadable at rest.
4. **Support line** ("100% original fragrances, curated for every moment of your day.") is tiny, at the top edge of the image, and low contrast over the artwork.
5. **Product cards**: every card carries a "Sale" badge, so the badge carries no information. All-caps titles wrap unevenly.
6. **Shop by Moment grid**: the six tiles mix photo styles and uneven crops; label chips sit on busy images.
7. **Contrast**: berry text on nude is 3.60:1 and taupe on nude is 3.72:1, both below AA (4.5:1) for body text.
8. **Announcement bar** is a carousel with arrows, which hides trust messages (COD, Authentic, Free Shipping) behind interaction.
9. No Arabic anywhere on the storefront (see section 0), despite the brand mark carrying Arabic script.

## 6. Accent proposal (needs your approval before anything is built)

See `accent-mockup.png` / `accent-mockup.html` (the mockup falls back to a generic serif because fonts did not load in headless Chrome; the real site uses Marcellus).

| Token | Hex | On pearl | On nude | On plum |
|---|---|---|---|---|
| gold-ink | #8A6A22 | 4.69 | 3.41 | 2.91 |
| gold-light | #CDA553 | 2.15 | n/a | 6.35 |

Recommendation: aged gold, two tokens (ink for light surfaces, light for plum bands), used only for hairline rules, the Save badge outline, active-state underline and one highlight per plum band. Berry stays the only action color.

Alternatives measured: deep oud #6B3A2A (8.63:1 on pearl) is safe but reads as another dark next to plum; oud-amber #A0522D (5.22:1) is close to berry in hue.

Caveat: the `design-taste-frontend` skill lists brass/ochre accents on cream backgrounds as an AI default for premium brands. Its own override allows it when the brand brief names it. Gold is your suggestion, but oud is the stronger brand story for Egypt and the Gulf, so the choice is yours.

## 7. Questions for you

1. Arabic: do you want me to enable and publish Arabic in the store (admin change, yours to do) before the redesign, or design RTL against `ar.json` only and defer the store setting?
2. Lighthouse and 375 px: may I run `npx lighthouse` (downloads the package) and a headless Chrome DevTools-protocol script for 375 px emulation? Both are dev tools only, nothing added to the theme.
3. Bug 2: may I do one add-to-cart click on the dev theme preview to check the button and bubble states (creates a cart session, no order)?
4. Accent: gold (recommended), oud, or other?
5. Vendors: confirm ASDAF vs ASSAF, and the preferred display style (all caps or title case, with or without "PERFUMES").
6. Hours: where do the "10 AM to 10 PM" support hours currently live?
7. Hero: do you have fragrance photography for the hero, or should I design around TODO placeholder slots?
