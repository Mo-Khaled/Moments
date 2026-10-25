# Docs index

Start here: [final-report.md](final-report.md) (what was done, what passed, what is weak, what is needed), then
[needs-from-owner.md](needs-from-owner.md).

| Area | File | What it is |
| --- | --- | --- |
| Decisions | [decisions-log.md](decisions-log.md) | Every judgment call made while you were away, with how to revert it |
| Owner tasks | [needs-from-owner.md](needs-from-owner.md), [about-todo.md](about-todo.md) | Facts, footage and store changes only you can supply or approve |
| Skills | [skills-log.md](skills-log.md) | Which skill was used for which change, and what it changed |
| Design | [design-system.md](design-system.md), [design/phase-3-design-plan.md](design/phase-3-design-plan.md) | Tokens, components, the plan and the clutter budget |
| Audit | [audit/](audit/) | Phase 1 audit, Haramain trace report, translation review, image audit (CSV), store write proposals, navigation changes |
| Assets | [assets/image-credits.md](assets/image-credits.md) | Where each image on the site comes from and its status |
| Performance | [performance/](performance/) | Lighthouse notes |
| Release | [release-checklist.md](release-checklist.md), [rollback.md](rollback.md) | Pass/fail list and the exact backup and rollback steps |
| Cleanup | [cleanup-log.md](cleanup-log.md) | What was removed and why, with how to restore each item |
| History | [phase-2-changelog.md](phase-2-changelog.md) | The Phase 2 bug-fix log |
| Evidence | [screenshots/](screenshots/) | Before and after screenshots (hero, tiles, tickers, About, identity reset, header fix) |

Scripts live in [../scripts/](../scripts/): `push.sh` (push to the dev theme after the trace check), `check-traces.sh`,
`check-tiles.mjs` and `check-home.mjs` (Playwright, installed once in `scripts/` with `npm install`), `prepare-brand-logos.py`,
`prepare-video.mjs` (needs ffmpeg), `probe-cls.mjs`.
