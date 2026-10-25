#!/usr/bin/env bash
# Fails if any theme file contains a trace of the other store (Haramain).
# Scans only the theme folders (not docs/ or scripts/, which describe the traces).
# Usage: scripts/check-traces.sh        (exit 1 on any hit)

set -u
cd "$(dirname "$0")/.." || exit 2

DIRS=(assets blocks config layout locales sections snippets templates)

# English, Arabic, URL-encoded Arabic, phone formats, emails, address and history fragments.
TERMS=(
  'haramain'
  'haramayn'
  'haramaineg'
  'haramaincs'
  'الحرمين'
  'حرمين'
  '%D8%AD%D8%B1%D9%85%D9%8A%D9%86'
  '121[ .-]?181[ .-]?8144'
  '1211818144'
  '201103305575'
  '01103305575'
  'info@haramaineg'
  'haramaincs@'
  'el ataba'
  'العتبة'
  'garage 7'
  'el bosta'
  'since 2002'
  'est\.? 2002'
)

PATTERN=$(IFS='|'; echo "${TERMS[*]}")

hits=$(grep -rniE --binary-files=without-match \
  --exclude='*.woff2' --exclude='*.png' --exclude='*.jpg' --exclude='*.webp' \
  -e "$PATTERN" "${DIRS[@]}" 2>/dev/null)

if [ -n "$hits" ]; then
  echo "TRACE CHECK FAILED: found terms from the other store:"
  echo "$hits" | cut -c1-200
  exit 1
fi

echo "trace check passed: no other-store terms in ${DIRS[*]}"
