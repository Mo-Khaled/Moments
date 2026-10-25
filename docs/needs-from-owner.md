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
- **Vendor and image data**: vendor names ("Haramain Perfumes" still appears as a vendor on gift bags), product images that carry another shop's watermark, and the products not published to the Online Store channel (see the image audit).
- **Backup theme** "MOMENTS - Backup before redesign": creating it is a store change, so it needs your yes.
- **Publishing**: not done. It happens only when you send the word "publish".

## Product images (see docs/assets/)
- Approve the image standard (4:5, 2000 px, bottle about 80% of the frame, pearl backdrop) or change it; six before/after samples are in `docs/assets/normalization-samples/`.
- Send the media-kit request (English and Arabic, ready to paste) to the distributors; 109 main images are under 1000 px and 46 have the bottle cropped.
- Tell me the permission status for any brand's images (supplied by the distributor, shot by you). Until then every brand is "unknown".

## Tools
- ffmpeg (for the experimental video and your own clips).
