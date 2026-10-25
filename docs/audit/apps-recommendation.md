# Zooomy wishlist and back-in-stock: what is there, what it needs, recommendation

Nothing was changed. This is evidence plus a recommendation for your decision.

## What I could and could not verify

| Question | Answer | How I know |
|---|---|---|
| Is the wishlist app installed? | **Cannot confirm.** The Admin API token behind my connector only lists 2 Shopify-owned apps (Claude Connector, Messaging), so third-party installs are not visible to me. Check Admin > Apps. | `appInstallations` query |
| What is the wishlist app? | Zooomy's app, listed on the App Store as "Wishlist - Wishify". The theme loads `zooomyapps.com/wishlist/*.js`. | Theme code, web search |
| Is it rendered today? | **Partly.** The wishlist page (`/pages/wishlist`, template `page.zooomywishlist`) loads `ListWishlist.js`. The heart on product pages and collection cards is **not rendered** by any theme file (the two `ZooomyListWishlist*` snippets are orphaned). | Theme-check OrphanedSnippet, grep |
| Is back-in-stock configured? | **No sign of it.** `snippets/da-restock.liquid` is never rendered, and the store has **zero** `da-restock` metafields (the app's settings store). | Admin API read |
| Which app owns `da-restock`? | **Could not identify it.** No App Store listing matches that namespace. It may be an app that was uninstalled, a custom build, or a copied snippet from another store (this theme also had another store's defaults in the footer block). | Web search found nothing |

## Cost and requirements

| App | Cost (verify on the listing, figures vary by source) | Needs |
|---|---|---|
| Wishlist - Wishify (Zooomy) | Free plan (reported up to 100 wishlist items per month); paid plans reported at about $5.99 and $12.99 per month, one source shows an advanced plan at $29.99 | App installed and active; theme integration |
| Back-in-stock | Unknown (app not identified) | An installed back-in-stock app with its own settings |

Sources: [Wishlist - Wishify on the App Store](https://apps.shopify.com/wishlist-wishify), [Growave comparison](https://www.growave.io/blogs/comparisons/wishlist-wizard-vs-wishlist-wishify-an-in-depth-comparison), [Back In Stock | Restock Alerts (an example of the category)](https://apps.shopify.com/alertme).

## Why hardcoded snippets are the wrong shape

- The two blocking `<script>` tags (`ListWishlist.js`, `ListWishlistProduct.js`) delay rendering and bypass Shopify's app embed system, so the merchant cannot switch them off in the editor.
- The product-page heart and the back-in-stock form are dead code today, so they cost nothing at runtime but mislead anyone reading the theme.

## Recommendation

1. **Back-in-stock: remove the dead snippet (`da-restock`)** and, separately, install a current back-in-stock app that uses a **theme app block or app embed**. A "notify me" capture is a real conversion tool for a fragrance store with frequent sold-out lines, but it should be a deliberate choice, not a leftover snippet. I need you to tell me which app (if any).
2. **Wishlist: keep only if you use it.** If yes: remove the hardcoded script from `sections/zooomy-wishlist.liquid` and the two orphaned snippets, and add the app's own theme embed (enabled from Customize > App embeds) so it loads deferred and can be turned off. If no: unpublish the wishlist page, remove the section and snippets, and drop the "Zooomy" files.
3. In both cases the theme-check `ParserBlockingScript` and `RemoteAsset` errors disappear (3 of the 4 remaining errors).

Decision needed: keep or remove the wishlist, and which back-in-stock app (if any) you want.
