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
