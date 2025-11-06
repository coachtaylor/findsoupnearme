#!/usr/bin/env bash
#
# Convenience wrapper to pull Tier-2 Filipino cuisine targets
# Usage: ./scripts/run-filipino-collector.sh [env_file]

set -eo pipefail

ENV_FILE="${1:-.env.local}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

run() {
  local city="$1"
  echo "=== Collecting Filipino restaurants in ${city} ==="
  node --env-file="${ENV_FILE}" "${ROOT_DIR}/scripts/cuisine-collector.js" specific "Filipino" "${city}"
  echo ""
}

run "San Diego, CA"
run "Los Angeles, CA"
run "Phoenix, AZ"
run "Seattle, WA"

echo "🎯 Filipino cuisine collection complete."
