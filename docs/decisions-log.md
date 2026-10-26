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
| 13 | `filters-toggle` was removed in the cleanup, found to change the collection layout, and restored. | Keep removed. | The screenshot diff showed a real layout change; the static reference scan cannot see indirect use. | Already reverted. |
| 14 | The Haramain vendor name is mapped to the shop name for display (cards, cart, product text block) with no store write. | Wait for the vendor rename. | Keeps the other shop's name off the storefront now; the real rename also changes smart collections, so it still needs approval. | Delete `snippets/vendor-name.liquid` and the replace in `snippets/text.liquid`. |
| 15 | The old product trust badges were rewritten (confirmed wording, shared 3,000 threshold). | Leave them. | They claimed 'official distributors', 2,000 EGP and an invented returns promise. | `git revert` the commit. |

## 2026-10-26: edit the live theme directly
- Found that the pinned dev theme `moments-redesign` #161294745791 had become the live theme (role main); #161251229887 is now unpublished. Two earlier small pushes (announcement bar) went to it before this was noticed.
- Owner decision: edit live directly under the LIVE-SAFETY RULES (branch `live-enhance`, checks before push, `--only` pushes of specific files, new features shipped dark, smoke test after every push, rollback by pushing previous versions, every push logged in `docs/live-pushes.md`).
- Backup: #161251229887 kept; new unpublished duplicate #161334263999 "MOMENTS - Backup 2026-10-26 11-47" created (approved). `shopify.theme.toml` now has environment `live` only.
- Still needs approval: any store-data write (products, collections, menus, pages, policies, discounts, languages, redirects, apps), deleting themes, placing orders.

## 2026-10-26: moment palette from one OKLCH recipe
- field L0.50 C0.12, deep L0.40 C0.10, soft L0.93 C0.035, ink L0.30 C0.07; hues Night 318, Gift 345, All day 82, Daily 48, Fresh 152, Love 12 (`scripts/moment-palette.mjs`). Daily no longer matches the page background, Fresh is a clean green, Love a clear rose. Gold stays the accent and hairline.
- The live accent (`--m-live`) now takes each moment's deep step with pearl text (8:1 or better).
- Baseline colour flow (`docs/design/colour-flow-baseline.md`): 4 hard seams, 6 surface colours at 1440 and 375, LTR and RTL. Still to do: the band changes.

## 2026-10-26: custom pointer
- Diagnosis: the arrow pointer was never built or pushed. Only the follower token existed (snippets/moment-cursor.liquid); nothing in the theme set a cursor image, so the system arrow always showed. The theme's own `cursor:` rules are class-level pointer/grab/not-allowed values.
- Fix: PNG cursors (32 and 64px) built from committed SVGs by scripts/build-cursors.mjs, tied to the tip hotspot (3,2). One snippet (moment-pointer) sets `--m-pointer-default` and `--m-pointer-link` with image-set, a -webkit-image-set fallback and native keywords, scoped to `(pointer: fine)`, off under forced-colors, theme setting "Custom pointer" (default on). Applied with `html:root:root :where(...)` so it beats theme class rules without !important. Inputs, textareas and disabled controls keep native cursors.
- Follower token moved to +62px/+56px so it never sits on the tip. Test page: /pages/about-us?view=cursor-test. If the old arrow still shows, hard-refresh (Ctrl+Shift+R).
