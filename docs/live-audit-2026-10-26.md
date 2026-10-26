# Live audit, 2026-10-26 (read-only)

What a customer sees on https://momentseg.com now. Method: fetched home, /collections/all, /collections/gift-moment, a product (/products/9-pm-night-out), /pages/about-us, /pages/contact, /pages/make-a-bundle, the returns and delivery pages, /cart, search and /checkout with plain HTTP, stripped scripts and styles, and searched the visible text. No store data was read or written beyond public pages. Live theme = #161294745791; a pull of it equals the local tree except the auto-generated editor header comment Shopify adds on pull (no editor drift).

| Check | Result |
|---|---|
| TODO text, TODO_PHONE, TODO_SUPPORT_EMAIL | None visible on any page checked. |
| Free-shipping threshold | LE 3,000 everywhere (announcement bar, product page, About). No 2,000 left. |
| Other shop's name (Haramain) | Not visible. |
| "Authorized distributor" claim | Not present. Wording is "100% original, sealed". |
| Returns vs exchange | **Open.** The page and footer link are titled "Returns & Exchange Policy" but the page says "No Exchanges / Exchange service is not available". The title promises what the body denies. Fix is a page title and menu label change (store data): needs owner approval. |
| Contact page | Loads. Contains an optional Phone field in the form; no placeholder phone or email shown. |
| Reachability | Home, collections, gift collection, product, bundle page (/pages/make-a-bundle), delivery, privacy, cart, search: 200. /checkout redirects to a checkout session (reachable, no order placed). /account returns 406 to a plain bot request (not a customer-facing failure; needs a browser check). |
| /policies/refund-policy, /policies/shipping-policy | 404. Shopify legal policies are not filled in; the store uses pages instead. Needs owner decision (store data). |
| /pages/faq | 404: the FAQ page is not created yet (store page, owner approval). |
| Hero video label | Not checked: no browser in this session; check on first browser run. |
| Gifts reachable from nav | Yes: "Gifts" and "Shop Gift" link to /collections/gift-moment. |

## Needs owner (store data)
1. Rename the "Returns & Exchange Policy" page and its menu label to "Returns Policy" (or provide an exchange policy).
2. Fill or redirect /policies/*, create /pages/faq if wanted.

## Fixed in theme
Nothing needed from this audit. Theme-side items (announcement bar, Gift block) are tracked in docs/live-pushes.md.
