# Trust wording audit (shipping, returns, originality, authenticity)

Allowed claims: "100% original, sealed", cash on delivery, the free shipping amount from ONE theme setting (Theme settings, Moments, "Free shipping above"),
and a link to the returns and exchange policy page. Nothing else (no return window, no "risk-free", no distributor status, no awards, no ratings).

## The 2,000 vs 3,000 conflict (needs your decision)
| Number | Where it came from | Status |
| --- | --- | --- |
| **3,000 EGP** | The live theme's announcement bar block ("Free Shipping on Orders Over 3000 EGP", `sections/header-group.json` in the baseline). | Now the theme setting `moments_free_shipping` (default 3000). Used by the announcement bar, the About trust strip, the FAQ answer, the bundle page hint, the product page badge. |
| **2,000 EGP** | Two places in the baseline theme: the product page trust badges (`sections/product-trust-badges.liquid`) and the product template `product.default-with-scent-notes.json`. | **Removed from the dev theme** (the badge now reads the setting; the template line now says "100% original, sealed. Cash on delivery available."). The **live** theme still shows 2,000 on those product pages until you publish. |
| Unknown | The store's own **shipping policy** page (no content on the store today) and the actual shipping rates in Shopify Settings, Shipping and delivery. | **Check which number is real** and set it once in Theme settings. Shopify's shipping rates are the source of truth for what checkout charges. |

## Where each claim appears now (dev theme)
| Claim | Places | Wording |
| --- | --- | --- |
| Original and sealed | announcement bar, product badge, About (explore badge, stand-for card, steps), FAQ, hero copy | "100% original, sealed" and "arrives in its original sealed packaging". No distributor wording. |
| Cash on delivery | announcement bar, product badge and template line, About, FAQ, steps | "Cash on delivery" / "available". |
| Free shipping | announcement bar, product badge, About trust strip (v1), FAQ, bundle hint | "over {amount}" from the one setting. |
| Returns and exchange | footer link, product badge link, About steps fine print, FAQ answer link | Links to `/pages/returns-exchange-policy` and states no terms, no window. |

## Removed or rewritten
- "Sourced directly from official distributors" (product badge), "official agency and distribution" (About), "from a source you can trust" (About), "Hassle-free returns for damaged or wrong items" (product badge: an invented policy), "On all orders over 2,000 EGP across Egypt" (product badge).

## Still open (store content, not theme)
- The live About template (`page.about-us`) says "Fair Prices ... without inflated retail markups" and "Fast Delivery ... across Egypt": unverified.
- The text of the returns and exchange policy page and the empty shipping policy are store content that was not reviewed or changed.
- Product descriptions in the store may carry claims of their own (for example "the official AFNAN Perfumes ..." appears in the structured data of a gift bag product). Not changed.
