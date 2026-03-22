#!/usr/bin/env bash
set -e

# kitai-ai-agents-system-framework installer
# Usage: bash install.sh [--force]
# Via curl: curl -fsSL https://raw.githubusercontent.com/[OWNER]/kitai-ai-agents-system-framework/main/install.sh | bash

FRAMEWORK_FILES=(
  "AGENTS.md"
  "ACTIVATION_PROMPT.md"
  "FEATURE_INDEX.md"
  "MODULE_MANIFEST_TEMPLATE.md"
  "DEBT_LEDGER.md"
  "REGRESSION_INDEX.md"
)

BASE_URL="https://raw.githubusercontent.com/[OWNER]/kitai-ai-agents-system-framework/main"

FORCE=false
for arg in "$@"; do
  [[ "$arg" == "--force" ]] && FORCE=true
done

DEST_DIR="${PWD}"

# Detect if running from inside the cloned repo (local install)
# BASH_SOURCE[0] is empty or /dev/stdin when piped via curl
SCRIPT_DIR=""
if [[ -n "${BASH_SOURCE[0]:-}" ]] && [[ "${BASH_SOURCE[0]}" != "/dev/stdin" ]]; then
  SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" 2>/dev/null && pwd)"
fi

echo ""
echo "kitai-ai-agents-system-framework"
echo "================================="
echo "Installing to: ${DEST_DIR}"
echo ""

INSTALLED=0
SKIPPED=0

for file in "${FRAMEWORK_FILES[@]}"; do
  dest="${DEST_DIR}/${file}"

  if [[ -f "${dest}" ]] && [[ "${FORCE}" == false ]]; then
    echo "  SKIP  ${file} (already exists — use --force to overwrite)"
    SKIPPED=$((SKIPPED + 1))
    continue
  fi

  # Prefer local copy (running from cloned repo)
  if [[ -n "${SCRIPT_DIR}" ]] && [[ -f "${SCRIPT_DIR}/${file}" ]]; then
    cp "${SCRIPT_DIR}/${file}" "${dest}"
  else
    # Download from GitHub
    if ! curl -fsSL "${BASE_URL}/${file}" -o "${dest}"; then
      echo "  ERROR ${file} (download failed)"
      exit 1
    fi
  fi

  echo "  OK    ${file}"
  INSTALLED=$((INSTALLED + 1))
done

echo ""
echo "Done! ${INSTALLED} file(s) installed, ${SKIPPED} skipped."
echo ""
echo "Next steps:"
echo "  1. Attach these 4 files to your AI session:"
echo "       AGENTS.md"
echo "       ACTIVATION_PROMPT.md"
echo "       FEATURE_INDEX.md"
echo "       MODULE_MANIFEST_TEMPLATE.md"
echo "  2. Copy the Bootstrap Activation Prompt from ACTIVATION_PROMPT.md"
echo "  3. Paste it into your AI session — the agent will scan and bootstrap your project"
echo ""
echo "To force-install via curl (overwrite existing files):"
echo "  curl -fsSL ${BASE_URL}/install.sh | bash -s -- --force"
echo ""
