#!/usr/bin/env bash
# Pushes SPECIFIC files to the LIVE theme (environment "live" in shopify.theme.toml, #161651720383). Owner approved live edits
# on 2026-10-26 under the live-safety rules (docs/decisions-log.md). A whole-theme push is refused: --only is required.
# Refuses when the store's published theme is not the theme in shopify.theme.toml (on 2026-11-06 a different theme had been
# published and a push meant for #161294745791 went to #161651720383): update the toml after checking, then push.
#   scripts/push.sh --only sections/hero.liquid --only locales/en.default.json
set -e
cd "$(dirname "$0")/.."
case " $* " in *" --only "*|*" -o "*) ;; *) echo "refusing: pass --only <file> (never push the whole live theme)"; exit 1;; esac
expected=$(sed -n '/^\[environments.live\]/,/^\[/{s/^theme = "\([0-9]*\)"/\1/p}' shopify.theme.toml)
published=$(shopify theme list --store dezrva-2z.myshopify.com --role live --json | grep -o '"id": *[0-9]*' | grep -o '[0-9]*' | head -1)
if [ -z "$published" ] || [ "$published" != "$expected" ]; then
  echo "refusing: the published theme is #${published:-unknown}, shopify.theme.toml names #$expected"
  exit 1
fi
bash scripts/check-traces.sh
shopify theme push -e live --path . --theme "$expected" --allow-live "$@"
