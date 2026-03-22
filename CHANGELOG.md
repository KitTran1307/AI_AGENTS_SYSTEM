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
