# Scripts

Dev tools, not part of the theme (Shopify ignores this folder). Install once: `cd scripts && npm install`. Headless Chrome is used; Chromium, WebKit and Firefox for the matrix checks (`npx playwright-core install webkit firefox`).
All checks run against the live storefront (https://momentseg.com); add `--theme <id>` where supported to test an unpublished theme through `?preview_theme_id=`.

| Script | What it checks or does |
|---|---|
| `push.sh --only <file> ...` | Trace check, then pushes ONLY the named files to the live theme (refuses a whole-theme push) |
| `smoke-live.mjs` | After every push: home, collection, about, search, product, add to cart, cart, checkout reachable, console errors, banned text, at 1440 and 375 |
| `check-traces.sh` | No other-shop names anywhere in the theme files |
| `check-colour-flow.mjs`, `audit-seams.mjs` | No visible seam between bands; three surface tones; nothing light inside the footer |
| `check-contrast.mjs` | axe colour-contrast plus a computed check (4.5:1, 3:1 large) on the key pages |
| `check-card-layout.mjs`, `check-card-matrix.mjs` | Product cards on every placement; text area across browsers and conditions |
| `check-mobile-menu.mjs` | The phone menu sheet at 320 to 700px, LTR and RTL, Chromium and WebKit |
| `check-menu-hover.mjs` | The desktop mega menu never stays open after the pointer leaves |
| `check-pointer.mjs`, `build-cursors.mjs` | The custom pointer; builds the cursor PNGs from `assets/cursor-*.svg` |
| `check-gift.mjs`, `check-tiles.mjs`, `check-home.mjs`, `check-links.mjs`, `check-terms.mjs`, `check-carousel.mjs`, `check-bundle.mjs` | Gift card, moment tiles, home, links, banned terms, carousel, bundle builder |
| `check-perf.mjs`, `analyse-weight.mjs`, `analyse-html.mjs`, `probe-idle-cpu.mjs` | Lighthouse (mobile), real bytes by owner, what makes the HTML heavy, idle CPU while a page does nothing |
| `moment-palette.mjs` | The six moment colours from one OKLCH recipe, with contrast and distance checks (`--css` prints the tokens) |
| `shot-page.mjs`, `shot-section.mjs`, `shot-marks.mjs`, `shot-card-iphone.mjs` | Screenshots on demand |
| `normalize-images.py`, `prepare-brand-logos.py`, `prepare-video.mjs`, `gen-store-proposals.py`, `visual-diff.py`, `visual-snapshot.mjs` | Asset preparation and older audit tools |

Two machine-specific notes: antivirus software that scans HTTPS (for example Kaspersky) re-serves pages uncompressed and injects its own scripts, which inflates every size measured on that machine (the scripts block those requests); and Git Bash rewrites a leading `/` in arguments, so run path arguments with `MSYS_NO_PATHCONV=1`.

Traffic note: the checks together make hundreds of page loads. After days of this the store's edge (Cloudflare) started answering headless browsers with a 429 challenge. Run the full suite sparingly (one engine, `--quick`), reuse one browser session, and leave an hour between big runs.
