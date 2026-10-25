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
