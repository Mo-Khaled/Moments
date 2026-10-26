#!/usr/bin/env bash
# Pushes SPECIFIC files to the LIVE theme (environment "live" in shopify.theme.toml, #161294745791). Owner approved live edits
# on 2026-10-26 under the live-safety rules (docs/decisions-log.md). A whole-theme push is refused: --only is required.
#   scripts/push.sh --only sections/hero.liquid --only locales/en.default.json
set -e
cd "$(dirname "$0")/.."
case " $* " in *" --only "*|*" -o "*) ;; *) echo "refusing: pass --only <file> (never push the whole live theme)"; exit 1;; esac
bash scripts/check-traces.sh
shopify theme push -e live --path . --live --allow-live "$@"
