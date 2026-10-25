# Sourcing and authorization claims (flagged, for your decision)

You have not verified "authorized distributors". The approved wording everywhere is "100% original, sealed". These are all the places that claim more than that. Nothing below was changed, except where noted.

| # | Where | Exact text | Live today? | Proposed replacement |
|---|---|---|---|---|
| 1 | Homepage pillar, `templates/index.json:2447` (editor-managed) | "Sourced from authorized distributors, in sealed original packaging." | Yes | "Sealed in original packaging." (planned with the pillar strip in the homepage step) |
| 2 | About page, `templates/page.about-us.json:343` (editor-managed) | "Every product is original, sourced through official agency and distribution." (under "100% Authentic") | Yes | Decide: "Every product is original and sealed." |
| 3 | Product page trust badges, `sections/product-trust-badges.liquid:28` | "Sourced directly from official distributors" (hard-coded English, on every product page, not translatable) | Yes | "100% original, sealed", moved into the locale files (planned with the product page step) |
| 4 | Product descriptions of the 4 gift bags (store data): `ibraq-premium-gift-bag-large`, `afnan-gift-bag`, `assaf-gift-bag`, `afnan-orange-gift-bag` | "Complete your gift with the **official** IBRAQ Premium Gift Bag", "the **official** AFNAN Perfumes Luxury Gift Bag", "the **official** ASSAF Luxury Gift Bag" | Yes | Remove "official" (store write, with the other product text) |
| 5 | 16 Arabic product meta descriptions (store data) | "أصلي 100% من الحرمين" | Yes (in search results) | See `seo-descriptions-preview-16.csv` |

Fine as it stands (no sourcing claim): the announcement bar "100% Original - Sealed & Authentic", the homepage "100% Original" heading. Also checked: 767 product descriptions contain no other "authorized", "official" or "distributor" wording (one match was the word "genuinely").

Wording rule used elsewhere in this work: "100% original, sealed" only, until you confirm the distributor claim.
