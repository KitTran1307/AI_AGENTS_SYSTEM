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
