# Decisions log (unattended run, 2026-10-25)

Each entry: decision, alternatives, why, how to revert.

| # | Decision | Alternatives | Why | Revert |
| --- | --- | --- | --- | --- |
| 1 | Primary navigation is a theme setting (`moments_primary_nav`, default `shop by moment,brands,gifts`), not an edit of the store menu. | Edit `main-menu`; create a new menu. | Menus are shared with the live theme and store writes need approval. | Change the setting text, or set it to all nine titles. |
| 2 | The Shop by Moment panel builds the six moments from fixed collection handles. | Add children to the menu item. | No store write; the menu item has no children. | Add children to the menu and read them instead. |
| 3 | "Unisex" and "New arrivals" are shown only if a Unisex collection or menu link and a `new-arrivals` collection exist. | Show dead links. | A panel must never contain a broken or empty link. | Create the pages, they appear by themselves. |
| 4 | Brand logos are derived transparent pearl files in `assets/brand-<handle>.png` (script `scripts/prepare-brand-logos.py`). | Use the collection images as they are. | The store images are opaque with a baked plum background; Laverne had a leopard silhouette behind its last letter. | Delete the assets; the marquee falls back to collection images. |
| 5 | The announcement bar rotates (CSS only) instead of the earlier marquee; the marquee stays as a setting. | Keep the marquee. | The v3 brief asks for one message at a time; the marquee is kept only for the brand strip. | Set Style to Marquee in the section settings. |
| 6 | Posters use a "Fit" mode (whole photo over a blurred copy) by default. | `object-fit: cover`. | The Island Sun bottle fills the frame; cover would crop it. | Set Poster fit to Fill per slide. |
| 7 | The About template is `templates/page.about.json` and is previewed with `?view=about`. It is NOT assigned to any page. | Switch the About page's template. | Changing a page's template is a store write. | n/a (nothing was assigned). |
| 8 | Empty About slots (story chapters, support details) are hidden on the storefront and shown as TODOs in the theme editor only. | Show placeholder text. | No TODO text may reach shoppers. | Fill the settings. |
| 9 | The experimental hero video was not produced: ffmpeg is not installed. | Install ffmpeg. | The brief says not to install anything. `scripts/prepare-video.mjs` is ready. | Install ffmpeg and run the script. |
| 10 | The shopify skill's Liquid validator would not run (package missing from the skill bundle); `shopify theme check` is used on every touched file instead. | Install the package. | No installs outside what the project needs. | n/a |
| 11 | RTL is checked by emulating `dir="rtl"` and `lang="ar"` on `<html>` (Arabic is not a store language). | Wait for Arabic. | Lets the layout be verified now. Real Arabic needs a second pass. | n/a |
| 12 | The Shop by Moment tiles are 5:6 with the mark at 50% of the tile width. | Square tiles. | Gives the mark room without touching the label. | Change the aspect ratio in `snippets/moment-tile.liquid`. |
