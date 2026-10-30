# Gift-box hero

A MOMENTS gift box that opens as the visitor scrolls, while one bottle (9 PM Night Out by default) rises out of it.
Preview: `https://momentseg.com/?view=hero-box` (the live homepage is unchanged until the owner approves the swap).

## Files
| File | What it does |
|---|---|
| `sections/hero-gift-box.liquid` | The section: copy, buttons, the CSS 3D box, the bottle. Settings and blocks below. |
| `snippets/hero-box-logo.liquid` | The lid logo: the icon with the English wordmark, or the Arabic wordmark on Arabic pages. Generated. |
| `snippets/hero-gift-box-styles.liquid` | Inline styles (no blocking request): box geometry, the scroll-linked progress, phone, reduced-motion and RTL rules. |
| `assets/hero-gift-box.js` | 0.7 KB gzipped. Toggles `will-change` while on screen; drives `--p` only where CSS scroll timelines are missing. |
| `assets/hero-box-pattern.svg` | One 4 KB tile of the signature pattern, tone-on-tone on plum (from the identity kit). |
| `assets/hero-9pm-{front,angle}[-sm].webp` | The transparent bottle cut-outs. |
| `templates/index.hero-box.json` | Preview template: the homepage with only the hero swapped. |
| `scripts/cutout-bottle.py`, `scripts/prepare-hero-box.py` | Rebuild the cut-outs and the pattern and logo from the source files. |
| `scripts/check-hero-box.mjs` | Local render test (states, RTL, reduced motion, WebKit, keyboard, axe, CLS). Screenshots in `docs/design/hero-gift-box/`. |

## How it works
- **First paint** is the closed box: CSS faces, the pattern, the inline logo, the first headline and two buttons, all in the HTML and CSS. Nothing waits for a script or an image, and nothing shifts (CLS 0). The bottle photos load afterwards at low priority.
- **Scroll**: a 300vh track (260vh on phones) holds a sticky 100svh stage. One number, `--p`, runs from 0 to 1 as the track scrolls past. Chrome and Edge drive it with CSS scroll-driven animations; Safari and Firefox get it from the small script (passive scroll listener, one rAF per frame, only while the hero is visible). There's no scroll hijacking or scroll lock.
- Everything reads `--p`, using transform and opacity only:
  - lid: hinges back on its rear edge, from 0.06 to 0.36;
  - bottle: appears from 0.16, rises from 0.22 to 0.64, and swaps from the front to the three-quarter photo between 0.40 and 0.70, with a few degrees of rotateY. Two photos exist, so it's a crossfade, not a turntable;
  - Night glow: grows behind the box from 0.12;
  - headlines: 1 → 2 around 0.3, 2 → 3 around 0.66;
  - box: settles slightly from 0.7.
- **Phones (under 750px)**: by default the section is not shown on phones (setting "Show on phones", off; the owner's choice 2026-10-30) and the previous hero shows instead. With the setting on: no tilt. The box faces the visitor, the lid lifts and leans a little (with the logo on its front band), and the bottle rises.
- **Reduced motion, or the setting off**: `--p` is fixed at 1, so the open box, the standing bottle and the last headline show, with no tall track.
- **Colours**: the stage starts and ends on deep plum `#251224` (the brand strip's colour), so the join below is seamless at every scroll position. The Night glow is radial and fades out before the stage's last rows. Text is pearl on every state, and contrast was checked on all of them. There's no gold: the identity palette has none. The box edge is a nude hairline.
- **Screen readers**: the h1 is headline 1. Headlines 2 and 3 are real text in the DOM but `aria-hidden`, so nothing is announced on scroll. Box faces are `aria-hidden`. The bottle has alt text ("9 PM Night Out by AFNAN, rising out of a MOMENTS gift box").

## Changing things (theme editor > Home > MOMENTS gift-box hero)
- **The bottle**: "Rising bottle (product)" sets the alt text. Upload two transparent cut-outs to "Bottle, front view" and "Bottle, three-quarter view": same bottle, same framing, the bottle filling the image, no white box. To make cut-outs from photos on a light background: `python scripts/cutout-bottle.py photo.jpg out-name`, then check `out-name-check.png` on plum, nude and pearl.
- **Lines**: add a "Headline" block, choose when it shows (1 closed, 2 opening, 3 open) and type the text. Stage 1 also has the line below it. Empty blocks use the defaults in `locales/en.default.json` (`hero_box.*`).
- **Buttons**: add up to two "Button" blocks (label, link, primary or secondary). Without blocks: "Shop gifts" (the `gifts` collection) and "Find your moment" (/pages/moments).
- **Colours**: "Box colour" is plum or deep plum; "Logo colour on the lid" is white or nude. Other colours come from the theme tokens (`--m-plum`, `--moment-night-field`).
- **Animation**: "Open the box on scroll" off shows the static open box.

## Swapping it in (only after the owner's yes)
1. Pull `templates/index.json` from live and diff it with the repo.
2. Minimal merge: add the `hero_box` section (copy it from `templates/index.hero-box.json`), put it first in `order`, and set the old `moments_hero` to `"disabled": true` (kept, not deleted, for a one-step rollback).
3. Push `templates/index.json` only, then run the smoke test, check-colour-flow on `/` and the Lighthouse comparison.

**Rollback** after a swap: set `hero_box` to disabled and `moments_hero` back to enabled (theme editor, or push the previous index.json from git). Deleting the old hero section is a separate step that needs the owner's yes.

## Measurements (2026-10-29)
- Lighthouse mobile (slow 4G, 4x CPU), two runs each, back to back on this PC (antivirus adds noise):

  | | Perf | LCP | TBT | CLS | Images |
  |---|---|---|---|---|---|
  | `/` (current hero) | 57, 55 | 8.2 s, 8.0 s | 300, 310 ms | 0.001 | 440–760 KB |
  | `/?view=hero-box` | 67, 71 | 4.5 s, 4.5 s | 190, 190 ms | 0 | 232 KB |

  Reports: `docs/performance/perf-hero-compare-{1,2}.md`.
- **LCP work (2026-10-29, second pass).** The LCP element is the h1 text, and LCP equals FCP: the headline paints as soon as the page's render-blocking CSS has arrived. The hero's own blocking stylesheet is gone (its styles are inline), the logo paths appear once (SVG symbols), and the bottle images are lazy and low priority, so the first paint waits on nothing from the hero. Two local runs afterwards: LCP 5.2 s and 4.8 s (perf 58 and 54). On this PC that number is dominated by things outside the hero: the antivirus serves the document uncompressed (386 KB instead of about 61 KB with Brotli, roughly 1.6 s of simulated slow-4G download), TTFB varied from 0.5 to 1.1 s, and the theme-wide head CSS (compiled section styles 46 KB, base.css, moments.css, a 29 KB inline colour-scheme block) gates the first paint on every page. PageSpeed Insights (Google's servers) could not be used today: the free API quota was exhausted. Getting under 3 s needs theme-wide work (fewer colour schemes, a smaller head CSS, the 20 KB phone-drawer markup), not the hero.
- Hero payload on a phone: inline CSS 4.2 KB, JS 0.7 KB, pattern 2 KB, inline logo about 5 KB (all gzipped), bottle WebPs 83 KB at 3x density (26 KB at 1x). About 95 KB in total, against a 250 KB target.
- WebKit: Playwright's WebKit on Windows cannot draw 3D transforms at all (a textbook cube renders as one flat face), so it verifies sticky, the script fallback, layout, keyboard and axe, but not the 3D. Check the 3D on a real iPhone or Mac Safari before the swap. If 3D ever flattens, the hero shows a flat front-on box with the lid band, which stays usable.
