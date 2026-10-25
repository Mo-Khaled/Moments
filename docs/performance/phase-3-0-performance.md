# Phase 3.0 performance: what I found, what I changed, what is left

Method: Lighthouse 13.5, mobile preset, simulated slow 4G, run on this machine. Preview bar off (`&pb=0`) on the dev theme; the live site (`momentseg.com`) is the baseline. **Kaspersky blocked from the measurement** (see below). 3 runs per page, medians reported. Single runs vary by about 5 points here, so differences under that are noise.

## A measurement problem I had to remove first

The first baseline (Performance 27 to 28, LCP about 10 s) was wrong. Kaspersky Internet Security on this PC injects `gc.kis.v2.scr.kaspersky-labs.com/.../main.js` (246 KB, 3.7 s of main-thread time) and a 221 KB ad-block stylesheet into every page Chrome loads. Shoppers do not get that. Blocking those requests gives the real baseline below. Anyone re-measuring on a machine with this antivirus should do the same (`--blocked-url-patterns="*kaspersky-labs.com*"`).

## Results (homepage, median of 3)

| | Before (live) | After (dev theme) |
|---|---|---|
| Performance | 51 | 56 |
| LCP | 7.3 s | 6.4 s |
| FCP | 5.6 s | 5.4 s |
| TBT | 343 ms | 278 ms |
| CLS | 0.066 | 0.06 to 0.07 |
| Requests | 212 | 203 |
| Transfer | 2.4 MB | 2.3 MB |
| Render-blocking time (Lighthouse estimate) | about 2.0 s | about 0.3 s |

Collection and product pages (single runs after the changes, noise about 5 points): collection 52 (before 52), product 50 (before 53). **No measurable change on those two yet.** The fixes below mostly help the homepage.

## Targets

| Target | Status |
|---|---|
| LCP under 2.5 s | **Not met** (6.4 s) |
| Performance 70+ on mobile | **Not met** (56) |

## What I changed (all in the dev theme, one commit each)

1. **Fonts.** Removed the Google Fonts stylesheet (it blocked first paint by about 1 s) and its two preconnects. Marcellus now comes from Shopify's font system (`marcellus_n4`, same origin, preloaded by the theme). Readex Pro (31 KB Latin) and Alexandria (Arabic only) are self-hosted from `assets/` with `font-display: swap`; Arabic files download only on pages that contain Arabic. The three unused theme fonts (IBM Plex Sans, IBM Plex Sans Condensed, Platypi, about 100 KB) are no longer preloaded. Weights are limited to what the variable files contain (300 to 600).
2. **Images.** Images are eager only in the first two sections (28 were eager before). Mobile grids with 2 columns now request 50vw-wide images instead of 100vw. Lighthouse had flagged about 220 KB of oversized images.
3. **View transitions.** Turned off the card-to-product transition and page cross-fade: they loaded a render-blocking script (a 150 ms long task) and a render-blocking `rel=expect` link. Both can be switched back on in theme settings.
4. **Zooomy and other blocking scripts.** Already limited: the Zooomy script loads only on `/pages/wishlist`; the product-page Zooomy snippet and the back-in-stock snippet are never rendered. Removal is waiting on your decision (see `docs/audit/apps-recommendation.md`).

## Why the targets are out of reach from theme code alone

- **Server and network time dominate.** Time to first byte is about 1 s in these runs (about 3 s in one outlier), measured from Egypt to Shopify's edge. The dev preview is not edge-cached; the live theme is. Theme code cannot change this.
- **About 60 requests are Shopify-injected**: Shop login and cart-sync modules (`shop-js`), `perf-kit`, `trekkie`, the web-pixels manager, `monorail` pings. They are not render-blocking, but they take bandwidth and main-thread time (the pixels manager plus perf-kit alone are about 650 ms of script). Which pixels run depends on installed apps and the Customer events settings in admin.
- **The base theme's own CSS and JS** (about 52 KB of render-blocking CSS, 21 script modules) is the Horizon baseline.
- **The LCP element is the hero headline, a looping marquee.** It waits for CSS, the heading font, and the marquee script. The redesign replaces it with a static headline, which removes that dependency.

## What the redesign should buy (expected, to be measured)

- Static hero text and no marquee JS: LCP should drop to roughly FCP.
- One real hero image, preloaded with `fetchpriority="high"` (when the photography arrives).
- Fewer, lighter blocks above the fold.
- Honest range: I expect Performance in the 60s on mobile, not 70+, unless the Shopify-injected scripts are reduced (pixels, Shop login) and the server time improves.

## Things only you can change (admin)

- Review Customer events (pixels) and installed apps; each adds script time.
- Remove or defer the Shop login module if customer accounts are not used.
- Publish before the final measurement: the published theme is edge-cached, which a preview is not.
