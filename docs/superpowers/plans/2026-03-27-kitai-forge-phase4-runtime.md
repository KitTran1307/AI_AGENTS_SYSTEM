# KitAI Forge Phase 4: Runtime Integration — Implementation Plan

**Goal:** Build the Claude Code runtime layer — skill definitions (slash commands), lifecycle hooks, MCP server for graph queries, and model provider abstraction with routing.

**Architecture:** Layer 3 of the three-layer architecture. Skills are markdown files that become Claude Code slash commands. Hooks are shell scripts that fire on lifecycle events. MCP server exposes graph operations over the Model Context Protocol. Provider abstraction enables model-agnostic routing.

**Spec:** `docs/superpowers/specs/2026-03-26-kitai-forge-v2-design.md` §6.3–6.5

**Depends on:** Phase 3 complete (orchestrator, 108 tests passing)

---

## File Structure

```
forge/
├── src/
│   └── runtime/
│       ├── providers/
│       │   ├── types.ts          # ModelProvider interface, ModelFamily, RoutingConfig
│       │   ├── router.ts         # Route budget tier → provider+model
│       │   └── index.ts
│       └── index.ts              # Barrel export
├── templates/                    # (existing) governance templates
│   ├── FORGE.md                  # Authority document (new)
│   ├── ACTIVATION.md             # How to activate personas (new)
│   └── workflows/                # Feature lifecycle, bug-fix, etc. (new)
├── skills/                       # Claude Code skill definitions (slash commands)
│   ├── forge.md                  # /forge — invoke orchestrator
│   ├── forge-analyst.md          # /forge:analyst — invoke Maya
│   ├── forge-pm.md               # /forge:pm — invoke Jordan
│   ├── forge-ux.md               # /forge:ux — invoke Sage
│   ├── forge-architect.md        # /forge:architect — invoke Winston
│   ├── forge-scrum.md            # /forge:scrum — invoke Rex
│   ├── forge-dev.md              # /forge:dev — invoke Nova
│   ├── forge-reviewer.md         # /forge:reviewer — invoke Crit
│   ├── forge-qa.md               # /forge:qa — invoke Quinn
│   ├── forge-status.md           # /forge:status — show graph + sprint status
│   └── forge-graph.md            # /forge:graph — graph operations
├── hooks/                        # Claude Code lifecycle hook scripts
│   ├── session-start.md          # Session start hook instructions
│   ├── pre-commit.md             # Pre-commit hook instructions
│   └── post-edit.md              # Post-edit hook instructions
└── test/
    └── unit/runtime/
        └── router.test.ts
```

---

## Task 1: Model Provider Abstraction & Router

**Files:**
- Create: `forge/src/runtime/providers/types.ts`
- Create: `forge/src/runtime/providers/router.ts`
- Create: `forge/src/runtime/providers/index.ts`
- Create: `forge/src/runtime/index.ts`
- Create: `forge/test/unit/runtime/router.test.ts`

### Tests:

```typescript
// forge/test/unit/runtime/router.test.ts
import { describe, it, expect } from 'vitest';
import { ModelRouter } from '../../../src/runtime/providers/router.js';

describe('ModelRouter', () => {
  const defaultConfig = {
    default_provider: 'anthropic' as const,
    routing: {
      expensive: { provider: 'anthropic', model: 'claude-opus-4-6' },
      moderate: { provider: 'anthropic', model: 'claude-sonnet-4-6' },
      cheap: { provider: 'anthropic', model: 'claude-haiku-4-5' },
    },
    fallbacks: { anthropic: ['openai', 'google'] },
  };

  it('routes expensive budget to opus', () => {
    const router = new ModelRouter(defaultConfig);
    const route = router.resolve('expensive');
    expect(route.model).toBe('claude-opus-4-6');
    expect(route.provider).toBe('anthropic');
  });

  it('routes moderate budget to sonnet', () => {
    const router = new ModelRouter(defaultConfig);
    const route = router.resolve('moderate');
    expect(route.model).toBe('claude-sonnet-4-6');
  });

  it('routes cheap budget to haiku', () => {
    const router = new ModelRouter(defaultConfig);
    const route = router.resolve('cheap');
    expect(route.model).toBe('claude-haiku-4-5');
  });

  it('resolves persona preferred model by name', () => {
    const router = new ModelRouter(defaultConfig);
    const route = router.resolveForPersona('opus', 'expensive');
    expect(route.model).toBe('claude-opus-4-6');
  });

  it('resolves sonnet preference', () => {
    const router = new ModelRouter(defaultConfig);
    const route = router.resolveForPersona('sonnet', 'moderate');
    expect(route.model).toBe('claude-sonnet-4-6');
  });

  it('falls back to budget routing when preference is unknown', () => {
    const router = new ModelRouter(defaultConfig);
    const route = router.resolveForPersona('unknown-model', 'moderate');
    expect(route.model).toBe('claude-sonnet-4-6');
  });

  it('returns fallback providers for a given provider', () => {
    const router = new ModelRouter(defaultConfig);
    const fallbacks = router.getFallbacks('anthropic');
    expect(fallbacks).toContain('openai');
  });
});
```

### Implementation:

```typescript
// forge/src/runtime/providers/types.ts
export const MODEL_PROVIDERS = ['anthropic', 'openai', 'google'] as const;
export type ModelProvider = (typeof MODEL_PROVIDERS)[number];

export interface ModelRoute {
  provider: string;
  model: string;
}

export interface RoutingConfig {
  default_provider: ModelProvider;
  routing: Record<string, ModelRoute>;
  fallbacks?: Record<string, string[]>;
}
```

```typescript
// forge/src/runtime/providers/router.ts
import type { RoutingConfig, ModelRoute } from './types.js';

// Map persona model preference names to Anthropic model IDs
const ANTHROPIC_MODEL_MAP: Record<string, string> = {
  opus: 'claude-opus-4-6',
  sonnet: 'claude-sonnet-4-6',
  haiku: 'claude-haiku-4-5',
};

// Map preference names to OpenAI model IDs
const OPENAI_MODEL_MAP: Record<string, string> = {
  'gpt-4o': 'gpt-4o',
  'gpt-4o-mini': 'gpt-4o-mini',
};

export class ModelRouter {
  private config: RoutingConfig;

  constructor(config: RoutingConfig) {
    this.config = config;
  }

  /** Resolve a budget tier to a provider+model route. */
  resolve(budget: string): ModelRoute {
    return this.config.routing[budget] ?? this.config.routing['moderate'] ?? { provider: this.config.default_provider, model: 'claude-sonnet-4-6' };
  }

  /**
   * Resolve a persona's model preference to a concrete route.
   * Falls back to budget routing if the preference name isn't recognized.
   */
  resolveForPersona(preference: string, budget: string): ModelRoute {
    const provider = this.config.default_provider;

    // Try Anthropic shorthand (opus, sonnet, haiku)
    if (provider === 'anthropic' && ANTHROPIC_MODEL_MAP[preference]) {
      return { provider, model: ANTHROPIC_MODEL_MAP[preference] };
    }

    // Try OpenAI shorthand
    if (provider === 'openai' && OPENAI_MODEL_MAP[preference]) {
      return { provider, model: OPENAI_MODEL_MAP[preference] };
    }

    // Fall back to budget routing
    return this.resolve(budget);
  }

  /** Get fallback providers for a given provider. */
  getFallbacks(provider: string): string[] {
    return this.config.fallbacks?.[provider] ?? [];
  }
}
```

```typescript
// forge/src/runtime/providers/index.ts
export * from './types.js';
export * from './router.js';
```

```typescript
// forge/src/runtime/index.ts
export * from './providers/index.js';
```

Commit: `feat(forge): add model provider abstraction and budget-based routing`

---

## Task 2: Claude Code Skill Definitions

**Files:** Create 11 markdown skill files in `forge/skills/`

These are the slash commands available in Claude Code. Each skill file defines the behavior of that slash command.

### `forge/skills/forge.md`
```markdown
# /forge — KitAI Forge Orchestrator

You are Forge, the KitAI Forge orchestrator. When invoked:

1. **Scan project state**: Load `_forge/config/forge.yaml`, read graph status from `_forge/graph/`
2. **Classify intent**: Determine what the user wants to build or fix
3. **Run gap detection**: Check what upstream artifacts are missing for the target
4. **Calculate ceremony**: Determine the minimum necessary process
5. **Present plan**: Show the user what you'll do and who will do it
6. **Execute on approval**: Delegate to specialist personas with assembled context

## On first invocation (no graph yet)
Scan the codebase, create initial `architecture:project-map` node, fill `PROJECT_CONTEXT.md`.

## Returning session
Report in-progress nodes, suggest next actions.

## Usage
- `/forge` — Status + next actions
- `/forge <task description>` — Plan and execute a task

## Examples
- `/forge build user authentication`
- `/forge fix the login rate limiting bug`
- `/forge what should we work on next`
```

### `forge/skills/forge-analyst.md`
```markdown
# /forge:analyst — Maya, Strategic Business Analyst

Activate the Maya persona for strategic analysis and product brief creation.

Load context:
1. Read `_forge/personas/analyst/PERSONA.md` for full instructions
2. Read `_forge/config/forge.yaml` for project context
3. Read `PROJECT_CONTEXT.md` if it exists
4. Assemble any relevant `prd` nodes as context

You are now Maya. Follow your persona instructions completely.
Produce a `brief` node when your analysis is complete.
```

### `forge/skills/forge-pm.md`
```markdown
# /forge:pm — Jordan, Product Manager

Activate the Jordan persona for requirements discovery and PRD creation.

Load context:
1. Read `_forge/personas/product-manager/PERSONA.md`
2. Read `_forge/config/forge.yaml` for project context
3. Assemble relevant `brief` nodes as context

You are now Jordan. Follow your persona instructions completely.
Produce a `prd` node when requirements are complete.
```

### `forge/skills/forge-ux.md`
```markdown
# /forge:ux — Sage, UX Designer

Activate the Sage persona for user experience design.

Load context:
1. Read `_forge/personas/ux-designer/PERSONA.md`
2. Read `_forge/config/forge.yaml` for project context
3. Assemble relevant `prd` and `brief` nodes as context

You are now Sage. Follow your persona instructions completely.
Produce a `ux-spec` node when design is complete.
```

### `forge/skills/forge-architect.md`
```markdown
# /forge:architect — Winston, System Architect

Activate the Winston persona for system architecture and technical decisions.

Load context:
1. Read `_forge/personas/architect/PERSONA.md`
2. Read `_forge/config/forge.yaml` for project context
3. Assemble relevant `prd`, `ux-spec`, and `brief` nodes as context
4. Check for existing `regression` nodes in the relevant domains

You are now Winston. Follow your persona instructions completely.
Produce `architecture`, `decision`, and/or `epic` nodes when design is complete.
Run the architecture-ready quality gate checklist before marking status: done.
```

### `forge/skills/forge-scrum.md`
```markdown
# /forge:scrum — Rex, Scrum Master

Activate the Rex persona for story creation and sprint planning.

Load context:
1. Read `_forge/personas/scrum-master/PERSONA.md`
2. Read `_forge/config/forge.yaml` for project context
3. Assemble relevant `epic`, `architecture`, `prd`, and `ux-spec` nodes
4. Check for existing `regression` nodes in the relevant domains

You are now Rex. Follow your persona instructions completely.
Produce `story` nodes — one per distinct unit of work.
Run the story-ready quality gate before marking each story: done.
```

### `forge/skills/forge-dev.md`
```markdown
# /forge:dev — Nova, Developer

Activate the Nova persona for implementation.

Load context:
1. Read `_forge/personas/developer/PERSONA.md`
2. Read `_forge/config/forge.yaml` for project context
3. Assemble the target `story` node and its `architecture` context
4. Load all `regression` nodes for the affected domains

You are now Nova. Follow your persona instructions completely.
Use TDD: write failing tests first, implement, pass, refactor.
Produce `code` and `test` nodes.
Run the code-complete quality gate before marking status: done.
```

### `forge/skills/forge-reviewer.md`
```markdown
# /forge:reviewer — Crit, Code Reviewer

Activate the Crit persona for code review.

Load context:
1. Read `_forge/personas/reviewer/PERSONA.md`
2. Read `_forge/config/forge.yaml` for project context
3. Assemble the `code`, `test`, `story`, and `architecture` nodes being reviewed

You are now Crit. Follow your persona instructions completely.
Categorize findings as: critical (blocks merge), important (should fix), minor (nice to have).
Produce a `review` node with structured findings.
```

### `forge/skills/forge-qa.md`
```markdown
# /forge:qa — Quinn, QA Engineer

Activate the Quinn persona for quality assurance and test strategy.

Load context:
1. Read `_forge/personas/qa-engineer/PERSONA.md`
2. Read `_forge/config/forge.yaml` for project context
3. Assemble relevant `story`, `code`, and `prd` nodes

You are now Quinn. Follow your persona instructions completely.
Design comprehensive test strategies and write automated tests.
Produce `test` nodes with coverage of edge cases and failure modes.
```

### `forge/skills/forge-status.md`
```markdown
# /forge:status — Project Status

Show the current state of the KitAI Forge context graph and sprint.

Actions:
1. Load `_forge/graph/` — count nodes by type and status
2. List in-progress nodes with their current status
3. List blocked nodes (nodes with failed quality gates)
4. Show next recommended actions based on the graph state
5. If a sprint is active, show story progress

Format output as a clean status report:
```
## Graph Status
- brief: 1 done
- prd: 1 done
- architecture: 1 done, 1 in-progress
- story: 3 done, 2 in-progress, 1 pending
- code: 5 done

## In Progress
- architecture:payments (Winston — started 2026-03-27)
- story:auth-register (Nova — 2/5 tasks complete)

## Next Actions
1. Continue story:auth-register (Nova)
2. Complete architecture:payments (Winston)
3. Create stories for epic:payments once arch is done
```
```

### `forge/skills/forge-graph.md`
```markdown
# /forge:graph — Graph Operations

Run graph queries and operations on the KitAI Forge context graph.

## Available operations

### gaps <target-node-id>
Find all missing upstream nodes required to produce the target.
Example: `/forge:graph gaps code:auth-login`

### impact <node-id>
Show all nodes affected by a change to the given node.
Example: `/forge:graph impact architecture:auth`

### validate
Check graph integrity — dangling edges, cycles, quality gate status.
Example: `/forge:graph validate`

### context <node-id>
Assemble and display the full context package for producing a node.
Example: `/forge:graph context story:auth-login`

## Implementation
Load the graph from `_forge/graph/`, run the requested operation using
the graph engine algorithms, and display results clearly.
```

Commit: `feat(forge): add Claude Code skill definitions for all 9 personas + graph + status`

---

## Task 3: Lifecycle Hook Instructions

**Files:** Create 3 markdown hook instruction files in `forge/hooks/`

### `forge/hooks/session-start.md`
```markdown
# Hook: session-start

Fires when a Claude Code session begins in a project with KitAI Forge initialized.

## Actions

1. **Detect Forge project**: Check if `_forge/config/forge.yaml` exists. If not, skip.

2. **Load graph**: Scan `_forge/graph/` for all node files. Read only YAML frontmatter (not full content).

3. **Report in-progress work**:
   - Find nodes with `status: in-progress`
   - Report: "Resuming: {node-id} ({producer}, started {created})"

4. **Suggest next actions**:
   - If any stories are `ready` and have no `in-progress` work: suggest starting them
   - If any quality gates are `fail`: surface them immediately
   - If graph is empty: suggest running `/forge` to bootstrap

5. **Check for regressions**:
   - Count total regression nodes
   - If any are `status: open`: surface them

## Output format
```
🔄 KitAI Forge — Session Started
Graph: 12 nodes (4 done, 2 in-progress, 6 pending)

In Progress:
  • story:auth-login — Nova, 3/5 tasks complete
  • architecture:payments — Winston

Next: Continue story:auth-login (`/forge:dev`)
```
```

### `forge/hooks/pre-commit.md`
```markdown
# Hook: pre-commit

Fires before every git commit in a Forge project.

## Actions

1. **Detect Forge project**: Check if `_forge/config/forge.yaml` exists. If not, pass through.

2. **Check quality gate config**: Read `quality.enforce_gates` from forge.yaml.
   - If `enforce_gates: false`, pass through with a warning.

3. **Find affected nodes**: For each staged file, check if any `code` or `test` graph nodes reference it.

4. **Validate code-complete gate**: For any affected nodes with `status: done`, verify:
   - `quality_gate.status: pass` (not `fail` or `pending`)

5. **Check for suppressed types**: Scan staged TypeScript files for:
   - Bare `any` types without justification comment
   - `@ts-ignore` without explanation

6. **Block or warn**:
   - If enforce_gates is true and gate fails: block commit, show what failed
   - If enforce_gates is false: warn but allow

## Output on failure
```
❌ KitAI Forge pre-commit gate FAILED

code:auth-login — quality_gate: pending (not yet evaluated)
Run: /forge:reviewer to complete the review before committing.
```
```

### `forge/hooks/post-edit.md`
```markdown
# Hook: post-edit

Fires after a file is edited in a Forge project.

## Actions

1. **Detect Forge project**: Check if `_forge/config/forge.yaml` exists. If not, skip.

2. **Find graph references**: Check if the edited file is referenced by any `code` or `story` node.

3. **Check regression nodes**: For any domain keywords in the file path (auth, payment, user, etc.),
   check if there are open `regression` nodes for that domain.

4. **Inject regression warnings** (if relevant regressions found):
   ```
   ⚠️  Regression warning for domain 'auth':
   • REG-003: Token expiry not validated on refresh endpoint
   • REG-007: Rate limiting bypass via header manipulation
   Check _forge/graph/regressions/ for full details.
   ```

5. **Flag stale context** (if story context is outdated):
   - If the edited file's `code` node has upstream nodes newer than the story it implements
   - Warn: "story:auth-login may have stale context — architecture:auth was updated after story creation"
```

Commit: `feat(forge): add lifecycle hook instruction templates`

---

## Task 4: FORGE.md Authority Document & Workflow Templates

**Files:** Create `forge/templates/FORGE.md` and workflow templates

### `forge/templates/FORGE.md`
```markdown
# FORGE.md — KitAI Forge Authority Document

> Copy this file to your project root during `forge init`.
> This is the system's constitution — all personas read it on activation.

## 0. Prime Directives

Seven rules that override everything else:

1. **The graph is truth** — Before any implementation, run gap detection. Never implement without upstream artifacts.
2. **Specialists produce, orchestrator coordinates** — Forge never implements. Each persona produces only its node types.
3. **Quality gates are mandatory** — No node advances to `done` without its gate passing.
4. **Context is assembled, not memorized** — Use the graph to assemble context; don't rely on memory.
5. **TDD always** — No code without a failing test first.
6. **No suppressed type safety** — No unwarranted `any`, no `@ts-ignore` without explanation.
7. **Regressions are permanent memory** — Every bug that reaches production becomes a regression node.

## 1. Persona Hierarchy

```
User (CEO)
  └── Forge (Orchestrator) — routes, delegates, never implements
        ├── Maya (Analyst) — produces brief nodes
        ├── Jordan (PM) — produces prd nodes
        ├── Sage (UX) — produces ux-spec nodes
        ├── Winston (Architect) — produces architecture, decision, epic nodes
        ├── Rex (Scrum Master) — produces story nodes
        ├── Nova (Developer) — produces code, test nodes
        ├── Quinn (QA) — produces test nodes
        └── Crit (Reviewer) — produces review nodes
```

## 2. Context Graph Protocol

### Reading the graph
- All artifacts live in `_forge/graph/{type}/{name}.md`
- YAML frontmatter contains metadata; markdown body is content
- Edge types: requires, informs, validates, implements, decomposes, blocks, supersedes

### Producing nodes
- Create the file with correct YAML frontmatter
- Set `status: draft` → `in-progress` → `review` → `done`
- Add edges to upstream nodes in frontmatter
- Run quality gate before setting `status: done`

### Before any implementation
1. Run `forge graph gaps <target>` to find missing upstream nodes
2. The number of gaps determines ceremony level
3. Never skip upstream artifacts when gaps > 0

## 3. Adaptive Ceremony

The graph decides ceremony level, not rules of thumb:

| Gaps Found | Scope Classified As | Ceremony |
|-----------|---------------------|----------|
| 0 | Any | Minimal (developer only) |
| 1–2 | feature/epic | Moderate (arch → scrum → dev → review) |
| 3+ | feature | Moderate |
| 3+ | epic/project | Full (all personas) |

## 4. Coding Standards

- TypeScript strict mode always
- Prefer `const` over `let`; never `var`
- No `any` without justification; no `@ts-ignore` without explanation
- Functions < 30 lines; files < 300 lines
- Explicit return types on all exported functions
- Error handling: use typed errors, never swallow exceptions

## 5. Security Rules (Non-Negotiable)

1. Never commit secrets, API keys, or credentials
2. Never log sensitive user data
3. Validate all external inputs at system boundaries
4. No SQL/command injection — use parameterized queries
5. Authentication checks before every protected route
6. HTTPS only for external communications
7. Sanitize all user content before rendering

## 6. Testing Standards

- TDD: failing test → implementation → pass → refactor
- Unit tests for all business logic
- Integration tests for all external boundaries
- Test edge cases: null, empty, boundary values, concurrent access
- Coverage target: 80% minimum, 100% for critical paths
- Never skip or delete tests — fix them or file a debt node

## 7. Quality Gates

| Gate | Required Items |
|------|---------------|
| story-ready | Self-contained, testable AC, file references, no ambiguity |
| architecture-ready | All PRD requirements covered, data model, API contracts, ADRs |
| code-complete | All AC tested, types pass, linter clean, no secrets |
| review-complete | All critical findings addressed, approved by Crit |

## 8. Anti-Patterns (Never Do These)

1. Implement before upstream artifacts exist
2. Skip quality gates under time pressure
3. Use `any` type to avoid fixing a type error
4. Commit commented-out code
5. Write tests after implementation (test-last)
6. Put business logic in UI components
7. Ignore linter errors with `// eslint-disable`
8. Hardcode configuration values
9. Catch and swallow errors silently
10. Merge without a passing review

## 9. Git & Change Management

- Commit messages: `type(scope): description` (conventional commits)
- One logical change per commit
- Never force-push to main
- Branch naming: `feat/`, `fix/`, `refactor/`, `docs/`
- PRs require review-complete quality gate

## 10. Bootstrap Protocol

On first session with `/forge`:
1. Scan codebase for existing structure
2. Create `architecture:project-map` node
3. Fill `PROJECT_CONTEXT.md` from detected stack and conventions
4. Ask user: "What would you like to build?"
```

### `forge/templates/workflows/feature-lifecycle.md`
```markdown
# Feature Lifecycle Workflow

Standard workflow for building a new feature from brief to code.

## Step 1: Intent Classification & Gap Detection
- Orchestrator classifies user intent → TaskProfile
- Run graph gap detection for target nodes
- If no gaps: skip to Step 5 (implementation)
- Present plan with ceremony level; wait for user approval

## Step 2: Produce Upstream Artifacts (Parallel Where Possible)
- Identify independent missing nodes
- Delegate each to appropriate persona
- Wait for all to complete; check quality gates
- If any gate fails: surface to user, do not proceed

## Step 3: Create Implementation Stories
- Scrum Master assembles context from graph
- Produces story nodes with tasks and acceptance criteria
- Runs story-ready quality gate on each story

## Step 4: Implementation
- Developer receives context package from graph
- TDD: write failing test → implement → pass → refactor
- Run code-complete quality gate

## Step 5: Review & Close
- Reviewer runs code-review checklist
- If pass: update all node statuses to done
- If fail: return to Developer with specific findings

## Halt Points (User Must Approve Before Proceeding)
- After Step 1: User approves ceremony plan
- After Step 3: User reviews stories before development
- After Step 5: User approves merge
```

### `forge/templates/workflows/bug-fix.md`
```markdown
# Bug Fix Workflow

Fast-path workflow for fixing bugs with minimal ceremony.

## Step 1: Classify & Check
- Classify as `patch` scope
- Run gap detection — typically 0 gaps for bug fixes
- Check regression nodes for the domain
- Route directly to Developer (no upstream artifacts needed)

## Step 2: Reproduce & Document
- Developer writes a failing test that reproduces the bug
- This test becomes the regression test

## Step 3: Fix & Verify
- Implement the minimal fix to make the test pass
- Verify no other tests broke
- Create a `regression` node documenting the bug

## Step 4: Optional Review
- For critical paths: run Reviewer on the fix
- For trivial fixes: Developer self-reviews

## Step 5: Close
- Update story/code node status to done
- Run code-complete quality gate
- Commit with clear message referencing the bug
```

Commit: `feat(forge): add FORGE.md authority document and workflow templates`

---

## Summary

After completing these 4 tasks:
1. **Model provider abstraction** — Budget-tier routing, model preference resolution, fallback chains
2. **Claude Code skill definitions** — 11 slash commands (/forge, /forge:analyst, /forge:pm, /forge:ux, /forge:architect, /forge:scrum, /forge:dev, /forge:reviewer, /forge:qa, /forge:status, /forge:graph)
3. **Lifecycle hook templates** — session-start, pre-commit, post-edit
4. **FORGE.md authority document** — Project constitution + 2 workflow templates

**What's next:** Phase 5 (Polish & Quality) — quality gate engine, sprint state machine, cross-session continuity, integration tests.
