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

## 2026-10-25: homepage identity reset (tickers, header, mega panel, hero, brand marquee, colour blocks)

Installed this session and used: shopify-liquid-themes, shopify (CLI/theme topics), frontend-design, impeccable, emil-design-eng,
ui-ux-pro-max, design-system, brand, banner-design. The official shopify-liquid, shopify-admin, shopify-custom-data and shopify-dev
skills were listed mid-session; this round was theme work and read no store data through the Admin API, so only shopify-liquid applies,
and its validator did not run (the `validate.mjs --api liquid` package is missing from the bundle). `shopify theme check` was run on every touched file: 0 offenses
in the new files (two pre-existing predictive-search class warnings remain, untouched).

| Skill | What it told me | What changed because of it |
| --- | --- | --- |
| shopify-liquid-themes | LiquidDoc on snippets, schema limits (name 25 chars, option labels short), translations through `t`, one `{% stylesheet %}` per file, no filters on `render` arguments | `moments-ticker`, `moments-diamond`, `moments-chevron`, `title-case`, `moments-mega` carry LiquidDoc. The first push failed on a 26-character schema name and a long option label; fixed. `render ... label: 'key' \| t` was rejected by theme check; the value is assigned first. All strings in en.default.json and ar.json. |
| design-system | Tokens in three layers, no hex in components, semantic names | `--m-content` and `--m-gutter` shared by every band; `--m-live*` registered with `@property`; `.m-tone--*` map moment tokens to tile variables used by tiles, hero slides, gift block and mega cards. Documented in docs/design-system.md. |
| frontend-design | Spend boldness in one place; avoid default chrome (all-caps eyebrow on everything, identical cards); critique with screenshots | One large idea (the page follows the moment). The only small caps labels are the three mega-panel column headings, which you specified. Hero is the memorable element; the rest stays calm. I looked at the 1440 and 375 screenshots and changed the hero mark into a watermark after seeing it was too timid. |
| emil-design-eng | Animate transform and opacity; ease-out; stay under 300 ms for UI; pause and respect reduced motion; make it interruptible | Tickers: transform only, linear (constant motion is the one case for linear), paused on hover and focus, static under reduced motion. Hero crossfade 360 ms ease-out through `@starting-style`; drift is transform only and paused with the video; the switcher is instant to operate and never blocks input. |
| ui-ux-pro-max | Reduced motion, 44 px targets, keyboard order, escape routes, no hover-only, overflow menu rules | Escape closes the panel and returns focus; arrow keys move across items and inside the panel; first touch tap opens, second follows; playback buttons are 44 px with aria labels and aria-pressed; the hero never auto-advances. |
| banner-design | Safe zones, one primary CTA, 4.5:1 text contrast | Hero scrim at 74% (setting, minimum advised 70%); one filled and one outlined button; tile art keeps the 12% safe area (checked by scripts/check-tiles.mjs). |
| brand | Voice and palette consistency | Gold stays a hairline; berry is the only action colour; copy uses only confirmed facts ("100% original, sealed"). |
| impeccable | Detector and slop tests; critique | `detect.mjs` run on the new sections; critique below. |
| shopify (CLI) | `theme push --only` for small pushes | Used `scripts/push.sh` (traces check first), never the live theme. |

### Impeccable critique of the new homepage (single-context)
⚠️ DEGRADED: single-context (your default; the two-agent run is reserved for the final homepage and product page review).
See the final report for the list of what is still weak.

## 2026-10-25 (later): v3 simplification, About page, cleanup, image audit, release prep

Skills in use: the official **shopify-liquid**, **shopify-admin**, **shopify-custom-data** and **shopify-dev** skills were listed mid-session.
This round read store data only through read-only Admin queries (counts, collection membership) and the public feed; no custom data or
metafields were involved, so **shopify-custom-data** and **shopify-dev** had nothing to apply. **shopify-admin**: the read-only GraphQL I wrote was run
through the connector (counts by status and publication, best-sellers membership); the skill's `validate.mjs --api admin` was not run because
the same bundle could not load its validator package (see the first entry). **shopify-liquid**: same bundle, validator unavailable; `shopify theme check` was used.

| Skill | What it told me | What changed because of it |
| --- | --- | --- |
| shopify-liquid-themes | Schema limits, LiquidDoc, `t` for strings, conditions cannot hold filters or compound tests, `render` args cannot take filters | Announcement, panels, About sections all carry LiquidDoc and locale keys. Fixed `contains ... == false` (rewritten as `unless`), `collections[handle \| strip]` (assigned first), 26-character schema name, long option labels. |
| design-system | One shared edge, semantic tokens, no raw hex | `--m-content`/`--m-gutter` shared by announcement bar, header, panels, hero, strip and sections; panel left edge is checked against it. |
| frontend-design | Spend boldness in one place; remove what does not earn its place | The brief's clutter budget was applied: one announcement message, three nav items, two-column panels, six-label switcher; the nav-bar row, 24-link list and gold separators were removed. |
| emil-design-eng | Transform and opacity only; ease-out; pause on hover; reduced motion | The announcement rotates with a 10 px slide and fade, paused on hover and focus, first message static under reduced motion. |
| ui-ux-pro-max | 44 px targets, escape routes, no hover-only, empty states with a path | Switcher and chips are 44 px; panels show no empty heading; About slots are hidden rather than empty; Escape closes panels. |
| banner-design | Safe zones and contrast | Hero scrim setting, mark clear of the headline, headline checked against the header bottom. |
| brand | Voice, confirmed claims only | Copy audited: the old trust badges ("official distributors", 2,000 EGP, an invented returns promise) were rewritten; About text uses only "100% original, sealed", COD, the shipping amount and the returns page link. |
| impeccable | Detector and the critique rubric | Detector clean on new files; critique recorded in docs/final-report-2026-10-25.md. |
| shopify (CLI) | `theme pull` for a read-only diff, `theme push --only` | Live theme pulled read-only to a scratch folder and compared (no editor-managed file differs from the baseline). Nothing was pushed to or changed on the live theme. |

## Earlier entries (retro)

| Date | Change | Skills |
| --- | --- | --- |
| 2026-10-25 | Header "More" overflow panel (blocks/_header-menu.liquid) | shopify-liquid-themes, diagnose (cause: wiped --overflow-count, closed submenu reserving height) |
| 2026-10-25 | Homepage hero, value strip, tiles v1, story, signup band, compare-at price contrast | shopify-liquid-themes, design-system, frontend-design, ui-ux-pro-max, impeccable |
| 2026-10-25 | Product image audit (read-only): scripts and docs/audit/image-audit.csv | shopify (read-only public feed; no GraphQL authored, so no schema validation applied) |

## 2026-10-26
- impeccable: critique of the announcement bar and the Gift block (flat strip; contained card, 16px radius, per the skill's card-radius cap); used its slop checklist for the pointer and bundle cards.
- shopify-liquid / shopify-dev: Liquid doc headers, theme-setting schema, `asset_url` for the cursor PNGs, `{% doc %}` blocks on new snippets.
- design-system: OKLCH moment recipe (scripts/moment-palette.mjs), token-level contrast fixes (--opacity-subdued-text, --color-foreground-muted).
- ui-ux-pro-max: contrast checks (4.5:1 normal, 3:1 large), 44px targets, pointer scoped to fine pointers and off under forced-colors.
- Not yet run: frontend-design, emil-design-eng, banner-design, brand audits for the remaining parts of the brief.
- design-system / frontend-design / impeccable / emil-design-eng (colour flow): tokens (--blend, --s-*), fade strips, no hairlines at joins, hero overlay, the proof script; motion unchanged.
- ui-ux-pro-max / shopify-liquid (card hotfix): colour-scheme opt-out, scheme variable pinning, diagnostic snippet.
- frontend-design / emil-design-eng / ui-ux-pro-max / impeccable (mobile menu): sheet structure from the owner's reference, 44px targets, focus and inert handling, motion limits, reduced motion, RTL; shopify-liquid: doc blocks, container queries for the tile marks, locale keys in en and ar.
