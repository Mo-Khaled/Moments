#!/usr/bin/env bash
# Pushes the theme files of ONE commit, exactly as they are in that commit, to the live theme.
#   bash scripts/push-commit.sh <commit> [file ...]      (default: every theme file the commit changed)
# Same safety as scripts/push.sh (published theme must match shopify.theme.toml) plus: each live file must equal the
# commit's parent version first, otherwise it stops (someone changed it outside git).
set -e
cd "$(dirname "$0")/.."
c=$1; shift
files=${*:-$(git diff --name-only "$c^" "$c" | grep -E '^(assets|blocks|config|layout|locales|sections|snippets|templates)/')}
expected=$(sed -n '/^\[environments.live\]/,/^\[/{s/^theme = "\([0-9]*\)"/\1/p}' shopify.theme.toml)
published=$(shopify theme list --store dezrva-2z.myshopify.com --role live --json | grep -o '"id": *[0-9]*' | grep -o '[0-9]*' | head -1)
[ "$published" = "$expected" ] || { echo "refusing: published #$published, toml #$expected"; exit 1; }
T=$(mktemp -d); L=$(mktemp -d)
only=""; for f in $files; do only="$only --only $f"; done
shopify theme pull --theme "$expected" --path "$L" $only >/dev/null 2>&1 || true
for f in $files; do
  mkdir -p "$T/$(dirname "$f")"; git show "$c:$f" > "$T/$f"
  if git cat-file -e "$c^:$f" 2>/dev/null; then
    if ! cmp -s <(git show "$c^:$f" | tr -d '\r') <(tr -d '\r' < "$L/$f" 2>/dev/null); then echo "refusing: live $f is not the parent version"; exit 1; fi
  fi
done
shopify theme push --path "$T" --theme "$expected" --allow-live $only 2>&1 | grep -iE "success|error" | head -1
echo "pushed $c: $files"
