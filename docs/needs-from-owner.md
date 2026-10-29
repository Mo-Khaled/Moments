# Needed from the owner

Nothing below is guessed or invented; each item is a slot that is hidden on the storefront until filled.

## Facts and copy
- **Support phone and support email** (footer shows `TODO_PHONE` and `TODO_SUPPORT_EMAIL`; the About support section is hidden until filled).
- **Governorates you deliver to** (About, Shipping and support).
- **Our story** chapters: how MOMENTS started, why moments, where you operate, what changed. No years, numbers or maps unless you supply them.
- **Whether "authorized distributors" is true.** Until confirmed the store says only "100% original, sealed".
- **The real exchange policy** wording (the pages only link to the existing "Returns & exchange policy" page).
- **Arabic review** of every `homepage.*`, `about.*` string (drafts are in `locales/ar.json`).

## Footage and photography
- Hero video clips per moment (1920x1080 and 9:16, 6 to 10 s). Run `scripts/prepare-video.mjs` on them (needs ffmpeg, not installed here).
- The long "Play our story" video (the button stays hidden until it exists).
- Moment photography, a gift packshot, normalised best-seller packshots (for example 9 PM for Night), a team or workshop photograph.

## Store changes only you can approve (not made)
- Add a **Unisex** collection or menu link and confirm the **New arrivals** collection handle (see `docs/audit/navigation-changes.md`).
- **Assign the About template**: change the About page's template to `page.about` (it is built and previewed with `?view=about`).
- **Add Arabic** to the store languages (unpublished) so RTL can be checked with real text.
- **Shipping policy**: `/policies/shipping-policy` has no content on the store; the link is hidden until it has some (and it must not carry returns wording).
- **The old About page text** (`page.about-us` template, the one assigned today) still says "Fair Prices ... without inflated retail markups" and "Fast Delivery across Egypt". Both are unverified claims. Either confirm them, edit the text, or assign the new `page.about` template (which avoids them).
- **Haramain leftovers in store data** (each needs your approval of the exact change): vendor "Haramain Perfumes" on 4 gift products (the theme shows MOMENTS for now), the `haramain-perfumes` collection (proposed: unpublish and redirect to /collections/all), the "Dolby" product (no image, proposed: set to draft, not delete), alt texts that name the other shop (538), and the watermarked gift-bag images.
- **Draft products**: 51 products are drafts (not in the image audit because they have no public images); say if they should be audited too.
- **Backup theme** "MOMENTS - Backup before redesign": creating it is a store change, so it needs your yes.
- **Publishing**: not done. It happens only when you send the word "publish".

## Product images (see docs/assets/)
- Approve the image standard (4:5, 2000 px, bottle about 80% of the frame, pearl backdrop) or change it; six before/after samples are in `docs/assets/normalization-samples/`.
- Send the media-kit request (English and Arabic, ready to paste) to the distributors; 109 main images are under 1000 px and 46 have the bottle cropped.
- Tell me the permission status for any brand's images (supplied by the distributor, shot by you). Until then every brand is "unknown".

## Tools
- ffmpeg (for the experimental video and your own clips).

## Make a bundle (header link)
- **Create the page**: Online Store, Pages, add a page titled "Make a bundle", handle `make-a-bundle`, template `page.bundle`. The header ("Make a bundle", accent link) and the phone drawer show the link only once that page exists (theme setting `moments_page_bundle`, default `make-a-bundle`). Gifts left the top bar (it stays inside Shop by Moment and the drawer); the primary nav default is now "shop by moment,brands".
- Bundle discount tiers stay off until you choose a mechanism (see the bundle options above).

## Bundle discount plan (supplied by the owner)
- Plan shown on /pages/make-a-bundle: **free delivery from the 2nd bottle, 10% off from the 3rd**. The page only displays it. **A real discount must exist at checkout**: an automatic discount applies to every cart, so a bundle-only rule needs a bundle app or a discount function (the cart line property "Bundle" is already sent). Until it exists, shoppers would see an offer the checkout does not honour: create it before this goes out, or turn off "Show tiers" in the bundle section.

- **Returns title (2026-10-26 live audit):** the page and footer link say "Returns & Exchange Policy" but the policy says exchanges are not available. Rename to "Returns Policy" (page title and menu label are store data), or supply an exchange policy.
- **Legal policies and FAQ:** /policies/refund-policy and /policies/shipping-policy return 404 and /pages/faq does not exist. Decide whether to fill them in or leave the pages as they are.
- **Footer menu label:** the footer menu item still reads "Returns & Exchange Policy" (menu = store data). Rename it to "Returns policy". The theme's own labels were already changed. Also listed: /policies/refund-policy and /policies/shipping-policy return 404 and /pages/faq does not exist; the theme links to none of them.

- **PayPal on the product page (performance):** the product page loads PayPal's smart button (about 840 KB in total). If most orders are cash on delivery, turning off "Show dynamic checkout buttons" on the product page (Theme editor, Product page, Buy buttons) makes product pages about 0.8 MB lighter. It removes a payment shortcut, so it is your call.
- **Brands page template:** the new Brands page is `templates/page.page.json` and applies to the pages whose template is "page" (Brands and the placeholder "Home Page"). The old `templates/page.brands.json` is unused; it can be deleted or assigned in the admin if you prefer.

## Gift finder
- Metafield definitions: **created 2026-10-29** with your approval (namespace `moments`, 7 definitions, pinned on the product page). No product values are written until you send the filled CSV and approve each "why" line.
- **Tag the products**: fill `scripts/gift-metafields-template.csv` (50 rows, values empty on purpose). I validate it with the dry run and write only after your approval.
- **Approve the wording of every "why" line** (max 90 characters, no scent notes, no "smells like").
- **Create the `gift-finder` collection** holding the tagged products (or name another in the section settings), and the page "Gift finder" (handle `gift-finder`, template `page.gift-finder`).
- **Budget bands**: Theme settings > MOMENTS > Gift finder > budget limits, e.g. `1000,2000,3500` (empty = no budget row).
- **Gift-ready**: say what "gift-ready" means for your products (nothing about wrapping, boxes or cards is claimed). The row stays off until you confirm and tag `gift_ready`.
- **Navigation**: not in the main menu (your answer 2026-10-29: not yet).
- **Un-hide the homepage strip** once products are tagged (it ships hidden).

## Gift-box hero
- **The swap**: on hold until you have tested `/?view=hero-box` on a real iPhone and an Android phone (your answer 2026-10-29). Say yes and it replaces the current hero (the old one is disabled, not deleted).
- **Higher-resolution bottle photos**: the two 9 PM photos are 720 px; the bottle is about 530 px tall, enough for phones but soft on large screens. Ideal: 2000 px or more on the long side, on a plain light background, front and three-quarter, same distance and light.
- **A turntable shoot** (12 to 36 angles) if you want a real rotation; today it is a two-photo crossfade.
- **Final copy**: "Every moment has a scent." / "Gifts and fragrances, sorted by the moment you are dressing for." / "Open a moment." / "Start with 9 PM, or find your own." are drafts (locales/en.default.json, hero_box.*). Arabic lines are still to be written.
- **A real iPhone check** of the 3D box before the swap (the Windows test browser cannot draw 3D transforms).
- **The identity zip and the two photos** are in the repo folder but git-ignored; keep them or move them, your choice.
