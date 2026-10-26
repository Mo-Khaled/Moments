# Performance before (mobile, slow 4G, 4x CPU)

Lighthouse on https://momentseg.com, 2026-10-26. Scores vary a few points run to run.

| page | perf | LCP | TBT | CLS | FCP | transferred | requests | JS | images |
|---|---|---|---|---|---|---|---|---|---|
| / | 53 | 7.8 s | 360 ms | 0.001 | 5.0 s | 2735 KB | 208 | 686 KB | 766 KB |

Heaviest requests on /:
- 404 KB Document /?pb=0
- 241 KB Script https://gc.kis.v2.scr.kaspersky-labs.com/FD126C42-EBFA-4E12-B309-BB3FDD723AC1/main.js?attr=qny9gfscOXLqcp1YKdG
- 216 KB Stylesheet https://gc.kis.v2.scr.kaspersky-labs.com/E3E8934C-235A-4B0E-825A-35A08381A191/abn/main.css?attr=aHR0cHM6Ly9tb2
- 181 KB Image /cdn/shop/files/island-sun-grid_05.png?v=1791410772&width=768
- 176 KB Other /cdn/shopifycloud/checkout-web/assets/c1/164ad2e3.CwH6Mz8a.js
- 102 KB Other /cdn/shopifycloud/checkout-web/assets/c1/6a2fc6d6.CJI9EBzg.js
- 86 KB Other /cdn/shopifycloud/checkout-web/assets/c1/3d539943.DdbJRwN5.js
- 85 KB Script /cdn/wpm/bfcc46ef0w9d3a45bbp8938e2eamdcca70d4m.js

| /collections/all | 50 | 6.3 s | 360 ms | 0 | 5.4 s | 2953 KB | 214 | 696 KB | 700 KB |

Heaviest requests on /collections/all:
- 665 KB Document /collections/all?pb=0
- 241 KB Script https://gc.kis.v2.scr.kaspersky-labs.com/FD126C42-EBFA-4E12-B309-BB3FDD723AC1/main.js?attr=kSaTOGsFWjYf4BVN4ET
- 216 KB Stylesheet https://gc.kis.v2.scr.kaspersky-labs.com/E3E8934C-235A-4B0E-825A-35A08381A191/abn/main.css?attr=aHR0cHM6Ly9tb2
- 176 KB Other /cdn/shopifycloud/checkout-web/assets/c1/164ad2e3.CwH6Mz8a.js
- 102 KB Other /cdn/shopifycloud/checkout-web/assets/c1/6a2fc6d6.CJI9EBzg.js
- 96 KB Image /cdn/shop/files/f13.png?v=1791411447&width=832
- 86 KB Other /cdn/shopifycloud/checkout-web/assets/c1/3d539943.DdbJRwN5.js
- 85 KB Script /cdn/wpm/bfcc46ef0w9d3a45bbp8938e2eamdcca70d4m.js

Lighthouse opportunities on /collections/all:
- Reduce initial server response time: about 1597 ms

| /products/9-pm-night-out | 62 | 4.9 s | 420 ms | 0 | 4.2 s | 4139 KB | 217 | 1215 KB | 249 KB |

Heaviest requests on /products/9-pm-night-out:
- 738 KB Document https://www.paypal.com/smart/buttons?fundingSource=paypal&style.label=pay&style.layout=horizontal&style.color=
- 448 KB XHR https://gc.kis.v2.scr.kaspersky-labs.com/7D8B79A2-8974-4D7B-A76A-F4F29624C06BkLSn5ff294Y_IwpAVx9dSFpawTqbcHGaC
- 275 KB Document /products/9-pm-night-out?pb=0
- 241 KB Script https://gc.kis.v2.scr.kaspersky-labs.com/FD126C42-EBFA-4E12-B309-BB3FDD723AC1/main.js?attr=dVtm4WsS-3MNvHVkQH5
- 241 KB Script https://gc.kis.v2.scr.kaspersky-labs.com/FD126C42-EBFA-4E12-B309-BB3FDD723AC1/main.js?attr=gguvk5TiBzzCGlu4Lk8
- 216 KB Stylesheet https://gc.kis.v2.scr.kaspersky-labs.com/E3E8934C-235A-4B0E-825A-35A08381A191/abn/main.css?attr=aHR0cHM6Ly93d3
- 216 KB Stylesheet https://gc.kis.v2.scr.kaspersky-labs.com/E3E8934C-235A-4B0E-825A-35A08381A191/abn/main.css?attr=aHR0cHM6Ly9tb2
- 176 KB Other /cdn/shopifycloud/checkout-web/assets/c1/164ad2e3.CwH6Mz8a.js

| /pages/brands | 75 | 4.2 s | 220 ms | 0 | 3.3 s | 1903 KB | 188 | 681 KB | 133 KB |

Heaviest requests on /pages/brands:
- 241 KB Script https://gc.kis.v2.scr.kaspersky-labs.com/FD126C42-EBFA-4E12-B309-BB3FDD723AC1/main.js?attr=Bz0HuUjvjfgo863jNGj
- 216 KB Stylesheet https://gc.kis.v2.scr.kaspersky-labs.com/E3E8934C-235A-4B0E-825A-35A08381A191/abn/main.css?attr=aHR0cHM6Ly9tb2
- 216 KB Document /pages/brands?pb=0
- 176 KB Other /cdn/shopifycloud/checkout-web/assets/c1/164ad2e3.CwH6Mz8a.js
- 102 KB Other /cdn/shopifycloud/checkout-web/assets/c1/6a2fc6d6.CJI9EBzg.js
- 86 KB Other /cdn/shopifycloud/checkout-web/assets/c1/3d539943.DdbJRwN5.js
- 85 KB Script /cdn/wpm/bfcc46ef0w9d3a45bbp8938e2eamdcca70d4m.js
- 77 KB Document /web-pixels@fcc46ef0w9d3a45bbp8938e2eamdcca70d4/custom/web-pixel-shopify-custom-pixel@0530/sandbox/modern/page
