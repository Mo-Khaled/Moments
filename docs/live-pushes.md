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

### 2026-11-09 brand pages on phones: compact slideshow, grid margins (live, smoke passed on re-run; owner: "push live")
Pushed: sections/moments-brand-slideshow.liquid (phone: photo tile beside the copy, 252 px instead of 520 px; whole slide is the link; brand line removed; Arabic tag without caps), then 9 collection templates (full_width_on_mobile false: afnan, diamond-collection, khadlaj, lattaf-pride, lattafa, le-falcone, nabeel-perfumes, rasasi-per, zimaya). Live copies equalled the previous commit before. Check: on Afnan at 390x844 the products start at 520 px (was 788 px). First smoke run failed mobile add to cart once (product page untouched); the re-run passed. Rollback: `git show 67a3c5d^:<file>` and push.

### 2026-11-09 brand slideshow buttons aligned (live; owner: "Push live now")
Pushed: sections/moments-brand-slideshow.liquid (af15c8f: the name keeps two lines' room so the button sits in the same place on every slide; slide cache key v=2). Live copy equalled the previous commit before. Check: button at the same offset on all 8 Afnan slides, EN, AR and desktop. Rollback: `git show af15c8f^:sections/moments-brand-slideshow.liquid` and push.

### 2026-11-09 no bottle size in any product name (live, smoke passed; owner: "push live")
Pushed: snippets product-name (size_only), text (closest.product fallback to product: the product page heading kept the size), cart-products (size on its own line), sticky-add-to-cart, gift-pick-card, card-gallery, resource-card, blocks/_product-card-gallery; then sections product-information (breadcrumb) and moments-brand-slideshow (clean name, size beside the tag, cache key v=3). Shopify titles unchanged (owner chose hide on site). Live copies equalled the previous commit before. Check: 0 sizes in names on the Afnan slideshow and cards, search, product heading and sticky bar, EN and AR. Rollback: `git show c2023a0^:<file>` and push.

### 2026-11-09 scent guide: perfume-specific words large (live, smoke passed; owner: "push live")
Pushed: sections/moments-scent-guide.liquid (6cb0cc1: family, notes, season, time and layer notes 22 px / 20 px phone in the heading face; general explanation 13-14 px muted; card titles quieter). Live copy equalled the previous commit before. Check: 9 PM Night Out, AR and EN desktop, AR phone. Rollback: `git show 6cb0cc1^:sections/moments-scent-guide.liquid` and push.

### 2026-11-09 Arabic fixes + scent guide spacing (live, smoke passed; owner: "push live")
Pushed: locales en/ar (breadcrumb.home, breadcrumb.label), snippets/moments-arabic-digits.liquid (no thousands separator: ١٨٥٠ ج.م), sections moments-scent-guide (description directly under its word), moments-brand-slideshow (Arabic line height on every screen), product-information (breadcrumb Home translated, links to routes.root_url). Live copies equalled b076b0b before. Store data (not theme): Arabic title translations for 3 products (STARDUST, FRANKEL COLLECTION, LADY COLLECTION) and 24 moment collections, backups in data/translations/*-before.json, rollback `python scripts/apply-ar-titles.py [--collections] --rollback`. Check: Cream Velvet breadcrumb الرئيسية › … → /ar; 0 separators left; guide gap 2 px; Afnan slideshow all Arabic names, line height 1.4; gift-moment titled لحظات الهدايا. Theme rollback: `git show b076b0b:<file>` and push.

### 2026-11-09 Arabic filter labels + moment subtitles (live, smoke passed; owner: "Push live", "Yes, use these")
Pushed: locales/ar.json (filters availability in_stock متوفر, out_of_stock غير متوفر), snippets/list-filter.liquid (Arabic for-whom, concentration from scent.value, size unit مل, name in its own span so brand names are put in Arabic). Live copies equalled 01f939d^ before. Store data: Arabic body_html translations for the 24 moment collections (backup data/translations/ar-collection-descriptions-before.json, rollback `python scripts/apply-ar-collection-descriptions.py --rollback`). Check: /ar/collections/love-moment, 0 English filter labels, subtitle in Arabic. Theme rollback: `git show 01f939d^:<file>` and push.

### 2026-11-20 white page, plum footer with a fade (live, smoke passed; owner: "approve everything", "push to live")
Pushed: assets/moments.css, config/settings_data.json, sections/header-group.json, sections moments-brand-marquee, moments-hero, moments-shop-by-moment, moments-steps, moments-story, snippets color-schemes, product-card-badges, hero-image-slot (6d7cdad). Before: live copies equalled 042447d (which synced index.json, moments-shop-by-moment and moments-story from live: they had been edited outside the repo). Checks: body #FCFCFA on home, /ar, collection, product, about-us; footer plum with a white-to-plum fade; logos plum; EN desktop and AR phone on momentseg.com; smoke PASSED.
Rollback: `git show 6d7cdad^:<file>` for each file above and push.

### 2026-11-20 typography per the 2026 brand guide (live, smoke passed; owner: "push the fonts live now")
The published theme had changed to "MOMENTS - Hero fix" #162384347327 (published outside the repo). Synced it into the repo first (b2852dc: 18 changed and 2 new files; where both sides changed, the live text was kept and the headline full stops re-applied); shopify.theme.toml now targets it.
Pushed 27 files (assets moments.css, rtl.css; locales en/ar; 7 sections; snippets brand-fonts, moments-search-chips; 14 templates). Checks: EN and AR, desktop 1440 and phone 390 on momentseg.com (screenshots in "Claude outputs/2026-11-20-fonts-live"); smoke PASSED.
Rollback: push the same files from b2852dc^ merged with the live versions in the Hero fix theme (or `git show 6d7cdad:<file>` for files the sync did not touch).

### 2026-11-20 hero photo layout, Arabic signup, sharper Winter photo (live; owner: "push the hero and signup fixes live now")
Pushed: blocks/email-signup.liquid (button at the reading-direction end, text-align start), sections/moments-hero.liquid (split photo hero: photo on the end side, copy on its reading side, Arabic right-aligned on the right; plum field blends into the photo; setting "Product position in the photo" aims the crop), templates/index.json (Winter desktop photo Midnight_Serpent_Perfume_2880.jpg: Lanczos 2x + sharpen of the 1672 px original). A first version that moved Arabic copy to the left was live for a few minutes and rejected by the owner.
Store data: Arabic label "سجّل الآن" for the signup button on index, index.hero-box, about-us, about, skin-body (translationsRegister).
Checks: EN/AR desktop 1440 and phone 390 (Claude outputs/2026-11-20-hero-signup-live). Rollback: `git show 8335516^:<file>` and push.

### 2026-11-20 bundle offer made real (live; owner approved the settings)
Store data: smart collection "Bundle perfumes" (bundle-perfumes, product type Perfume / Extrait de Parfum / Perfume Oil, published to Online Store); automatic discounts "Bundle: 10% off 3+ bottles" (10% on that collection, minimum 3 items from it, combines with shipping discounts only) and "Free delivery over EGP 3,000 (Egypt)" (subtotal >= 3,000, Egypt only, combines with product discounts). Before this there was NO discount and NO free-shipping rule (flat EGP 118 in Egypt), although the site promised both.
Theme: sections/moments-bundle.liquid, snippets/product-card.liquid, locales en/ar, templates/page.bundle.json (pushed after live = HEAD).
Test checkouts (Egypt address, stopped before payment): 2 bottles 2,400 -> 2,518; 2,950 -> 3,068; 3,025 -> 3,025; 3 bottles 3,650 -> 3,285; 3 bottles + incense 4,200 -> 3,835 (incense full price); 3 bottles 3,198 -> 2,996.20 (2,878.20 after 10% is under 3,000, so delivery is charged).
Rollback: deactivate the two automatic discounts in admin; `git show <this commit>^:<file>` for the theme files and push.

### 2026-11-20 phone tab bar; bundle page delivery hint after discount (live; owner: "push the tab bar")
Pushed: snippets/moments-tabbar.liquid, layout/theme.liquid, locales en/ar (tab bar: Home, Moments, Bundle, Cart with live count opening the drawer, Account; phones only; sticky add-to-cart and bundle bar sit above it). Then sections/moments-bundle.liquid: the free-delivery hint uses the total after the 10% (owner: keep 3,000 counted after discount).
Checks: 390x844 live (count 1, drawer opens); cart bar at 3,198 bundle says "Add LE 121.80 more" (cart total 2,878.20) and checkout charges 118; at 3,650 "You have free shipping" and checkout free; bundle page hint "Add LE 121.80 more" for the same bundle.
Rollback: `git show 887ca00^:<file>` for the tab bar files, `git show <bundle hint commit>^:sections/moments-bundle.liquid`, and push.

### 2026-11-20 B + C: MOMENTS mark in the tab bar, page structure, card image tint (live, smoke passed; owner: approved "PUSH B + C")
Pushed: assets/moments-mark.svg (brand kit small icon), snippets/moments-tabbar.liquid, assets/moments.css (header divider #E6DDE3,
soft shadow once scrolled, homepage sections 48/80px, hairlines between white sections, product image area #F7F3F5). Merge a092d48.
Live copies equalled the base before. Checks: live 390 and 1440 (D:\MOMENTS_Content\06_Website\review\2026-11-20-BC-live), smoke PASSED.
Rollback: `git show a092d48^1:<file>` and push.

### 2026-11-20 full-width Winter hero (live, smoke passed; owner: "Hero: PUSH")
Pushed: sections/moments-hero.liquid (full-width photo, bottle centred, copy-side gradient only, srcset to 3840w), templates/index.json
(Winter poster hero-winter-desktop-3840.jpg, subject_side center). Merge 46aeec3. Live copies equalled the base before.
Photo: Higgsfield 21:9 (2688x1152) -> Real-ESRGAN x4plus -> Lanczos 3840x1646, JPG q92. Screenshots: D:\MOMENTS_Content\06_Website\review\2026-11-20-hero-live\.
Rollback: `git show 46aeec3^1:<file>` and push.

### 2026-11-20 header + wishlist + language tab + footer step (live; owner: "push" for both)
Pushed: assets/moments.css (purple header divider, footer step band), snippets/header-actions.liquid (wishlist heart, phone: no profile icon),
snippets/moments-tabbar.liquid (Cart tab -> language switch with round flag), sections/moments-wishlist.liquid + templates/page.zooomywishlist.json
("Your wishlist is coming soon", EN/AR). Fast-forward of main to 6f86b58 (staging-ui-2). Live copies equalled the base before.
Smoke: EN/AR home, product, Moments, wishlist, cart at 390 and 1440: no horizontal scroll; flag switches language on the same page (EN<->AR).
Known, pre-existing: in Arabic the header is not sticky (rtl.css overflow-x:hidden); fixed in the Notes push (overflow-x: clip).
Screenshots: D:\MOMENTS_Content\06_Website\review\push\live-header-*.png.
Rollback: `git revert 6f86b58` range 483115e..6f86b58, or `git show 483115e:<file>` and push.

### 2026-11-20 header fix: divider + flags (live, smoke passed)
Pushed assets/moments.css + snippets/moments-tabbar.liquid (main e78d2d8). The purple divider was painted under the opaque `.header__row--top`; now drawn inset on the row (phone + desktop, EN/AR).
Flags: proper Union Jack and Egypt (eagle) in the round language tab. Rollback: `git show 972391b:<file>` and push.

### 2026-11-20 Notes page files (live, smoke passed; owner: "push" for both)
Main 18db353 (merge of notes-page). Pushed: sections/moments-notes.liquid, templates/page.notes.json, assets/notes-data.json (UNCONFIRMED products excluded, counts/strengths/Most loved re-checked),
snippets/notes-image-map.liquid, assets/rtl.css (overflow-x: clip, Arabic sticky fixed), 74 assets/note-*.webp, templates/metaobject/note.json, sections/moments-note-page.liquid, snippets/moments-tabbar.liquid (larger eagle).
Live smoke: Notes template at /pages/about-us?view=notes (EN/AR, 390 + 1440): grid, sheet opens, header sticky in Arabic, no horizontal scroll; home/product/Moments/wishlist/cart OK.
/pages/notes itself does not exist until scripts/notes-publish.py --apply runs (waiting on the owner's CLI approval). Rollback: `git show 972391b:<file>` and push.

### 2026-11-20 Notes published (data, not theme)
scripts/notes-publish.py --apply: note definition got the EN/AR text fields, 37 images uploaded to Files (first attempt hit a transient CLI error after some uploads, so a few images exist twice in Files), 37 entries ACTIVE, page /pages/notes created (template notes).
Verified live: /pages/notes (37 tiles, EN/AR, 390 + 1440) and /pages/notes/<handle> (standalone note page). Undo: delete the page "Notes" and set the entries to DRAFT.
Also live (0f2f6c6): real flag files, language bottom sheet, bundle chips row, product gallery dots. On staging only (61e4c9f): Arabic row RTL + rounded close button, Easy Bundles id hidden in cart lines.

### 2026-11-21 pushes (owner: "push everything")
1. Notes card (6faa2a2) + Arabic cart title (184b3e6): live, smoke OK (Notes card EN/AR 390 + 1440).
2. Wishlist 6d5d9fb (+ earlier 1f16c68 one-heart header): card heart below the Save badge, Arabic popup swap by locale, RTL popup, /pages/wishlist opens the app list. Live smoke: one header heart, no floating heart, no app header icon, no overlap, no horizontal scroll (360/390/430 + 390 for home, product, Notes, wishlist; EN + AR). Not checked: 1440 collection pages (Shopify bot check page).
3. Cart ea540cb: free-shipping box restyle, one type system, claims row, hidden bundle id (JWXLJD), Arabic discount line from locales (moments_cart.bundle_discount), drawer uses the theme threshold (3,000; live since 1f16c68). Cart pages NOT viewed (bot check, not bypassed). Add to cart via /cart/add.js OK; no Liquid errors on home/product EN+AR.
Rollback: `git revert <commit>` or push the previous file versions (git show <commit>^:<file>).

### 2026-11-21 drawer + Notes bar (live)
- 480aab0: cart drawer shows ONE free-shipping box (removed the duplicate render at the top of cart-drawer.liquid; the summary one stays). Staging then live test: 1 item / 4 items / empty, EN+AR, 360/390/430/1440: one box, summary in view, no overlap, no JWXLJD. Not tested: bundle lines in the drawer (Easy Bundles needs its own page/gates), list scroll with 4+ items beyond the check that the summary stays in view.
- 904548a: Notes bar: 52px, count at start / Filters button at end, zero gap when stuck (measured header offset), one bottom border, chips row only when filters are active. Live: gap 0 stuck, 24px under description before scrolling, EN+AR at 360/390/430, 1440 desktop count bar.

### 2026-11-21 Notes menu link (live)
8427945: "Notes" between Brands and Make a bundle in the desktop menu, the phone menu sheet and the phone drawer list; label from locales (notes_nav.label: Notes / النوتات). Live check: desktop EN+AR order "Shop by Moment | Brands | Notes | Make a bundle", href /pages/notes (/ar/pages/notes), active on /pages/notes; phone menu EN+AR shows it, aria-current on the Notes page. The admin Navigation was not changed (the visible items come from theme code).

### 2026-11-21 cart rebuild: bundle box + details sheet (live)
Commit 5bbcfbe (+ sync 77c4e31). NOTE: the published theme changed during this work: live is now "MOMENTS - Gift banner + fonts (Claude)" #162418163903 (a copy of Hero fix #162384347327 with a font-variable edit and a hero headline edit, made outside this repo). Verified it contained all earlier work, merged its two edits into the repo, pointed shopify.theme.toml at it, and pushed the cart files there.
Pushed: snippets/moments-bundle-box.liquid (new), snippets/cart-products.liquid, locales/en.default.json + ar.json (moments_cart keys, bundle page text), sections/moments-bundle.liquid (LE 3,000, "Add bundle to cart", Edit bundle loads picks, replaces old lines), assets/moments.css.
Checked in the owner's real Chrome (staging, then live): bundle card EN/AR, details sheet (Esc, scroll lock, focus), remove bundle + Undo, drawer, desktop two columns, bundle/outside-bottle scenarios (1, 2, 3 outside; bundle 3/4/5; qty 2; bundle + 1 and + 3 outside; empty). Not checked: 360px (Chrome window minimum is about 500px), 430px, very long names visually, Edit bundle end to end (add back to cart).
Rollback: previous files = git show 77c4e31^:<file> (before 5bbcfbe) and push to #162418163903; or remove the render line for moments-bundle-box in snippets/cart-products.liquid and the hidden-row attributes.

### 2026-11-21 cart design pass (live)
f45a1de pushed to live #162418163903 (live files equalled the base first): bundle card desktop row layout, one price per item (struck price in the price column), summary lines (bundle, items, shipping Free / at checkout), claims aligned. Checked live in the owner Chrome at desktop EN + AR: one box, summary lines right, no Liquid errors, no horizontal scroll. Not checked on live: phone width (Chrome window would not go below ~500px). Rollback: git show f45a1de^:<file> for the 6 files and push.

### 2026-11-21 owner fixes batch (live)
1a5b7ff (cart arrow + airy price block) and d2d9f52 pushed to live #162418163903: Notes card title centred + Learn more toggle; hero buttons keep /ar (merged with the live hero edits from another session: Arabic poster, scrim option); scent guide bold card titles + note pictures; product description open by default (3 product templates); Arabic Add to wishlist text + outline style; Arabic cart drawer opens from the left; brands logo row centred; About dropdown card; cart link/stepper on the end side. Footer link "ABOUT MOMENTS" Arabic translation set to "عن لحظات" (Translate data, LINK 645255790783).
Not changed: the English bits inside the Arabic product description (product content; owner decision needed).

### 2026-11-21 fb6e8dd (live): bundle card photos side by side; one number font in the cart (page, drawer, sheet, summary). Rollback: git show fb6e8dd^:assets/moments.css and push.

### 2026-11-21 live: 7f396b4/76c928e + transform fix (dropdown divider; Brands row centred, 44px above and below), c533d9b (no Moment label on cart lines; note name variants use existing pictures). Missing note pictures: about 70 notes in the catalogue have no picture (see chat); new pictures need Higgsfield credits (owner to decide).

### 2026-11-21 bb01c26 (live): Notes card without full stop, soft close button (no focus ring on open); cart See your bottles + quantity controls on the end side, delete before the count. Live checked (AR): title "مسك", close button tint, close not focused on open, controls row-reverse on the end side, no Liquid errors. Rollback: git show bb01c26^:<file> for assets/moments.css and sections/moments-notes.liquid.

### 2026-11-21 86978d9 (live): Arabic bundle title "باقتك من ٣ زجاجات" (the middle dot looked like ٠, so it read as ٣٠). Rollback: git show 86978d9^:locales/ar.json and push.

### 2026-11-21 cb2953c (live): Arabic wishlist button/popup keep their Arabic text when the app redraws them (permanent page watcher). Rollback: git show cb2953c^:snippets/header-actions.liquid and push.

### 2026-11-22 live: 79 new note pictures (158 WebP) + snippets/scent-guide-panel.liquid (commits 3b7e2e0, c1c3bc2, a6f6e9f). Generated by Higgsfield GPT Image 2.6 Flare in Unlimited mode (no credits; balance 810/1000). Rollback: git show 3b7e2e0^:snippets/scent-guide-panel.liquid and push (the pictures can stay).

### 2026-11-22 Notes page with 115 notes (live)
ac957f9 pushed (notes-data.json, notes-image-map.liquid, moments-notes.liquid). 79 new note entries published as metaobjects (/pages/notes/<handle>), texts drafted from web research (review file notes/NOTES_79_TEXTS_REVIEW.md). Live check: 115 tiles, all with pictures, Cognac card with 4 perfumes. Note: the failed publish runs left some unused duplicate note pictures in Shopify Files. Rollback: git show ac957f9^:<file> for the 3 files and push.

### 2026-11-22 55287df (live): perfume page notes hint. A card under the buy buttons (3 note pictures + "See the scent story" / «تعرّف على هذا العطر») and a pulsing floating pill shown until the visitor reaches the notes. Files: sections/moments-scent-guide.liquid, locales/en.default.json, locales/ar.json. Live check 390/1440 EN/AR. Rollback: git show 55287df^:<file> for the 3 files and push.

### 2026-11-22 product data: long dash (—) removed from product descriptions (EN body + AR translation), 361 products, by scripts/remove-em-dash.py. Backup data/descriptions/em-dash-2026-11-22/live-before.json; rollback: python scripts/remove-em-dash.py --rollback.

### 2026-11-22 054d201 (live): notes hint without arrows; the call-to-action line above the note names. Rollback: git show 55287df:sections/moments-scent-guide.liquid and push.

### 2026-11-22 65f34ca (live): Google site verification meta tag in layout/theme.liquid (Search Console, for the Google sign-in branding check). Rollback: git show 65f34ca^:layout/theme.liquid and push (only after Google verification is no longer needed).

### 2026-11-22 a3d4a7a (live): notes pill sits above the phone sticky add-to-cart bar. Rollback: git show 054d201:sections/moments-scent-guide.liquid and push.

### 2026-11-22 00a1bac + d2081dd (live): wishlist header count follows add/remove live and reads Arabic digits; Arabic popup buttons; AR checkout "إجمالي التوفير". Files: snippets/header-actions.liquid, locales/ar.json. Rollback: git show 00a1bac^:snippets/header-actions.liquid and d2081dd^:locales/ar.json, push.

### 2026-11-22 d5114cd + b37022b (live): AR account popup opens from the icon (was off screen); AR cart drawer slides from the left; scent guide notes card full width on top, 3 cards below. Files: snippets/account-popover.liquid, assets/moments.css, sections/moments-scent-guide.liquid. Rollback: git show d5114cd^:<file> for the first two and a3d4a7a:sections/moments-scent-guide.liquid, push.

### 2026-11-22 store data (live): the 6 moment collections and their 15 For him/For her/Unisex versions sorted Best selling (were manual; winter already was). Backup of the manual order: data/backups/moment-collections-order-2026-11-22.json and moment-sub-collections-order-2026-11-22.json.

### 2026-11-22 ca35aae + b498f6c (live): cards name first then moment/brand, self-care sun mark; cart lines delete then count at the end side; AR centred text boxes; moment pages show pictured perfumes 2nd-4th (theme setting "Pictured perfumes per moment"). Files: assets/moments.css, snippets/product-card-meta.liquid, blocks/product-title.liquid, sections/main-collection.liquid, config/settings_schema.json. Rollback: git show ca35aae^:<file> and push.

### 2026-11-22 translations (live): Arabic titles of winter-moment and its 3 variants were "لحظات كل يوم" (old title); now "لحظات الشتا" (+ للرجال / للنساء / للجنسين). Other 20 moment titles checked, correct. Before: MOMENTS_Content/06_Website/moments/collection-ar-titles-before-2026-11-22.json

### 2026-11-22 76d455c (live): type rule (names Marcellus, prices Readex); cards brand above moment, moment icon aligned; AR «الشتاء» (theme texts + 4 Winter collection title translations). Files: assets/moments.css, snippets/product-card-meta.liquid, locales/ar.json, templates/index.json, templates/page.moments-core.json. Rollback: git show <commit>^:<file> and push.

### 2026-11-22 d03e36d (live): cart type scale (titles Marcellus, labels/buttons Readex 500, prices Readex 600), page + drawer. Rollback: git show d03e36d^:assets/moments.css and push.

### 2026-11-22 66dc8a7 (live): SEO pass. Home title/description EN+AR, plain-text product/collection descriptions, og/twitter = description, share image fallback (assets/moments-share.jpg + setting), preconnect, JSON-LD (Organization, WebSite+SearchAction, Product with offers/shippingDetails, BreadcrumbList, ItemList), alt fallbacks, one H1 per page incl. /collections/all. Live check: 1 Product JSON-LD per product page, 0 parse errors, hreflang 3. Rollback: git checkout 66dc8a7^ -- $(git diff --name-only 66dc8a7^ 66dc8a7 | grep -E "^(assets|blocks|config|layout|locales|sections|snippets|templates)/") and push those files. Report: MOMENTS_Content/06_Website/seo/SEO_REPORT.md

### 2026-11-22 b8da842 (live): SEO descriptions keep a space where a tag is removed (Muse "100 ML EDP Refined", AR "100 مل أناقة"). Live check: Muse/9PM EN+AR 155 chars, og=twitter=description, no escaped HTML, 1 Product JSON-LD each. Rollback: git checkout 66dc8a7 -- snippets/meta-tags.liquid snippets/seo-structured-data.liquid and push both.

### 2026-11-22 d71b434 + 632441d (live): SEO descriptions: line breaks become spaces, blog/page fallback collapses spaces and decodes entities (d71b434); English home description 152 chars, 155 cut also after the fallback (632441d). Live check on 10 pages (home, Muse, Night, Afnan, blog, About us; EN+AR): all pass. Rollback: git checkout b8da842 -- snippets/meta-tags.liquid snippets/seo-structured-data.liquid locales/en.default.json and push those three.

### 2026-11-22 4ac9a28 (live): cart type scale v2, page + drawer EN/AR (labels 500/16, secondary 500/14, fine print 400/12, prices 600: items 18, struck 14, total 24/28). Owner checks phone widths. Rollback: git checkout 4ac9a28^ -- assets/moments.css and push it.

### 2026-11-23 store data (live): Home & Bakhoor. home-and-ambiance renamed "Home & Bakhoor" / «البيت والبخور» with EN/AR description, 79 products (76 + Al Bahaar Gold, Sougah, Taiba now type Incense). All 79 left the moments (Self-Care 171->92, Gift 147->97) and have no moment field. Winter 289: 6 air fresheners still tagged season:Winter (tag removal waits for owner). Backups: MOMENTS_Content/06_Website/bakhoor/BACKUP_BEFORE_APPLY.csv/.json, BACKUP_3_ITEMS.json. Rollback: python scripts/home-bakhoor-apply.py rollback (the 3 items: re-add to gift/self-care-moment-unisex and restore filter.moment from BACKUP_3_ITEMS.json).

### 2026-11-23 five commits pushed one by one with scripts/push-commit.sh (each live file checked against the commit's parent first)
- 65c77a2 (live): product title pattern EN/AR + gtin13. Live: 9 PM EN "AFNAN 9 PM Night Out 100 ml – MOMENTS" (37), AR 57, og = title, 1 Product block. Rollback: git checkout 65c77a2^ -- snippets/meta-tags.liquid snippets/seo-structured-data.liquid, push both.
- 698695b (live): shippingDetails handling 0-1, transit 1-2 days, EGP 118, free from 3000, EG. Rollback: git checkout 698695b^ -- config/settings_schema.json snippets/seo-structured-data.liquid, push both.
- c5c75f6 (live): hidden H1 on default-template collections (Home & Bakhoor). Rollback: git checkout c5c75f6^ -- sections/main-collection.liquid, push.
- b90da22 (live): phone menu free-shipping line removed (pushed as this change only on top of the live file). Rollback: push git show 7ab396e^:snippets/moments-mobile-menu.liquid.
- 7ab396e (live): Home & Bakhoor 7th tile (dropdown + phone list + drawer list), censer mark, olive tone, Type filter labels; snippets/moments-mobile-menu.liquid pushed as b90da22 (tile + no shipping line). Rollback: git checkout 7ab396e^ -- snippets/moment-marks-sprite.liquid snippets/moment-mark.liquid assets/moments.css locales/en.default.json locales/ar.json snippets/moments-mega.liquid snippets/moments-drawer-list.liquid snippets/list-filter.liquid snippets/filter-remove-buttons.liquid and push them, then push the file from the b90da22 rollback line.

### 2026-11-23 store data (live): season:Winter tag removed from 6 air fresheners (al-bashiq-dry-air-freshener, al-majalis-320ml, dahn-al-oud-amiri-air-freshener, la-yuqawam-320ml, lamya-dry-air-freshener, saada-air-freshener). Winter 289 -> 283. No Home & Bakhoor product is in any moment collection. Backup: MOMENTS_Content/06_Website/bakhoor/BACKUP_WINTER_TAGS.csv/.json. Rollback: tagsAdd season:Winter on those 6 (ids in the backup).

### 2026-11-23 8a711e3 + 2cac4bb (live): Type filter = metafield filter.kind ("Product Type"), first and open on Home & Bakhoor only, labels Bakhoor / Air fresheners, بخور / معطرات جو; absent on moments, brands, all products, search. Live check EN/AR passed. Rollback: git checkout 8a711e3^ -- blocks/filters.liquid and git checkout 7ab396e -- snippets/list-filter.liquid snippets/filter-remove-buttons.liquid, push the three.

### 2026-11-23 store data (live): product type set on 4 products that had none: Odyssey Homme Body Mist = Perfume Mist; Fire on Ice 100ml, Dolby, Frankel Chill 200ml = Perfume. Brands unchanged. Backup: MOMENTS_Content/06_Website/seo/BACKUP_PRODUCT_TYPES_4.json (all four were empty). Rollback: productUpdate productType "" for those 4.

### 2026-11-23 754eeb5 (live): dropdown heading "More ways to shop" / «المزيد من طرق التسوّق». Rollback: git checkout 754eeb5^ -- locales/en.default.json locales/ar.json, push both.
### 2026-11-23 8af91d4 (live): phone cards brand | moment on one row with the rule; a wrapped line starts flush. Rollback: git checkout 8af91d4^ -- snippets/product-card-meta.liquid, push.

### 2026-11-23 fc05ca7 (live): notes card "Learn more" chevron points down/up in Arabic too. Rollback: git checkout fc05ca7^ -- assets/moments.css, push.

### 2026-11-23 6556e84 (live): header wishlist number built and placed like the cart number (top-right of its icon in EN and AR). Rollback: git checkout 6556e84^ -- snippets/header-actions.liquid, push.

### 2026-11-24 live theme is now #162553200831 "MOMENTS - Menu heading spacing (Claude)" (published from another session)
Includes c5ac09c (product page notes open the note card + "Go to the notes page"), 9ed26cc, c4191c6, 6e07af6/c9e962b, 7eb5987, 5293fc4, 9367459, 02276fa, plus edits made on the live theme and brought into the repo as 6d1019d (brand strip, story link, promo code field always shown, phone menu, price spacing, phone footer). Live = repo after 6d1019d (checked file by file). Rollback: publish the previous live theme #162552185023 ("Breadcrumb, menu and notes") or #162418163903 ("Gift banner + fonts") in Online Store > Themes.

### 2026-11-24 staging #162401091775 refreshed from live (copy of #162553200831, sections/zz-syntax-test.liquid deleted). Live untouched.

### 2026-11-24 19b9401 (live): always light. color-scheme "only light" (meta, inline on <html>, CSS), supported-color-schemes, theme-color #FCFCFA, so phones in dark mode no longer darken the site (Chrome; Samsung Internet's own dark mode may still apply). Live check: page served by #162553200831 has all four signals, computed color-scheme "light only". Also shopify.theme.toml live environment now #162553200831. Rollback: git checkout 19b9401^ -- layout/theme.liquid snippets/meta-tags.liquid assets/moments.css and push the three.

### 2026-11-26 cf06b5d (live #162553200831): language prefix kept. Bundle builder "Add bundle to cart" went to /cart from Arabic; its search and product fetches too ({% javascript %} runs no Liquid, so window.Shopify.routes.root). Also cart fetches in the bundle box, menu count, sticky bar, gift bag and product form; returns link under products and on About/FAQ; /moments on About; gift finder /arpages slash. Verified live AR+EN at 390: AR lands /ar/cart in Arabic, edit bundle keeps /ar. Rollback: git revert cf06b5d && bash scripts/push-commit.sh HEAD. Do NOT publish the saved editor version 82b7df6b: it writes Liquid inside {% javascript %}.

### 2026-11-26 faa85bf (live): footer invisible in every browser since 19b9401. <html> had a background colour (inline, and in the dark-mode block), so body painted above .section-background (z-index -2) and the plum footer vanished under white. Removed both backgrounds; color-scheme only light, meta tags and theme-color unchanged. Verified live with WebKit iPhone, EN+AR, light and dark, home and product. Rollback: git revert faa85bf && bash scripts/push-commit.sh HEAD. Staging #162401091775 has the same files (the earlier defensive block there is gone).

### 2026-11-26 0a99414 + 6964a59 (live #162553200831): a bundle below 3 bottles becomes individual items. Cart page and drawer: Bundle property cleared (empty value), no box, no bundle wording, one time notice with a link back to the builder; no reload. Tested on staging by the owner; live files read back equal to 6964a59. Shopify's automatic discount is unchanged and still counts bottles across the whole cart. Rollback of 6964a59 only: git revert --no-edit 6964a59 && bash scripts/push-commit.sh HEAD. Rollback of the whole fix (this order): the line above, then git revert --no-edit 0a99414 && bash scripts/push-commit.sh HEAD.

### 2026-11-26 f1f4cb9 (live #162553200831): every new bundle gets its own id (two built one after the other showed as one box). Live file read back equal to the commit. Rollback: git revert --no-edit f1f4cb9 && bash scripts/push-commit.sh HEAD

### 2026-11-26 092cdea (live #162553200831): editing a bundle survives a reload of the builder (it left the old bundle and added a second). Live file read back equal to the commit. Rollback: git revert --no-edit 092cdea && bash scripts/push-commit.sh HEAD

### 2026-11-26 store decisions 1 to 4 (live #162553200831, owner approved). All files read back equal to the commits; checked at phone width AR+EN (product, footer, brands, notes data).
- c838f49 delivery "2 to 5 business days depending on your governorate": product accordions now use the new block moments-shipping-returns (text in locales, both languages), journey template "2 to 5", FAQ topic "time" (no FAQ page exists on the store yet: /pages/faq is 404), Google transit 2 to 4 after 0-1 day handling. Rollback: git revert --no-edit c838f49 && bash scripts/push-commit.sh HEAD (then the new block stays unused on the theme).
- acbddcf footer: phone only with digits, email only with @. Rollback: git revert --no-edit acbddcf && bash scripts/push-commit.sh HEAD
- 725278d + b54e4f3 "Brands" / «العلامات التجارية»: heading, phone menu, desktop menu. Rollback: git revert --no-edit b54e4f3 && bash scripts/push-commit.sh HEAD && git revert --no-edit 725278d && bash scripts/push-commit.sh HEAD
- feda628 Amber «عنبر», Tonka bean «فول التونكا»; ambergris «عنبر رمادي», amberwood «خشب العنبر» so no two notes share a name. Rollback: git revert --no-edit feda628 && bash scripts/push-commit.sh HEAD
- Note: feda628 and 725278d both touch locales/ar.json, as does c838f49: roll back in reverse order if more than one.
- scripts/notes-build-data.py would rebuild notes-data.json from the old source names: check names after any rebuild.

### 2026-11-26 f42d2a3 (live #162553200831): one free shipping threshold, 3,000. Journey product template now uses block moments-delivery-journey (both languages from the translations, amount from the theme setting); unused snippet free-shipping-progress default too. Live files read back equal; checked at 390 EN+AR (journey view shows LE 3,000 / ٣٠٠٠, no 2,500). Rollback: git revert --no-edit f42d2a3 && bash scripts/push-commit.sh HEAD

### 2026-11-27 2b41051 (live #162553200831): note page "Perfumes with <note>" section (key, perfume row, See all), shared with the note card. 820e8c1 and 4ad809a were already live (both note files read back equal to 4ad809a before the push), so they were skipped. Live files read back equal to 2b41051. Checked EN+AR at 390 and 1280: card Vanilla and Bergamot (View all beside the heading, See all button, X 36 px round with 1 px ring), /pages/notes/vanilla section (3 key rows, 4 perfumes phone, 6 desktop, See all), Arabic See all Vanilla lists about 270 perfumes (12 pages), Bergamot opens a search with results, intoxicate-mystique description shows no raw tags. Rollback, newest first:
- git revert --no-edit 2b41051 && bash scripts/push-commit.sh HEAD
- git revert --no-edit 4ad809a && bash scripts/push-commit.sh HEAD
- git revert --no-edit 820e8c1 && bash scripts/push-commit.sh HEAD

### 2026-11-27 f4c22a8, 5fe6b1a, 1a92306 (live #162553200831, owner asked). Live files read back equal.
- f4c22a8 product description text block max width None (was Normal, 455 px) in product.json, product.default-with-f-journey.json, product.default-with-scent-notes.json: the first line of Intoxicate Mystique now fits on one line at 1920 (EN and AR). Rollback: git revert --no-edit f4c22a8 && bash scripts/push-commit.sh HEAD
- 5fe6b1a note page less empty space: the three facts as a compact list (label beside text on desktop, under it on phones), image centred with the text, perfumes section closer with the key in one row; previewed on staging #162401091775 first. Rollback: git revert --no-edit 5fe6b1a && bash scripts/push-commit.sh HEAD (after reverting 1a92306)
- 1a92306 note page perfume row bleeds by 16 px (was 20 px, which made phones scroll sideways by 4 px since 2b41051). Rollback: git revert --no-edit 1a92306 && bash scripts/push-commit.sh HEAD
- Checked live: guaiac-wood EN and AR at 1920 and 390 (no sideways scroll, 3 facts), intoxicate-mystique EN and AR at 1920 (first line one line).
