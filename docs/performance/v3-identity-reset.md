# Performance: identity reset (homepage, mobile)

Lighthouse 13, mobile emulation, Kaspersky script blocked (it injects a 246 KB script on this PC), preview bar hidden. Same machine, same hour.
The machine was noisier today than for the Phase 3 baseline (live scored 51 then, 45 to 46 now), so compare the rows measured together.

| Run | Performance | LCP | FCP | TBT | CLS |
| --- | --- | --- | --- | --- | --- |
| Live theme today (2 runs) | 45, 46 | 7.6 s, 7.0 s | 6.4 s, 5.8 s | 570, 600 ms | 0.067, 0.010 |
| Dev, first build of the identity reset (2 runs) | 42, 40 | 5.9 s, 5.7 s | 5.0 s | 920, 1250 ms | 0.002 |
| Dev, after one logo copy per marquee group and lazy logos (2 runs) | **46, 46** | **5.8 s, 5.4 s** | 4.7 s, 4.8 s | 750, 840 ms | **0.002** |
| Phase 3 baseline (earlier, for reference) | live 51, dev 56 | live 7.3 s, dev 6.4 s | 5.6 s, 5.4 s | 343, 278 ms | |

Product page (dev, one run): Performance 41, LCP 4.8 s, TBT 1,860 ms, CLS 0. Not compared with live.

## What this says
- **LCP is about 1.5 s better than live** (the headline is static, there is no marquee script, the first slide's poster is the preloaded LCP candidate).
- **Layout shift is near zero** (0.002): the nav no longer wraps and collapses at 750 to 1100 px, and the hero holds its height.
- **Performance score equals live (46 vs 45 to 46), not better.** Blocking time is about 200 ms above live. The largest long tasks are Shopify's own injected scripts
  (web pixels 300 to 410 ms, perf-kit 170 to 250 ms, trekkie, checkout preloads 200 ms), the same ones live loads; they cannot be changed from the theme.
- A first version rendered 84 logo images (14 logos x 6 copies in the marquee); that cost about 4 points. It now renders 28, lazy.
- Targets not met: Performance 70+ and LCP under 2.5 s on mobile, as before. The remaining levers are outside the theme (Shopify-injected pixels, the Shop login script, server response time)
  and the video work (poster-first, desktop-only, no mobile video).

## Video
No hero video exists yet (ffmpeg is not installed, see `docs/needs-from-owner.md`), so its cost is not measured. The design keeps it out of the critical path: the poster is the
LCP image, the video loads only on desktop, after the poster has painted, never with Save-Data or reduced motion, and pauses off screen and in a hidden tab.
