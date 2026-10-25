#!/usr/bin/env bash
# Runs the trace check, then pushes to the dev theme (environment "redesign" in shopify.theme.toml).
# The live theme is never a target. Extra arguments are passed through, for example:
#   scripts/push.sh --only sections/hero.liquid --only locales/en.default.json
set -e
cd "$(dirname "$0")/.."
bash scripts/check-traces.sh
shopify theme push -e redesign --path . "$@"
