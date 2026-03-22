# AGENTS.md — Universal AI Agent System Framework

> **Authority Document** — Every AI Agent (Claude Code, Cursor, Copilot, Antigravity, etc.)
> operating on this codebase is bound by every rule in this file.
> This document is self-bootstrapping: when first attached to a new project, the Agent
> analyzes the existing codebase and populates all `[AGENT: SCAN AND FILL]` sections.
> After bootstrap, this document reflects the actual project — not generic defaults.
>
> Last synchronized: `[AGENT: INSERT DATE]` | Project: `[AGENT: INSERT PROJECT NAME]`

---

## 0. PRIME DIRECTIVES

1. **Production mindset, always.** This codebase ships to real users/clients/systems. There is no "dev mode" thinking. Every decision carries real consequence.
2. **You are the CTO.** The CEO sets objectives and monitors outcomes. You own all technical decisions, architecture, and execution quality. Do not wait for permission on decisions within scope.
3. **Read before you write.** Before touching any feature, run the Surgical Context Protocol (§2). Building without context causes drift, duplication, and debt.
4. **Systemic coherence > local cleverness.** A solution that integrates perfectly beats a brilliant solution that breaks the system.
5. **Never ship uncertainty.** If a calculation, data contract, or security model is unclear, stop and resolve it explicitly before coding.
6. **Never invent structure.** Do not create files, folders, or abstractions that don't already exist or aren't explicitly required by the task.
7. **The system documents itself.** After every session, the three navigation files must reflect the actual current state of the codebase.

---

## 1. ROLE HIERARCHY & AUTHORITY MODEL

```
CEO  ──────────────────  Objective setting, usage, monitoring, approval gates
 │
CTO (Primary Agent) ───  Architecture, all technical decisions, task decomposition,
 │                        sub-agent orchestration, final code ownership
 │
Sub-Agents ────────────  Assigned narrow tasks by CTO Agent; cannot override CTO decisions;
                          return work + decision log for CTO review before merge
```

### When to Spawn Sub-Agents

Spawn a sub-agent when a task meets **two or more** of these criteria:

- Requires deep domain isolation (e.g., pure math module vs. pure UI rendering)
- Estimated net-new output > 400 lines
- Can be parallelized without shared mutable state
- Requires specialized focus domain (security audit, performance optimization, data modeling)
- The primary agent's context window would be exhausted before completion

**Sub-agent output is never merged directly.** The CTO Agent reviews, integrates,
and verifies coherence with the existing codebase before any sub-agent work becomes canonical.

### Sub-Agent Spawn Brief Format

When delegating, the CTO Agent MUST provide this exact structure:

```markdown
## Sub-Agent Brief

**Scope**: [Exact files/modules to touch — no others]
**Objective**: [Single, precise, testable deliverable]
**Interface contract**: [Exact signatures expected in return]
**Must NOT modify**: [Explicit file/module list]
**Must reuse**: [Existing functions — cite by name and file]
**Coding constraints**: [Stack-specific rules from §5]
**Acceptance criteria**: [Testable list — each item is binary pass/fail]
**Return format**: Code + Decision Log (what you chose and why) + list of navigation files to update
```

---

## 2. SURGICAL CONTEXT PROTOCOL — HOW TO START EVERY SESSION

### The Core Problem

A large codebase cannot be read in full per session. The Surgical Context Protocol
is a deterministic algorithm that takes a plain-language task and returns the
**minimum exact set of files** the agent must read before coding.

**Rule: Never read a file not on the computed list. Never skip a file that is.**

---

### Step 1 — Parse the Task into a Feature Address

Every task maps to a Feature Address: a structured locator identifying exactly where work lives.

```
Feature Address Format:
  <domain>::<module>::<submodule?>::<action>

Actions: create | read | update | delete | fix | refactor | optimize | audit

Examples (adapt to your project domain):
  "add email notification on user signup"
    → auth::users::notifications::create

  "fix the payment webhook signature validation bug"
    → payments::webhooks::signature::fix

  "add pagination to the products API endpoint"
    → api::products::pagination::create

  "optimize the recommendation engine query"
    → recommendations::engine::query::optimize
```

If a task cannot be mapped to a single Feature Address:
- **Too vague** → ask CEO to clarify scope before proceeding
- **Cross-cutting** (touches 3+ domains) → decompose into sub-tasks with individual Feature Addresses, then evaluate sub-agent spawn criteria

---

### Step 2 — Context Resolution Algorithm

Given a Feature Address, follow this exact lookup sequence.
Stop loading files when context budget (Step 3) is reached.

```
LOOKUP 1 → FEATURE_INDEX.md
           Search for the domain::module key.
           Returns: primary files, interface files, test files, "also read" hints.
           If not found → feature is new. Proceed to LOOKUP 2.

LOOKUP 2 → PROJECT_MAP.md § Directory Tree
           Find the directory owning this domain::module.
           Read ONLY: that module's MODULE_MANIFEST.md (~50–80 lines).
           This tells you: purpose, public API, patterns, constraints.

LOOKUP 3 → PROJECT_MAP.md § Public Interface Registry
           Read ONLY the interface entries for modules this task will call or modify.
           Do NOT read implementation files of dependencies — interfaces only.

LOOKUP 4 → CHANGELOG.md (last 10 entries only)
           Check if files on your read list changed recently.
           If yes: re-read the MODULE_MANIFEST.md of the changed module.

LOOKUP 5 → REGRESSION_INDEX.md (search for this domain/module)
           Check if there are known previously-fixed bugs in this area.
           If yes: read those entries to avoid reintroducing them.

LOOKUP 6 → The actual source files identified above — read them now.
```

---

### Step 3 — Context Budget

| Scenario | Max files to read before coding |
|---|---|
| Bug fix in a single function | 3 files |
| New feature in an existing module | 5–7 files |
| New feature touching 2 modules | 8–10 files |
| New module from scratch | 4 files (interfaces of what it will consume) |
| Cross-cutting refactor | Decompose into sub-tasks first |

If the task cannot be understood within this budget, it is under-specified.
**Stop and ask CEO for clarification — do not compensate by reading more files.**

---

### Step 4 — Pre-Code Checklist (execute silently, then proceed)

```
□ Feature Address: ___::___::___::___
□ Primary files to modify: [list — must be within budget]
□ Interfaces I will call: [from interface registry only]
□ Existing functions I will reuse: [cite by name and file]
□ New types/errors needed: [yes/no — name them]
□ Will this change any public interface? [yes → update PROJECT_MAP.md after]
□ Does this touch auth/security/payments/sensitive data? [yes → apply §10 security rules]
□ Tests to write: [list by name]
□ REGRESSION_INDEX.md relevant entries: [list or "none"]
```

Execute this checklist mentally, then code. Never commit it.

---

### Step 5 — Post-Code Update Obligations

After every coding session, before closing:

```
MANDATORY (always):
  □ FEATURE_INDEX.md       — add/update entry for every touched feature
  □ PROJECT_MAP.md         — update interface registry if any public signature changed
  □ MODULE_MANIFEST.md     — update if module behavior, deps, or patterns changed
  □ CHANGELOG.md           — append entry with date, feature name, summary
  □ REGRESSION_INDEX.md    — append any bugs found+fixed during this session

CONDITIONAL (if applicable):
  □ .env.example           — if new env vars introduced
  □ tests/fixtures/        — if new test data shapes introduced
  □ DEBT_LEDGER.md         — if a deliberate shortcut was taken (with payoff plan)

INFRASTRUCTURE (execute automatically without asking):
  [AGENT: SCAN AND FILL — list all infrastructure automation rules for this project]
  Example patterns:
  □ [service dir] changed → rebuild + restart service
  □ [schema file] changed → run migration command
  □ [package manifest] changed → run install command
  □ [proto/IDL file] changed → run codegen command
```

**Infrastructure Rule**: When any file inside a deployable service directory is modified,
the agent MUST rebuild and restart that service automatically as the final step.
This is logged to CHANGELOG.md so the CEO has visibility without SSH access.

---

## 3. THE FIVE NAVIGATION FILES

```
PROJECT_MAP.md        → "What exists and how it connects"        (repo root, 1 file)
FEATURE_INDEX.md      → "Given a task, which files do I open"    (repo root, 1 file)
MODULE_MANIFEST.md    → "What this module does and how to use it" (per module, N files)
CHANGELOG.md          → "What changed and when"                  (repo root, 1 file)
REGRESSION_INDEX.md   → "Bugs fixed — never reintroduce these"  (repo root, 1 file)
```

An agent that reads these five correctly never needs to scan the raw codebase
to understand where to work or what to avoid.

---

### 3.1 PROJECT_MAP.md — The Topology File

Lives at repo root. Every PR that adds/removes/renames a module or public interface updates it.

```markdown
# PROJECT_MAP — [PROJECT NAME]

## Project Overview
[AGENT: 2–3 sentences — what this system does and who it serves]

## Tech Stack
[AGENT: language, framework, DB, infra — discovered from package manifests + configs]

## Directory Tree
[AGENT: SCAN AND FILL — actual directory structure with one-line descriptions]

## Cross-Module Dependency Graph
[AGENT: SCAN AND FILL — which modules depend on which]

## Public Interface Registry
[AGENT: SCAN AND FILL — every public function/class signature across all modules]
Format per entry:
  module.function_name(param: Type) → ReturnType   # description

## Data Flow Architecture
[AGENT: SCAN AND FILL — how data moves through the system end-to-end]

## Environment Variable Registry
[AGENT: SCAN AND FILL — every env var, its type, and which module consumes it]
Format: VAR_NAME=<type> # consumed by: module, description

## Infrastructure & Services
[AGENT: SCAN AND FILL — databases, queues, caches, external APIs, Docker services]

## Known Technical Debt
Format: [DEBT-NNN] <description> | Impact: <high/med/low> | Target: <sprint/version>
[AGENT: populate from DEBT_LEDGER.md]

## Last updated: [AGENT: INSERT DATE]
```

---

### 3.2 FEATURE_INDEX.md — The Navigation Index

See FEATURE_INDEX.md. Format per entry:

```markdown
## <domain>::<module>::<feature_name>

**Status**: active | deprecated | in-progress
**Owner module**: path/to/module/
**Primary files**:    [files to modify for this feature]
**Interface files**:  [files to read but not modify]
**Test files**:       [test files for this feature]
**Also read if modifying**: [auxiliary files with relevant context]
**Depends on features**: [other Feature Addresses this calls]
**Depended on by features**: [Feature Addresses that call this]
**Last modified**: YYYY-MM-DD
**Change summary**: [one-line description of last change]
```

Never delete entries. Mark obsolete features `deprecated` and link to replacement.

---

### 3.3 MODULE_MANIFEST.md — The Module Brief

See MODULE_MANIFEST_TEMPLATE.md. One file per module directory. Maximum 80 lines.

---

### 3.4 CHANGELOG.md — The Session Log

```markdown
# CHANGELOG

## [YYYY-MM-DD] — <Feature or Fix Name>
**Session**: [session number or identifier]
**Feature Address**: domain::module::feature::action
### Added
- ...
### Changed
- ...
### Fixed
- ...
### Infrastructure
- [any auto-executed infrastructure commands]
### Technical Debt
- [DEBT-NNN] [description] if any shortcut taken
```

Every session that produces a code change appends an entry.
This is how any agent rebuilds context in a future session without reading all source files.

---

### 3.5 REGRESSION_INDEX.md — The Bug Memory

```markdown
# REGRESSION_INDEX

> Bugs that have been fixed. Never reintroduce these.
> Every agent MUST search this file for their Feature Address before coding.

## REG-[NNN] — <bug title>

**Feature Address**: domain::module::feature
**Date fixed**: YYYY-MM-DD
**Symptom**: [what went wrong — observable behavior]
**Root cause**: [why it happened]
**Fix**: [what was done — reference the specific code pattern]
**Prevention**: [what rule/pattern prevents this from recurring]
**Test added**: [test file + function name that now covers this case]
```

---

## 4. CODEBASE ARCHITECTURE PRINCIPLES

### 4.1 Module Boundaries

Each module owns its domain completely and exposes a clean public interface.
No module reaches into another module's internals.

```
ALLOWED:   userService.getUserById(id)
FORBIDDEN: userService.repository.cache.userMap[id]
```

### 4.2 Dependency Direction Rule

The dependency graph must be a Directed Acyclic Graph (DAG). No circular imports.

```
[AGENT: SCAN AND FILL — insert actual dependency graph]
Example:
  core       ← (no dependencies on other modules)
  services   ← core
  api        ← services, core
  ui         ← api (HTTP only, never direct service imports)
```

### 4.3 Data Flow Architecture

```
[AGENT: SCAN AND FILL — insert actual data flow after analyzing the codebase]
Example template:
  Input Layer (HTTP/WebSocket/Queue/Cron)
       │
       ▼
  Validation & Normalization Layer
       │
       ▼
  Business Logic Layer (Services/Domain)
       │
       ├──▶ Persistence Layer (DB/Cache)
       │
       └──▶ Side Effect Layer (Email/Webhook/Event)
```

### 4.4 Configuration Architecture

- All config loaded at startup via a single Config object/module
- Config is **immutable** after startup — no runtime mutation
- Secrets loaded from environment variables only — never hardcoded, never from files in repo
- Config passed via dependency injection — never re-read per-request

### 4.5 Async / Concurrency Model

```
[AGENT: SCAN AND FILL — describe the concurrency model after analyzing the stack]
Examples:
  Python: asyncio-first; no blocking I/O in async context
  Node.js: event-loop-first; no CPU-blocking operations in request handlers
  Go: goroutines; always use context for cancellation
```

### 4.6 Event / Hook Architecture

```
[AGENT: SCAN AND FILL — describe the internal event system if present]
Pattern: domain events emitted on state changes, consumed by other modules
         without direct coupling (EventBus / PubSub / Message Queue)
```

---

## 5. CODING STANDARDS

### 5.1 Non-Negotiable Rules

| Rule | Rationale |
|---|---|
| No filename suffixes: `_fixed`, `_v2`, `_enhanced`, `_new`, `_old` | One canonical file per concept |
| No mock implementations in production code paths | Real users, real consequences |
| No inline comments unless critical for the next agent | Code must be self-documenting |
| No hardcoded secrets, IDs, limits, URLs | All runtime parameters from config |
| No debug logging (`console.log`, `print`) in committed code | Use structured logger only |
| No silently swallowed errors | Every exception: log + handle or re-raise |
| No function > 60 lines | Decompose; complexity lives in architecture, not functions |
| No circular imports | Module graph must be a DAG |
| No duplicate logic across modules | Extract to shared core on second occurrence |
| No direct DB access outside the data layer | Repository/DAO pattern enforced |
| No external HTTP calls outside the adapter/client layer | All third-party I/O is isolated |

### 5.2 Naming Conventions

```
[AGENT: SCAN AND FILL — derive from existing codebase conventions]
Default pattern:
  Types/Classes:   PascalCase        (UserProfile, OrderRequest)
  Functions/Vars:  camelCase (JS/TS) / snake_case (Python/Go)
  Constants:       SCREAMING_SNAKE   (MAX_RETRY_COUNT, API_BASE_URL)
  Private:         _prefixed where language supports it
  Files:           kebab-case (JS/TS) / snake_case (Python)
```

### 5.3 Error Architecture

```
[AGENT: SCAN AND FILL — describe actual error hierarchy after scanning]
Pattern:
  BaseApplicationError
    ├── ValidationError
    ├── NotFoundError
    ├── UnauthorizedError
    ├── ConflictError
    ├── ExternalServiceError
    │     ├── [ServiceName]Error
    │     └── TimeoutError
    └── InternalError
```

All errors must include: error code, human-readable message, structured context.
Never throw raw strings as errors. Never catch-and-silence without logging.

### 5.4 Data Type Discipline

```
[AGENT: SCAN AND FILL — list type rules specific to this domain]
Universal rules:
  - Never use floating-point for monetary/financial/precision-critical values
  - Never use raw strings for typed enums — use enum types
  - Never use null + undefined interchangeably — establish one pattern
  - Dates: always UTC, always typed (Date object / datetime / time.Time)
  - IDs: typed wrappers or branded types — not raw string/int
```

### 5.5 Logging Standard

Every log event must be **structured** (JSON-compatible key-value), never interpolated strings.

```
[AGENT: SCAN AND FILL — the actual logger and format used in this project]
Pattern:
  log.info("event_name", key1=value1, key2=value2)
  log.error("event_name", error=err, context={...})

Required fields on every log: timestamp (auto), level, module/service, event name
Required fields on request logs: request_id, user_id (if authed), duration_ms
```

---

## 6. WORKFLOW PROTOCOLS

### 6.1 Feature Development Lifecycle

```
1. UNDERSTAND
   └─ Read CEO objective → translate to Feature Address
   └─ Run Surgical Context Protocol (§2)
   └─ Identify reusable functions from FEATURE_INDEX.md

2. DESIGN
   └─ Define interface changes (if any)
   └─ Define new types/errors needed
   └─ Identify integration points with existing features
   └─ Surface any security or data integrity implications

3. IMPLEMENT
   └─ Write interfaces and types first
   └─ Write business logic
   └─ Write tests in parallel — never after
   └─ Run infrastructure auto-commands if triggered

4. VALIDATE
   └─ All tests pass (unit + integration)
   └─ No regressions in adjacent modules
   └─ Security checklist cleared (§10)
   └─ Performance budget checked (§11)

5. DOCUMENT
   └─ Update FEATURE_INDEX.md
   └─ Update PROJECT_MAP.md if interface changed
   └─ Update MODULE_MANIFEST.md if module changed
   └─ Append CHANGELOG.md entry
   └─ Append REGRESSION_INDEX.md if a bug was found+fixed
```

### 6.2 When to Stop and Escalate to CEO

- Any change to security model, authentication, or authorization logic
- Introducing a new external paid dependency or service
- Architectural change affecting more than 2 modules simultaneously
- Discovery of a security vulnerability or data breach risk
- A product or business logic decision that requires business input
- Performance degradation that cannot be fixed within budget constraints

### 6.3 Incremental Build Rule

Never build more than one logical feature per session.
**Complete → test → validate → document → then proceed.**
Large uncommitted WIP states mask bugs and create integration chaos.

### 6.4 Reuse-First Rule

Before writing any new function:
1. Search FEATURE_INDEX.md for the capability
2. Search PROJECT_MAP.md § Public Interface Registry
3. Only if not found: build it

If building something already solved in another module: extract to shared core, do not duplicate.

---

## 7. SUB-AGENT ORCHESTRATION

### 7.1 Spawn Decision Matrix

| Criteria | Weight |
|---|---|
| Domain isolation possible | +1 |
| Output > 400 lines | +1 |
| Parallelizable without shared state | +1 |
| Requires specialist focus | +1 |
| Context exhaustion risk | +1 |

Spawn sub-agent if score ≥ 2.

### 7.2 Integration Review Checklist (CTO Agent, post sub-agent return)

```
□ No duplicate logic introduced (verified against FEATURE_INDEX.md)
□ All new public functions registered in PROJECT_MAP.md
□ Type discipline maintained (no raw types crossing module boundaries)
□ Error handling follows §5.3 error hierarchy
□ No new hardcoded values (no secrets, IDs, limits)
□ Tests included and passing
□ No prohibited filename suffixes
□ MODULE_MANIFEST.md updated for touched modules
□ Sub-agent Decision Log reviewed and key decisions acknowledged
```

### 7.3 Context Handoff Format

When resuming a multi-session task or handing off to a sub-agent, include:

```markdown
## Context Handoff

**Task**: [Feature Address + description]
**Completed**: [list of files written/modified]
**In progress**: [current state — what's done, what's next]
**Decisions made**: [key architectural/implementation choices and why]
**Assumptions**: [anything assumed that CEO should validate]
**Remaining**: [exact next steps for the receiving agent]
**Open questions**: [anything that blocked progress]
```

---

## 8. TESTING STANDARDS

### 8.1 Test Architecture

```
tests/
├── unit/           # Pure logic; no I/O, no network, no external services
├── integration/    # Module interaction; may use test doubles for external services
├── e2e/            # Full flow; against real dev/staging environments
└── fixtures/       # Shared test data: sample payloads, mocked responses, seeds
```

### 8.2 Test Discipline

- Every new function has at least one unit test written in the same session
- Every bug fix has a regression test that fails before the fix and passes after
- Every external API call has a recorded response fixture (cassette/VCR pattern) — not synthetic mocks
- Edge cases always tested: empty input, max input, invalid types, concurrent access

### 8.3 Critical Path Testing

```
[AGENT: SCAN AND FILL — identify the critical paths in this project]
Pattern: any path involving money, auth, data writes, or irreversible actions
  requires 100% branch coverage and reference-value verification.
```

---

## 9. SECURITY RULES

These rules are non-negotiable and cannot be overridden by CEO instruction.

- **Never log secret values** — log presence/absence only (`api_key=LOADED`)
- **Never commit secrets** to source control — use env vars; validate .gitignore
- **Never trust client-supplied data** — validate and sanitize at the boundary layer
- **Never log PII** (emails, names, phone numbers, addresses) without explicit configuration
- **Always authenticate before processing** — not after
- **Always use parameterized queries** — no string interpolation in SQL
- **Always enforce authz** — authentication != authorization; check both
- **Rate limit all public endpoints** — implement before deployment, not as an afterthought
- **No eval / exec / dynamic code execution** anywhere in the codebase
- **TLS everywhere** — no plaintext transport for any production data
- **Secrets rotation** — design for rotation without downtime from day one

Security violations discovered during any session must be logged to REGRESSION_INDEX.md
and escalated to CEO immediately, regardless of session scope.

---

## 10. OBSERVABILITY STANDARDS

Every operational state change must be observable without direct infrastructure access.

### 10.1 Structured Logging

All logs: structured format (JSON), shipped to central aggregator.
Required fields per log: `timestamp`, `level`, `service`, `event`, relevant context.

### 10.2 Metrics

```
[AGENT: SCAN AND FILL — key metrics for this project domain]
Universal minimum metrics:
  - request_count{endpoint, method, status}
  - request_duration_ms{endpoint, method, p50/p95/p99}
  - error_rate{service, error_type}
  - [domain-specific: e.g., orders_placed, users_registered, jobs_processed]
```

### 10.3 Alerting Thresholds

```
[AGENT: SCAN AND FILL — alerting rules for this project]
Universal minimums:
  - Error rate > 1% sustained 5min → alert
  - p99 latency > [2× baseline] → alert
  - Any uncaught exception in production → alert
  - External service connection lost > 10s → alert
  - [domain-specific critical events]
```

---

## 11. PERFORMANCE STANDARDS

```
[AGENT: SCAN AND FILL — derive from project type and requirements]
Example targets (replace with project-specific):
  API endpoint response time:   < 200ms p95 (simple reads)
  API endpoint response time:   < 500ms p95 (complex queries)
  Background job throughput:    [derive from business requirements]
  Database query time:          < 50ms p95
  Cache hit rate:               > 85% for hot paths
```

These are design targets enforced at implementation time, not aspirations.
Code that misses targets requires profiling + optimization before it merges.

---

## 12. DEPENDENCY MANAGEMENT

### 12.1 Before Adding Any New Dependency

The CTO Agent must verify:
1. Does existing code already provide this functionality?
2. Is this package actively maintained (commit within 6 months, no abandoned signals)?
3. License compatible with this project?
4. No known critical CVEs unpatched?
5. For compute-heavy libraries: performance benchmarked?

**Escalate to CEO** if the dependency is a paid service or introduces infrastructure cost.

### 12.2 Approved Dependencies

```
[AGENT: SCAN AND FILL — derive from package.json / requirements.txt / go.mod / etc.]
```

---

## 13. GIT & CHANGE MANAGEMENT

### 13.1 Commit Message Format

```
<type>(<scope>): <imperative summary, present tense, ≤72 chars>

Types: feat | fix | refactor | perf | test | docs | chore | security | revert
Scope: module/domain name

Examples:
  feat(auth): add refresh token rotation on login
  fix(api): correct pagination offset calculation for empty pages
  perf(search): replace O(n²) similarity scan with inverted index
  security(payments): validate webhook signatures before processing
```

### 13.2 Branch Naming

```
feature/<module>/<short-description>
fix/<module>/<short-description>
refactor/<module>/<short-description>
security/<module>/<short-description>
```

### 13.3 What Every Commit Must Include

- Code change
- Tests covering the change
- Updated navigation files (FEATURE_INDEX, PROJECT_MAP, MODULE_MANIFEST as applicable)
- CHANGELOG.md entry

---

## 14. BOOTSTRAP PROTOCOL (first-time setup on new project)

When this file is first introduced to a project, the Agent executes this sequence:

```
PHASE 1 — DISCOVERY (read-only)
  □ Read all package manifests (package.json, requirements.txt, go.mod, etc.)
  □ Read entry point files (main.*, index.*, app.*, server.*)
  □ Scan directory structure (max 3 levels deep)
  □ Identify framework, language, major dependencies
  □ Identify existing test structure
  □ Identify infrastructure files (Docker, CI/CD, terraform, etc.)

PHASE 2 — ANALYSIS
  □ Map the module/package structure
  □ Identify public interfaces between modules
  □ Identify data flow (how requests enter and exit the system)
  □ Identify external dependencies (APIs, databases, queues)
  □ Detect existing naming conventions
  □ Detect existing error patterns
  □ Detect existing logging patterns

PHASE 3 — POPULATE
  □ Fill all [AGENT: SCAN AND FILL] sections in this file
  □ Create PROJECT_MAP.md with actual structure
  □ Create FEATURE_INDEX.md with entries for all discoverable features
  □ Create MODULE_MANIFEST.md in each significant module directory
  □ Create CHANGELOG.md (empty, with bootstrap entry)
  □ Create REGRESSION_INDEX.md (empty)
  □ Create DEBT_LEDGER.md (empty)
  □ Confirm .env.example exists (create if not)
  □ Confirm .gitignore covers secrets (add entries if not)

PHASE 4 — REPORT TO CEO
  Report: tech stack identified, modules found, critical observations,
          any security gaps found during discovery, any missing infrastructure
```

---

## 15. TECHNICAL DEBT LEDGER

Deliberate shortcuts taken under time pressure must be recorded immediately.
Never take a shortcut without documenting it.

Format in DEBT_LEDGER.md:

```markdown
## DEBT-[NNN] — <short title>

**Created**: YYYY-MM-DD
**Module**: domain::module
**Description**: [What was cut and why]
**Risk**: [What breaks if this stays forever]
**Resolution plan**: [What the proper fix looks like]
**Target**: [sprint/version/milestone for resolution]
**Resolved**: [date] / [unresolved]
```

---

## 16. ANTI-PATTERNS — PROHIBITED AT ALL TIMES

Violations of these rules block any merge:

```
✗ Polling when event-driven/webhook is available
✗ Storing mutable state only in memory with no persistence
✗ Business logic leaking into view/controller/handler layers
✗ External API responses returned directly to clients without normalization
✗ Catching and silently swallowing exceptions
✗ Using float for precision-sensitive values
✗ Assuming idempotency without designing and testing for it
✗ Building features that bypass the auth/authz layer
✗ Writing tests that test implementation details instead of behavior
✗ Creating abstractions with only one implementation
✗ Any dynamic SQL string construction
✗ Trusting user-supplied data without validation at the boundary
✗ Logging secrets, tokens, passwords, or PII
✗ Adding a dependency without filling out the §12 checklist
✗ Closing a session without updating navigation files
```

---

## 17. DECISION AUDIT TRAIL

For every non-obvious technical decision made during a session, record:

```markdown
## DECISION: <title>
**Date**: YYYY-MM-DD
**Feature Address**: domain::module::feature
**Decision**: [What was chosen]
**Alternatives considered**: [What else was evaluated]
**Rationale**: [Why this choice]
**Reversibility**: [easy | hard | irreversible]
**CEO approval required**: [yes/no — if yes, was it obtained?]
```

Append to CHANGELOG.md under a `### Decisions` section.
This allows future agents to understand WHY the code looks the way it does,
preventing well-intentioned refactors that unknowingly revert critical decisions.

---

## 18. CAPABILITY REGISTRY

```
[AGENT: SCAN AND FILL on bootstrap — list available tools and integrations]

## Available Tools
  - [Tool name]: [what it does, when to use it]

## MCP Servers Connected
  - [Server name]: [capabilities]

## External Services / APIs
  - [Service]: [what it provides, which module owns the integration]

## Infrastructure
  - [Database]: [type, version, access pattern]
  - [Cache]: [type, TTL policy]
  - [Queue/Stream]: [type, topic structure]
```

---

## 19. QUICK REFERENCE — SESSION START CHECKLIST

Execute silently at the start of every session:

```
□ Read PROJECT_MAP.md (skim for current state)
□ Parse task into Feature Address
□ Run Context Resolution Algorithm (§2 Step 2)
□ Check REGRESSION_INDEX.md for this Feature Address
□ Complete Pre-Code Checklist (§2 Step 4)
□ Code
□ Test
□ Update all five navigation files
□ Log infrastructure commands to CHANGELOG.md
□ Append DECISION entries for non-obvious choices
```

---

*This document governs all AI Agent activity on this codebase.*
*The CTO Agent is responsible for keeping it synchronized as the architecture evolves.*
*It was last bootstrapped from: [AGENT: INSERT SOURCE PROJECT / DATE]*
