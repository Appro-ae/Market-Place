#!/usr/bin/env bash
# Runner for the portal test agent.
# Resolves the globally-installed Playwright and Chromium in this environment,
# then runs the agent. Pass HEADLESS=false to watch it.
set -euo pipefail

cd "$(dirname "$0")"

# Use the pre-installed Playwright / Chromium if a local one isn't present.
if [ ! -d node_modules/playwright ]; then
  export NODE_PATH="${NODE_PATH:-}:/opt/node22/lib/node_modules"
fi

# Chromium is pre-provisioned in this environment; don't try to download it.
export PLAYWRIGHT_BROWSERS_PATH="${PLAYWRIGHT_BROWSERS_PATH:-/opt/pw-browsers}"
export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD="${PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD:-1}"

exec node agent.js "$@"
