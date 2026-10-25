# Phase 3 design plan (for your approval before anything is built)

Mockups: `docs/design/phase-3-plan/mockups-full.png` (header and mega menu, homepage), `mockups-mobile.png` (375 px hero, pillars, cart drawer, Skin & Body), `mockups-marks.png` (the six Moment marks). Source: `mockups.html`. All imagery is a marked TODO slot; all copy is draft; prices shown are example values already in the store.

Skills used for this plan: ui-ux-pro-max (e-commerce patterns, accessibility rules), brand (voice), design-system (token layers), frontend-design (plan-and-critique pass), banner-design (hero composition; its AI image generation and Pinterest research steps were not used, because you have no photography to generate against and the result would be placeholder art).

## 1. Direction in one paragraph

MOMENTS is an Egyptian shop for original, sealed fragrance, organized by occasion. The design says that plainly: a quiet pearl page, plum for weight, nude for warmth, berry only where someone acts, and a thin aged-gold rule where the page needs a pause. The idea of "moments" lives in the structure (six occasions as the main navigation axis, a moment label on every product) and in one illustrated device, the Moment marks, not in decoration. The one memorable thing is the product name treatment; everything else stays disciplined.

## 2. Tokens (three layers, no hex in sections)

| Layer | Examples |
|---|---|
| Primitive | `--plum #3B1E3A`, `--berry #B7406A`, `--nude #E9CFC8`, `--pearl #FAF6F2`, `--taupe #75665E`, `--gold-ink #8A6A22`, `--gold-light #CDA553`, `--berry-ink #8A2F52` |
| Semantic | `--surface` (pearl), `--surface-tint` (nude), `--surface-dark` (plum), `--text` (plum), `--text-muted` (#5E5048), `--action` (berry), `--rule` (gold-ink), `--rule-quiet` (#DCB9B0) |
| Component | `--card-name-first`, `--badge-outline`, `--pillar-rule`, `--drawer-progress`, set per component from semantic tokens |

Contrast (checked): plum on pearl 13.6:1; berry-ink on nude 5.45:1; text-muted on pearl 7.2:1; pearl on berry button 4.94:1; gold-ink on pearl 4.69:1 (rules, outlines, large text only); gold-light on plum 6.35:1 (plum bands only).

**Gold, as you specified:** hairlines (section rules, pillar strip, plum band top), one badge outline (the Save badge), one highlight per plum band. Never as a fill, never on text smaller than 18 px except the Save badge. **Berry stays the only action color.**

## 3. Type

- Headings: Marcellus. Body and UI: Readex Pro (300 to 600). Arabic headings: Alexandria. Kept, as you asked; they are the brand fonts and now load without Google.
- Scale (fluid, Latin): display 40 to 64, h2 28 to 38, h3 22 to 26, body 16, small 14, label 12.5. Line-height 1.05 to 1.15 for display, 1.5 for body.
- Arabic: line-height 1.7 for body and 1.35 for headings, `letter-spacing: 0`, no uppercase transform, headings in Alexandria 500.
- Latin uppercase is used in one place only: the second part of a product name.

## 4. Signature elements (documented in `docs/design-system.md` when built)

1. **Section header:** heading plus a 56 px gold rule under it, and one quiet "View all" link opposite (inline-end). No eyebrow labels, no numbers.
2. **Product card and the name device.** Photo, then a moment label (mark plus word), then a two-part name, then price.
   - Name rule: first word (or "9 PM" when the name starts with a number) in Marcellus 24 px; the rest in Readex Pro 300, 14 px, uppercase, letter-spaced (Latin only, never on Arabic). Examples: **Rare** / REEF, **Supremacy** / COLLECTOR'S EDITION, **9 PM** / NIGHT OUT.
   - **Sale badge** only when a compare-at price exists; it states the saving ("Save LE 250"), outlined in gold, not a filled pill. Sold-out items get muted media and the words "Sold out" in place of the price, no badge.
   - **Rating slot:** present in the markup, rendered only when a real rating metafield exists. With no review app today it renders nothing. No ratings, counts or testimonials are invented.
   - Same card in collections, search, recommendations and the cart line (the cart uses the name device without the photo frame).
3. **One badge style** (gold outline, square corners) and **one radius rule:** pills for actions, square for media and badges.
4. **One motion language** (section 7).

## 5. Layout concepts (revised 2026-10-25: identity reset)

The homepage is organised around one idea: **the site changes with the moment.** Six moments (Night, Gift, All day, Daily, Fresh, Love).
Order: continuous announcement ticker, header, full-bleed hero (one slide per moment, opening on the visitor's local hour), brand
marquee, Shop by Moment (large colour blocks), best sellers carousel, a full-bleed Gift colour block, a story band that takes the
active moment's colour, email band. The pillar strip is gone as its own row: its facts live in the ticker and the footer.
One content width and one gutter (`--m-content`, `--m-gutter`) are shared by every band so edges line up. Left-aligned content
throughout (it mirrors in RTL). Photography, when it exists, is shown uncropped (fit mode, contain frames); colour fields and the
Moment marks carry the page until then.


### Clutter budget (enforced by `scripts/check-home.mjs`)
- Announcement bar: one message visible at a time (a slim rounded bar, rotating, three messages at most).
- Header: at most three primary items (Shop by Moment, Brands, Gifts as the accent link), plus search, account and cart.
- Panels: at most three columns, at most four links per column, no empty heading, nothing outside the shared gutter.
- Hero: one headline, one filled button, one outlined button, one pill tag, and the moment switcher with visible labels. Nothing else on the media.
- No separators, icons or underlines used as decoration where spacing does the job.

## 6. Moment marks (placeholders until an illustrator delivers)

Six object marks, no characters: Night (lantern with crescent), Gift (ribbon-tied bottle), All day (sun over a wave line), Daily (lotus bud), Fresh (palm leaf with drops), Love (rose with a drifting petal). One 1.5 px plum stroke, nude body, berry accent, gold at most once per mark (All day only, in the placeholders).
- Files: `moment-night.svg`, `moment-gift.svg`, `moment-allday.svg`, `moment-daily.svg`, `moment-fresh.svg`, `moment-love.svg`; each has `<g id="body">` and `<g id="accent">`.
- Used in the mega menu rows, the Shop by Moment tiles and the product card's moment label. Inline SVG through a snippet (no JS libraries, no video or GIF).
- **Gestures** (CSS transforms on one layer, 160 to 360 ms, shared easing): Night body swings 4 degrees; Gift bow scales 1.08; All day sun rises 3 px; Daily side petals open 6 degrees; Fresh leaf sways 3 degrees and the drop falls 4 px; Love petal drifts 6 px.
- Touch: runs once when the mark scrolls into view (IntersectionObserver), otherwise static. `prefers-reduced-motion`: always static. RTL-safe (transforms are symmetric or mirrored via logical properties).
- Merchant editing: a block setting per menu item or collection card for the SVG or image and a "gesture" select, so a new moment needs no code.

## 7. Motion (revised 2026-10-25: lively motion is now allowed, still purposeful)

Allowed and built: two continuous tickers (announcement bar and brand marquee; CSS transform only, pause on hover and focus,
reversed in RTL, static under reduced motion), the hero (looping video on desktop after the poster, very slow transform-only drift
on slides without footage, crossfade between moments), the accent takeover (colour transitions on `--m-live`), the Moment mark
gestures, press feedback on tiles and buttons. After approval: the Moment cursor companion and the search-overlay shortcuts.
Rules unchanged: transform, opacity and colour only; nothing moves under `prefers-reduced-motion`; no layout shift; no
scroll-jacking; no parallax; nothing auto-advances faster than 6 s (the hero does not auto-advance at all).
Tokens: `--m-ease: cubic-bezier(0.23, 1, 0.32, 1)`, durations 160 / 240 / 360 ms.

## 8. Voice (EN now; AR needs a native pass)

Short, confident, a little playful, no filler. Name things by what the shopper does. Examples:

| Where | EN | AR (draft, to be reviewed) |
|---|---|---|
| Hero | Every moment has its scent. | لكل لحظة عطرها. |
| Pillar | Pay when it arrives. | ادفع عند الاستلام. |
| Empty cart | Nothing here yet. Start with a moment. | السلة فارغة. ابدأ من إحدى اللحظات. |
| Free shipping | You are LE 750.00 away from free shipping. | متبقي 750.00 جنيه على الشحن المجاني. |
| Sold out | Sold out | نفدت الكمية |

Avoid: "elevate", "discover the magic", fake urgency, countdowns. No copy borrowed from the dossier.eu reference; only its structure (pillars, intent navigation, name device, progress bar, rating slot) is adapted.

## 9. What I am deliberately not doing (revised 2026-10-25)

Purple or blue gradient heroes, glass cards, glows, a row of identical icon-title-text cards, emoji icons, one shadow on every card,
stacked popups, countdown timers, fake ratings or testimonials, motion on everything, cover-cropped product photographs.
No longer excluded: marquees (the two tickers), a video hero, lively motion (section 7). Moment gradient fills are surfaces tied
to the six moments, not decoration. The one gold device per band and the name treatment remain the only flourishes.

## 10. Build order (after your approval)

1. Tokens and `docs/design-system.md` (consolidate `moments.css` and the theme variables; remove the four `!important`).
2. Moment marks as placeholder SVGs plus the snippet and block settings.
3. Product card (name device, moment label, badge, rating slot), used in collections, search, recommendations, cart.
4. Header and mega menu, then cart drawer and footer.
5. Homepage sections, then collection and product pages.
6. Per page: EN and AR at 375, 768, 1440 with the drawer open and empty; `shopify theme check`; Lighthouse; impeccable critique of each finished page; emil-design-eng pass on the gestures.
7. After approval of the design: vendor cleanup, then the alt-text rewrite, each as its own reviewable step.

## 11. Decisions I need from you

1. **Approve or change** the direction, the name device, the layouts and the six marks (placeholders).
2. **Moment label data.** Cards need to know each product's moment. Options: (a) a product metafield `moments.primary` (needs a metafield definition, a store change I will not make without your approval, and then filling it for about 760 products), or (b) derive it from the six moment collections the product belongs to (no store change, a small render cost per card). I recommend (b) to start, with (a) as an override later.
3. **Navigation structure.** The mega menu needs the Shop by Moment menu item to have six child links, and Skin & Body to have Daily Care and Skin Moments. These are store navigation changes. Menus are shared with the **live** theme, and the `skin-body` template exists only in the dev theme, so changing them now would point the live site at a page the live theme cannot render properly. **I have therefore held the menu edits and the new `skin-body` page** (your decision 6) until the theme is published. Tell me if you want them applied earlier anyway.
4. **Brand story and authenticity section:** I will not write facts about the company. Send the real story, years, sourcing and any certificates, or approve a TODO placeholder.
5. **Footer phone, support email, and the true exchange policy** are still placeholders (`TODO_PHONE`, `TODO_SUPPORT_EMAIL`, neutral "Returns & exchange policy" wording).
6. **Hero and moment photography** is still needed; the plan uses TODO slots.
