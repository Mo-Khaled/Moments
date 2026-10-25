# Store write proposals (NOTHING APPLIED)

Every item here is a change to the live store. None has been run. Each lists the exact GraphQL write, what it affects, and how to undo it. Back up first (a CSV export of the products, collections and menus involved) before anything is applied. Store confirmed as MOMENTS (`get-shop-info`) before these reads.

## 1. "Dolby" to draft (your decision 3)

Evidence: product `gid://shopify/Product/15386436698303`, status ACTIVE, price 1,200.00, inventory 0, no description, no images, vendor "Haramain Perfumes". Created 2026-10-07 22:07 UTC and last edited 15 seconds later. **No orders reference it** (the orders API covers all dates since creation, which is within its window).

```graphql
mutation { productUpdate(product: { id: "gid://shopify/Product/15386436698303", status: DRAFT }) { product { id status } userErrors { field message } } }
```
Undo: set `status: ACTIVE`. Not deleted.

## 2. Collection `haramain-perfumes` (your decision 4)

Evidence: `gid://shopify/Collection/488505901247`, smart collection (rule: vendor = "Haramain Perfumes"), 5 products, published to the Online Store only. No redirect exists today. It is in no menu and in no theme file.

```graphql
mutation { publishableUnpublish(id: "gid://shopify/Collection/488505901247", input: [{ publicationId: "gid://shopify/Publication/224508248255" }]) { userErrors { field message } } }
mutation { urlRedirectCreate(urlRedirect: { path: "/collections/haramain-perfumes", target: "/collections/all" }) { urlRedirect { id path target } userErrors { field message } } }
```
Undo: `publishableUnpublish` reversed with `publishablePublish`; `urlRedirectDelete` with the returned id. Note: the 5 products themselves are separate (see section 3).

## 3. Vendor of the 5 "Haramain Perfumes" products (your decision 2)

Your answer in the message was left as a template choice ("MOMENTS for generic gift bags / brand name for brand-specific ones"), so I have not chosen. All four bags are brand-branded (IBRAQ, AFNAN x2, ASSAF), none is generic. What each choice does, checked against the collection rules:

| Product | Option A: vendor = MOMENTS | Option B: vendor = the brand on the bag |
|---|---|---|
| `afnan-gift-bag`, `afnan-orange-gift-bag` | No collection filters on vendor "MOMENTS", so no collection gains them | Vendor AFNAN: both join the smart collection `afnan` (50 to 52 products) |
| `ibraq-premium-gift-bag-large` | same | Vendor IBRAQ: joins `ibraq` (25 to 26) |
| `assaf-gift-bag` | same | Vendor ASSAF: joins `assaf` (49 to 50) |
| `dolby` | same | n/a (see section 1) |

Common to both: the 5 products leave `haramain-perfumes` (it becomes empty, and you are unpublishing it anyway). `gift-bags` is a manual collection (no rules), so it keeps its 4 products. The manual moment collections are unaffected. Nothing else filters on these vendors (the only other vendor-based rules are the brand collections, `made-in-saudi`, `faan-200ml-buy-2-get-200-off`, `nabeels-` and `khadlajs-incense-collection`, none of which match). The product's brand in structured data (JSON-LD) and the brand line on the product page change to the new vendor. Under option B the gift bags (LE 40 to 50) would appear in brand pages next to LE 1,000+ perfumes, which you may not want; option A avoids that.

Exact write (one per product, example for option A):
```graphql
mutation { productUpdate(product: { id: "<product gid>", vendor: "MOMENTS" }) { product { id vendor } userErrors { field message } } }
```
Undo: set the vendor back. Product ids are in the Admin API (`products(query:"vendor:'Haramain Perfumes'")`); I will list them when you choose.

## 4. 16 Arabic SEO descriptions (your decision 7)

Preview: `docs/audit/seo-descriptions-preview-16.csv`. Change: remove "من الحرمين" and say "أصلي 100% ومغلق بعبوته الأصلية. توصيل لكل مصر." (the 100% original and sealed wording you approved); the rest of each sentence (including its scent notes) is kept as is. Proposed lengths are 160 to 168 characters; Google truncates near 155 to 160, so tell me if you want them shortened. Nothing applied.

```graphql
mutation { productUpdate(product: { id: "<product gid>", seo: { description: "<proposed text>" } }) { product { id seo { description } } userErrors { field message } } }
```
Undo: write the "current" column back.

## 5. New menus and the `skin-body` page for the dev theme (Step B, item 8)

The live menus are not touched. This creates NEW menus that only the redesigned theme will use, and a page that no live menu links to.

Menu `main-menu-redesign` (handle `main-menu-redesign`):

| Item | Links to | Children |
|---|---|---|
| Shop by Moment | page `moments` | Night `night-moment`, Gift `gift-moment`, All day `all-day-moment`, Daily `daily-moment`, Fresh `fresh-moment`, Love `love-moment` (all collections) |
| Gifts | collection `gift-moment` | none |
| For Her | collection `for-her` | none |
| For Him | collection `for-him` | none |
| Home & Incense | page `incense` | none |
| Skin & Body | page `daily-care` | Daily Care (page `daily-care`), Skin Moments (page `skin-body`, to be created) |
| New Moments | page `new-in` | none |
| Offers | page `offers` | none |
| Brands | page `brands` | the 22 brand collections already in the live menu, same order and links |

Resource ids: pages (`moments` 143304097983, `incense` 142989066431, `daily-care` 142989099199, `new-in` 142988968127, `offers` 142989000895, `brands` 142961017023); collections (`night-moment` 489238167743, `gift-moment` 489238266047, `all-day-moment` 489238298815, `daily-moment` 489238233279, `fresh-moment` 489238134975, `love-moment` 489238200511, `for-her` 488606138559, `for-him` 488606105791).

```graphql
mutation { menuCreate(title: "Main menu (redesign)", handle: "main-menu-redesign", items: [
  { title: "Shop by Moment", type: PAGE, resourceId: "gid://shopify/Page/143304097983", items: [
      { title: "Night", type: COLLECTION, resourceId: "gid://shopify/Collection/489238167743" },
      { title: "Gift", type: COLLECTION, resourceId: "gid://shopify/Collection/489238266047" },
      { title: "All day", type: COLLECTION, resourceId: "gid://shopify/Collection/489238298815" },
      { title: "Daily", type: COLLECTION, resourceId: "gid://shopify/Collection/489238233279" },
      { title: "Fresh", type: COLLECTION, resourceId: "gid://shopify/Collection/489238134975" },
      { title: "Love", type: COLLECTION, resourceId: "gid://shopify/Collection/489238200511" } ] },
  { title: "Gifts", type: COLLECTION, resourceId: "gid://shopify/Collection/489238266047" },
  { title: "For Her", type: COLLECTION, resourceId: "gid://shopify/Collection/488606138559" },
  { title: "For Him", type: COLLECTION, resourceId: "gid://shopify/Collection/488606105791" },
  { title: "Home & Incense", type: PAGE, resourceId: "gid://shopify/Page/142989066431" },
  { title: "Skin & Body", type: PAGE, resourceId: "gid://shopify/Page/142989099199", items: [
      { title: "Daily Care", type: PAGE, resourceId: "gid://shopify/Page/142989099199" },
      { title: "Skin Moments", type: PAGE, resourceId: "<new skin-body page gid>" } ] },
  { title: "New Moments", type: PAGE, resourceId: "gid://shopify/Page/142988968127" },
  { title: "Offers", type: PAGE, resourceId: "gid://shopify/Page/142989000895" },
  { title: "Brands", type: PAGE, resourceId: "gid://shopify/Page/142961017023", items: [ "...the same 22 brand collection items as the live menu" ] }
]) { menu { id handle } userErrors { field message } } }

mutation { pageCreate(page: { title: "Skin & Body", handle: "skin-body", templateSuffix: "skin-body", isPublished: true, body: "" }) { page { id handle } userErrors { field message } } }
```
Notes:
- The new page is published but linked from no live menu. **The live theme has no `skin-body` template**, so anyone who types `/pages/skin-body` on the live site sees a nearly empty default page (title only). Low risk, but not zero; set `isPublished: false` instead if you prefer, in which case the page can only be seen once the theme is published.
- The new menu is invisible to shoppers until a theme section is pointed at it, which only the dev theme will be.
- Undo: `menuDelete` and `pageDelete` (both new objects).
- I will paste the full 22-item brand list when you approve.

## 6. Shipping Policy link (your decision 9)

`/policies/shipping-policy` returns 404: Shopify's shipping policy is empty (only the privacy policy has content). So the footer link is **left as a marked TODO**, not changed. Current state: the footer's "Shipping Policy" item points at the page `/pages/delivery-policy`, which renders the **returns** policy template. No shipping terms were written. Options for you: fill Settings > Policies > Shipping policy (then I link the footer to it), or have the footer omit the item until it exists. In the new footer menu I will leave a `TODO` item rather than a wrong link.

## 7. Placeholder banners on brand collection pages (your decision 8)

**Cause: the files are missing, not a wrong setting.** The collection templates reference store files such as `shopify://shop_images/wep-afnan.jpg`; those names exist in the *other* store's library and not in MOMENTS' Files (a file search for `wep` returns nothing). Shopify then renders its built-in teal-shirt placeholder. The same applies to the other references copied across (for example `sa2_0c43c02f-….png` used 26 times, `nightly-2.jpg`, `213W1.png`, `hhhhh.png`, `E1236D1F-….png`, and the favicon `favu.png`).

You uploaded 20 brand banners on 18 Oct (4226 x 1421, about 3:1): `afnan`, `armaf`, `assaf`, `khadlaj`, `lattafa`, `pride`, `le-falcone`, `le-bonheur`, `nabeel`, `rasasi`, `zimaya`, `faan`, `ibraq`, `ibraq-ibrahim-alqurashi`, `laverne`, `ajmal`, `al-ezz`, `amarah`, `french-avenue`, `dkhoon-alemiratia`. The templates do not use them. Proposed mapping (theme change, applied while rebuilding collection pages in Step B, plus a fallback so the placeholder can never render):

| Template | Currently points at | Proposed file |
|---|---|---|
| `collection.afnan.json` | `wep-afnan.jpg` | `afnan.png` |
| `collection.khadlaj.json` | `wep-khadlaj.jpg` | `khadlaj.png` |
| `collection.lattafa.json` | `wep-latafa.jpg` | `lattafa.png` |
| `collection.zimaya.json` | `wep-zimaya.jpg` | `zimaya.png` |
| `collection.lattaf-pride.json` | (missing file) | `pride.png` |
| `collection.le-falcone.json` | (missing file) | `le-falcone.png` |
| `collection.nabeel-perfumes.json` | (missing file) | `nabeel.png` |
| `collection.rasasi-per.json`, `collection.armaf.json` | no image block | `rasasi.png`, `armaf.png` (optional) |
| Default `collection.json` (assaf, ibraq, faan, laverne, ajmal, …) | missing file | one banner per collection from the table above, or a no-image layout |

The banners themselves are included in the OCR pass for baked-in traces.

## 8. Everything else in Step C (not prepared yet)

Vendor cleanup (KHADLAJ/Khadlaj merge plus title case, with the 34 collection rules updated in the same step), the alt-text rewrite (538 + 331 + 30), and the Haramain alt/SEO text are separate reviewable steps after the design, as agreed.
