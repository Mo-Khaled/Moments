"""One-off: append the carousel and card-backdrop rules to assets/moments.css (kept as a script so the change is reviewable)."""
import os

CSS = """
/* ---------- Product carousels (best sellers and every product list set to "carousel") ----------
   Inside the shared content width with equal gutters, an exact number of cards per breakpoint (4, 3, 2, and 1.15 as an intentional peek on
   phones), a token gap, and one backdrop token for every card. The arrows live in the section header beside "View all" (see
   snippets/moments-carousel-controls.liquid). */
html:root {
  --m-card-gap: 20px;
  --m-cols: 1.15;
  --m-cols-whole: 2;
}

@media screen and (min-width: 750px) {
  html:root { --m-cols: 2; --m-cols-whole: 2; }
}

@media screen and (min-width: 990px) {
  html:root { --m-cols: 3; --m-cols-whole: 3; }
}

@media screen and (min-width: 1200px) {
  html:root { --m-cols: 4; --m-cols-whole: 4; }
}

.section-resource-list .resource-list.resource-list__carousel {
  inline-size: 100%;
  max-inline-size: calc(var(--m-content) + 2 * var(--m-gutter));
  margin-inline: auto;
}

.section-resource-list .resource-list__carousel slideshow-slides {
  gap: var(--m-card-gap);
  padding-inline: var(--m-gutter);
  scroll-padding-inline: var(--m-gutter);
}

.section-resource-list .resource-list__carousel slideshow-slide.resource-list__slide {
  flex: 0 0 calc((100% - (var(--m-cols-whole) - 1) * var(--m-card-gap)) / var(--m-cols));
  inline-size: calc((100% - (var(--m-cols-whole) - 1) * var(--m-card-gap)) / var(--m-cols));
  min-inline-size: 0;
  max-inline-size: none;
  scroll-snap-align: start;
}

/* The carousel's own overlaid arrows are replaced by the header controls. */
.section-resource-list .resource-list__carousel slideshow-arrows {
  display: none;
}

.m-carousel-end {
  display: inline-flex;
  align-items: center;
  gap: 20px;
}

.m-carousel-controls {
  display: inline-flex;
  gap: 8px;
}

.m-carousel-controls button {
  display: grid;
  place-items: center;
  inline-size: 44px;
  block-size: 44px;
  padding: 0;
  border: 1px solid currentcolor;
  border-radius: 9999px;
  background: transparent;
  color: inherit;
  cursor: pointer;
  transition: background-color var(--m-dur-1) var(--m-ease), opacity var(--m-dur-1) var(--m-ease);
}

.m-carousel-controls button:hover:not([disabled]) {
  background: var(--m-plum);
  border-color: var(--m-plum);
  color: var(--m-pearl);
}

.m-carousel-controls button[disabled] {
  opacity: 0.35;
  cursor: default;
}

.m-carousel-controls button:focus-visible {
  outline: 2px solid var(--m-plum);
  outline-offset: 2px;
}

.m-carousel-controls [data-dir='prev'] .m-chevron {
  transform: scaleX(-1);
}

html[dir='rtl'] .m-carousel-controls [data-dir='prev'] .m-chevron {
  transform: none;
}

html[dir='rtl'] .m-carousel-controls [data-dir='next'] .m-chevron {
  transform: scaleX(-1);
}

/* One backdrop token for every card, whatever backdrop the photo came with: the photo is multiplied onto the token and lifted a little
   so a light grey backdrop and a white one both land on the same colour. The bottle stays contained with even padding. */
html:root {
  --m-card-backdrop: var(--m-pearl);
}

.card-gallery {
  isolation: isolate;
  background: var(--m-card-backdrop);
}

.card-gallery img {
  box-sizing: border-box;
  padding: 6%;
  mix-blend-mode: multiply;
  filter: brightness(1.06);
}

@media (prefers-reduced-motion: reduce) {
  .m-carousel-controls button {
    transition: none;
  }
}
"""
root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
path = os.path.join(root, "assets", "moments.css")
s = open(path, encoding="utf-8").read()
if "m-carousel-end" not in s:
    open(path, "a", encoding="utf-8").write(CSS)
    print("appended")
else:
    print("already there")
p = os.path.join(root, "layout", "theme.liquid")
t = open(p, encoding="utf-8").read()
if "moments-carousel-controls" not in t:
    t = t.replace("    {%- render 'moment-cursor' -%}", "    {%- render 'moment-cursor' -%}\n    {%- render 'moments-carousel-controls' -%}", 1)
    open(p, "w", encoding="utf-8").write(t)
    print("layout updated")
