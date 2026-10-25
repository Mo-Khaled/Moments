# Phase 2 change log

Scope: dev theme `moments-redesign` (#161294745791) only. The live theme (#161251229887) was never a target. Every change below was pushed with `shopify theme push -e redesign --only <files>`. No store data was written.

## Commits (one concern each)

| Commit | Change | Files |
|---|---|---|
| fix(i18n): add 20 missing Arabic keys | en and ar now match key for key (theme-check MatchingTranslations for en/ar: 15 to 0) | `locales/ar.json` |
| fix(home): Find Your Moment goes to /pages/moments | Second hero button no longer duplicates the first | `templates/index.json` (editor-managed) |
| fix(hero): TODO image slot instead of demo illustration | The hikers artwork was Shopify's built-in `hero-apparel-1` placeholder, shown because no hero image is set | `snippets/hero-image-slot.liquid` (new), `sections/hero.liquid`, `locales/en.default.json`, `locales/ar.json` |
| fix(hero): dark slot, label moved to a corner | White hero text was unreadable on the first light version | `snippets/hero-image-slot.liquid` |
| fix(home): visible Sign up label | Arrow-only button had no text | `templates/index.json` (editor-managed) |
| fix(footer): editable phone and email, no other store's defaults | `info@haramaineg.com` and a fake phone were schema defaults; live values were blank. Now `TODO_PHONE`, `TODO_SUPPORT_EMAIL`. Hours "10:00 AM - 10:00 PM" already existed in the block settings and are kept | `blocks/ai_gen_block_23ace36.liquid`, `sections/footer-group.json` (editor-managed) |
| feat(pages): Skin and Body coming soon template | Brand statement, signup with visible label, "Line has launched" switch with collection picker | `templates/page.skin-body.json` (new), `sections/coming-soon-gate.liquid` (new), `locales/en.default.json`, `locales/ar.json`, `locales/en.default.schema.json` |
| fix(a11y): berry and taupe text contrast on nude | scheme-4 link hover 3.60 to 5.45:1; scheme-7 link hover 4.14 to 5.82:1; sale price text uses berry ink (5.45:1 on nude) | `config/settings_data.json` (editor-managed), `assets/moments.css` |
| feat(i18n): ar.schema.json | 1,039 editor labels, same keys as `en.default.schema.json`, links and placeholders verified | `locales/ar.schema.json` (new) |
| docs | Phase 1 audit, accent mockup, store data proposals, alt text scan script | `docs/audit/*` |

## Editor-managed JSON touched

- `templates/index.json`: hero button link value; signup `display_type` arrow to text.
- `sections/footer-group.json`: footer contact block `phone` and `email` values.
- `config/settings_data.json`: `primary_hover` in scheme-4 and scheme-7.
- `templates/page.skin-body.json`: new file; created from the homepage signup section.

All four were validated by `shopify theme check` (no JSON errors) and pushed to the dev theme. Before publishing, re-pull the live theme and diff these files so no merchant edits made in the editor are lost.

## theme-check

Excluding drift in non-en/ar locales (ignored per your instruction):

| | Baseline | Now |
|---|---|---|
| Errors | 19 | 4 |
| Warnings | 86 | 86 |

The 4 remaining errors are the 3 ParserBlockingScript (Zooomy, da-restock) and 1 LiquidHTMLSyntaxError (`product-scent-notes`, a false positive). Warnings are unchanged and grouped by area in the Phase 1 audit for the Phase 4 pass. Adding keys to `en.default.json` raises the ignored non-en/ar drift count (87 to 253).

## Findings that changed since Phase 1

- **Bug 2 ("Add Added", "0 0") is not a visual bug.** One add-to-cart click on the dev preview: drawer opened, cart count 1, bubble showed "1", button showed only "Add to cart" (the "Added" label stays at opacity 0). Both strings appear together only in text extraction. The test cart was cleared. No code change made.
- **Daily Care page (the old Skin & Body target) is a live deodorant and perfume list**, not an incense copy as the audit said. Re-pointing the menu hides it. See the proposals doc.
- **Returns policy conflicts with a homepage badge.** `/pages/returns-exchange-policy` says "No Exchanges"; the homepage trust strip says "Easy Exchange". Not changed (business decision).
- **ar.json base translations look machine-generated and some are wrong** (examples: `actions.submit` is "يُقدِّم", `actions.sort` is "نوع", `placeholders.search` is "يبحث", `fields.separator` is "ل"). The file header says the Shopify admin language editor owns it, so I only added missing keys. A correction pass is a separate task.

## Skipped or waiting on you

| Item | Status |
|---|---|
| Accent color | Held for Phase 3. Your message had an unfilled choice. Nothing built with gold or oud yet. |
| Footer phone and email | Placeholders `TODO_PHONE`, `TODO_SUPPORT_EMAIL`. Your message had unfilled fields. |
| Zooomy wishlist and back-in-stock | Untouched. Your message had an unfilled keep/remove choice. |
| Vendor renames | Proposed only (`docs/audit/phase-2-store-data-proposals.md`). Also requires updating 34 smart collection rules. |
| Alt text rewrite | Proposed only: 538 images on 519 products carry "الحرمين مصر", 331 are blank, 30 name other brands. |
| Nav changes (Gifts, Skin & Body) | Proposed only. They are store navigation data. |
| Empty collections `morning-moments`, `work-moments` | Nothing to hide: not in any menu or theme file. |
| Template deletion | None deleted. Unused: `collection.womaaaa`, `collection.mann`, `page.oud`. |

## Open questions

1. Accent: gold, oud or other?
2. Footer phone number and support email.
3. Apps: keep, restore rendering, or remove Zooomy and back-in-stock?
4. Approve the vendor table, the alt text pattern, and the two navigation changes?
5. Where should the deodorants list live once Skin & Body points at the coming-soon page?
6. Hero photography: when do you expect it? The TODO slot stays until then.
