# Cleanup log (branch cleanup/2026-10-25)

Rule: a file is removed only when nothing renders, includes or references it across layout, sections, snippets, blocks, templates,
config, assets and locales, and it cannot be added from the theme editor. Anything uncertain is kept and listed as a candidate.
Every group below is one commit and can be reverted with `git revert <commit>` (or restored from the main branch).

## Removed

| Group | Items | Why safe | Restore |
| --- | --- | --- | --- |
| Unused snippets | `mega-menu`, `mega-menu-list`, `util-mega-menu-img-sizes-attr`, `filters-toggle` | The header now renders `moments-mega`; no file renders the old four. Found by scanning every `render` and `include` tag, iterating until nothing new was orphaned. | `git revert bcb3929` |
| Superseded section | `sections/moments-pillars.liquid` | Replaced by the announcement bar and the About trust strip; no template references it (the pillar row was removed by request). It had no editor presets in use. | same commit |
| Orphan locale keys | 11 keys under `homepage.*` and `about.*` in `en.default.json` and `ar.json` (hero headline/primary/photo_todo, moments image_todo/find, mega moments/brands/discover, trust cod_link, signup heading/text) | No file references them (static or built dynamically). Both locale files changed together. | same commit |
| Removed earlier in this branch of work | `snippets/moments-diamond` (orphaned after the ticker change) | `theme check` reported it orphaned | git history |

## Candidates (kept, not proven unused)

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
