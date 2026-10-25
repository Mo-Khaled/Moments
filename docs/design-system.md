# MOMENTS design system

Status: palette, tokens, type, the Moment marks and the product card are built (Step B items 1 to 3). Header, mega menu, cart drawer, footer, homepage, collection and product pages are still to come and are marked "planned". Every rule has its reason next to it.

Where it lives: `assets/moments.css` (tokens and Arabic rules), `snippets/brand-fonts.liquid` (self-hosted fonts), `snippets/moment-marks-sprite.liquid` and `snippets/moment-mark.liquid` (marks), `snippets/product-name.liquid`, `snippets/product-card-meta.liquid`, `snippets/product-card-badges.liquid`, `blocks/product-title.liquid` (card).

## 1. Tokens: three layers

Components use only the second and third layers. A section or snippet never contains a hex value (a few inherited Horizon files still do; see "Known gaps").

| Layer | What it is | Examples |
|---|---|---|
| 1 Primitive | Raw brand values | `--m-plum #3B1E3A`, `--m-berry #B7406A`, `--m-nude #E9CFC8`, `--m-pearl #FAF6F2`, `--m-taupe #75665E`, `--m-gold-ink #8A6A22`, `--m-gold-light #CDA553`, `--m-berry-ink #8A2F52`, `--m-taupe-ink #5E5048`, `--m-ease`, `--m-dur-1/2/3` |
| 2 Semantic | What a value is for | `--m-surface`, `--m-surface-tint`, `--m-surface-dark`, `--m-text`, `--m-text-muted`, `--m-text-on-dark`, `--m-action`, `--m-action-text`, `--m-accent-rule`, `--m-accent-on-dark`, `--m-rule-quiet`, `--m-price-sale` |
| 3 Component | One component's decision | `--m-badge-ink`, `--m-badge-bg`, `--m-badge-radius`, `--m-mark-ink/-body/-accent/-gold`, `--m-card-name-first/-rest`, `--m-card-meta` |

Page background and text colors still come from the theme color schemes (Customize > Theme settings > Colors), which stay the source of truth; the tokens cover the brand details the schemes do not.

## 2. Color rules and contrast

| Pair | Ratio | Use |
|---|---|---|
| Plum on pearl | 13.6:1 | Body text, headings |
| Taupe ink (#5E5048) on pearl | 7.2:1 | Muted text, card meta |
| Berry ink (#8A2F52) on nude | 5.45:1 | Berry as text (sale price, link hover on nude) |
| Berry (#B7406A) with white text | 5.31:1 | Buttons only |
| Gold ink (#8A6A22) on pearl | 4.69:1 | The badge outline and text, hairlines. Never small text elsewhere |
| Gold light (#CDA553) on plum | 6.35:1 | One highlight per plum band |

- **Berry is the only action color.** It fills buttons; as text it becomes berry ink. Reason: one color means "you can act here".
- **Gold is used only for hairlines, the single badge outline, and one highlight per plum band.** Never as a fill, never in body text. Reason: restraint is what makes it read as a mark of quality.
- Rejected (and why): taupe `#75665E` and berry `#B7406A` as text on nude (3.7:1 and 3.6:1, below AA).

## 3. Type

- Headings: Marcellus (from Shopify's font system, `marcellus_n4`). Body and UI: Readex Pro 300 to 600 (self-hosted variable font, Latin 31 KB). Arabic headings: Alexandria 500 to 600 (Arabic file loads only on Arabic pages). Reason: the brand fonts, loaded without a render-blocking third-party request.
- Scale and sizes come from the theme's type presets; the card adds: name first part 22 px (Marcellus), name second part 13 px (Readex 300, uppercase, 0.1em), meta 13 px.
- **Arabic:** letter-spacing 0 and no uppercase everywhere, body line-height 1.7, headings 1.35. Reason: letter-spacing and capitals break Arabic letter joining. Implemented through theme variables plus one specific selector, with no override flags.

## 4. Spacing, radius and shape

- Spacing uses the theme's spacing scale (`--padding-*`, `--gap-*`); no new scale was added.
- **Pills for actions** (buttons), **square corners for media and badges**. Reason: the contrast between a soft action and a hard, quiet frame guides the eye to what can be pressed.

## 5. Motion

| Token | Value | Use |
|---|---|---|
| `--m-ease` | `cubic-bezier(0.23, 1, 0.32, 1)` | Everything. A strong ease-out feels immediate. |
| `--m-dur-1` | 160 ms | Press feedback, color changes |
| `--m-dur-2` | 240 ms | Mark gestures, hover |
| `--m-dur-3` | 360 ms | Drawers, larger moves (planned) |

Rules: only `transform` and `opacity`; CSS transitions (interruptible), not keyframes; hover effects only under `(hover: hover) and (pointer: fine)`; the durations collapse to about zero under `prefers-reduced-motion`. Motion appears only where it explains state (add-to-cart, drawer, menu, the mark gestures). There is no marquee, parallax or scroll animation.

## 6. Moment marks

Six object marks, no characters: Night (lantern with crescent), Gift (ribbon-tied bottle), All day (sun over a wave line), Daily (lotus bud), Fresh (palm leaf with drops), Love (rose with a drifting petal). One 1.5 px plum line, a nude body, a berry accent, gold at most once (All day only, in the placeholders).

**These are placeholders until an illustrator delivers the final set.** The contract for the final artwork:
- One SVG symbol per mark, viewBox 48 x 48, with groups `mm-body` (main shape), `mm-accent` (the small part that moves) and `mm-detail` (extra line work shown only at the large size, nested inside the group it belongs to). Standalone files use `id="body"`, `id="accent"`, `id="detail"`. File names `moment-night.svg`, `moment-gift.svg`, `moment-allday.svg`, `moment-daily.svg`, `moment-fresh.svg`, `moment-love.svg`.
- Sizes: small 24 px (menu rows, card labels), large 160 px (art on Shop by Moment tiles; the detail layer appears and the gesture amplitude doubles).

| Mark | Gesture (hover) | Moves |
|---|---|---|
| Night | swing 4° (8° large) | the lantern, moon and detail together, pivoting at the top ring |
| Gift | bow scales 1.08 (1.16) | the bow |
| All day | sun rises 3 px (6 px) | the sun and its rays |
| Daily | side petals scale 1.06 (1.12) | the open petals |
| Fresh | leaf sways 3° and the drop falls 4 px (6° / 8 px) | the leaf; the drop |
| Love | petal drifts 6 px and turns 10° (12 px / 20°) | the petal |

- **Hover** (a mouse over the mark or over the card, which carries `data-moment-host`); **touch**: plays once when the mark scrolls into view; **reduced motion**: static. RTL-safe (transforms are symmetric).
- How it works: the marks are one SVG sprite per page (`<use>`); gestures are CSS variables set on the `<moment-mark>` element, which inherit into the sprite, so one shared drawing moves one part.
- **Merchant control:** `moment-mark` accepts an uploaded image or SVG (it replaces the drawing and takes a whole-image version of the gesture) and a gesture choice. Per-menu-item and per-collection editing arrives with the header and tile blocks (planned).
- **Which moment a product shows:** the six moment collections are manual (not tag based), so the card compares the product's collection handles with the theme setting **Moment collections** (comma-separated handles, most specific first: `gift-moment, love-moment, night-moment, all-day-moment, fresh-moment, daily-moment`). A product in several moments shows the first in the list (the fixed tiebreak). The handle gives the mark and the label by name (`night-moment` is the night mark with the word from `moments.night`); any other handle shows the collection title and no mark, so a new moment needs no code.

## 7. Product card

Order, top to bottom: photo with the badge, then the label row (moment mark and word, a thin rule, the brand), then the two-part name, then the price.

- **Two-part name** (the signature device): first word in Marcellus, the rest in Readex 300, uppercase, letter-spaced. Rule: first word, or the first two when the name starts with a number and the next word is one or two letters (9 PM, 9 AM). Titles typed in capitals are normalised to capitalised words; a title that already has lowercase keeps its casing. Arabic splits the same way with no uppercase.
- **Badge** (one style across the theme): square corners, gold outline on the page surface. "Save LE 250.00" appears only when there is a compare-at price and the product is in stock; "Sold out" appears in muted ink with no savings. Reason: a badge on every card carries no information.
- **Brand line** shows the vendor as stored. Vendor casing is cleaned in the later store-data step.
- **Rating slot:** reserved in the plan, not built yet; it will render only when a real review rating exists. No ratings, counts or testimonials are invented.
- **Prices:** one format, `LE 2,250.00`, everywhere (the currency-code switches are off).

## 8. Language bar

`snippets/language-bar.liquid`: mobile-only EN | العربية switch above the header, built with the tokens. The muted language link now passes AA (taupe ink, 7.2:1; it was 3.7:1).

## 9. Accessibility rules (apply to everything)

WCAG AA contrast; visible focus; semantic headings; marks are decorative (`aria-hidden`) unless they are the only content of a link (then `label`); keyboard-operable menu, drawer and quick add; `aria-live` for cart updates (planned); no information by color alone (a badge says "Save" or "Sold out" in words).

## 10. Known gaps (backlog)

- About 60 hex values remain in inherited Horizon files and AI-generated blocks (`ai_gen_block_*` still carry `#000000`-style defaults); they move to tokens as those sections are rebuilt.
- 18 `!important` remain in inherited CSS (`base.css` 11, `rtl.css` 2, snippets and sections 18 counting inline styles); `moments.css` has none.
- The Moment marks are placeholders; the final set from an illustrator replaces `snippets/moment-marks-sprite.liquid` without code changes if the layer contract in section 6 is kept.
- Planned and not built yet: header and mega menu, cart drawer, footer, homepage sections, collection and product pages, the rating slot, large mark tiles.
