#!/bin/bash
set -euo pipefail

# Only run in Claude Code on the web (remote) environments.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

# Install poppler-utils so PDF tools (pdftotext, pdftoppm) are available.
# Idempotent: skip if already installed.
if ! command -v pdftotext >/dev/null 2>&1; then
  apt-get update
  apt-get install -y poppler-utils
fi
