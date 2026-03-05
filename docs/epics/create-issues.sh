#!/usr/bin/env bash
# Creates GitHub issues from epic markdown files.
# Usage: ./create-issues.sh [--repo owner/repo] [--label epic]
# Requires: gh CLI authenticated (gh auth login)

set -euo pipefail

LABEL="epic"
REPO_FLAG=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --repo) REPO_FLAG="--repo $2"; shift 2 ;;
    --label) LABEL="$2"; shift 2 ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

for file in "$SCRIPT_DIR"/epic-*.md; do
  # Skip the template
  [[ "$file" == *"epic-template.md" ]] && continue

  # Extract title from first heading (# Epic: ...)
  title=$(grep -m1 '^# Epic:' "$file" | sed 's/^# Epic: *//')

  if [[ -z "$title" ]]; then
    echo "Skipping $file: no '# Epic:' heading found"
    continue
  fi

  echo "Creating issue: Epic: $title"

  # shellcheck disable=SC2086
  gh issue create \
    $REPO_FLAG \
    --title "Epic: $title" \
    --body-file "$file" \
    --label "$LABEL"

  echo "Done: Epic: $title"
done
