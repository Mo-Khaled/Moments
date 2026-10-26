# Live pushes

Every push to the live theme (#161294745791), newest last. Command: `shopify theme push -e live --only <files> --live --allow-live`.

| Time | Files | Commit | Checks | Smoke test |
|---|---|---|---|---|
| 2026-10-26 (before the rule) | sections/moments-announcement.liquid | 23d4ab5 | theme was believed to be a dev theme | not run; flat plum strip instead of the pill |
| 2026-10-26 | locales/en.default.json, locales/ar.json | (this batch) | theme check (error level), check-terms, check-links, check-traces, check-tiles all pass | scripts/smoke-live.mjs: home, collection, about, search, product, add to cart, cart, checkout reachable at 1440 and 375: PASSED. Labels now "Returns policy"; the footer menu item is store data and still says "Returns & Exchange Policy" (needs-from-owner). |
| 2026-10-26 | assets/moments.css | (colour tokens batch) | moment-palette.mjs AA check (pearl on field 5.3:1+), check-traces, check-tiles (120 states) | smoke PASSED. Six moment colours rebuilt from one OKLCH recipe; hero/tile/ticker follow the tokens. |
| 2026-10-26 | assets/cursor-*.png/svg, snippets/moment-pointer.liquid, sections/moments-cursor-test.liquid, templates/page.cursor-test.json, config/settings_schema.json | (pointer dark batch) | build-cursors, check-pointer (test page) | pointer only on ?view=cursor-test; smoke later |
| 2026-10-26 | layout/theme.liquid, snippets/moment-cursor.liquid | (pointer on) | check-pointer --site: body/link/button/cta/card custom, inputs native on 5 pages, follower 30px right and 24px below the tip, CLS 0.001 | smoke PASSED |
