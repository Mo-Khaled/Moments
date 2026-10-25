# Skills log

One entry per change: the skill used, what it said, what changed because of it. If a skill could not be used, that is
written here too. Entries before 2026-10-25 are reconstructed from the commit messages (marked "retro").

Installed and listed this session: shopify, shopify-liquid-themes, shopify-admin, shopify-custom-data, shopify-dev, shopify-liquid
(the last four appeared mid-session), frontend-design, banner-design, emil-design-eng, design-system, brand, ui-ux-pro-max, impeccable.
Not usable: the shopify skill's `validate.mjs --api liquid` fails with "Cannot find package @shopify/theme-check-common" (the skill
bundle is incomplete). `shopify theme check` (same engine) is used instead on every touched file. Skill telemetry is opted out
(`OPT_OUT_INSTRUMENTATION=true`); no skill helper that reports to a remote service was run without it.

## 2026-10-25: tile fix (Shop by Moment, /pages/moments), claims fix

| Skill | What it told me | What changed |
| --- | --- | --- |
| shopify-liquid-themes | Snippets always carry LiquidDoc; reuse through `{% render %}`; schema with `max_blocks`, `visible_if`; every string through `t`; one `{% stylesheet %}` per file | `snippets/moment-tile.liquid` (LiquidDoc, params) is the one tile used by `sections/moments-shop-by-moment.liquid`, which both templates render. New strings in en.default.json and ar.json (`homepage.moments.total`, `.find`). |
| shopify (liquid topic) | Validate Liquid with `validate.mjs --api liquid` | Validator would not run (missing package, see above). Used `shopify theme check`: 0 offenses on touched files. |
| design-system | Three layers: primitive, semantic, component; never raw hex in components | Added semantic tokens `--moment-night`, `--moment-night-ink`, `-body`, `-accent`, `-gold` (and gift, allday, daily, fresh, love) in `assets/moments.css`, built from the existing primitives with `color-mix`. The tile maps them to component tokens `--tile-bg/-ink/-body/-accent/-gold`. No hex in the snippet or section. |
| frontend-design | Spend boldness in one place; identical card kits and decoration without purpose read as templated; critique your own screenshots | Dropped the six identical nude fields and the photo option. Each moment gets its own colour field; big Marcellus label is the only large type; one gold hairline per tile. I looked at the 1440 and 375 screenshots before reporting. |
| banner-design | Keep critical content inside a safe zone (central 70 to 80% of the canvas) | The 12% safe-area rule: mark box 40% of the tile, art padded 12.5% inside its own viewBox, 12% from the top and the end edge, enforced in `scripts/check-tiles.mjs` (`MIN_SAFE = 0.12`). Label sits 12% from the start and bottom edges. |
| emil-design-eng | Animate only transform and opacity; press feedback `scale(0.97 to 0.98)`; ease-out; reduced motion off; never animate from scale(0) | `.m-tile:active { transform: scale(0.985) }` with the shared ease token. Gestures stay transform-only and size-relative (the mark's drawing units scale with the tile). Deviation: the hover gradient shift animates `background-position` (a paint, not layout, on six tiles). Left as is; disabled under reduced motion. |
| impeccable | Absolute bans (side stripes, gradient text, identical icon-title-text cards, ghost borders with big shadows); detector; critique | `detect.mjs` on the three touched files: no findings. Gradient fills are on surfaces, not text. Findings of the single-context critique below. |
| shopify-liquid-themes (claims) | Content goes in the template JSON, minimal edits | `templates/page.about-us.json`: removed "official agency and distribution" and "from a source you can trust"; now "100% original and sealed". Brands page already has no "Al Haramain" text on the dev theme. |

### Impeccable critique of the Moments tiles (home and /pages/moments), single-context
⚠️ DEGRADED: single-context (the default you set; two-sub-agent run reserved for the final homepage and product page review).

Verified: strict 3 x 2 / 2 x 3 / 2-column grid, no orphan cell, equal tile size (1px rounding), marks never clipped (rest and gesture end
state, 120 states, five widths, LTR and RTL emulated), no tile image, label contrast 5.1:1 to 16.4:1 on every field.
Still weak:
1. The mark reads small and thin: the art fills about 30% of the tile width. It is placeholder line art. The illustrator's final marks should be bolder at this size.
2. The tiles carry no imagery. They are colour fields. Richness will need moment photography, shown uncropped, which does not exist yet.
3. Gold hairline contrast on the gift, fresh and love fields is low (decorative only).
4. The Daily tile is close to the page background colour; it relies on its gradient to separate.
5. Hover is a quiet gradient shift. It does not tell the shopper which tile has focus beyond the mark's gesture.
6. RTL was emulated with `dir="rtl"`; real Arabic is not previewable until it is added to the store languages.

## Earlier entries (retro)

| Date | Change | Skills |
| --- | --- | --- |
| 2026-10-25 | Header "More" overflow panel (blocks/_header-menu.liquid) | shopify-liquid-themes, diagnose (cause: wiped --overflow-count, closed submenu reserving height) |
| 2026-10-25 | Homepage hero, value strip, tiles v1, story, signup band, compare-at price contrast | shopify-liquid-themes, design-system, frontend-design, ui-ux-pro-max, impeccable |
| 2026-10-25 | Product image audit (read-only): scripts and docs/audit/image-audit.csv | shopify (read-only public feed; no GraphQL authored, so no schema validation applied) |
