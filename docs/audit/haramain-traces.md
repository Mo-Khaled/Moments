# Haramain traces: audit report (NOTHING CHANGED)

Step A, parts 1 to 3. Read-only: no theme edits, no store writes. Store reads used the connector after `get-shop-info` returned MOMENTS. Screenshots are in `docs/audit/haramain-evidence/`.

## What I searched

Terms (case-insensitive, English and Arabic): `haramain`, `haramaineg`, `haramaincs`, `الحرمين`, `حرمين`, the phone `+20 121 181 8144` in every format (with spaces, dashes, dots, `0121…`, `20121…`), `haramaincs@gmail.com`, `info@haramaineg.com`, plus the extras I added after finding the first hits: `201103305575` / `01103305575`, `El Ataba` / `العتبة`, `Garage 7`, `El Bosta`, `Est. 2002` / `Since 2002`, commercial-registration and tax-ID wording, and social links (`instagram.com/`, `facebook.com/`, `tiktok.com/`, `wa.me`, and similar).

| Where | How | Coverage |
|---|---|---|
| Theme: `layout/ sections/ snippets/ blocks/ templates/*.json config/ locales/*.json (all 50 languages) assets/` | text search plus asset file names | complete |
| Store, public: 767 active products (title, handle, tags, vendor, description, rendered page text, SEO title and meta description, Open Graph, JSON-LD), 77 collections (title, description, page text, SEO), 19 pages (text and SEO), privacy policy, homepage | fetched and searched | complete for what is public |
| Store, admin (read-only): shop email and address, privacy policy body, URL redirects, blogs, metafield definitions, vendors, navigation menus, drafts by search (51 drafts) | Admin API | see "gaps" below |
| Images | visual review: about 65 product images (Afnan, Lattafa, home and ambiance, gift bags), the homepage tiles, the moment tiles, 2 product pages at full size | partial, by eye |

Not found anywhere I could search: the phone `+20 121 181 8144`, `haramaincs@gmail.com`, `info@haramaineg.com` (the footer default is already removed), a commercial registration number, other-store social handles. Neither the shop email (`moments.tunnel@gmail.com`) nor the billing address (New Cairo) is Haramain's.

## 1. Theme files

| # | File and line | What it is | Live? | Action |
|---|---|---|---|---|
| T1 | `sections/header-group.json:145,147` | A language-switcher block with `arabic_url: https://haramaineg.com/ar` and `english_url: https://haramaineg.com/`. Its settings are inside the editor-managed header group. | **No: the block is `"disabled": true`.** If anyone enables it, visitors are sent to the other store's website. | Fix in theme now (remove the block and its settings) |
| T2 | `sections/location-banner.liquid:1` | Code comment "Haramain Location Banner" | No (comment) | Fix in theme now |
| T3 | `sections/location-banner.liquid:217,227,233,239,245,261,277` | Schema **defaults** for another store: "We welcome you to Haramain Perfumes", "Haramain Perfumes — El Ataba", address "In front of Garage 7, El Bosta St., El Ataba, El Mosky, Cairo 11541", WhatsApp `201103305575`, a Google Maps link for Haramain El Ataba, "Est. 2002 · El Ataba · Cairo, Egypt". | The live Locations page (`/pages/locations`) overrides these with blank values, so **nothing shows today**; but any new Location Banner added in the editor starts with all of this. | Fix in theme now (defaults become empty or TODO; the contact values come from settings) |
| T4 | `sections/location-banner.liquid` (CSS prefix `hm-loc-*`) | Class names probably derived from the source store | No (invisible) | Optional rename, low priority |
| T5 | `assets/rtl.css:2` | Header comment "RTL Stylesheet — haramaineg.com" | No (comment) | Fix in theme now |
| T6 | `templates/page.json:30`, `page.moments-core.json:30`, `page.our-picks.json:30`, `page.perfuems.json:30`, `page.offers.json:31`, `page.daily-picks.json:30`, `page.for-women.json:30`, `page.home-fragrances.json:31`, `page.oud.json:30`, `page.valentine-s-day-offers.json:30` | Text: "Al Haramain selects brands that reflect real quality and true value where exceptional craftsmanship matters far more than price." A pull-quote at the top of 10 page templates. | **Yes, visible today** on 5 live pages: `/pages/home-page`, `/pages/brands`, `/pages/our-picks`, `/pages/perfumes`, `/pages/moments` (verified in the browser). The other 5 templates carry it but no live page renders it. | Fix in theme now (replace with neutral, true wording; I will propose copy) |
| T7 | `sections/footer-group.json`, `blocks/ai_gen_block_23ace36.liquid` | Already fixed in Phase 2 (defaults replaced with `TODO_PHONE`, `TODO_SUPPORT_EMAIL`) | n/a | Done |

Editor-managed files that would be touched: `sections/header-group.json`, and the 10 `templates/page*.json`.

Also found: the `ai_gen_block_*` blocks were generated from prompts written for the other store (the file headers say "my store logo", "my existing 4 footer columns"); that wording is a trace of origin only, not visible.

## 2. Store data

| # | Where | Count and examples | Action |
|---|---|---|---|
| S1 | **Image alt text** (product media) | **538 images on 519 products** end with "الحرمين مصر" (for example `Afnan 9 PM … الحرمين مصر`). Also appears in the homepage HTML. | Needs store write approval (the alt-text rewrite already agreed as Step C) |
| S2 | **Product SEO meta description** | **16 products** have an Arabic meta description ending "أصلي 100% من الحرمين، توصيل لكل مصر." ("100% original from Al Haramain, delivery across Egypt"): `spanish-tobacco`, `black-diamond-incense`, `tobacco-box`, `cullinan-diamond-iris`, `wild-colt-assaf`, `arrogate-colt-assaf`, `arrogate-girl-assaf`, `miss-arrogate-assaf`, `white-regent-diamond`, `musk-al-shams`, `musk-al-qamar`, `musk-al-lail`, `musk-al-fajr`, `lador-incense-classic`, `sapphire-leather`, `qasida-bakhour`. This text shows in Google results and social previews. | Needs store write approval |
| S3 | **Vendor name** | Vendor "Haramain Perfumes" on **5 products**: `ibraq-premium-gift-bag-large`, `afnan-gift-bag`, `assaf-gift-bag`, `afnan-orange-gift-bag`, `dolby`. It is shown as the brand on each product page and in the product's structured data (JSON-LD `brand`) that search engines read. | Needs store write approval, and your decision on the right vendor for each (the gift bags are IBRAQ, AFNAN and ASSAF branded; "Dolby" needs your input) |
| S4 | **Collection** | `haramain-perfumes` ("Haramain Perfumes", 5 products, a smart collection on vendor = Haramain Perfumes). Public at `/collections/haramain-perfumes`. Not in any menu. | Needs store write approval (delete or rename, plus a redirect) |
| S5 | **Product "Dolby"** (`/products/dolby`) | Active, no description, no images, vendor Haramain Perfumes, type Eaux de Parfum. Looks like a leftover test product. | Needs your input |
| S6 | Product titles, handles, tags, descriptions, rendered metafield text | **0 hits** across 767 active products. The metafield definitions (`custom.description`, `custom.inspired_by`, scent notes) show no Haramain text where rendered. | None |
| S7 | Draft products | 51 drafts. A search for the terms across drafts returns 0. Arabic search is less reliable, so this is not proof. | Needs a deeper admin read if you want certainty |
| S8 | Pages, navigation labels, policies, redirects, blog | Only the T6 text above. Privacy policy clean. No redirects. Blog empty. Menus clean. | None beyond T6 |
| S9 | Shop email, address | `moments.tunnel@gmail.com`, New Cairo address: MOMENTS' own | None |
| S10 | Brand claims worth a decision (not Haramain traces, but inherited copy) | The About page says every product is "sourced through official agency and distribution". The pillar says "authorized distributors". Product descriptions for gift bags say "the official … gift bag". | Needs your input (is the authorized-distributor claim true?) |

## 3. Images

| # | Image | Finding | Evidence |
|---|---|---|---|
| I1 | `ibraq1bag.png` (product `ibraq-premium-gift-bag-large`, image 1) | A large faint watermark baked into the picture reads "HARAMAIN" and, under it, "…FINE FRAGRANCES · SINCE 2002" across the top of the bag. Visible on the product page and the gift-bags collection. | `watermark-ibraq-gift-bag.png`, `collection-gift-bags.png` |
| I2 | `afnan-1.png` (product `afnan-gift-bag`, image 1) | Same baked watermark, "HARAMAIN … FRAGRANCES · SINCE 2002", across the lower front of the bag. | `watermark-afnan-gift-bag.png` |
| I3 | `afnan2.png`, both orange Afnan images, `assaf-24.png`, `ibraq-2-bag.png` | **Update after the full-size review:** the same watermark is present on all of these. **7 of the 8 bag images carry it**; only `assaf-23.png` is clean. See `image-ocr-report.md`. | **Needs new images** (7, not 2) |
| I4 | About 60 product images (Afnan, Lattafa, home and ambiance) and the 6 moment tiles | No logo, watermark, URL, or phone visible at card size. Watermarks as faint as I1 and I2 could hide at thumbnail size. | I cannot OCR; a full-size review of the whole catalogue would be needed to rule them out |
| I5 | Homepage hero | Shopify's demo illustration (already replaced in the dev theme) | n/a |

Unrelated but seen while checking: the brand collection pages (Afnan, Lattafa) show Shopify's teal-shirt placeholder instead of a banner (`collection-afnan-placeholder.png`). The templates point at store files such as `shopify://shop_images/wep-afnan.jpg`; a file search could not find `wep-*` files (the search is unreliable, so confirm in Content > Files). This is a bug, not a Haramain trace.

## 4. Only you can check in admin

| Item | Why it may hold a trace |
|---|---|
| Notification email templates (order confirmation, shipping, customer account) | Often carry the old store's name, phone, signature |
| Settings > Notifications > sender email | Must be a MOMENTS address |
| Checkout settings, order status page, checkout banner and logo | Branding and support contact |
| Settings > Policies (only the privacy policy exists; refund, terms, shipping policy are empty) | Add MOMENTS' own text |
| Apps and app settings (Zooomy wishlist, any other) | Account email, store name inside the app |
| Domains, redirects, Online Store Preferences (homepage title, meta description) | Old domain or title |
| Customer events and pixels (Meta, Google, TikTok) | A pixel ID from the other store would send MOMENTS data to their account |
| Google Search Console, Google Merchant Center, Facebook Business, Instagram | Verification files and feeds |
| Sales channels, payment providers (Paymob or similar), shipping carrier and profiles | Business name and phone on those accounts |
| Shopify Email templates and subscriber lists | Branding and the origin of the lists |
| Customer data and the Files library | Imported customer lists and image names |

## 5. Status of every item

| Item | Status |
|---|---|
| T1, T2, T3, T5, T6 (header-group block, location-banner defaults and comment, rtl.css comment, the "Al Haramain selects brands" text on 10 templates) | **Fix in theme now** (after your approval, dev theme only) |
| T4 (class prefix) | Optional, low priority |
| S1 alt text, S2 SEO descriptions, S3 vendor, S4 collection | **Needs store write approval** (part of Step C; exact writes and a backup first) |
| S5 "Dolby", S3 vendor choice for the 4 gift bags, S10 authorized-distributor claim | **Needs your input** |
| I1, I2 (two watermarked gift-bag images) | **Needs new image** (I will not edit images) |
| I3, I4 | Needs a full-size check; tell me if you want me to review every gift and bag image at full size |
| Section 4 | **Needs your input** (admin checks) |

## 6. What I will do after you approve this report (Step A, part 4)

1. Fix T1, T2, T3, T5, T6 in the dev theme. Contact details will come from settings; no Haramain value stays anywhere as a default. For T6 I will propose neutral, true copy and wait for your wording if you prefer your own.
2. Add `scripts/check-traces.sh` (outside the theme) that fails on every term above (theme folders only, excluding `docs/`), and run it before every push.
3. Leave all store data untouched until you approve each write.
