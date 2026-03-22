# Production Release Design — kitai-ai-agents-system-framework

**Date**: 2026-03-22
**Status**: Approved
**Scope**: Public GitHub release of the Universal AI Agent System Framework

---

## 1. Project Summary

The `kitai-ai-agents-system-framework` is a universal AI Agent governance framework consisting of 6 markdown files. It provides any software project — regardless of tech stack — with a structured operating protocol that AI coding assistants (Claude Code, Cursor, GitHub Copilot, Antigravity, etc.) follow automatically when attached to a session.

**Core value proposition**: Drop these files into any project, run one bootstrap prompt, and every AI agent that touches that project will follow consistent engineering standards, maintain navigation files, avoid known regressions, and behave like a senior CTO rather than a code-completion tool.

---

## 2. Goals

1. **Zero-friction installation** — 3 methods: GitHub Template, `npx`, `curl | bash`
2. **Perfect first impression** — README converts visitors to users in 30 seconds
3. **AI agents must follow the system** — AGENTS.md + ACTIVATION_PROMPT.md provide enough context that any compatible agent bootstraps without manual guidance
4. **Works solo and at team scale** — No assumptions about project size or team structure
5. **Explicit agent compatibility** — Claude Code, Cursor, Copilot, Antigravity named and documented

---

## 3. Repository Structure

```
kitai-ai-agents-system-framework/
│
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── CONTRIBUTING.md
│
├── examples/
│   ├── README.md                    — How to read the examples
│   ├── nodejs-api/                  — Bootstrapped Node.js/Express project
│   │   ├── PROJECT_MAP.md           — Filled topology for fictional TaskAPI
│   │   ├── FEATURE_INDEX.md         — Real entries for auth, tasks, users domains
│   │   ├── CHANGELOG.md             — Bootstrap entry + 1 sample feature entry
│   │   ├── REGRESSION_INDEX.md      — 1 sample bug entry
│   │   ├── DEBT_LEDGER.md           — 1 sample debt entry
│   │   └── src/auth/MODULE_MANIFEST.md — Real module manifest example
│   └── python-service/              — Bootstrapped FastAPI service
│       ├── PROJECT_MAP.md
│       ├── FEATURE_INDEX.md
│       ├── CHANGELOG.md
│       ├── REGRESSION_INDEX.md
│       ├── DEBT_LEDGER.md
│       └── app/users/MODULE_MANIFEST.md
│
├── docs/
│   └── QUICK_START.md               — Step-by-step for solo devs + teams
│
├── AGENTS.md                        — Core framework authority document
├── ACTIVATION_PROMPT.md             — Bootstrap, Session, and Task prompts
├── FEATURE_INDEX.md                 — Template for feature navigation index
├── MODULE_MANIFEST_TEMPLATE.md      — Template for per-module documentation
├── DEBT_LEDGER.md                   — Template for technical debt tracking
├── REGRESSION_INDEX.md              — Template for bug memory
│
├── install.sh                       — curl-based shell installer
├── package.json                     — npm package (npx entry point)
├── index.js                         — npm bin script (Node.js installer)
├── README.md                        — Primary project documentation
├── LICENSE                          — MIT
├── CHANGELOG.md                     — Framework version history
└── .gitignore
```

---

## 4. Installation System

### 4.1 GitHub Template Repository
- Repo configured as a GitHub Template (Settings → Template repository ✓)
- Users click "Use this template" → get a copy of the full repo
- All 6 framework files land at repo root, ready to attach to AI sessions

### 4.2 Shell Installer (`install.sh`)
```bash
curl -fsSL https://raw.githubusercontent.com/[OWNER]/kitai-ai-agents-system-framework/main/install.sh | bash
```
Behavior:
- Detects current working directory
- Copies all 6 framework files to `./`
- **Conflict resolution**: default behavior is skip-with-warning (prints which files were skipped). Accepts `--force` flag to overwrite all. Non-interactive friendly — safe to use in CI/CD pipelines without input prompts.
- Prints next steps after install: which files to attach + which prompt to paste

**Note**: All `[OWNER]` placeholders throughout this spec are left for manual substitution after the GitHub account is confirmed.

### 4.3 npm / npx Package
```bash
npx kitai-ai-agents-system-framework init
```
Behavior (via `index.js` bin script):
- Copies 6 framework files (bundled inside the npm tarball at publish time) to `process.cwd()`
- Uses Node.js built-ins only (`fs`, `path`) — zero external dependencies
- Conflict resolution: same skip-with-warning default as install.sh; `--force` flag to overwrite
- Windows-compatible: uses `path.join()` throughout, handles spaces in paths
- Published as `kitai-ai-agents-system-framework` on npmjs.com

**Prerequisite**: Verify npm package name `kitai-ai-agents-system-framework` is available on npmjs.com before publishing. If taken, the alternative is `@[OWNER]/ai-agents-system` (scoped package).

---

## 5. README.md Structure

1. **Hero** — name, one-line tagline, badges (MIT license from GitHub, npm version from npmjs.com once published — use static shields as placeholder until npm publish)
2. **Compatibility table** — Claude Code ✅, Cursor ✅, GitHub Copilot ✅, Antigravity ✅
3. **3-method install block** — GitHub Template / npx / curl — one command each. All `[OWNER]` references use a clearly marked placeholder.
4. **30-second explanation** — what it is, what the 5 navigation files do, CEO/CTO model
5. **Getting started (5 steps)** — install → attach **AGENTS.md + ACTIVATION_PROMPT.md + FEATURE_INDEX.md + MODULE_MANIFEST_TEMPLATE.md** (these 4 files) to your AI session → paste Bootstrap Activation Prompt from ACTIVATION_PROMPT.md → agent scans and creates all navigation files → every future session: attach PROJECT_MAP.md + FEATURE_INDEX.md + CHANGELOG.md (last 10 entries) and paste Subsequent Session Prompt
6. **Examples** — links to `examples/nodejs-api/` and `examples/python-service/`
7. **Contributing + License**

---

## 6. Examples Directory

### examples/README.md content
Explains: (1) what these examples are — output of the Bootstrap Protocol, not templates; (2) how to read them — PROJECT_MAP.md first, then FEATURE_INDEX.md; (3) the two projects covered (TaskAPI Node.js, DataPipeline Python); (4) encouragement to submit examples for other stacks via PR.

### Purpose
Show what a project looks like **after bootstrap** — not the templates, but real filled-in navigation files. This answers the user's most common question: *"What does this actually produce?"*

### nodejs-api example
Fictional project: "TaskAPI" — a Node.js/Express REST API with JWT auth, task management, user accounts.
- `PROJECT_MAP.md` — filled with real module topology, tech stack (Node.js, Express, PostgreSQL, Redis), public interface registry
- `FEATURE_INDEX.md` — entries for `auth::users::login`, `auth::users::register`, `tasks::crud::create`, `tasks::crud::list`, etc.
- `CHANGELOG.md` — bootstrap entry + one realistic feature entry
- `REGRESSION_INDEX.md` — one REG-001 entry (realistic bug scenario)
- `DEBT_LEDGER.md` — one DEBT-001 entry
- `src/auth/MODULE_MANIFEST.md` — fully filled manifest for the auth module

### python-service example
Fictional project: "DataPipeline" — a Python/FastAPI async data processing service with SQLAlchemy and Celery workers.
- `PROJECT_MAP.md` — filled with real module topology, tech stack (Python 3.11, FastAPI, PostgreSQL, Celery, Redis), public interface registry
- `FEATURE_INDEX.md` — entries for `ingestion::pipeline::create`, `processing::workers::transform`, `api::health::check`, etc.
- `CHANGELOG.md` — bootstrap entry + one realistic feature entry
- `REGRESSION_INDEX.md` — one REG-001 entry (realistic async bug scenario)
- `DEBT_LEDGER.md` — one DEBT-001 entry
- `app/users/MODULE_MANIFEST.md` — fully filled manifest for the users module

---

## 7. docs/QUICK_START.md

Covers:
1. Prerequisites (any AI coding assistant)
2. Installation (pick a method)
3. First session: attaching files and running Bootstrap Prompt
4. What the agent does during bootstrap
5. Subsequent sessions: Subsequent Session Prompt
6. Team setup: committing navigation files to git so all team members + agents share the same context

---

## 8. .github/ Configuration

All files live under `.github/`. GitHub auto-discovers `CONTRIBUTING.md`, `SECURITY.md`, and issue/PR templates from `.github/` — this location is intentional and canonical.

### ISSUE_TEMPLATE/bug_report.md
Fields: description of unexpected agent behavior, which agent/version, which prompt used, expected vs actual behavior.

### ISSUE_TEMPLATE/feature_request.md
Fields: what behavior is missing, use case, proposed addition to AGENTS.md.

### PULL_REQUEST_TEMPLATE.md
Checklist: does this change AGENTS.md protocol? tested with at least one agent? examples updated?

### CONTRIBUTING.md
- How to propose changes to AGENTS.md (framework changes require rationale)
- How to add new examples
- Commit message format (matches AGENTS.md §13)

### SECURITY.md
- Security disclosure policy for the framework itself
- Instructs reporters to open a GitHub Security Advisory (private disclosure)
- Scope: install.sh integrity, npm package integrity, AGENTS.md protocol security rules

---

## 9. Versioning Strategy

- **v1.0.0** — initial production release
- **Semantic versioning**: `MAJOR.MINOR.PATCH`
  - MAJOR: breaking changes to AGENTS.md protocol (agents following v1 would behave incorrectly on v2)
  - MINOR: new sections, new templates, new examples
  - PATCH: typo fixes, clarifications, example improvements
- Framework `CHANGELOG.md` tracks version history (separate from the template `CHANGELOG.md`)

---

## 10. Files To Create (delta from current state)

New files (26):
- `README.md`
- `LICENSE`
- `CHANGELOG.md` (framework version history)
- `.gitignore`
- `install.sh`
- `package.json`
- `index.js`
- `docs/QUICK_START.md`
- `examples/README.md`
- `examples/nodejs-api/PROJECT_MAP.md`
- `examples/nodejs-api/FEATURE_INDEX.md`
- `examples/nodejs-api/CHANGELOG.md`
- `examples/nodejs-api/REGRESSION_INDEX.md`
- `examples/nodejs-api/DEBT_LEDGER.md`
- `examples/nodejs-api/src/auth/MODULE_MANIFEST.md`
- `examples/python-service/PROJECT_MAP.md`
- `examples/python-service/FEATURE_INDEX.md`
- `examples/python-service/CHANGELOG.md`
- `examples/python-service/REGRESSION_INDEX.md`
- `examples/python-service/DEBT_LEDGER.md`
- `examples/python-service/app/users/MODULE_MANIFEST.md`
- `.github/ISSUE_TEMPLATE/bug_report.md`
- `.github/ISSUE_TEMPLATE/feature_request.md`
- `.github/PULL_REQUEST_TEMPLATE.md`
- `.github/CONTRIBUTING.md`
- `.github/SECURITY.md`

Existing files (6): unchanged
- `AGENTS.md`, `ACTIVATION_PROMPT.md`, `FEATURE_INDEX.md`, `MODULE_MANIFEST_TEMPLATE.md`, `DEBT_LEDGER.md`, `REGRESSION_INDEX.md`

---

## 11. Success Criteria

- [ ] A developer with zero prior knowledge can install in under 2 minutes
- [ ] Claude Code follows the framework when AGENTS.md + ACTIVATION_PROMPT.md are attached
- [ ] Cursor follows the framework with the same files in `.cursorrules` or context
- [ ] GitHub Copilot follows the framework via workspace instructions
- [ ] Examples show realistic, filled-in navigation files (not templates with placeholders)
- [ ] Repository is configured as a GitHub Template (one-click install)
- [ ] `npx kitai-ai-agents-system-framework init` works on macOS, Linux, Windows
- [ ] `curl | bash` installer skips existing files by default; `--force` flag overwrites
- [ ] npm package name verified available before publishing
- [ ] Repository topics set: `ai-agents`, `developer-tools`, `claude`, `cursor`, `copilot`, `coding-assistant`, `framework`
- [ ] All `[OWNER]` placeholders substituted with actual GitHub account before go-live

## 12. .gitignore Contents

Covers:
- OS files: `.DS_Store`, `Thumbs.db`, `desktop.ini`
- Node.js artifacts: `node_modules/`, `*.log`, `.npm`
- Editor/IDE files: `.vscode/settings.json`, `.idea/`
- Common secrets: `.env`, `.env.local`, `*.pem`, `*.key`

Note: The repo itself has no build artifacts — `.gitignore` is primarily defensive against accidental commits by users who clone the repo.
