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
