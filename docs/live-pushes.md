# Live pushes

Every push to the live theme (#161294745791), newest last. Command: `shopify theme push -e live --only <files> --live --allow-live`.

| Time | Files | Commit | Checks | Smoke test |
|---|---|---|---|---|
| 2026-10-26 (before the rule) | sections/moments-announcement.liquid | 23d4ab5 | theme was believed to be a dev theme | not run; flat plum strip instead of the pill |
| 2026-10-26 | locales/en.default.json, locales/ar.json | (this batch) | theme check (error level), check-terms, check-links, check-traces, check-tiles all pass | scripts/smoke-live.mjs: home, collection, about, search, product, add to cart, cart, checkout reachable at 1440 and 375: PASSED. Labels now "Returns policy"; the footer menu item is store data and still says "Returns & Exchange Policy" (needs-from-owner). |
| 2026-10-26 | assets/moments.css | (colour tokens batch) | moment-palette.mjs AA check (pearl on field 5.3:1+), check-traces, check-tiles (120 states) | smoke PASSED. Six moment colours rebuilt from one OKLCH recipe; hero/tile/ticker follow the tokens. |
| 2026-10-26 | assets/cursor-*.png/svg, snippets/moment-pointer.liquid, sections/moments-cursor-test.liquid, templates/page.cursor-test.json, config/settings_schema.json | (pointer dark batch) | build-cursors, check-pointer (test page) | pointer only on ?view=cursor-test; smoke later |
| 2026-10-26 | layout/theme.liquid, snippets/moment-cursor.liquid | (pointer on) | check-pointer --site: body/link/button/cta/card custom, inputs native on 5 pages, follower 30px right and 24px below the tip, CLS 0.001 | smoke PASSED |
| 2026-10-26 | sections/moments-bundle.liquid, snippets/product-card-meta.liquid | (bundle cards) | check-traces, probe-bundle-layout (buttons level in every row at 1440 and 375) | smoke PASSED (one timing flake on the first run right after the push, two clean reruns) |
| 2026-10-26 | blocks/filters.liquid, sections/product-trust-badges.liquid | (contrast: trust badge subtitle, filter text) | check-contrast | smoke PASSED |
| 2026-10-26 | assets/moments.css | (muted text tokens 0.78) | check-contrast on /collections/all and /search: ok | smoke PASSED (3 pushes of this file: opacity token, scheme token, scheme token with higher specificity) |
| 2026-10-26 | assets/cursor-*.png/svg, snippets/moment-pointer.liquid | (pointer icons) | check-pointer (test page and --site): arrow for the page (hotspot 8,3), OK hand for links and buttons (18,3) | smoke PASSED |
| 2026-10-26 | assets/moments.css, sections/moments-story.liquid, moments-steps.liquid, moments-brand-marquee.liquid, moments-brands-row.liquid, moments-gift-block.liquid, templates/index.json | (colour flow) | check-colour-flow home 1440/375 LTR+RTL: max step 0.75-0.97, 0 lines, 2 resting tones; /pages/moments, About, Bundle, Cart 1440/375 pass | smoke PASSED |
| 2026-10-26 | assets/moments.css | (moment palette: sand All day, clay Daily, crimson Love; closest pair dE 11.4) | check-tiles, moment-palette contrast and distance | smoke PASSED |
| 2026-10-26 | assets/moments.css, layout/theme.liquid, snippets/moment-card-diagnostic.liquid | (card hotfix: color-scheme only light, explicit card colours; diagnostic ?card-diagnostic=1) | check-card-matrix (Chromium, WebKit, Firefox x light, dark, forced-colors, iPhone 13, cart with 3, bundle state): ok | smoke PASSED |
| 2026-10-26 | assets/moments.css, sections/moments-bundle.liquid | (product card: bordered clipped card, full-width square frame on the card surface, badge and 44px add button 12px inside the frame, text on one inset, price pinned to the bottom, equal heights; recommendation cards: in-flow buy-buttons block and duplicate centred brand hidden, frame no longer shrinks; one 16px radius, 6px badge radius) | check-card-layout quick on Chromium and WebKit: ok on home, collection, search, bundle, product recommendations, cart at 375 (touch iPhone emulation) and 1440 | smoke PASSED (one flake from a Shopify worker script on the first run) |
| 2026-10-26 | snippets/moment-tile.liquid | (rounded Shop by Moment tiles, 16px) | check-tiles, check-colour-flow home | smoke PASSED |
| 2026-10-26 | snippets/moments-mobile-menu.liquid, snippets/header-drawer.liquid, locales/en.default.json, locales/ar.json | (mobile menu sheet: tested on staging theme #161340850367 first) | check-mobile-menu on staging: 320-412 and 700px, LTR and RTL, Chromium and WebKit all ok; on live 320/375/412 both engines ok | smoke PASSED |
| 2026-10-26 | assets/moments.css, snippets/moments-mega.liquid | (footer: no fade strips inside the footer group; rounded mega-menu tiles; "All brands" follows the logos) | check-colour-flow home 1440/375 (now also fails on any light row inside the footer) | smoke PASSED |
| 2026-10-26 | snippets/moment-marks-sprite.liquid, sections/moments-gift-block.liquid, sections/moments-story.liquid, templates/index.json | (Gift mark redrawn as a bottle with a bow; Gift card with three real gift-set packshots; story list as rounded colour-chip rows; index.json gift block picks khamrah-gift-set, fakhar-man-gift-set, yara-candy-gift-set) | tested on staging #161340850367 first; check-gift (card 425px at 1440, one-line headline, packshots contained inside frames, no overflow at 375), check-tiles (120 states), check-colour-flow | smoke PASSED |
| 2026-10-26 | assets/header-menu.js | (mega menu: a panel could stay open after the pointer left; closes on leaving any nav item, plus a hover watchdog) | scripts/check-menu-hover.mjs: live as shipped 3 stuck of 100 trials; with the fix 0 of 200 | smoke PASSED (one add-to-cart timing flake, two clean reruns) |
| 2026-10-26 | sections/moments-brands-index.liquid, templates/page.page.json, locales/en.default.json, locales/ar.json, templates/search.json, templates/collection*.json (16), assets/moments.css | (Brands page as an A-Z brand grid; numbered pages instead of infinite scroll on collections and search; 44px page-number controls) | pulled live first: no editor drift in the templates; staging preview checked | smoke PASSED |
| 2026-10-26 | config/settings_data.json, snippets/moment-card-diagnostic.liquid, assets/card-diagnostic.js | (performance: card swipe gallery off, 2 images per card instead of up to 5; the diagnostic script is fetched only with the query instead of 8 KB inline on every page) | live == local checked; diagnostic still works; check-card-layout quick ok | smoke PASSED |
| 2026-10-26 | snippets/card-gallery.liquid | (performance: card images were ALL eager at 100vw on every collection page; now lazy with real sizes and candidates capped at 1200px) | analyse-weight: collection page images 1,494 KB (24) -> 212 KB (10); check-card-layout quick ok | smoke PASSED |
| 2026-10-26 | sections/moments-announcement.liquid | (performance: the rotation animated `visibility`, forcing about 145 style recalculations a second on every page; opacity and transform only) | probe-idle-cpu: 144 -> 14 recalcs/s, main thread 22% -> 3% idle on home, collections and bundle; all three messages still rotate | smoke PASSED |

### Pending: cart batch (built, tested on staging #161340850367; NOT pushed: the store's edge is rate limiting my test traffic, no smoke test possible)
Files: snippets/moments-free-shipping-bar.liquid, snippets/cart-summary.liquid, snippets/cart-products.liquid, sections/moments-cart-empty.liquid, templates/cart.json (copy of templates/cart.new.json), assets/moments.css, assets/moment-toast.js, snippets/moment-toast.liquid, layout/theme.liquid, config/settings_data.json (cart_type page), locales/en.default.json, locales/ar.json.
Order: push everything except templates/cart.json and settings_data.json, smoke test, check-cart.mjs with --theme absent; then cart.json; smoke; then settings_data.json (cart type page); smoke and an add-to-cart toast check.

### 2026-10-27 cart batch, part 1 (live, smoke passed)
Pushed: snippets/moments-free-shipping-bar, cart-summary, cart-products, sections/moments-cart-empty, assets/moments.css, moment-toast.js, snippets/moment-toast, layout/theme.liquid, locales en + ar. Live had no drift on these files. templates/cart.json and settings_data.json (cart_type page) still pending.

### 2026-10-27 header-menu.js (mega panel half-open fix, live, smoke passed)
Pushed assets/header-menu.js: panel height follows its content (ResizeObserver), a 250 ms guard closes an open panel when the pointer/focus is away, and a lost-state reset. 40 hover trials clean on live.

### 2026-10-27 header-menu.js again (live, smoke passed)
Cause found: when the pointer leaves the window (or the window blurs), Chrome keeps :hover on the menu and fires no pointerleave, so the panel stayed open (reproduced: 499px open on the old code). The menu now also closes on document mouseleave, mouseout with no target, window blur and tab hidden. scripts/check-menu-leave.mjs covers it.

### 2026-10-27 Save badge, brand icons, jsconfig (live)
Pushed: snippets/product-card-badges.liquid (Save label: solid berry pill, pearl text, tag icon, no gold; 5.9:1), assets/moments.css, snippets/cart-summary.liquid (claim icons), assets/icon-{cart,add-to-cart,account,search,arrow}.svg redrawn (rounded, small spark accent) and new icon-{tag,truck,shield,return,gift,spark,bottle}.svg, assets/jsconfig.json (removed deprecated baseUrl; "paths" still resolves @theme/*).

### 2026-10-27 cursor follower removed (live, smoke passed)
layout/theme.liquid no longer renders the moment-cursor companion (the circle that followed the pointer). The pointer images (moment-pointer) stay. snippets/moment-cursor.liquid deleted from the repo; the unused copy remains on the live theme (no deletions pushed).

### 2026-10-29 gift finder (live, smoke passed twice)
Pulled live first: templates/index.json, locales/en.default.json, config/settings_schema.json equal to the last commit (no editor drift). Commit 52e6833 (branch gift-finder).
1. sections/gift-finder.liquid, snippets/gift-pick-card.liquid, assets/gift-finder.js, assets/gift-finder.css, locales/en.default.json, config/settings_schema.json (new settings: gift budget limits, Gift-ready toggle default off). Checks: theme check 0 errors and no offence in these files; scripts/check-gift-finder.mjs (local render with sample values, 390/768/1440, RTL, keyboard, axe, no-JS) PASSED. Smoke PASSED.
2. templates/page.gift-finder.json (new), templates/index.json (adds `gift_strip` after the moment tiles with `"disabled": true`, nothing else changed). Smoke PASSED. Checked: /pages/about-us?view=gift-finder renders the finder and says "No fragrances are ready for the gift finder yet." (no product is tagged); the homepage renders no strip, so its HTML and Lighthouse numbers are unchanged.
Rollback: the strip is already hidden; push the previous templates/index.json (`git show 52e6833^:templates/index.json`) if the section entry itself must go. The other files are inert while no page uses page.gift-finder.

### 2026-10-29 hero gift box: new files only (live homepage unchanged, smoke passed)
Commit 14781a2 (branch hero-gift-box). Pulled first: locales/en.default.json and templates/index.json equal to the last commit.
Pushed: sections/hero-gift-box.liquid, snippets/hero-box-logo.liquid, assets/hero-gift-box.css, assets/hero-gift-box.js, assets/hero-9pm-{front,front-sm,angle,angle-sm}.webp, assets/hero-box-pattern.svg, locales/en.default.json (hero_box strings), templates/index.hero-box.json (preview: the homepage with only the hero swapped; /?view=hero-box). Nothing references these from the live homepage (index.json untouched).
Then assets/hero-gift-box.css again (the Night glow faded out over the stage's last 30% so the hero always ends on pure #251224: measured on live at 1440, 390, 360). Smoke PASSED both times.
Checks: scripts/check-hero-box.mjs (local render; Chromium 1440/1280/768/390/360 LTR+RTL, WebKit 1440/390 LTR+RTL, reduced motion, setting off, keyboard, axe, CLS) PASSED; check-colour-flow /?view=hero-box 1440/375 LTR+RTL OK; check-contrast /?view=hero-box OK.
Rollback: nothing to roll back on the homepage; to remove the preview, delete templates/index.hero-box.json in the admin code editor (a deletion, so only with the owner's yes).

### 2026-10-29 mega panel: no cropped strip after a quick hover (live, smoke passed)
Owner report: hovering "Shop by Moment" and leaving at once left a cropped strip of moment tiles under the header. Cause: the panel opens and closes by animating a clip, and the theme hides the panel content with --submenu-content-opacity, but the MOMENTS panel (snippets/moments-mega.liquid) never used it, so the tiles stayed fully painted inside the shrinking clip. Fix: .m-mega follows --submenu-content-opacity, fading in over 160 ms and disappearing at once on close. Commit (branch hero-gift-box) "fix(menu): mega panel tiles follow the theme's content opacity".
Pushed: snippets/moments-mega.liquid. Checks on live: frame sampling every 40 ms after hovers of 20 to 140 ms: tiles at opacity 0 in all 22 closing frames; check-menu-leave (window leave, blur) ok; check-menu-hover 40 trials, nothing stuck; scripts/check-menu-quick-leave.mjs (new) ok. Smoke PASSED.
Rollback: push the previous file (`git show HEAD~1:snippets/moments-mega.liquid`); the old behaviour returns.

### 2026-10-29 store change: gift finder metafield definitions (owner approved in chat)
Created 7 product metafield DEFINITIONS in namespace `moments` (Admin API metafieldDefinitionCreate, pinned): gift_feel (single line, choices fresh/warm/sweet/woody/clean), gift_strength (integer 1-5), gift_who (list, her/him/mother/father/friend/colleague/partner), gift_occasion (list, birthday/anniversary/eid/thank_you/wedding/new_baby), gift_safe (boolean), gift_why (single line, max 90), gift_ready (boolean). No definitions existed before. No product values written.
Rollback: delete the definitions in Settings > Custom data > Products (no values exist yet, so nothing else is lost).

### 2026-10-29 cursor follower: last traces removed (live, smoke passed)
config/settings_schema.json: the "Moment cursor companion" setting removed (settings_data.json held no value for it). snippets/moment-cursor.liquid, unused since 2026-10-27, deleted from the live theme. Scripts and docs no longer reference it; scripts/check-pointer.mjs now fails if anything follows the mouse. check-pointer --site: arrow and hand on every page tested, inputs native, no follower, CLS 0.000. Smoke PASSED.
Rollback: not expected; the snippet is in git history (`git show 6005df2^:snippets/moment-cursor.liquid`).

### 2026-10-29 hero LCP pass (preview only, smoke passed)
Pushed: sections/hero-gift-box.liquid, snippets/hero-box-logo.liquid (logo paths once, as symbols), snippets/hero-gift-box-styles.liquid (new: the hero's styles inline), and assets/hero-gift-box.css removed from the live theme (replaced by the inline styles). check-hero-box (Chromium) PASSED; lid logo checked on desktop, phone and RTL. Live homepage unchanged.

### 2026-10-30 hero: desktop only, inside walls (preview only, smoke passed)
Owner: the box on phones is not wanted; a side looked missing on desktop. Pulled templates/index.hero-box.json first (equal to the last push).
Pushed: sections/hero-gift-box.liquid (new setting "Show on phones", default off: under 750px the section is hidden and the previous moments-hero shows; from 750px the previous hero is hidden), snippets/hero-gift-box-styles.liquid (inside faces of the left and right walls, seen through the open top), templates/index.hero-box.json (moments_hero added back after hero_box, so phones on the preview get today's hero). check-hero-box PASSED (incl. hidden at 390/749, shown at 750/1440). On live: /?view=hero-box shows the new hero at 1440 and the current hero at 390; the live homepage is unchanged. Smoke PASSED.

### 2026-10-30 hero headline 3 (preview only, smoke passed)
Pulled locales/en.default.json first (no drift). hero_box.headline_3 is now "Now choose your moment." (no product named; the owner chose a generic MOMENTS bottle for the 3D model). Only the preview uses this string.

### 2026-10-30 hero: live 3D bottle (preview only, smoke passed twice)
Owner chose a generic MOMENTS bottle (3D model "perfume bottle" by milaha, Sketchfab, CC BY 4.0). Source 26.75 MB (4096 px PNG textures) compressed to assets/hero-bottle.glb, 424 KB (1024 px WebP, meshopt); 1024 and 2048 textures compared at hero size: no visible difference.
Pushed: assets/hero-bottle-3d.js (three.js r170, glTF loader, meshopt decoder, room environment, 147 KB gzipped; built from scripts/hero-bottle-3d/entry.js by scripts/build-hero-3d.mjs), assets/hero-bottle.glb, assets/hero-bottle-{start,end}[-sm].webp (stills rendered from the model by scripts/render-hero-posters.mjs, the first paint and the fallback), assets/hero-gift-box.js (loads the 3D on desktop only), sections/hero-gift-box.liquid (setting "3D bottle on desktop", default on; generic alt text; the CC BY credit line shown wherever the bottle is), snippets/hero-gift-box-styles.liquid, locales/en.default.json (bottle_alt_generic, credit_html), templates/index.hero-box.json (pulled first: only Shopify's header comment differed).
First version loaded the 3D on idle after load: desktop TBT rose to 1.9-2.0 s. Second push of assets/hero-gift-box.js: the 3D loads on the first scroll, pointer move or key press instead. Lighthouse desktop, two runs each, after: / perf 27-31, LCP 10.9-12.1 s, TBT 590-890 ms; /?view=hero-box perf 31-45, LCP 4.3-4.9 s, TBT 320-740 ms, CLS 0; JS 684 KB on both (no 3D code during load).
Checks: check-hero-box Chromium and WebKit PASSED (incl. no 3D before interaction, mounts after it, turns with scroll, stills hidden after, none under reduced motion). On live: the 3D mounts at 1440; at 390 the current hero shows and no 3D loads; the live homepage is unchanged.
Rollback: section setting "3D bottle on desktop" off (stills only), or push the previous section file.

### 2026-10-30 hero: new bottle, centred box, complete lid (preview only, smoke passed)
Owner swapped the 3D model for "Fancy Perfume Bottle" by Jamie McFarlane (Sketchfab, CC BY 4.0; 2.78 MB -> assets/hero-bottle.glb 335 KB) and asked for the box centred and larger, a lid with no missing side, and better use of the 3D.
Pushed: sections/hero-gift-box.liquid (one centred column: headline, box, buttons under the box; lid back band and four inner rim walls; credit names the new author and model), snippets/hero-gift-box-styles.liquid (box sized by width and height, up to 460 px, turned less; the bottle larger and rising less), assets/hero-bottle-3d.js (wider framing; the bottle leans up to ~7 degrees toward the mouse, eased), assets/hero-bottle.glb, assets/hero-bottle-{start,end}[-sm].webp (stills re-rendered from the new model).
Checks: check-hero-box Chromium and WebKit PASSED. On live: no 3D before interaction, mounts after it, credit "3D bottle adapted from Fancy Perfume Bottle by Jamie McFarlane, CC BY 4.0"; at 390 the current hero shows. Lighthouse desktop, two runs: / LCP 10.7-11.2 s, TBT 410-1,050 ms; /?view=hero-box LCP 4.9-5.0 s, TBT 250 ms, CLS 0-0.001.
Rollback: push the previous versions of these files from git (commit before "feat(hero): new 3D bottle").

### 2026-10-30 site-wide colour and placement pass (live, four batches, smoke passed after each)
Staging #161340850367 first (full push, review screenshots in docs/design/site-polish/, colour flow and contrast on staging). Pulled and diffed every editor-managed file before pushing; live had no drift.
1. CSS, sections, snippets (33 files): no gold; berry actions; identity state colours; guide headings (Marcellus, uppercase, 0.04em, 56/36 and 34/26); three spacing steps; one content edge (breadcrumb, trust/returns badges, scent notes, fragrance journey, FAQ, page text); 96px seamless joins; sticky add-to-cart, drawer free-shipping bar, Save pill, location banner, fragrance journey on tokens; empty hero slot label only in the editor.
2. Templates and the footer group (27 files): product page price case, "Pour Homme" alignment, "Related products" H2; collection and returns titles start-aligned; 32 dead colour-scheme references to scheme-1; search grid gutter on phones; footer link hover nude.
3. config/settings_data.json (pushed from the pulled live copy, so cart_type stayed "drawer"): scheme-2 pearl background, berry primary buttons in schemes 5, 7, 8, nude-deep input borders.
4. Header into the hero: transparent header on the homepage (inverse, pearl text), deep-plum scrim on the photo hero, nude accent link and plum-filled search pill over the hero; the dead "top" scheme reference fixed.
Checks on live: colour flow 9 pages x 4 modes PASS; contrast OK; check-layout-edges (edges, headings, gold, overflow) at 1440/768/390 PASS; tiles, hero, gift finder checks PASS.
Rollback: per batch from git (`git show <commit>^:<file>`), templates and settings_data from the pulled copies.

### 2026-10-30 announcement marquee, hero polish, menu artifacts, cursor, drawer link (live, smoke passed after each)
- sections/header-group.json (announcement style "marquee"), sections/moments-announcement.liquid (nude sparkle separators): the bar scrolls left to right like the brand strip.
- Gift-box hero: berry ribbon (the bow was added, then removed at the owner's request), tone-on-tone pattern stage, light pool, "Scroll to open" cue and a lid peek; lighter text and buttons (300 / 500); on desktop the stage splits as it opens (box to the end side, words and buttons to the start side). Preview only (/?view=hero-box).
- Mega menu: the header section is one z-index level above sticky page parts (the collection filter bar painted a pale band over the open panel); the menu background layer has no drop shadow (its shadow outside the clip left a strip of tiles under the header after closing); closed panels are not rendered (content-visibility). scripts/check-menu-artifacts.mjs reproduces both.
- Pointer: the berry hand applies inside clickable elements (the filter headings showed the system hand); text fields use a new MOMENTS I-beam (assets/cursor-text.*); check-pointer --site OK.
- Cart drawer: "View cart" link beside the title (routes.cart_url).
Checks: menu leave/hover/quick-leave OK; colour flow home, collection, hero preview PASS; contrast OK; hero check Chromium and WebKit PASS.

### 2026-11-06 owner notes: product page, brand rows, phone hero (live, smoke passed)
The published theme is now **#161651720383 "moments-redesign + moment pages"** (shopify.theme.toml and older notes still name #161294745791, which is no longer live; `scripts/push.sh` follows `--live`, so it pushed to #161651720383).
Pushed (23 files): sections/product-list.liquid (brand rows: "This page's collection", newest or best selling, fetched with the Section Rendering API, single-brand collections only), blocks/_product-list-button.liquid, blocks/_product-list-text.liquid (translated titles), snippets/moments-carousel-controls.liquid (arrows without "View all"), sections/moments-hero.liquid (phone autoplay 6 s, swipe, centred icons), sections/moments-scent-guide.liquid (notes first and bold, explanation smaller), templates/product.json (description closed), 14 templates/collection*.json (New in and Top sellers rows), locales/en.default.json and ar.json (brand_rows).
Before: the 23 files on the copy the live theme came from (#161628979391) equal git HEAD; the drift check was run against #161294745791 by mistake, so the live theme's own earlier copies were not compared. After: theme check on the live theme: 0 errors, no missing translation keys; its own moment-pages files were not touched.
Issue and fix: the first push uploaded the collection templates before the new section schema, so Shopify dropped the rows' "source" and "sort" settings; the 14 templates were pushed again and now equal the repo.
Checks on live: smoke PASSED (desktop and mobile); brand rows on Afnan and Lattafa (12 cards each, arrows, sorted View all), none on For her, Arabic titles on /ar; product page description closed, notes first; phone hero autoplay, swipe (mirrored in Arabic), centred bar, no autoplay under reduced motion.
Rollback: push the files from commit 304f8dc (`git show 304f8dc:<file>`), or each file's "Older versions" in the code editor of #161651720383.

### 2026-11-06 filter panel, set guide, more moments (live, smoke passed after each)
- snippets/scent-guide-panel.liquid, snippets/moments-set-guide.liquid, sections/moments-scent-guide.liquid: sets show one "Understanding this scent" per perfume with a switcher.
- blocks/filters.liquid, snippets/list-filter.liquid, snippets/price-filter.liquid (owner: "push filters live"): one panel from an allow list (Moment, Scent family, Key notes, For, Season, Brand, Price, Concentration, Size, Availability), first three open, counts on every choice. The owner added Moment and Size in Search & Discovery and renamed Shop For to For.
- config/settings_schema.json (moments_handles default; live sets no value), snippets/product-card-meta.liquid (mark only for moments with a drawing), locales (moments.self_care): the cards and the Moment filter also use self-care-moment, gift-moment, all-day-moment (owner: "yes add them"). Most specific first, so existing card labels do not change.
- Store data: filter.moment values for the three added moments (428, verified, backup filter-metafields-2026-11-06-2258.json); Arabic labels for the filter headings For, Scent Family, Key Notes, Season, Concentration, Moment, Size.
Before each push the live copies equalled git HEAD. Checks: English and Arabic panels, seven moments in the filter, card labels, smoke PASSED.
Rollback: `git show aac8ac6^:<file>` for the filter files, `git show <this commit>^:<file>` for the moment files; filter data with `python scripts/apply-filter-data.py --rollback data/backups/filter-metafields-2026-11-06-2158.json`.

### 2026-11-08 brand slideshow, availability as one choice (live, smoke passed; owner: "push live")
Pushed: sections/moments-brand-slideshow.liquid, locales/en.default.json, locales/ar.json, snippets/list-filter.liquid, then the 14 collection templates (brand_slideshow replaces brand_new_in and brand_top_sellers). Before: live copies equalled the last pushed versions. After: templates equal the repo; Afnan, Rasasi, Lattafa (ar) show 8 slides (4 New in, 4 Top seller), For her none; filter panel 10 groups, Availability only "In stock".
Rollback: `git show 9addd5c:<file>` for the templates and locales, then push.

### 2026-11-08 brand page photo removed; header colours with a menu open (live, smoke passed; owner: "push live")
Pushed: assets/moments.css (accent link berry and search pill normal while a menu panel is open over the hero), the 14 brand collection templates (image block image_KAdJtB removed from the top section; several pointed at deleted photos and showed Shopify's placeholder). Live copies equalled HEAD before. Checks: accent nude over the hero, berry with Brands open; no image in Afnan's top section; smoke PASSED.
Rollback: `git show 05b7e99:<file>` and push.

### 2026-11-08 Arabic spacing on the product page (live, smoke passed; owner: "push live")
Pushed: sections/product-information.liquid (gap between photo and details as padding-inline-start/end), blocks/buy-buttons.liquid (quantity rules), snippets/product-grid.liquid (grid title). Live copies equalled the previous commit before. Check: the gap is 24 px in English and in Arabic. Rollback: `git show 6391825^:<file>` and push.

### 2026-11-08 scent guide: layers without notes left out (live, smoke passed; owner: "push live")
Pushed: snippets/scent-guide-panel.liquid. Live copy equalled the previous commit before. Check: Miss Arrogate (set and own page) shows top and heart only; Wild Colt and Arrogate Pink all three. Rollback: `git show e327d43^:snippets/scent-guide-panel.liquid` and push.
