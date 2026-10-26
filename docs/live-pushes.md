# Live pushes

Every push to the live theme (#161294745791), newest last. Command: `shopify theme push -e live --only <files> --live --allow-live`.

| Time | Files | Commit | Checks | Smoke test |
|---|---|---|---|---|
| 2026-10-26 (before the rule) | sections/moments-announcement.liquid | 23d4ab5 | theme was believed to be a dev theme | not run; flat plum strip instead of the pill |
| 2026-10-26 | locales/en.default.json, locales/ar.json | (this batch) | theme check (error level), check-terms, check-links, check-traces, check-tiles all pass | scripts/smoke-live.mjs: home, collection, about, search, product, add to cart, cart, checkout reachable at 1440 and 375: PASSED. Labels now "Returns policy"; the footer menu item is store data and still says "Returns & Exchange Policy" (needs-from-owner). |
