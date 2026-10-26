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

## 2026-10-26: bundle page product cards
- Root cause search for the "plum panel": on the live theme the card text area is transparent on the pearl section (`--color-background` rgb 250 246 242, `--color-foreground` plum, `color-scheme-1`); name, brand, price and compare-at all computed to plum or taupe ink on pearl. I could not reproduce a plum panel in a clean headless Chromium in light, dark (`prefers-color-scheme`), reduced-contrast, forced-colors, hover, or after-add states, at 1440 and 375. No `prefers-color-scheme` rule exists anywhere in the theme. Most likely the screenshot came from a browser holding an older cached stylesheet or from the theme editor preview; hard refresh (Ctrl+Shift+R) first. Nothing was overridden with one-off colours.
- Real defects found and fixed: (1) buttons not level across a row (the gift-bag cards were 22px shorter, so their buttons sat higher; same on phones): grid cell is now `1fr auto`, so the card takes the free height and the button sits at the bottom; (2) brand shown twice when the product title starts with the vendor ("AFNAN GIFT BAG" + "AFNAN"): `product-card-meta` skips the brand when the title already starts with it, on every card placement; (3) the photo frame was pearl on pearl, so photos with off-white backdrops showed as pale boxes: the bundle grid frame is now a soft nude tint with a 12px radius (photos are multiplied onto it); (4) the disabled Checkout used opacity 0.45 (2.2:1): now taupe ink on light taupe.
- Stray corner marks: not found in the live DOM (no pseudo-elements on the gallery); most likely the pale baked-in photo backdrops from (3).
- New `scripts/check-contrast.mjs` (axe color-contrast + own computed check; gradient stops worst case; photographs reported not guessed; when only the body background is found the real rendered pixel is sampled, because section backgrounds can be pointer-events:none siblings). Report: docs/design/contrast-report.md.

## 2026-10-26: pointer artwork changed to the owner's chosen icons
- Page cursor: Fluent UI System Icons "cursor-24-filled" (MIT) in plum with a white outline. Clickable cursor: Hugeicons "ok-finger" (MIT) in berry on a white outline. Sources in assets/cursor-*.svg, built to 32px and 64px PNG by scripts/build-cursors.mjs. Hotspots: arrow tip (8,3), hand raised fingertip (18,3). Replaces the first diamond-arrow drawing. Both are from npm packages (@iconify-json/fluent, @iconify-json/hugeicons) installed in a scratch folder only; nothing from them is a project dependency.
- Muted text: the product count and filter labels used the scheme token `--color-foreground-muted` at 60% opacity (4.0:1 on pearl); raised to 78% at token level (plus `--opacity-subdued-text`).

## 2026-10-26: colour flow
- Cause of the lines: every full-bleed band met the next at a hard edge (plum > nude > berry gradient > bronze (the story band took --m-live, which my All day token had made a brown) > plum), plus a 1px gold hairline under the brand strip and nude hairlines on About bands. Six surface tones, four hard seams.
- Fix: three tones (plum family, pearl, nude kept inside cards); the lower band of every plum/pearl join opens with a fade strip (::before on its wrapper, --blend 200px desktop and 120px phone, plum > mauve #9C6B8A > pearl, interpolated in oklab) so there is no overlap, no mask and no text in the fade; the hero fades up out of the header colour with an overlay; hairlines at joins removed; the story and steps bands are plum; Most loved is pearl (index.json scheme-4 > scheme-1); Gift is a contained card.
- Proof: scripts/check-colour-flow.mjs samples every pixel row of a gutter column (OKLab step, 1px-line and tone-count rules). Live: largest step 0.75-1.0 per row (limit 1.2), zero 1px lines, 2 resting tones, on home, /pages/moments, About, Bundle and Cart at 1440 and 375 (home also RTL).
- Known exception: the announcement bar and header are one chrome unit and keep a deliberate edge between them; the hero marquee strip and hero media are not measured.
- Palette: All day is a light golden sand with plum ink (#E6C77C), Daily a clay (#9C5132), Love crimson-rose (#921F3F), Gift orchid (#A44D8E), Night indigo (#5F4589), Fresh green; closest pair dE 11.4, AA text on all.

## 2026-10-26: plum text panel on product cards (user devices)
- Not reproducible on the live theme in headless Chromium, WebKit or Firefox across light/dark, forced-colors, prefers-contrast, reduced motion, iPhone 13, cart with 3 items, bundle state in localStorage, preview cookie (scripts/check-card-matrix.mjs, docs/design/card-matrix.md). There is no `prefers-color-scheme` rule in the theme.
- Most likely mechanism (unproven): card names and meta use explicit plum and taupe tokens while the text-area background comes from the section colour scheme (`--color-background`). Any scheme with a plum background that reaches the card content (a leaking scheme class, a forced or auto dark mode, an extension) gives plum text on a plum panel.
- Hotfix pushed: `color-scheme: only light` on the page (plus the meta tag), explicit scheme variables on the card and every scheme class inside it, and an explicit pearl surface and plum text on `.product-card__content` with specificity that beats `.color-scheme-N`.
- Diagnostic for the real devices: open /pages/make-a-bundle?card-diagnostic=1, wait for the cards, press "Copy report", paste it into the chat. (`?view=card-diagnostic` would make Shopify fall back to the default page template, so the query is `card-diagnostic=1`.)
