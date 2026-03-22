# kitai-ai-agents-system-framework Production Release Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the existing 6-file AI Agent framework into a fully production-ready public GitHub repository with 3 installation methods, realistic examples, and complete OSS scaffolding.

**Architecture:** Pure markdown framework with two lightweight installer scripts (bash + Node.js). No build step, no dependencies beyond Node.js built-ins for the npm package. All 26 new files are static — no generation, no templating engine.

**Tech Stack:** Bash (install.sh), Node.js built-ins only (index.js), Markdown (all other files)

**Spec:** `docs/superpowers/specs/2026-03-22-production-release-design.md`

---

## File Map

### New files to create (26 total)

```
Root level:
  README.md                                    — Primary project page
  LICENSE                                      — MIT license
  CHANGELOG.md                                 — Framework version history (v1.0.0)
  .gitignore                                   — OS + Node + editor + secrets
  install.sh                                   — curl-based shell installer
  package.json                                 — npm package config
  index.js                                     — npm bin script (Node.js installer)

Documentation:
  docs/QUICK_START.md                          — Step-by-step solo + team guide

Examples:
  examples/README.md                           — How to read examples
  examples/nodejs-api/PROJECT_MAP.md           — TaskAPI topology (Node.js/Express/PostgreSQL)
  examples/nodejs-api/FEATURE_INDEX.md         — auth + tasks domain entries
  examples/nodejs-api/CHANGELOG.md             — Bootstrap + 1 feature entry
  examples/nodejs-api/REGRESSION_INDEX.md      — REG-001: pagination bug
  examples/nodejs-api/DEBT_LEDGER.md           — DEBT-001: offset pagination
  examples/nodejs-api/src/auth/MODULE_MANIFEST.md  — Auth module manifest

  examples/python-service/PROJECT_MAP.md       — DataPipeline topology (FastAPI/Celery/PostgreSQL)
  examples/python-service/FEATURE_INDEX.md     — ingestion + processing + api entries
  examples/python-service/CHANGELOG.md         — Bootstrap + 1 feature entry
  examples/python-service/REGRESSION_INDEX.md  — REG-001: Celery silent drop
  examples/python-service/DEBT_LEDGER.md       — DEBT-001: sync validation blocks event loop
  examples/python-service/app/users/MODULE_MANIFEST.md  — Users module manifest

GitHub config:
  .github/ISSUE_TEMPLATE/bug_report.md         — Bug report template
  .github/ISSUE_TEMPLATE/feature_request.md    — Feature request template
  .github/PULL_REQUEST_TEMPLATE.md             — PR checklist
  .github/CONTRIBUTING.md                      — Contribution guide
  .github/SECURITY.md                          — Security disclosure policy
```

### Existing files (unchanged)
```
AGENTS.md, ACTIVATION_PROMPT.md, FEATURE_INDEX.md,
MODULE_MANIFEST_TEMPLATE.md, DEBT_LEDGER.md, REGRESSION_INDEX.md
```

---

## Task 1: Git initialization + core repo foundation

**Files:**
- Create: `.gitignore`
- Create: `LICENSE`
- Create: `CHANGELOG.md`

- [ ] **Step 1: Initialize git repository**

```bash
cd /mnt/d/Kit/AI_AGENTS_SYSTEM
git init
```
Expected: `Initialized empty Git repository in ...`

- [ ] **Step 2: Create `.gitignore`**

Create `/mnt/d/Kit/AI_AGENTS_SYSTEM/.gitignore` with this exact content:

```
# OS
.DS_Store
Thumbs.db
desktop.ini
ehthumbs.db

# Node.js
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.npm
*.log

# Editor / IDE
.vscode/settings.json
.idea/
*.swp
*.swo
*~

# Secrets (never commit these)
.env
.env.local
.env.*.local
*.pem
*.key
*.p12
credentials.json
```

- [ ] **Step 3: Create `LICENSE` (MIT)**

Create `/mnt/d/Kit/AI_AGENTS_SYSTEM/LICENSE`:

```
MIT License

Copyright (c) 2026 [OWNER]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

- [ ] **Step 4: Create `CHANGELOG.md` (framework version history)**

Create `/mnt/d/Kit/AI_AGENTS_SYSTEM/CHANGELOG.md`:

```markdown
# CHANGELOG — kitai-ai-agents-system-framework

> This file tracks changes to the **framework itself** (version history).
> It is separate from the `CHANGELOG.md` template that gets installed into user projects.

---

## [1.0.0] — 2026-03-22

### Added
- `AGENTS.md` — Core authority document: 19 sections covering role hierarchy, surgical
  context protocol, 5 navigation files, coding standards, workflow protocols, sub-agent
  orchestration, testing, security, observability, performance, dependency management,
  git standards, bootstrap protocol, debt ledger, anti-patterns, decision audit trail,
  capability registry, and session start checklist
- `ACTIVATION_PROMPT.md` — Three ready-to-use agent prompts: Bootstrap, Subsequent Session,
  and Targeted Task
- `FEATURE_INDEX.md` — Template for feature navigation index with full usage instructions
- `MODULE_MANIFEST_TEMPLATE.md` — Template for per-module documentation with 4 examples
- `DEBT_LEDGER.md` — Template for technical debt tracking with resolution protocol
- `REGRESSION_INDEX.md` — Template for bug memory with entry format
- `install.sh` — curl-based shell installer with skip-with-warning default and --force flag
- `package.json` + `index.js` — npm/npx installer, zero external dependencies
- `examples/nodejs-api/` — Bootstrapped TaskAPI (Node.js/Express/PostgreSQL) example
- `examples/python-service/` — Bootstrapped DataPipeline (FastAPI/Celery/PostgreSQL) example
- `docs/QUICK_START.md` — Step-by-step guide for solo developers and teams
- MIT License
```

- [ ] **Step 5: Commit foundation files**

```bash
cd /mnt/d/Kit/AI_AGENTS_SYSTEM
git add .gitignore LICENSE CHANGELOG.md
git commit -m "chore: initialize repo with license, gitignore, and changelog"
```
Expected: `[main (root-commit) xxxxxxx] chore: initialize repo...`

---

## Task 2: Shell installer (`install.sh`)

**Files:**
- Create: `install.sh`

- [ ] **Step 1: Write the failing test (verify install.sh doesn't exist yet)**

```bash
ls /mnt/d/Kit/AI_AGENTS_SYSTEM/install.sh 2>/dev/null && echo "EXISTS" || echo "NOT YET CREATED"
```
Expected: `NOT YET CREATED`

- [ ] **Step 2: Create `install.sh`**

Create `/mnt/d/Kit/AI_AGENTS_SYSTEM/install.sh` with this exact content:

```bash
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
```

- [ ] **Step 3: Make install.sh executable**

```bash
chmod +x /mnt/d/Kit/AI_AGENTS_SYSTEM/install.sh
```

- [ ] **Step 4: Test install.sh in a temp directory (local mode)**

```bash
TMPDIR=$(mktemp -d)
cd "$TMPDIR"
bash /mnt/d/Kit/AI_AGENTS_SYSTEM/install.sh
ls -la "$TMPDIR"
```
Expected: All 6 files present in TMPDIR (AGENTS.md, ACTIVATION_PROMPT.md, FEATURE_INDEX.md, MODULE_MANIFEST_TEMPLATE.md, DEBT_LEDGER.md, REGRESSION_INDEX.md), output shows `6 file(s) installed, 0 skipped`

- [ ] **Step 5: Test --force flag and skip behavior**

```bash
# Run again without --force — all 6 should be skipped
bash /mnt/d/Kit/AI_AGENTS_SYSTEM/install.sh
```
Expected: `0 file(s) installed, 6 skipped`

```bash
# Run with --force — all 6 should be overwritten
bash /mnt/d/Kit/AI_AGENTS_SYSTEM/install.sh --force
```
Expected: `6 file(s) installed, 0 skipped`

- [ ] **Step 6: Clean up temp dir**

```bash
rm -rf "$TMPDIR"
cd /mnt/d/Kit/AI_AGENTS_SYSTEM
```

- [ ] **Step 7: Commit**

```bash
git add install.sh
git commit -m "feat(install): add curl-based shell installer with --force flag"
```

---

## Task 3: npm package (`package.json` + `index.js`)

**Files:**
- Create: `package.json`
- Create: `index.js`

- [ ] **Step 1: Create `package.json`**

Create `/mnt/d/Kit/AI_AGENTS_SYSTEM/package.json`:

```json
{
  "name": "kitai-ai-agents-system-framework",
  "version": "1.0.0",
  "description": "Universal AI Agent governance framework — structure, context, and discipline for AI coding assistants on any codebase",
  "main": "index.js",
  "bin": {
    "kitai-ai-agents-system-framework": "./index.js"
  },
  "files": [
    "index.js",
    "AGENTS.md",
    "ACTIVATION_PROMPT.md",
    "FEATURE_INDEX.md",
    "MODULE_MANIFEST_TEMPLATE.md",
    "DEBT_LEDGER.md",
    "REGRESSION_INDEX.md"
  ],
  "scripts": {
    "test": "node test/install.test.js"
  },
  "keywords": [
    "ai-agents",
    "developer-tools",
    "claude",
    "cursor",
    "copilot",
    "antigravity",
    "framework",
    "coding-assistant",
    "llm"
  ],
  "author": "[OWNER]",
  "license": "MIT",
  "engines": {
    "node": ">=14.0.0"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/[OWNER]/kitai-ai-agents-system-framework.git"
  },
  "bugs": {
    "url": "https://github.com/[OWNER]/kitai-ai-agents-system-framework/issues"
  },
  "homepage": "https://github.com/[OWNER]/kitai-ai-agents-system-framework#readme"
}
```

- [ ] **Step 2: Create `index.js`**

Create `/mnt/d/Kit/AI_AGENTS_SYSTEM/index.js`:

```javascript
#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const FRAMEWORK_FILES = [
  'AGENTS.md',
  'ACTIVATION_PROMPT.md',
  'FEATURE_INDEX.md',
  'MODULE_MANIFEST_TEMPLATE.md',
  'DEBT_LEDGER.md',
  'REGRESSION_INDEX.md',
];

const args = process.argv.slice(2);
const force = args.includes('--force');
const command = args.find((a) => !a.startsWith('--'));

if (command !== 'init') {
  console.log('');
  console.log('kitai-ai-agents-system-framework');
  console.log('');
  console.log('Usage: npx kitai-ai-agents-system-framework init [--force]');
  console.log('');
  console.log('  init           Copy framework files to current directory');
  console.log('  --force        Overwrite existing files (default: skip with warning)');
  console.log('');
  process.exit(command ? 1 : 0);
}

const srcDir = __dirname;
const destDir = process.cwd();

console.log('');
console.log('kitai-ai-agents-system-framework');
console.log('=================================');
console.log('Installing to: ' + destDir);
console.log('');

let installed = 0;
let skipped = 0;

for (const file of FRAMEWORK_FILES) {
  const src = path.join(srcDir, file);
  const dest = path.join(destDir, file);

  if (fs.existsSync(dest) && !force) {
    console.log('  SKIP  ' + file + ' (already exists — use --force to overwrite)');
    skipped++;
    continue;
  }

  try {
    fs.copyFileSync(src, dest);
    console.log('  OK    ' + file);
    installed++;
  } catch (err) {
    console.error('  ERROR ' + file + ': ' + err.message);
    process.exit(1);
  }
}

console.log('');
console.log('Done! ' + installed + ' file(s) installed, ' + skipped + ' skipped.');
console.log('');
console.log('Next steps:');
console.log('  1. Attach these 4 files to your AI session:');
console.log('       AGENTS.md');
console.log('       ACTIVATION_PROMPT.md');
console.log('       FEATURE_INDEX.md');
console.log('       MODULE_MANIFEST_TEMPLATE.md');
console.log('  2. Copy the Bootstrap Activation Prompt from ACTIVATION_PROMPT.md');
console.log('  3. Paste it into your AI session — the agent will scan and bootstrap your project');
console.log('');
```

- [ ] **Step 3: Make `index.js` executable (required for `npx` invocation)**

```bash
chmod +x /mnt/d/Kit/AI_AGENTS_SYSTEM/index.js
```

- [ ] **Step 4: Test `index.js` in a temp directory**

```bash
TMPDIR=$(mktemp -d)
cd "$TMPDIR"
node /mnt/d/Kit/AI_AGENTS_SYSTEM/index.js init
ls -la "$TMPDIR"
```
Expected: All 6 files present, output shows `6 file(s) installed, 0 skipped`

- [ ] **Step 5: Test skip behavior**

```bash
node /mnt/d/Kit/AI_AGENTS_SYSTEM/index.js init
```
Expected: `0 file(s) installed, 6 skipped`

- [ ] **Step 6: Test --force flag**

```bash
node /mnt/d/Kit/AI_AGENTS_SYSTEM/index.js init --force
```
Expected: `6 file(s) installed, 0 skipped`

- [ ] **Step 7: Test unknown command**

```bash
node /mnt/d/Kit/AI_AGENTS_SYSTEM/index.js foo
echo "Exit code: $?"
```
Expected: prints usage, exit code 1

- [ ] **Step 8: Test no args (shows help, exits 0)**

```bash
node /mnt/d/Kit/AI_AGENTS_SYSTEM/index.js
echo "Exit code: $?"
```
Expected: prints usage, exit code 0

- [ ] **Step 9: Clean up and commit**

```bash
rm -rf "$TMPDIR"
cd /mnt/d/Kit/AI_AGENTS_SYSTEM
git add package.json index.js
git commit -m "feat(install): add npm/npx installer with zero external dependencies"
```

---

## Task 4: `README.md`

**Files:**
- Create: `README.md`

- [ ] **Step 1: Create `README.md`**

Create `/mnt/d/Kit/AI_AGENTS_SYSTEM/README.md` with the following exact content:

```markdown
# kitai-ai-agents-system-framework

> A universal governance framework that turns any AI coding assistant into a disciplined,
> context-aware engineering partner.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![npm version](https://img.shields.io/npm/v/kitai-ai-agents-system-framework?color=blue)](https://www.npmjs.com/package/kitai-ai-agents-system-framework)

---

## Compatible Agents

| Agent | Tested | How to attach |
|---|---|---|
| [Claude Code](https://claude.ai/code) | ✅ | Files auto-read from project root |
| [Cursor](https://cursor.sh) | ✅ | Add to `.cursorrules` or Cursor context |
| [GitHub Copilot](https://github.com/features/copilot) | ✅ | Add to workspace instructions |
| [Antigravity](https://antigravity.dev) | ✅ | Attach via session context |

---

## Install

**Option 1 — GitHub Template** *(new projects)*

Click **"Use this template"** above — all files land in your new repo.

**Option 2 — npx** *(add to an existing project)*

```bash
npx kitai-ai-agents-system-framework init
```

**Option 3 — curl** *(shell environments, macOS/Linux)*

```bash
curl -fsSL https://raw.githubusercontent.com/[OWNER]/kitai-ai-agents-system-framework/main/install.sh | bash
```

Use `--force` to overwrite existing files.

---

## What It Does

This framework gives AI agents a **structured operating protocol** to follow on your codebase.

**The role model:**
- **You (CEO):** Set objectives, review outcomes, approve gate decisions.
- **AI Agent (CTO):** Owns all technical decisions, architecture, and execution quality.

**How it works:**

1. **Drop 6 files** into any project (any language, any stack).
2. **Run one Bootstrap Prompt** — the agent scans your codebase and fills in everything.
3. **Every future session:** The agent reads 3 navigation files and immediately knows where to work, what bugs to avoid, and what decisions have already been made.

**What agents do differently with this framework:**

| Without framework | With framework |
|---|---|
| Reads 20+ files to understand codebase | Reads 3 navigation files |
| Rewrites decisions already made | Checks DECISION AUDIT TRAIL first |
| Re-introduces fixed bugs | Checks REGRESSION_INDEX before coding |
| Forgets context between sessions | Updates CHANGELOG + FEATURE_INDEX every session |
| Guesses architecture | Follows explicit data flow and module boundaries |

---

## The 5 Navigation Files

After bootstrap, the agent maintains these files across every session:

| File | Purpose |
|---|---|
| `PROJECT_MAP.md` | Topology: what exists and how it connects |
| `FEATURE_INDEX.md` | Given a task, which files do I open? |
| `MODULE_MANIFEST.md` | Per-module: public API, patterns, gotchas |
| `CHANGELOG.md` | What changed and when |
| `REGRESSION_INDEX.md` | Bugs fixed — never reintroduce these |

---

## Getting Started

**Step 1** — Install using any method above.

**Step 2** — Attach these 4 files to your AI session:
- `AGENTS.md`
- `ACTIVATION_PROMPT.md`
- `FEATURE_INDEX.md`
- `MODULE_MANIFEST_TEMPLATE.md`

**Step 3** — Copy the **Bootstrap Activation Prompt** from `ACTIVATION_PROMPT.md` (between the `===ACTIVATION PROMPT===` markers) and paste it into your session.

**Step 4** — The agent scans your project and creates all navigation files automatically.

**Step 5** — Every future session: attach `PROJECT_MAP.md` + `FEATURE_INDEX.md` + `CHANGELOG.md`, then paste the **Subsequent Session Prompt** from `ACTIVATION_PROMPT.md`.

> See [docs/QUICK_START.md](docs/QUICK_START.md) for the full guide including team setup.

---

## Examples

See what a fully bootstrapped project looks like:

- [`examples/nodejs-api/`](examples/nodejs-api/) — TaskAPI: Node.js / Express / PostgreSQL
- [`examples/python-service/`](examples/python-service/) — DataPipeline: Python / FastAPI / Celery

---

## Contributing

See [`.github/CONTRIBUTING.md`](.github/CONTRIBUTING.md).

## License

MIT — see [LICENSE](LICENSE).
```

- [ ] **Step 2: Verify README renders correctly**

Open the file and check:
- No `[AGENT: SCAN AND FILL]` placeholders
- All section headers present (Compatible Agents, Install, What It Does, 5 Navigation Files, Getting Started, Examples)
- Badges use correct shield URLs
- `[OWNER]` placeholder present in curl command (intentional — see spec §11)

- [ ] **Step 3: Commit**

```bash
cd /mnt/d/Kit/AI_AGENTS_SYSTEM
git add README.md
git commit -m "docs: add README with install methods, compatibility table, and getting started guide"
```

---

## Task 5: `docs/QUICK_START.md`

**Files:**
- Create: `docs/QUICK_START.md`

- [ ] **Step 1: Create directory and file**

```bash
mkdir -p /mnt/d/Kit/AI_AGENTS_SYSTEM/docs
```

Create `/mnt/d/Kit/AI_AGENTS_SYSTEM/docs/QUICK_START.md`:

```markdown
# Quick Start — kitai-ai-agents-system-framework

Get your AI agent operating on structured protocol in under 10 minutes.

---

## Prerequisites

- Any AI coding assistant (Claude Code, Cursor, GitHub Copilot, or Antigravity)
- A software project (any language, any stack — the framework is tech-stack agnostic)

---

## Step 1 — Install

Pick any method:

**npm / npx (any OS):**
```bash
npx kitai-ai-agents-system-framework init
```

**curl (macOS/Linux):**
```bash
curl -fsSL https://raw.githubusercontent.com/[OWNER]/kitai-ai-agents-system-framework/main/install.sh | bash
```

**GitHub Template** (new projects only): Click "Use this template" on the repository page.

After install, these files appear at your project root:
- `AGENTS.md` — the operating protocol
- `ACTIVATION_PROMPT.md` — prompts to paste into your agent
- `FEATURE_INDEX.md` — template (agent fills this in)
- `MODULE_MANIFEST_TEMPLATE.md` — template (agent uses this per module)
- `DEBT_LEDGER.md` — template
- `REGRESSION_INDEX.md` — template

---

## Step 2 — First Session (Bootstrap)

1. Open your AI agent (Claude Code, Cursor, etc.)

2. **Attach these 4 files** to the session context:
   - `AGENTS.md`
   - `ACTIVATION_PROMPT.md`
   - `FEATURE_INDEX.md`
   - `MODULE_MANIFEST_TEMPLATE.md`

3. **Copy the Bootstrap Activation Prompt** from `ACTIVATION_PROMPT.md`
   (copy everything between `===ACTIVATION PROMPT (copy from here)===` and `===END ACTIVATION PROMPT===`)

4. **Paste it** as your first message to the agent.

5. The agent will scan your project and create:
   - `PROJECT_MAP.md` — full topology of your codebase
   - Populated `FEATURE_INDEX.md` — every feature mapped to its files
   - `MODULE_MANIFEST.md` in each significant module directory
   - `CHANGELOG.md`, `REGRESSION_INDEX.md`, `DEBT_LEDGER.md`

The bootstrap takes 2–5 minutes depending on codebase size.

---

## Step 3 — Every Subsequent Session

1. **Attach these 3 files** to the session context:
   - `PROJECT_MAP.md`
   - `FEATURE_INDEX.md`
   - `CHANGELOG.md`

2. **Copy the Subsequent Session Prompt** from `ACTIVATION_PROMPT.md`
   (between the `===SUBSEQUENT SESSION PROMPT===` markers)

3. **Paste it**, then give the agent your task.

---

## Team Setup

If you're working with a team:

1. **Commit all framework files** to your git repository:
   ```bash
   git add AGENTS.md ACTIVATION_PROMPT.md FEATURE_INDEX.md \
           MODULE_MANIFEST_TEMPLATE.md DEBT_LEDGER.md REGRESSION_INDEX.md
   git commit -m "chore: add AI agent framework"
   ```

2. After bootstrap, commit the navigation files too:
   ```bash
   git add PROJECT_MAP.md CHANGELOG.md REGRESSION_INDEX.md DEBT_LEDGER.md
   # Also commit any MODULE_MANIFEST.md files created in module directories
   git add '**/MODULE_MANIFEST.md'
   git commit -m "chore: bootstrap AI agent navigation files"
   ```

3. Every team member and every agent session now shares the same context. After each agent session that modifies the codebase, the agent updates navigation files — commit those changes so the whole team stays in sync.

---

## Troubleshooting

**Agent isn't following the protocol?**

Make sure `AGENTS.md` is fully attached to the session context — not just referenced by filename, but actually loaded. In Claude Code, files at the project root are auto-read. In Cursor, add the content to `.cursorrules`. In Copilot, add it to workspace instructions.

**Bootstrap created files with `[AGENT: SCAN AND FILL]` still in them?**

The agent ran out of context window. Break the bootstrap into phases: paste only `PHASE 1 — DISCOVERY` first, wait for completion, then paste `PHASE 2 — ANALYSIS`, then `PHASE 3 — POPULATE`.

**Navigation files are out of date after several sessions?**

Each session prompt instructs the agent to update navigation files before closing. If files drifted, paste: *"Please update FEATURE_INDEX.md and CHANGELOG.md to reflect all work done in this session."*

**`npx` command not found?**

Requires Node.js ≥ 14. Install from [nodejs.org](https://nodejs.org) and retry.
```

- [ ] **Step 2: Verify all `[OWNER]` placeholders are present and clearly marked**

Check the file — the curl URL contains `[OWNER]` intentionally.

- [ ] **Step 3: Commit**

```bash
cd /mnt/d/Kit/AI_AGENTS_SYSTEM
git add docs/QUICK_START.md
git commit -m "docs: add quick start guide covering solo and team workflows"
```

---

## Task 6: `examples/README.md`

**Files:**
- Create: `examples/README.md`

- [ ] **Step 1: Create directory and file**

```bash
mkdir -p /mnt/d/Kit/AI_AGENTS_SYSTEM/examples
```

Create `/mnt/d/Kit/AI_AGENTS_SYSTEM/examples/README.md`:

```markdown
# Examples

These examples show what a project looks like **after the Bootstrap Protocol has run** — not the templates, but real filled-in navigation files.

They answer the most common question: *"What does this actually produce?"*

---

## How to read an example

1. Start with `PROJECT_MAP.md` — understand the project topology and tech stack
2. Read `FEATURE_INDEX.md` — see how features are mapped to files
3. Read a `MODULE_MANIFEST.md` — see how per-module context is compressed
4. Check `CHANGELOG.md` — see what a bootstrap entry and a feature entry look like
5. Check `REGRESSION_INDEX.md` and `DEBT_LEDGER.md` — see how bugs and debt are tracked

---

## Available examples

### `nodejs-api/` — TaskAPI
A Node.js/Express REST API with JWT authentication, task management, and user accounts.
- Stack: Node.js 20, Express 4, PostgreSQL 15, Redis 7
- Modules: core, api, services, repositories, adapters, workers

### `python-service/` — DataPipeline
An async Python/FastAPI data ingestion and transformation service with Celery workers.
- Stack: Python 3.11, FastAPI 0.104, PostgreSQL 15, Celery 5, Redis 7
- Modules: core, api, services, repositories, workers, adapters, users

---

## Contribute an example

Have another stack? Contributions welcome.

1. Create `examples/<your-stack>/` with all 5 navigation files filled in
2. Include at least one `MODULE_MANIFEST.md` in a realistic module directory
3. Use a fictional project name — no real codebases or real credentials
4. Add your example to this README
5. Open a PR — see [`.github/CONTRIBUTING.md`](../.github/CONTRIBUTING.md)
```

- [ ] **Step 2: Commit**

```bash
cd /mnt/d/Kit/AI_AGENTS_SYSTEM
git add examples/README.md
git commit -m "docs(examples): add examples index with reading guide"
```

---

## Task 7: Node.js API example (`examples/nodejs-api/`)

**Files:**
- Create: `examples/nodejs-api/PROJECT_MAP.md`
- Create: `examples/nodejs-api/FEATURE_INDEX.md`
- Create: `examples/nodejs-api/CHANGELOG.md`
- Create: `examples/nodejs-api/REGRESSION_INDEX.md`
- Create: `examples/nodejs-api/DEBT_LEDGER.md`
- Create: `examples/nodejs-api/src/auth/MODULE_MANIFEST.md`

- [ ] **Step 1: Create directories**

```bash
mkdir -p /mnt/d/Kit/AI_AGENTS_SYSTEM/examples/nodejs-api/src/auth
```

- [ ] **Step 2: Create `examples/nodejs-api/PROJECT_MAP.md`**

```markdown
# PROJECT_MAP — TaskAPI

## Project Overview
TaskAPI is a REST API for team task management. It provides JWT-authenticated endpoints
for creating, assigning, and tracking tasks across user accounts. It serves mobile and
web clients via HTTP/JSON.

## Tech Stack
- Runtime: Node.js 20 (LTS)
- Framework: Express 4.18
- Database: PostgreSQL 15 (primary), Redis 7 (sessions + cache)
- Auth: JWT (access tokens 15min, refresh tokens 7d, httpOnly cookies)
- Query builder: Knex.js + raw SQL for complex queries
- Testing: Jest 29 + Supertest
- Deployment: Docker + docker-compose

## Directory Tree
```
src/
├── core/          — Config, logger, errors, event bus, shared types
├── api/           — Routes, controllers, middleware, validators, serializers
├── services/      — Business logic: auth, user, task services
├── repositories/  — Data access: user repo, task repo (Knex queries)
├── adapters/      — External integrations: email (SendGrid)
└── workers/       — Background jobs: email sender, task reminders
tests/
├── unit/          — Pure logic tests (no I/O)
├── integration/   — Service + real DB tests
└── fixtures/      — Test data: users, tasks, JWT tokens
```

## Cross-Module Dependency Graph
```
core          ← (no dependencies)
repositories  ← core
adapters      ← core
services      ← core, repositories, adapters
api           ← services, core
workers       ← services, core
```

## Public Interface Registry
```
core.loadConfig() → Config
core.getLogger(name: string) → Logger
core.EventBus.emit(event: DomainEvent) → void

services.AuthService.login(email, password) → { accessToken, refreshToken }
services.AuthService.register(data: CreateUserInput) → User
services.AuthService.refreshToken(token: string) → { accessToken }
services.AuthService.logout(refreshToken: string) → void

services.UserService.getUserById(id: UserId) → User | null
services.UserService.updateProfile(id: UserId, data: UpdateProfileInput) → User

services.TaskService.createTask(data: CreateTaskInput) → Task
services.TaskService.getTaskById(id: TaskId) → Task | null
services.TaskService.listTasks(filters: TaskFilters) → PaginatedResult<Task>
services.TaskService.updateTask(id: TaskId, data: UpdateTaskInput) → Task
services.TaskService.deleteTask(id: TaskId) → void
```

## Data Flow Architecture
```
HTTP Request
     │
     ▼
Middleware (request-id, cors, rate-limit, auth)
     │
     ▼
Controller (parse + validate input)
     │
     ▼
Service (business logic, emit domain events)
     │
     ├──▶ Repository (DB reads/writes via Knex)
     └──▶ Adapter (email, notifications)
```

## Environment Variable Registry
```
DATABASE_URL=<string>        # consumed by: repositories/db.js
REDIS_URL=<string>           # consumed by: core/cache.js
JWT_SECRET=<string>          # consumed by: services/auth.service.js
JWT_REFRESH_SECRET=<string>  # consumed by: services/auth.service.js
SENDGRID_API_KEY=<string>    # consumed by: adapters/email/
PORT=<number>                # consumed by: api/server.js (default: 3000)
NODE_ENV=<string>            # consumed by: core/config.js
```

## Infrastructure & Services
- PostgreSQL 15: primary data store (users, tasks, sessions)
- Redis 7: JWT refresh token store, rate limiting, Bull job queue
- SendGrid: transactional email (welcome, task assignments, reminders)

## Last updated: 2026-03-22
```

- [ ] **Step 3: Create `examples/nodejs-api/FEATURE_INDEX.md`**

```markdown
# FEATURE_INDEX — TaskAPI

> Navigation index for AI Agents. Given a task, search this file first.
> Last updated: 2026-03-22

---

## [DOMAIN: auth] ─────────────────────────────────────────────

## auth::users::login

**Status**: active
**Owner module**: src/services/
**Primary files**:
  - src/services/auth.service.js    # login() — validates credentials, issues JWT pair
  - src/api/controllers/auth.js     # POST /auth/login handler
**Interface files**:
  - src/core/types/auth.js          # AuthTokenPair, LoginInput types
**Test files**:
  - tests/unit/auth.service.test.js # covers login success, wrong password, account locked
  - tests/integration/auth.test.js  # covers full login flow with real DB
**Depends on features**:
  - auth::users::find_by_email
  - core::config::jwt
**Last modified**: 2026-03-22
**Change summary**: Initial implementation

## auth::users::register

**Status**: active
**Owner module**: src/services/
**Primary files**:
  - src/services/auth.service.js    # register() — hash password, create user, send welcome email
  - src/api/controllers/auth.js     # POST /auth/register handler
**Test files**:
  - tests/unit/auth.service.test.js # covers duplicate email, weak password, success
**Depends on features**:
  - users::crud::create
  - adapters::email::send_welcome
**Last modified**: 2026-03-22
**Change summary**: Initial implementation

## auth::users::refresh_token

**Status**: active
**Owner module**: src/services/
**Primary files**:
  - src/services/auth.service.js    # refreshToken() — validates, rotates, issues new pair
  - src/api/controllers/auth.js     # POST /auth/refresh handler
**Also read if modifying**:
  - src/core/cache.js               # Redis client for token blacklist
**Test files**:
  - tests/unit/auth.service.test.js # covers valid refresh, expired token, replayed token
**Last modified**: 2026-03-22
**Change summary**: Initial implementation

---

## [DOMAIN: tasks] ─────────────────────────────────────────────

## tasks::crud::create

**Status**: active
**Owner module**: src/services/
**Primary files**:
  - src/services/task.service.js    # createTask() — validates, persists, emits domain event
  - src/api/controllers/tasks.js    # POST /tasks handler
**Interface files**:
  - src/core/types/tasks.js         # Task, CreateTaskInput types
**Test files**:
  - tests/unit/task.service.test.js
  - tests/integration/tasks.test.js
**Depends on features**:
  - auth::users::login              # task creation requires authenticated user
**Last modified**: 2026-03-22
**Change summary**: Initial implementation

## tasks::crud::list

**Status**: active
**Owner module**: src/services/
**Primary files**:
  - src/services/task.service.js    # listTasks() — paginated query with filters
  - src/api/controllers/tasks.js    # GET /tasks handler
**Test files**:
  - tests/unit/task.service.test.js # covers empty list, pagination, filter combinations
**Also read if modifying**:
  - REGRESSION_INDEX.md             # REG-001 — pagination stability (ORDER BY required)
**Last modified**: 2026-03-22
**Change summary**: Initial implementation

---

## DEPRECATION LOG

<!-- none yet -->
```

- [ ] **Step 4: Create `examples/nodejs-api/CHANGELOG.md`**

```markdown
# CHANGELOG — TaskAPI

## [2026-03-22] — Bootstrap
**Session**: 001
**Feature Address**: system::bootstrap::initial
### Added
- Bootstrapped entire navigation file system via kitai-ai-agents-system-framework
- Created PROJECT_MAP.md reflecting Node.js/Express/PostgreSQL/Redis architecture
- Populated FEATURE_INDEX.md with auth and tasks domain entries
- Created src/auth/MODULE_MANIFEST.md
### Infrastructure
- No commands run (bootstrap is read-only analysis)

## [2026-03-22] — Add JWT refresh token rotation
**Session**: 002
**Feature Address**: auth::users::refresh_token::create
### Added
- POST /auth/refresh endpoint accepting refresh token in httpOnly cookie
- AuthService.refreshToken() — validates, rotates (old token blacklisted), issues new pair
- Redis-backed token blacklist with TTL matching token expiry
### Changed
- AuthService.login() now sets refresh token in httpOnly cookie in addition to returning access token
### Infrastructure
- redis-cli PING verified connection before deploying session-dependent change
### Decisions
- Chose httpOnly cookie over response body for refresh token: prevents XSS token theft.
  Reversal: easy — move token to response body. CEO approval: no (security detail, not policy).
```

- [ ] **Step 5: Create `examples/nodejs-api/REGRESSION_INDEX.md`**

```markdown
# REGRESSION_INDEX — TaskAPI

> Bugs that have been fixed. Never reintroduce these.
> Last updated: 2026-03-22

---

## REG-001 — Pagination returns duplicate tasks on concurrent inserts

**Feature Address**: tasks::crud::list
**Date fixed**: 2026-03-22
**Severity**: medium
**Symptom**: GET /tasks with page=2 occasionally returned items already visible on page=1
  when new tasks were inserted between page requests.
**Root cause**: Pagination used OFFSET without a stable sort order. Concurrent inserts
  shifted row positions between sequential page requests.
**Fix**: Added `ORDER BY created_at DESC, id DESC` to all paginated queries in
  src/repositories/task.repository.js. The composite sort ensures deterministic ordering
  even when created_at values collide (same-millisecond inserts).
**Prevention rule**: All paginated queries MUST have a deterministic ORDER BY clause
  with a unique tie-breaker (typically `id`). Never paginate without a stable sort.
**Test added**: tests/integration/tasks.test.js::test_pagination_stable_under_concurrent_inserts
```

- [ ] **Step 6: Create `examples/nodejs-api/DEBT_LEDGER.md`**

```markdown
# DEBT_LEDGER — TaskAPI

> Last updated: 2026-03-22

---

## DEBT-001 — Offset-based pagination instead of cursor-based

**Created**: 2026-03-22
**Feature Address**: tasks::crud::list
**Module**: src/repositories/
**Description**: Task list uses OFFSET-based pagination (LIMIT x OFFSET y). Correct and
  stable (see REG-001 fix) but inefficient at high row counts — PostgreSQL scans all rows
  up to the offset position even when discarding them.
**Proper solution**: Implement keyset/cursor pagination: `WHERE id < :cursor ORDER BY id DESC LIMIT :limit`.
  Return `next_cursor` in the response envelope. Client passes cursor on next request.
**Risk**: Query time grows O(offset) as task count grows. Acceptable at current scale
  (<10k tasks per user). Will degrade noticeably above 50k tasks.
**Impact**: low
**Target**: v1.2.0
**Resolved**: unresolved
```

- [ ] **Step 7: Create `examples/nodejs-api/src/auth/MODULE_MANIFEST.md`**

```markdown
# MODULE_MANIFEST — src/services/ (auth domain)

## Purpose
Authentication and authorization for the entire API. Owns the full auth lifecycle:
registration, login, JWT issuance, refresh token rotation, and logout.
Does NOT handle user profile data — that lives in services/user.service.js.

## Public API
  AuthService.register(data: CreateUserInput) → User
  AuthService.login(email: string, password: string) → AuthTokenPair
  AuthService.refreshToken(refreshToken: string) → { accessToken: string }
  AuthService.logout(refreshToken: string) → void
  authMiddleware() → Express.Middleware    # JWT validation + req.user injection

## Internal Structure
  auth.service.js     — Business logic: register, login, token operations
  auth.middleware.js  — Express middleware: JWT validation, user context injection
  auth.repository.js  — DB queries: user lookup, session storage
  auth.validators.js  — Zod schemas: LoginInput, RegisterInput

## Imports from other modules
  core/config    — JWT_SECRET, JWT_REFRESH_SECRET, token TTLs
  core/errors    — UnauthorizedError, ValidationError
  core/logger    — Structured auth event logging
  core/cache     — Redis client for refresh token blacklist

## Exports to other modules
  api/middleware/  — authMiddleware used on all protected routes
  api/controllers/ — AuthService called by auth.controller.js

## Patterns in use
  - Passwords: bcrypt, cost factor 12
  - Access token: 15min TTL, signed with JWT_SECRET
  - Refresh token: 7d TTL, httpOnly cookie, stored hash in Redis
  - Rotation: old refresh token blacklisted in Redis on every use (replay prevention)
  - All auth events logged: login_success, login_failure, token_refresh, logout

## Known constraints / gotchas
  - NEVER return password hash in any response — serializer strips it before return
  - Refresh tokens: Redis TTL = token expiry; Redis loss = forced re-login for all users
  - authMiddleware sets req.user — downstream code reads from req.user, never re-fetches
  - Login rate limit: 5 attempts/15min per IP — enforced in api/middleware/rate-limit.js
  - jwt.verify() throws on expired tokens — always catch TokenExpiredError separately

## Security boundary
  - All password verification and JWT validation lives here
  - PII handled: email (logged as presence only), hashed password (never logged/returned)

## Last updated: 2026-03-22
```

- [ ] **Step 8: Verify no `[AGENT: SCAN AND FILL]` placeholders remain in any nodejs-api file**

```bash
grep -r "\[AGENT:" /mnt/d/Kit/AI_AGENTS_SYSTEM/examples/nodejs-api/ && echo "FOUND PLACEHOLDERS" || echo "CLEAN"
```
Expected: `CLEAN`

- [ ] **Step 9: Commit**

```bash
cd /mnt/d/Kit/AI_AGENTS_SYSTEM
git add examples/nodejs-api/
git commit -m "docs(examples): add TaskAPI Node.js example with filled navigation files"
```

---

## Task 8: Python service example (`examples/python-service/`)

**Files:**
- Create: `examples/python-service/PROJECT_MAP.md`
- Create: `examples/python-service/FEATURE_INDEX.md`
- Create: `examples/python-service/CHANGELOG.md`
- Create: `examples/python-service/REGRESSION_INDEX.md`
- Create: `examples/python-service/DEBT_LEDGER.md`
- Create: `examples/python-service/app/users/MODULE_MANIFEST.md`

- [ ] **Step 1: Create directories**

```bash
mkdir -p /mnt/d/Kit/AI_AGENTS_SYSTEM/examples/python-service/app/users
```

- [ ] **Step 2: Create `examples/python-service/PROJECT_MAP.md`**

```markdown
# PROJECT_MAP — DataPipeline

## Project Overview
DataPipeline is an async data ingestion and transformation service. It accepts CSV/JSON
uploads via REST API, validates and transforms records through configurable processing
rules, and exports results to downstream systems. Serves data engineering teams via HTTP/JSON.

## Tech Stack
- Runtime: Python 3.11
- Framework: FastAPI 0.104 (fully async)
- Database: PostgreSQL 15 (primary), Redis 7 (Celery broker + result backend)
- Task Queue: Celery 5.3 with Redis broker
- ORM: SQLAlchemy 2.0 (async sessions)
- File Storage: AWS S3
- Testing: pytest 7 + pytest-asyncio + httpx
- Deployment: Docker + docker-compose

## Directory Tree
```
app/
├── core/          — Settings, logger, exceptions, DB session factory, base types
├── api/           — FastAPI routers, request/response Pydantic schemas, dependencies
├── services/      — Business logic: ingestion, processing, export services
├── repositories/  — Async SQLAlchemy queries: pipeline repo, job repo, results repo
├── workers/       — Celery tasks: file processor, transformer, exporter
├── adapters/      — External integrations: S3 storage, webhook notifier
└── users/         — User management: API key auth, profiles, key rotation
tests/
├── unit/          — Pure logic (validators, transformers, no I/O)
├── integration/   — Service + real DB (pytest-asyncio)
└── fixtures/      — CSV/JSON test files, DB seeds
```

## Cross-Module Dependency Graph
```
core          ← (no dependencies)
repositories  ← core
adapters      ← core
users         ← core, repositories
services      ← core, repositories, adapters
workers       ← services, core
api           ← services, users, core
```

## Public Interface Registry
```
core.get_settings() → Settings
core.get_db() → AsyncIterator[AsyncSession]    # FastAPI dependency

services.IngestionService.ingest_file(file: UploadFile, user_id: UUID) → Job
services.IngestionService.get_job_status(job_id: UUID) → Job
services.ProcessingService.run_pipeline(job_id: UUID) → ProcessingResult
services.ExportService.export_results(job_id: UUID, format: ExportFormat) → bytes

users.UserService.create_user(data: CreateUserInput) → User
users.UserService.get_by_api_key(key: str) → User | None
users.UserService.rotate_api_key(user_id: UUID) → str    # returns new plaintext key
users.get_current_user(api_key: str = Header(...)) → User  # FastAPI dependency
```

## Data Flow Architecture
```
HTTP Request (file upload or job status)
     │
     ▼
FastAPI Router (API key auth, rate limiting)
     │
     ▼
Service Layer (validate, create Job record, enqueue Celery task)
     │
     ├──▶ Repository (persist job state to PostgreSQL)
     └──▶ Celery Task Queue (Redis broker)
               │
               ▼
          Worker (process file, write results, update job status)
               │
               └──▶ Adapter (S3 for storage, webhook for completion)
```

## Environment Variable Registry
```
DATABASE_URL=<string>          # consumed by: core/database.py
REDIS_URL=<string>             # consumed by: core/cache.py, workers/celery_app.py
S3_BUCKET=<string>             # consumed by: adapters/storage.py
S3_REGION=<string>             # consumed by: adapters/storage.py
AWS_ACCESS_KEY_ID=<string>     # consumed by: adapters/storage.py
AWS_SECRET_ACCESS_KEY=<string> # consumed by: adapters/storage.py
SECRET_KEY=<string>            # consumed by: app/users/security.py (API key hashing)
PORT=<number>                  # consumed by: main.py (default: 8000)
```

## Infrastructure & Services
- PostgreSQL 15: job records, pipeline configs, user accounts, results metadata
- Redis 7: Celery broker + result backend; rate limiting
- S3: raw uploaded files + processed output storage

## Last updated: 2026-03-22
```

- [ ] **Step 3: Create `examples/python-service/FEATURE_INDEX.md`**

```markdown
# FEATURE_INDEX — DataPipeline

> Navigation index for AI Agents. Given a task, search this file first.
> Last updated: 2026-03-22

---

## [DOMAIN: ingestion] ─────────────────────────────────────────

## ingestion::pipeline::upload_file

**Status**: active
**Owner module**: app/services/
**Primary files**:
  - app/services/ingestion.service.py   # ingest_file() — validate headers, store to S3, enqueue
  - app/api/routers/ingestion.py        # POST /pipelines/upload
**Interface files**:
  - app/core/types.py                   # UploadFile, Job, JobStatus types
**Test files**:
  - tests/unit/test_ingestion_service.py
  - tests/integration/test_ingestion_api.py
**Depends on features**:
  - users::auth::api_key                # upload requires authenticated user
  - adapters::storage::upload           # file stored to S3 before enqueue
**Last modified**: 2026-03-22
**Change summary**: Initial implementation

## ingestion::pipeline::job_status

**Status**: active
**Owner module**: app/services/
**Primary files**:
  - app/services/ingestion.service.py   # get_job_status() — fetch job from DB
  - app/api/routers/ingestion.py        # GET /pipelines/{job_id}/status
**Test files**:
  - tests/unit/test_ingestion_service.py # covers PENDING, PROCESSING, DONE, FAILED states
**Last modified**: 2026-03-22
**Change summary**: Initial implementation

---

## [DOMAIN: processing] ────────────────────────────────────────

## processing::workers::transform

**Status**: active
**Owner module**: app/workers/
**Primary files**:
  - app/workers/processor.py            # Celery task: validate rows, apply transform rules
  - app/services/processing.service.py  # run_pipeline() — orchestrates transform steps
**Test files**:
  - tests/unit/test_processing_service.py
  - tests/unit/test_processor_worker.py
**Also read if modifying**:
  - REGRESSION_INDEX.md                 # REG-001 — Celery retry policy required
**Depends on features**:
  - ingestion::pipeline::upload_file    # worker triggered after successful upload
**Last modified**: 2026-03-22
**Change summary**: Initial implementation

---

## [DOMAIN: api] ───────────────────────────────────────────────

## api::health::check

**Status**: active
**Owner module**: app/api/
**Primary files**:
  - app/api/routers/health.py           # GET /health — returns DB + Redis + worker connectivity
**Test files**:
  - tests/integration/test_health.py
**Last modified**: 2026-03-22
**Change summary**: Initial implementation

---

## [DOMAIN: users] ─────────────────────────────────────────────

## users::auth::api_key

**Status**: active
**Owner module**: app/users/
**Primary files**:
  - app/users/service.py                # get_by_api_key(), create_user(), rotate_api_key()
  - app/users/dependencies.py           # FastAPI get_current_user dependency
  - app/users/security.py              # key generation + SHA-256 hashing
**Test files**:
  - tests/unit/test_user_service.py
  - tests/integration/test_auth.py
**Last modified**: 2026-03-22
**Change summary**: Initial implementation

---

## DEPRECATION LOG

<!-- none yet -->
```

- [ ] **Step 4: Create `examples/python-service/CHANGELOG.md`**

```markdown
# CHANGELOG — DataPipeline

## [2026-03-22] — Bootstrap
**Session**: 001
**Feature Address**: system::bootstrap::initial
### Added
- Bootstrapped navigation file system via kitai-ai-agents-system-framework
- Created PROJECT_MAP.md for Python/FastAPI/Celery/PostgreSQL architecture
- Populated FEATURE_INDEX.md with ingestion, processing, api, users domains
- Created app/users/MODULE_MANIFEST.md
### Infrastructure
- No commands run (bootstrap is read-only analysis)

## [2026-03-22] — Add CSV header validation on upload
**Session**: 002
**Feature Address**: ingestion::pipeline::validate::create
### Added
- Fast-fail CSV header validation before job is enqueued
- IngestionService.validate_headers(file_bytes) — checks required columns present
- 422 Unprocessable Entity response with column-level error details on failure
### Changed
- ingest_file() now calls validate_headers() before S3 upload (fail fast, avoid wasted storage)
### Infrastructure
- No DB migrations required (validation is stateless)
### Decisions
- Validation runs synchronously in the API request (blocks event loop briefly for large files).
  Recorded as DEBT-001. Acceptable at current upload sizes (<5MB p99).
```

- [ ] **Step 5: Create `examples/python-service/REGRESSION_INDEX.md`**

```markdown
# REGRESSION_INDEX — DataPipeline

> Bugs that have been fixed. Never reintroduce these.
> Last updated: 2026-03-22

---

## REG-001 — Celery worker silently drops jobs when Redis connection is interrupted

**Feature Address**: processing::workers::transform
**Date fixed**: 2026-03-22
**Severity**: critical
**Symptom**: File upload returned HTTP 202 Accepted, job appeared in DB as PENDING,
  but job never progressed to PROCESSING. No error visible in API logs. No exception raised.
**Root cause**: Celery task was defined with `ignore_result=True` and no retry policy.
  When Redis was briefly unavailable, the broker silently dropped the enqueued task.
  The job record stayed PENDING indefinitely with no failure path.
**Fix**: Added to all Celery tasks:
  `autoretry_for=(Exception,)`, `max_retries=3`, `default_retry_delay=5`, `acks_late=True`.
  Added explicit job status transition to FAILED with error message on final retry exhaustion.
**Prevention rule**: All Celery tasks MUST define a retry policy. Never use `ignore_result=True`
  on tasks that affect persistent state. Always handle `kombu.exceptions.OperationalError`.
  Every task must have a failure path that updates the job record.
**Test added**: tests/integration/test_processor_worker.py::test_worker_retries_on_broker_failure
```

- [ ] **Step 6: Create `examples/python-service/DEBT_LEDGER.md`**

```markdown
# DEBT_LEDGER — DataPipeline

> Last updated: 2026-03-22

---

## DEBT-001 — Synchronous CSV validation blocks the async event loop

**Created**: 2026-03-22
**Feature Address**: ingestion::pipeline::validate
**Module**: app/services/ingestion.service.py
**Description**: CSV header validation reads the first N lines of the uploaded file
  using Python's synchronous `csv.reader`. For large files (>5MB) this can block
  the FastAPI event loop for 50-200ms, degrading throughput under concurrency.
**Proper solution**:
  ```python
  loop = asyncio.get_event_loop()
  await loop.run_in_executor(None, validate_csv_headers, file_bytes)
  ```
  Or: move validation entirely into the Celery worker (async-safe, no loop blocking).
**Risk**: API latency degrades under concurrent large file uploads. Acceptable at
  current upload volume (<50 concurrent users, files typically <2MB).
**Impact**: medium
**Target**: v1.1.0
**Resolved**: unresolved
```

- [ ] **Step 7: Create `examples/python-service/app/users/MODULE_MANIFEST.md`**

```markdown
# MODULE_MANIFEST — app/users/

## Purpose
User account management and API key authentication for DataPipeline. Owns user creation,
API key generation/rotation, and the FastAPI dependency that validates API keys on every
protected request. Does NOT handle pipeline or job business logic.

## Public API
  UserService.create_user(data: CreateUserInput) → User
  UserService.get_by_api_key(key: str) → User | None
  UserService.rotate_api_key(user_id: UUID) → str    # returns new plaintext key (shown once)
  get_current_user(api_key: str = Header(...)) → User  # FastAPI dependency for protected routes

## Internal Structure
  service.py       — UserService: create user, find by key, rotate key
  repository.py    — Async SQLAlchemy queries for user table
  schemas.py       — Pydantic: CreateUserInput, UserResponse (no key in response)
  security.py      — Key generation (secrets.token_urlsafe(32)) + SHA-256 hashing
  dependencies.py  — FastAPI get_current_user dependency (raises 401 if invalid)

## Imports from other modules
  core/database    — Async DB session (get_db dependency)
  core/exceptions  — UnauthorizedException, NotFoundException
  core/logger      — Structured auth event logging

## Exports to other modules
  api/             — get_current_user dependency used on all protected routers

## Patterns in use
  - API key: generated with secrets.token_urlsafe(32), stored as SHA-256 hash
  - Lookup: hash the incoming key, query DB by hash — never store or compare plaintext
  - Response: API key shown to user ONCE at creation; not in any subsequent response
  - Auth events logged: user_created, key_rotated, auth_success, auth_failure

## Known constraints / gotchas
  - Key shown once only — if user loses it, they must rotate (no recovery path by design)
  - get_current_user raises HTTP 401 immediately on missing or invalid key — no grace period
  - Rate limiting on auth failures lives in api/middleware/rate_limit.py, not here
  - NEVER log the raw API key — log only `key[:8] + "..."` for debugging correlation

## Security boundary
  - All API key hashing and validation logic lives exclusively in security.py
  - PII: email address only; logged as event presence, not value

## Last updated: 2026-03-22
```

- [ ] **Step 8: Verify no placeholders in python-service files**

```bash
grep -r "\[AGENT:" /mnt/d/Kit/AI_AGENTS_SYSTEM/examples/python-service/ && echo "FOUND PLACEHOLDERS" || echo "CLEAN"
```
Expected: `CLEAN`

- [ ] **Step 9: Commit**

```bash
cd /mnt/d/Kit/AI_AGENTS_SYSTEM
git add examples/python-service/
git commit -m "docs(examples): add DataPipeline Python/FastAPI example with filled navigation files"
```

---

## Task 9: `.github/` configuration

**Files:**
- Create: `.github/ISSUE_TEMPLATE/bug_report.md`
- Create: `.github/ISSUE_TEMPLATE/feature_request.md`
- Create: `.github/PULL_REQUEST_TEMPLATE.md`
- Create: `.github/CONTRIBUTING.md`
- Create: `.github/SECURITY.md`

- [ ] **Step 1: Create directories**

```bash
mkdir -p /mnt/d/Kit/AI_AGENTS_SYSTEM/.github/ISSUE_TEMPLATE
```

- [ ] **Step 2: Create `.github/ISSUE_TEMPLATE/bug_report.md`**

```markdown
---
name: Bug report
about: Unexpected agent behavior or framework issue
title: '[BUG] '
labels: bug
assignees: ''
---

**Which AI agent?**
<!-- Claude Code / Cursor / GitHub Copilot / Antigravity / Other -->

**Which prompt did you use?**
<!-- Bootstrap / Subsequent Session / Targeted Task -->

**What happened?**
<!-- Describe the unexpected agent behavior -->

**Expected behavior**
<!-- What should the agent have done? -->

**Actual behavior**
<!-- What did the agent actually do? -->

**AGENTS.md version**
<!-- Check the top of AGENTS.md — paste the "Last synchronized" line -->

**Additional context**
<!-- Any relevant codebase context, error messages, or session logs -->
```

- [ ] **Step 3: Create `.github/ISSUE_TEMPLATE/feature_request.md`**

```markdown
---
name: Feature request
about: Suggest a new section, rule, or improvement to the framework
title: '[FEATURE] '
labels: enhancement
assignees: ''
---

**What problem does this solve?**
<!-- What agent behavior is missing, inconsistent, or broken without this change? -->
<!-- Be specific: "The agent does X when it should do Y" -->

**Which section of AGENTS.md does this relate to?**
<!-- e.g., §2 Surgical Context Protocol, §5 Coding Standards, new section -->

**Proposed change**
<!-- What should be added, changed, or removed in AGENTS.md or the framework? -->

**Which agent(s) did you test with?**
<!-- Claude Code / Cursor / GitHub Copilot / Antigravity / Other -->

**Have you tested that the current framework doesn't already cover this?**
<!-- Search AGENTS.md first — the answer may already be there -->
- [ ] Yes, searched AGENTS.md and this case is not covered
```

- [ ] **Step 4: Create `.github/PULL_REQUEST_TEMPLATE.md`**

```markdown
## What does this PR do?

<!-- Brief description of the change -->

## Type of change
- [ ] Bug fix (unexpected agent behavior)
- [ ] Framework improvement (new rule or protocol change in AGENTS.md)
- [ ] New example
- [ ] Documentation improvement
- [ ] Installer / tooling fix

## Checklist

- [ ] **If this changes AGENTS.md**: I tested the changed section with at least one AI agent and observed the expected behavior change (describe below)
- [ ] **If this adds an example**: All navigation files are filled with realistic content — no `[AGENT: SCAN AND FILL]` placeholders remaining
- [ ] **If this modifies install.sh or index.js**: Tested in a clean temp directory on the target OS
- [ ] CHANGELOG.md updated
- [ ] No real credentials, real project code, or PII in any example files

## Agent testing notes (if AGENTS.md changed)

<!-- Which agent, which prompt, what behavior you observed before and after the change -->
```

- [ ] **Step 5: Create `.github/CONTRIBUTING.md`**

```markdown
# Contributing to kitai-ai-agents-system-framework

Thank you for contributing. This framework improves through real-world usage.

---

## Types of contributions

### 1. Proposing changes to AGENTS.md (protocol changes)

AGENTS.md is the operating protocol for AI agents. Changes here affect all users across all stacks and all agents.

Before opening a PR:
- Describe the specific agent behavior problem your change solves
- Include a before/after example of agent behavior
- Note which AI agents you tested with

Protocol changes (Sections 1–19) require a clear rationale. Cosmetic changes (formatting, typos) don't.

### 2. Adding new examples

New stack examples are very welcome. Requirements:
1. Create `examples/<your-stack>/`
2. Fill all 5 navigation files with realistic content — **no `[AGENT: SCAN AND FILL]` placeholders**
3. Include at least one `MODULE_MANIFEST.md` in a realistic module subdirectory
4. Use a fictional project name — do not include real codebases, real credentials, or PII
5. Add your example to `examples/README.md`
6. Open a PR

### 3. Improving documentation

README, QUICK_START.md, and this file can always be improved. Fix typos, clarify confusing steps, add missing troubleshooting entries.

### 4. Fixing installer bugs

If `install.sh` or `index.js` has a bug (path handling, OS compatibility, conflict resolution), test your fix in a clean temp directory before submitting.

---

## Commit message format

Follow the format in AGENTS.md §13:

```
<type>(<scope>): <imperative summary, present tense, ≤72 chars>

Types: feat | fix | refactor | docs | chore
Scope: agents | install | examples | readme | quickstart
```

Examples:
- `docs(readme): clarify which 4 files to attach for bootstrap`
- `feat(agents): add §20 multi-repo orchestration protocol`
- `fix(install): handle directory paths containing spaces on Windows`
- `docs(examples): add Go/Gin API example`

---

## Pull request process

1. Fork the repo and create a branch: `git checkout -b docs/improve-quickstart`
2. Make your changes
3. Verify the PR checklist in the PR template
4. Open the PR — describe what you changed and why
```

- [ ] **Step 6: Create `.github/SECURITY.md`**

```markdown
# Security Policy

## Scope

This framework consists of markdown files and a shell/Node.js installer. Security concerns in scope include:

- **install.sh integrity**: The curl installer downloads and executes a shell script. Supply chain tampering with the script or the files it downloads is a critical concern.
- **npm package integrity**: The published npm package should match the source in this repository. Unexpected additions to the npm tarball are in scope.
- **AGENTS.md security rules**: The security rules in AGENTS.md §9 are part of the framework's value. Incomplete, incorrect, or misleading security guidance is in scope.

## Reporting a vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

Open a [GitHub Security Advisory](https://github.com/[OWNER]/kitai-ai-agents-system-framework/security/advisories/new) for private disclosure.

Please include:
1. Description of the vulnerability
2. Steps to reproduce or proof of concept
3. Potential impact
4. Suggested fix (optional)

We will respond within 5 business days and coordinate a fix and disclosure timeline with you.

## Out of scope

- Security vulnerabilities in the codebases of users who installed this framework
- Agent behavior that violates security rules despite AGENTS.md §9 being correctly attached (agent compliance issues, not framework issues)
```

- [ ] **Step 7: Verify all .github files created correctly**

```bash
find /mnt/d/Kit/AI_AGENTS_SYSTEM/.github -type f | sort
```
Expected: 5 files listed:
```
.github/CONTRIBUTING.md
.github/ISSUE_TEMPLATE/bug_report.md
.github/ISSUE_TEMPLATE/feature_request.md
.github/PULL_REQUEST_TEMPLATE.md
.github/SECURITY.md
```

- [ ] **Step 8: Commit**

```bash
cd /mnt/d/Kit/AI_AGENTS_SYSTEM
git add .github/
git commit -m "chore: add GitHub issue templates, PR template, contributing guide, and security policy"
```

---

## Task 10: Final verification

- [ ] **Step 1: Verify total file count**

```bash
find /mnt/d/Kit/AI_AGENTS_SYSTEM -not -path '*/.git/*' -type f | sort
```
Expected: 32 files total (6 original + 26 new)

- [ ] **Step 2: Verify no remaining `[AGENT: SCAN AND FILL]` in non-template files**

The original 6 files are templates — they intentionally contain these placeholders. New files must not.

```bash
find /mnt/d/Kit/AI_AGENTS_SYSTEM -not -path '*/.git/*' \
  -not -name "AGENTS.md" \
  -not -name "FEATURE_INDEX.md" \
  -not -name "MODULE_MANIFEST_TEMPLATE.md" \
  -not -name "DEBT_LEDGER.md" \
  -not -name "REGRESSION_INDEX.md" \
  -type f | xargs grep -l "\[AGENT:" 2>/dev/null && echo "FOUND UNEXPECTED PLACEHOLDERS" || echo "CLEAN"
```
Expected: `CLEAN`

- [ ] **Step 3: Verify all `[OWNER]` placeholders are present where expected**

```bash
grep -r "\[OWNER\]" /mnt/d/Kit/AI_AGENTS_SYSTEM \
  --include="*.md" --include="*.sh" --include="*.json" --include="LICENSE" \
  -l | sort
```
Expected: `install.sh`, `package.json`, `README.md`, `docs/QUICK_START.md`, `.github/SECURITY.md`, `LICENSE`

- [ ] **Step 4: Verify index.js runs without error**

```bash
node /mnt/d/Kit/AI_AGENTS_SYSTEM/index.js
echo "Exit code: $?"
```
Expected: Prints usage, exit code 0

- [ ] **Step 5: Verify install.sh is executable and parses without errors**

```bash
bash -n /mnt/d/Kit/AI_AGENTS_SYSTEM/install.sh && echo "SYNTAX OK"
```
Expected: `SYNTAX OK`

- [ ] **Step 6: Verify git log looks clean**

```bash
cd /mnt/d/Kit/AI_AGENTS_SYSTEM && git log --oneline
```
Expected: 9 commits, each scoped correctly

- [ ] **Step 7: Verify npm tarball will contain all 6 framework files**

```bash
cd /mnt/d/Kit/AI_AGENTS_SYSTEM
npm pack --dry-run 2>&1
```
Expected output includes all 6 framework files:
```
AGENTS.md
ACTIVATION_PROMPT.md
FEATURE_INDEX.md
MODULE_MANIFEST_TEMPLATE.md
DEBT_LEDGER.md
REGRESSION_INDEX.md
index.js
```
If any are missing, fix the `"files"` array in `package.json` and re-run.

- [ ] **Step 8: Commit any remaining unstaged files**

```bash
cd /mnt/d/Kit/AI_AGENTS_SYSTEM
git status
```
If clean: nothing to do. If there are unstaged changes, stage and commit them.

- [ ] **Step 9: Print final summary**

```bash
echo "=== kitai-ai-agents-system-framework ==="
echo ""
echo "Total files:"
find /mnt/d/Kit/AI_AGENTS_SYSTEM -not -path '*/.git/*' -type f | wc -l
echo ""
echo "Git log:"
git log --oneline
echo ""
echo "READY. Complete these manual steps before creating the git tag and pushing:"
echo ""
echo "  REQUIRED before tagging:"
echo "  1. Replace all [OWNER] placeholders in: install.sh, package.json, README.md,"
echo "     docs/QUICK_START.md, .github/SECURITY.md, LICENSE"
echo "  2. Commit the substituted files: git commit -m 'chore: substitute owner placeholder'"
echo "  3. git tag -a v1.0.0 -m 'v1.0.0 — initial production release'"
echo ""
echo "  THEN (GitHub + npm):"
echo "  4. Create GitHub repo: kitai-ai-agents-system-framework"
echo "  5. Enable 'Template repository' in Settings"
echo "  6. Add topics: ai-agents developer-tools claude cursor copilot antigravity framework"
echo "  7. Verify npm name: https://www.npmjs.com/package/kitai-ai-agents-system-framework"
echo "  8. git remote add origin https://github.com/[OWNER]/kitai-ai-agents-system-framework.git"
echo "  9. git push -u origin main --tags"
echo "  10. npm publish"
```

---

## Manual Steps After Implementation (not automated)

These require human action. **Complete steps 1-3 before creating the git tag.**

1. **Replace `[OWNER]` placeholders** in 6 files: `install.sh`, `package.json`, `README.md`, `docs/QUICK_START.md`, `.github/SECURITY.md`, `LICENSE`
2. **Commit**: `git commit -m "chore: substitute owner placeholder"`
3. **Create tag**: `git tag -a v1.0.0 -m "v1.0.0 — initial production release"` *(after step 2)*
4. **Create GitHub repository** named `kitai-ai-agents-system-framework`
5. **Enable Template repository**: Settings → check "Template repository"
6. **Add repository topics**: `ai-agents`, `developer-tools`, `claude`, `cursor`, `copilot`, `antigravity`, `framework`, `coding-assistant`, `llm`
7. **Verify npm package name** availability: `npmjs.com/package/kitai-ai-agents-system-framework`
8. **Push to GitHub**: `git remote add origin ... && git push -u origin main --tags`
9. **Publish to npm**: `npm publish` (requires npm account + `npm login`)
