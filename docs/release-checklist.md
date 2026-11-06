> **STATUS 2026-11-06 (supersedes the status below).** **Live = "moments-redesign + moment pages" #161651720383 (role main).** Previous live theme: `moments-redesign` #161294745791 (unpublished, keep); "Copy of moments-redesign" #161628979391.
> Push with `bash scripts/push.sh --only <files>`: it refuses when the published theme is not the one in shopify.theme.toml. To roll back to the previous live theme: Admin, Themes, moments-redesign (#161294745791), Publish.

> **STATUS 2026-10-26 (supersedes the dev/live wording below).** The owner approved editing the LIVE theme directly.
> **Live = `moments-redesign` #161294745791 (role main).** Previous live theme, kept as a backup, never deleted: #161251229887 "MOMENTS - Homepage v2".
> Fresh backup of the live theme made before the enhancement pass: #161334263999 "MOMENTS - Backup 2026-10-26 11-47" (refresh before each risky batch).
> Pushes go file by file: `shopify theme push -e live --only <files> --live --allow-live`, one feature per push, logged in `docs/live-pushes.md`.

# Release checklist (dev theme `moments-redesign` #161294745791)

Prepared only. **Nothing has been published.** Publishing happens only when you send a message that says "publish".
Status as of 2026-10-25, checked on the dev theme preview.

## Editor drift (live vs dev)
The live theme (#161251229887) was pulled read-only and compared with the baseline commit (`efa522a`, the theme as first received) and with dev.
**Every editor-managed file on live equals the baseline** (`config/*.json`, `templates/*.json`, `sections/*-group.json`, `markets.json`, all locale files).
So nobody changed live in the editor since the work started: there are **no conflicts and nothing to merge**. The dev theme changes these editor-managed files on purpose:
`settings_data.json`, `settings_schema.json`, `en.default.json`, `en.default.schema.json`, `ar.json`, `footer-group.json`, `header-group.json`, `index.json`, `page.about-us.json`,
`page.moments-core.json` and a few page templates (daily-picks, for-women, home-fragrances, offers, oud, our-picks, perfuems, valentine-s-day-offers, page). Re-run the comparison right before publishing
(`shopify theme pull --theme 161251229887` to a scratch folder), because someone may edit live in between.

## Checklist
| # | Item | Result | Evidence or what is open |
| --- | --- | --- | --- |
| 1 | No TODO text visible on the storefront | **PASS** | `scripts/check-terms.mjs`: 14 pages clean. Footer `TODO_PHONE` / `TODO_SUPPORT_EMAIL` are hidden from shoppers (shown in the editor only); About slots are hidden until filled. |
| 2 | No Haramain traces | **PASS in the theme, OPEN in store data** | Theme code and rendered text are clean (`check-traces.sh`, `check-terms.mjs`). Still in the **store**: vendor "Haramain Perfumes" on 4 gift products (shown as MOMENTS by a display rule), that vendor name in product structured data (SEO), the `haramain-perfumes` collection, the "Dolby" product (no image), 538 alt texts with the other shop's wording, watermarks inside the gift bag images. All need your approval to change. |
| 3 | No unverified claims (official agency/distribution, awards, ratings) | **PASS on the pages checked** | The old product trust badges ("official distributors", 2,000 EGP, an invented returns promise) and the About page "official agency and distribution" line were rewritten. **Open:** the live About template (`page.about-us`) still has "Fair Prices ... without inflated retail markups" and "Fast Delivery across Egypt", which are unverified; the new `page.about` template does not. |
| 4 | Returns and exchange wording consistent | **PASS (links), not checked (policy body)** | Every mention (footer, About trust strip and steps, product badge) links to the same "Returns & exchange policy" page and states no terms. The policy page's own text is store content and was not reviewed here. |
| 5 | Experimental hero video labelled and replaceable | **PASS** | The editor help texts and `docs/assets/image-credits.md` mark the All day slide's poster EXPERIMENTAL. **No video exists** (ffmpeg is not installed); `scripts/prepare-video.mjs` is ready. |
| 6 | Every link and menu target exists | **PASS** | `scripts/check-links.mjs`: 75 internal links from 5 pages all resolve. "Unisex" is left out of the panel because no such collection exists; New arrivals appears because its collection exists. |
| 7 | 404, cart, search, account, checkout | **PARTLY** | 404, cart, search and collections respond correctly. The account login page rejects scripted requests (406/429), so **check it by hand**. **Checkout was not tested** (it needs a real cart); do the smoke test below. |
| 8 | Theme check clean on touched files | **PASS** | 0 errors in the whole theme. Two pre-existing warnings in the base theme's predictive-search CSS scope are untouched. |
| 9 | Lighthouse before/after | **DONE, targets not met** | Mobile: live today 45 to 46, LCP 7.0 to 7.6 s, CLS 0.01 to 0.07; dev 46, LCP 5.4 to 5.8 s, CLS 0.002; blocking time about 200 ms above live (Shopify's own scripts). Performance 70+ and LCP under 2.5 s are not met. See `docs/performance/v3-identity-reset.md`. |
| 10 | LTR and RTL screenshots at 1920, 1440, 375 | **PASS (RTL emulated)** | `docs/screenshots/hero/` (six slides), `docs/screenshots/final/` (header, both panels, drawer, About), `docs/screenshots/tiles/`. RTL uses `dir="rtl"` on English text; **real Arabic still needs a pass** once it is a store language. |
| 11 | Automated checks | **PASS** | `check-home.mjs` (clutter budget, panels, hero hours, accent, layout shift, bottle crop), `check-tiles.mjs`, `check-terms.mjs`, `check-links.mjs`. |
| 12 | Image rights and quality | **OPEN** | All 1,650 product images have unknown rights; 109 images are under 1000 px; see `docs/assets/image-rights.md` and `docs/audit/image-audit-summary.md`. Not a publishing blocker for the theme, a business exposure. |
| 13 | Backup theme | **NOT CREATED** | Creating it is a store change; it needs your yes (see `docs/rollback.md`). |

## Before you say "publish"
1. Decide the open store items (vendor rename, `haramain-perfumes` collection, "Dolby", alt text, the old About text). Nothing is changed until you approve each.
2. Add Arabic as an unpublished store language and review the draft strings, or accept English-only for now.
3. Supply the TODO facts you want live (support phone and email, delivery areas, story). Hidden slots stay hidden until then.
4. Say yes to the backup theme (duplicate of live).

## Publish (only after "publish")
`shopify theme publish --store dezrva-2z.myshopify.com --theme 161294745791`, or Admin, Themes, moments-redesign, Publish. Rollback in `docs/rollback.md`.

## Post-publish smoke test (5 minutes)
1. Home loads, one announcement message at a time, header shows Shop by Moment, Brands, Gifts, search, account, cart; hero shows the moment for the current hour; the switcher changes it.
2. Hover Shop by Moment and Brands: panels open inside the page margins, no empty headings. Press Tab, Down arrow, Escape.
3. A collection page: filters work, cards show moment and brand, compare-at price readable.
4. A product page: add to cart, the cart drawer opens, the count badge updates, "Check out" reaches checkout (do not pay), the trust badges read correctly.
5. Mobile (375): menu drawer lists the six moments first; no sideways scroll; hero buttons reachable.
6. /pages/moments, the About page (after you assign the template), the footer links, the 404 page, search.
7. Log in from the account icon.
If anything is wrong: publish the backup theme, then tell me.
