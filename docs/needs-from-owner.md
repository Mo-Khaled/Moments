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
- **Vendor and image data**: vendor names ("Haramain Perfumes" still appears as a vendor on gift bags), product images that carry another shop's watermark, and the products not published to the Online Store channel (see the image audit).
- **Backup theme** "MOMENTS - Backup before redesign": creating it is a store change, so it needs your yes.
- **Publishing**: not done. It happens only when you send the word "publish".

## Tools
- ffmpeg (for the experimental video and your own clips).
