# AI Agents System

> Rules and an installer that make AI coding assistants plan, test and review their work before it ships.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

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

Clone this repository once, then run the installer from the root of the project you want to equip. It copies the framework files into the current directory:

```bash
git clone https://github.com/KitTran1307/AI_AGENTS_SYSTEM.git
cd /path/to/your-project
bash /path/to/AI_AGENTS_SYSTEM/install.sh
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

**Step 3** — Copy the **Bootstrap Activation Prompt** from `ACTIVATION_PROMPT.md` (look for the `===ACTIVATION PROMPT (copy from here)===` line) and paste it into your session.

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
