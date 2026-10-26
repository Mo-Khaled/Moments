# Cleanup log (branch cleanup/2026-10-25)

Rule: a file is removed only when nothing renders, includes or references it across layout, sections, snippets, blocks, templates,
config, assets and locales, and it cannot be added from the theme editor. Anything uncertain is kept and listed as a candidate.
Every group below is one commit and can be reverted with `git revert <commit>` (or restored from the main branch).

## Removed

| Group | Items | Why safe | Restore |
| --- | --- | --- | --- |
| Unused snippets | `mega-menu`, `mega-menu-list`, `util-mega-menu-img-sizes-attr` | The header now renders `moments-mega`; no file renders the old three. Found by scanning every `render` and `include` tag, iterating until nothing new was orphaned. Verified by the before/after screenshots (see below). | `git revert bcb3929` (then re-add `filters-toggle` is NOT needed: it was restored) |
| Superseded section | `sections/moments-pillars.liquid` | Replaced by the announcement bar and the About trust strip; no template references it (the pillar row was removed by request). It had no editor presets in use. | same commit |
| Orphan locale keys | 11 keys under `homepage.*` and `about.*` in `en.default.json` and `ar.json` (hero headline/primary/photo_todo, moments image_todo/find, mega moments/brands/discover, trust cod_link, signup heading/text) | No file references them (static or built dynamically). Both locale files changed together. | same commit |
| Removed earlier in this branch of work | `snippets/moments-diamond` (orphaned after the ticker change) | `theme check` reported it orphaned | git history |

## A removal that was wrong, and was reverted
`snippets/filters-toggle.liquid` looked unused: no `render` or `include` anywhere in the baseline names it. The before/after screenshot
diff caught that removing it changed the desktop collection layout (the filter sidebar became a "Filter" toggle and the page grew
from 3404 to 3705 px at 1920). Restoring it brought the page back to 3404 px. **Lesson: a snippet no file names is not proof it is unused in this theme (the theme
reaches it indirectly).** It is kept. The same visual-diff check is the gate for any further removal.

## Candidates (kept, not proven unused)

- `filters-toggle` (see above): kept, used indirectly.

- `ZooomyListWishlistColl`, `ZooomyListWishlistProduct`: wishlist app snippets, pending your confirmation of whether the app is installed.
- Every block and section a merchant could still add from the theme editor, and anything referenced by editor-managed JSON
  (`settings_data.json`, `templates/*.json`, `*-group.json`, `markets.json`) or by the live theme.
- `assets/jsconfig.json` (editor support file, 271 bytes).
- `!important` in `snippets/price.liquid` (three rules around the compare-at price): they override a base-theme rule; removing them
  changes specificity and was not done under the "no visual change" rule. Planned for a styled rewrite of the price block.
- Predictive-search CSS-scope warnings from `theme check` (base theme): unchanged.

## Not touched on purpose
No locale file was deleted. `docs/audit` and `docs/screenshots` are kept as evidence. No media was moved or deleted.
`.gitignore` now also covers build output, scratch folders and raw video.

## 2026-10-26: repo cleanup (branch repo-cleanup)
- docs/screenshots: 168 MB of generated screenshots removed from the tree (regenerable with the scripts; still in git history). One reference image kept (moment-marks.png) and a README saying which script makes which set. `docs/screenshots/*` is now git-ignored.
- docs/design and docs/performance: 33 intermediate run reports removed (colour-flow drafts and re-runs, card-layout runs); the latest of each kept (colour-flow-baseline.md, colour-flow-home.md, card-layout.md, contrast-report.md, card-matrix.md, seams-audit.md) plus the before and after performance reports. Generated report patterns are git-ignored.
- scripts: 21 one-off probes and screenshot helpers removed (probe-card*, probe-bundle*, probe-recs*, probe-corners, probe-rtl, probe-terms, probe-cls, probe-carousel, probe-section-api, shot-desktop-menus, shot-pagination, shot-recs-iphone, shots-final, append-carousel-css.py, blend-draft.css, blend-test-overrides.css); probe-menu-stuck.mjs became check-menu-hover.mjs. A scripts/README.md lists what remains.
- sections: moments-promises, moments-split, moments-trust and moments-about-hero removed (superseded, referenced by no template). Not pushed: the live theme still has its copies; they can be removed from the store later.
- build/ (ignored build output, 1.6 MB) deleted; regenerate with scripts/normalize-images.py.
- Left alone on purpose: the theme's own sections, blocks and snippets (the theme editor offers them), the brand logo and cursor files (loaded by computed names), filters-toggle (used indirectly), the Zooomy wishlist snippets (written by an app), `.claude/skills` (project skills).
