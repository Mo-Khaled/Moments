> **STATUS 2026-11-06 (supersedes the status below).** **Live = "moments-redesign + moment pages" #161651720383 (role main).** Previous live theme: `moments-redesign` #161294745791 (unpublished, keep); "Copy of moments-redesign" #161628979391.
> Push with `bash scripts/push.sh --only <files>`: it refuses when the published theme is not the one in shopify.theme.toml. To roll back to the previous live theme: Admin, Themes, moments-redesign (#161294745791), Publish.

> **STATUS 2026-10-26 (supersedes the dev/live wording below).** The owner approved editing the LIVE theme directly.
> **Live = `moments-redesign` #161294745791 (role main).** Previous live theme, kept as a backup, never deleted: #161251229887 "MOMENTS - Homepage v2".
> Fresh backup of the live theme made before the enhancement pass: #161334263999 "MOMENTS - Backup 2026-10-26 11-47" (refresh before each risky batch).
> Pushes go file by file: `shopify theme push -e live --only <files> --live --allow-live`, one feature per push, logged in `docs/live-pushes.md`.

# Backup and rollback plan (nothing here has been run)

## 1. Before publishing: make the backup (needs your yes, it is a store change)
Admin, Online Store, Themes, find **MOMENTS - Homepage v2** (the live theme, #161251229887), open "..." and choose **Duplicate**.
Rename the copy **MOMENTS - Backup before redesign 2026-10-25** (use the real date of publishing). Do not publish or edit it.
CLI alternative: `shopify theme duplicate --store dezrva-2z.myshopify.com --theme 161251229887`, then rename it in the admin.
I will not create this myself until you say so.

## 2. Publish (only after you send the word "publish")
Admin, Themes, **moments-redesign** (#161294745791), "..." , **Publish**. CLI: `shopify theme publish --store dezrva-2z.myshopify.com --theme 161294745791`
(it asks for confirmation).

## 3. Roll back (any time, about one minute)
Admin, Themes, find **MOMENTS - Backup before redesign <date>**, "..." , **Publish**. The store is back as it was. Nothing in the
store data was changed by the redesign, so there is nothing else to undo: products, collections, menus, policies and languages are untouched.
CLI: `shopify theme publish --store dezrva-2z.myshopify.com --theme <backup theme id>`.
If the backup was not made: the baseline theme files are in git (`git show efa522a:<path>`; first commit "baseline snapshot of theme as received");
`git checkout efa522a -- .` followed by a push to a new unpublished theme recreates it for publishing.

## 4. After rollback
Keep the dev theme; nothing is lost. Tell me what failed and I fix it on the dev theme.

## 5. Rollback while editing live (2026-10-26)
Fast path, one file or a batch: push the previous commit's versions of the same files, `git show <commit>~1:<path> > <path>` then
`shopify theme push -e live --only <files> --live --allow-live`, then re-run the smoke test.
Whole-theme path: Admin, Themes, publish **MOMENTS - Backup 2026-10-26 11-47** (#161334263999), or the older #161251229887.
Nothing in store data is touched by theme pushes.

## 6. Backups (newest first)
- #161337540799 "MOMENTS - Backup 2026-10-26 13-43 pre colour-flow" (unpublished): live as it was before the colour-flow work.
- #161334263999 "MOMENTS - Backup 2026-10-26 11-47" (unpublished).
- #161251229887 "MOMENTS - Homepage v2" (the original live theme).
- #161340850367 "MOMENTS - Staging mobile menu 2026-10-26 15-23" (unpublished): staging copy of live used to test the mobile menu through ?preview_theme_id=161340850367 before it goes live.
