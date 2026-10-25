# ar.json review: customer-facing strings (NOTHING CHANGED)

Reviewed all 270 theme strings (`en.default.json` keys) against `ar.json`. The file header says Shopify's admin language editor owns it, and several values look machine-translated. Proposals below are for your approval; I have not edited any of them. Arabic wording is mine and should get a native review before it ships.

## 1. Broken links (fix first)

Nine strings carry a corrupted link address: translation markup ended up inside `href`, so the link goes nowhere on Arabic pages. Example, `actions.log_in_html`:

`<a href="&lt;span%20class='notranslate'&gt;{{%20link%20}}&lt;/span&gt;">` should be `<a href="{{ link }}">`

Affected keys: `actions.log_in_html`, `content.shipping_policy_html`, `content.store_owner_link_html`, `content.use_fewer_filters_html`, `content.taxes_at_checkout_shipping_at_checkout_with_policy_html`, `content.taxes_at_checkout_shipping_at_checkout_with_policy_without_discounts_html`, `content.taxes_included_shipping_at_checkout_with_policy_html`, `content.duties_and_taxes_included_shipping_at_checkout_with_policy_html`, `content.duties_included_taxes_at_checkout_shipping_at_checkout_with_policy_html`.

Proposed fix: restore `href="{{ link }}"` (or `{{ class }}` where the English uses it) and keep the Arabic words around it unchanged.

## 2. Wrong meaning

| Key | English | Current Arabic | Problem | Proposed |
|---|---|---|---|---|
| `actions.submit` | Submit | يُقدِّم | "he presents" (a verb form) | إرسال |
| `actions.apply` | Apply | نفذ | means "execute" and also reads as "sold out" | تطبيق |
| `actions.clear` | Clear | واضح | means "clear/obvious" | مسح |
| `actions.sort` | Sort | نوع | means "type/kind" | ترتيب |
| `actions.sign_up` | Sign up | اشتراك | noun, not a button action | اشترك |
| `actions.more` | More | أكثر | "more" as a comparison | المزيد |
| `actions.show_filters`, `blocks.filter` | Filter | فلتر | transliteration | تصفية |
| `content.search`, `content.search_input_label`, `content.search_input_placeholder`, `placeholders.search` | Search | يبحث | "he searches" | بحث (label), ابحث (placeholder) |
| `content.grid_view.default_view` | Default | تقصير | means "shortening" | افتراضي |
| `content.grid_view.single_item` | Single | أعزب | means "bachelor" | عنصر واحد |
| `fields.separator` | to | ل | wrong preposition for "to" in ranges | إلى |
| `content.duties_included` | Duties included. | الواجبات مشم | truncated, and "duties" mistranslated | الرسوم الجمركية مشمولة. |
| `content.price_compare_at` | Compare at price | قارن بسعر | an imperative verb | السعر قبل الخصم |
| `customer_accounts.order_details.shipping.free` | (English value is "Based on Location") | حر | "free" as in liberty | مجاني |

## 3. Untranslated (English left in the Arabic file)

| Key | Current | Proposed |
|---|---|---|
| `content.inventory_low_stock_show_count.one` / `.other` | `{{ count }} left` | متبقي {{ count }} |
| `content.item_count.one` | `{{ count }} item` | {{ count }} منتج |
| `content.item_count.other` | `{{ count }} items` | {{ count }} منتجات |

## 4. Checkout wording ("الخروج" means "exit")

"Checkout" is translated as "الخروج" in these strings, which reads as leaving the site: `content.shipping_policy`, `content.shipping_discount_error`, `content.taxes_at_checkout_shipping_at_checkout_without_policy` (and the `_without_discounts` variant). Proposed: replace "عند الخروج" with "عند إتمام الطلب". Also `content.checkout` ("الدفع") could be "إتمام الشراء".

## 5. Consistency and polish

| Key | Current | Proposed | Note |
|---|---|---|---|
| `content.cart_title` | عربة التسوق | keep one term across the theme | "سلة التسوق" is used elsewhere; pick one (Egyptian shops often use عربة التسوق or السلة) |
| `blocks.sold_out`, `products.product.sold_out`, `content.product_badge_sold_out` | نفذ | نفدت الكمية | matches `content.inventory_out_of_stock` |
| `content.cart_estimated_total` | إجمالي التقديرات | الإجمالي التقديري | |
| `content.account_orders` / `content.account_profile` | طلبات / حساب تعريفي | الطلبات / الملف الشخصي | |
| `products.product.adding_to_cart` | إضافة... | جارٍ الإضافة... | |
| `content.quantity`, `products.product.quantity` | كمية | الكمية | |
| `content.reviews` | المراجعات | التقييمات | |
| `actions.choose`, `actions.close`, `actions.open` | اختار / اغلق / افتح | اختر / إغلاق / فتح | |
| `blocks.contact_form.name` / `.email` | اسم / بريد إلكتروني | الاسم / البريد الإلكتروني | |
| `blocks.email_signup.success` | شكرا على الاشتراك! | شكرًا على اشتراكك! | |

## 6. How to apply, when you approve

One commit per group above. Group 1 is a code-level fix and safe to apply first. Because the file header says the admin language editor may overwrite it, the durable home for these corrections is the theme's translation editor once Arabic is added to the store, so I can apply them either in `ar.json` here or you can paste them in the editor. Tell me which.
