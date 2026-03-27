# KitAI Forge v2.0 -- Design Specification

**Date:** 2026-03-26
**Status:** Approved
**Approach:** Context Forge (Context-Graph + Adaptive Orchestration)
**Informed by:** KitAI v1.0, Oh-my-OpenAgent (43.7K stars), BMAD Method (42K stars)

---

## 1. Vision & Identity

### Name: KitAI Forge

"Forge" -- the system shapes raw intent into production artifacts through heat (agents), structure (context graph), and discipline (quality gates).

### Mission

The first AI agent framework that **automatically adapts its ceremony to task complexity** -- full lifecycle for new features, surgical precision for bug fixes -- powered by a context graph that knows what exists, what's missing, and who should produce it.

### Core Principles

1. **Adaptive ceremony** -- The graph decides how much process a task needs, not hardcoded rules
2. **Context is king** -- Every agent decision is only as good as the context it receives
3. **Agents are specialists** -- Each persona excels at one thing, orchestrator coordinates many
4. **Universal core, Claude superpowers** -- Works everywhere as markdown, unlocks full power in Claude Code
5. **Solo-first, team-ready** -- One person gets the full experience; teams get collaboration for free
6. **Model-agnostic** -- Optimized for Claude, works with any LLM provider
7. **Graph-driven parallelism** -- Independent work is automatically identified and parallelized

---

## 2. Three-Layer Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    LAYER 3: RUNTIME ENGINE                       │
│  TypeScript/Node.js | Claude Code skills & hooks | MCP servers  │
│  Dynamic prompt generation | Background agents | Model routing  │
│  Zod config validation | CLI tooling | Sprint state machine     │
│                                                                  │
│  Activates in Claude Code (or compatible runtime)                │
│  Powers multi-agent orchestration, hooks, live validation        │
├─────────────────────────────────────────────────────────────────┤
│                  LAYER 2: CONTEXT GRAPH ENGINE                   │
│  Artifact DAG | Node types & edge types | Graph traversal       │
│  Gap detection | Parallel task identification | Quality gates    │
│  Cross-session persistence | Dependency resolution              │
│                                                                  │
│  The brain: decides what exists, what's missing, what's next     │
├─────────────────────────────────────────────────────────────────┤
│                 LAYER 1: GOVERNANCE CORE                         │
│  Authority docs (markdown) | Agent persona definitions          │
│  Navigation files | Workflow templates | Coding standards        │
│  Security rules | Anti-patterns | Activation prompts             │
│                                                                  │
│  Works everywhere: Claude Code, Cursor, Copilot, any LLM tool   │
└─────────────────────────────────────────────────────────────────┘
```

**Layer independence:** Each layer adds power but layers below remain functional alone:
- **Cursor/Copilot user** → Layer 1 only (governance + prompts)
- **Claude Code without runtime** → Layers 1+2 (governance + context graph awareness via prompts)
- **Claude Code with full install** → All 3 layers (full orchestration, background agents, hooks)

---

## 3. Context Graph Engine (Layer 2)

### 3.1 What Is the Context Graph?

A directed acyclic graph (DAG) of **artifacts** (nodes) connected by **typed edges**. The graph represents everything the project knows about itself -- from high-level requirements to individual code files.

The graph is persisted as files on disk (YAML metadata + markdown content), making it:
- Versionable (git)
- Readable by any LLM (markdown)
- Queryable by the runtime engine (YAML)
- Survivable across sessions (files)

### 3.2 Node Types

Each node type represents a category of artifact produced during development:

| Node Type | Phase | Producer Agent | Content | Persisted As |
|-----------|-------|---------------|---------|-------------|
| `brief` | Analysis | Analyst | Product vision, market context, strategic goals | `_forge/graph/briefs/{name}.md` |
| `prd` | Planning | Product Manager | Requirements (FR/NFR), user stories, success metrics | `_forge/graph/prds/{name}.md` |
| `ux-spec` | Planning | UX Designer | User flows, wireframes, interaction patterns | `_forge/graph/ux/{name}.md` |
| `architecture` | Solutioning | Architect | System design, ADRs, component diagram, data model | `_forge/graph/architecture/{name}.md` |
| `epic` | Solutioning | Architect/PM | Feature group with scope and acceptance criteria | `_forge/graph/epics/{name}.md` |
| `story` | Implementation | Scrum Master | Self-contained dev guide with tasks, AC, context | `_forge/graph/stories/{name}.md` |
| `code` | Implementation | Developer | Source files produced or modified | `_forge/graph/code/{name}.md` (metadata + file path list; actual code lives in source tree) |
| `test` | Implementation | QA/Developer | Test files and coverage data | `_forge/graph/tests/{name}.md` (metadata + file path list; actual tests live in source tree) |
| `review` | Implementation | Reviewer | Code review findings, approval status | `_forge/graph/reviews/{name}.md` |
| `regression` | Any | Any | Bug root cause, prevention rule, linked test | `_forge/graph/regressions/{id}.md` |
| `debt` | Any | Any | Technical debt entry with impact and target | `_forge/graph/debt/{id}.md` |
| `decision` | Any | Any | Architecture Decision Record (ADR) | `_forge/graph/decisions/{id}.md` |

### 3.3 Edge Types

Edges define relationships between nodes:

| Edge Type | Meaning | Example |
|-----------|---------|---------|
| `requires` | Target cannot be produced without source | `story:auth-login` requires `architecture:auth` |
| `informs` | Source provides context that improves target quality | `brief:product-vision` informs `prd:auth` |
| `validates` | Source validates correctness of target | `test:auth-login` validates `code:auth-login` |
| `implements` | Source is the implementation of target | `code:auth-login` implements `story:auth-login` |
| `decomposes` | Source breaks target into smaller units | `epic:auth` decomposes into `story:auth-login`, `story:auth-register` |
| `blocks` | Target cannot proceed until source is complete | `story:auth-register` blocks `story:auth-profile` |
| `supersedes` | Source replaces target (for evolution tracking) | `architecture:auth-v2` supersedes `architecture:auth-v1` |

### 3.4 Node Metadata Schema

Every node has YAML frontmatter:

```yaml
---
id: "story:auth-login"
type: story
status: draft | in-progress | review | done | superseded
producer: scrum-master          # Agent persona that created this
created: 2026-03-26T10:00:00Z
updated: 2026-03-26T14:30:00Z
session: "abc123"               # Session that last modified this
edges:
  requires:                       # Upstream nodes this node depends on
    - "architecture:auth"
    - "prd:user-management"
  implements:                     # What this node implements
    - "epic:auth"
  informs:                        # Downstream nodes this node provides context to
    - "ux-spec:login-flow"
# Note: Edges are stored using canonical edge type names from §3.3.
# Direction is always FROM this node's perspective.
# "requires" = "I require these", "informs" = "these inform me"
quality_gate:
  status: pass | fail | pending
  checklist: "story-ready"      # Which checklist was applied
  checked_at: 2026-03-26T14:30:00Z
tags: [auth, login, security]
---
```

### 3.5 Graph Operations

The graph engine supports these core operations:

**1. Gap Detection** (`forge graph gaps <target>`)
Given a target node, trace backwards through `requires` edges to find all missing upstream nodes.
```
Target: code:auth-login
Trace: code:auth-login → requires → story:auth-login (MISSING)
       story:auth-login → requires → architecture:auth (MISSING)
       architecture:auth → requires → prd:user-management (EXISTS, status: done)
Result: [architecture:auth, story:auth-login] need to be produced
```

**2. Parallel Identification** (`forge graph parallel <targets[]>`)
Given multiple missing nodes, identify which can be produced simultaneously (no mutual `requires` or `blocks` edges).
```
Missing: [architecture:auth, ux-spec:login-flow, architecture:payments]
Result: All three are independent → can be produced in parallel by 3 agents
```

**3. Impact Analysis** (`forge graph impact <node>`)
Given a node that changed, trace forward through `requires`, `implements`, `validates` edges to find all potentially affected nodes.
```
Changed: architecture:auth
Impact: [story:auth-login, story:auth-register, code:auth-login (if exists)]
Action: Mark downstream nodes for re-validation
```

**4. Context Assembly** (`forge graph context <node>`)
Given a target node to produce, collect all upstream `requires` and `informs` content into a single context package for the producing agent. This replaces v1.0's Surgical Context Protocol.
```
Producing: story:auth-login
Context assembled:
  - prd:user-management (full content)
  - architecture:auth (full content)
  - ux-spec:login-flow (full content)
  - regression:auth-* (all auth regressions)
  - decision:auth-* (all auth ADRs)
```

**5. Validation** (`forge graph validate`)
Check graph integrity:
- No orphan nodes (every node has at least one edge)
- No cycles (DAG property maintained)
- All `requires` edges point to nodes that exist
- Quality gates pass for all nodes marked `done`
- Node content matches its type schema

### 3.6 Adaptive Ceremony: How the Graph Decides

When a user gives a task, the orchestrator:

1. **Classifies intent** → What's the target node type?
   - "Build auth system" → target is `code:auth-*` (multiple code nodes)
   - "Fix login bug" → target is `code:login-fix` (single code node)
   - "Plan the payment feature" → target is `architecture:payments`

2. **Runs gap detection** → What's missing upstream?
   - New feature: many gaps → full lifecycle (brief → PRD → architecture → stories → code)
   - Bug fix: code exists, no gaps → straight to Developer agent
   - Enhancement: architecture exists, story missing → just story + code

3. **Identifies parallelism** → What can run simultaneously?

4. **Assigns agents** → Each missing node gets the right persona

5. **Enforces gates** → Each edge can have a quality gate condition

**This is the killer feature:** The system never forces unnecessary ceremony, and never skips necessary context. The graph makes the decision transparent and auditable.

---

## 4. Agent Persona System

### 4.1 Agent Roster

Nine specialized personas, each a producer of specific graph node types:

| Persona | Name | Produces | Consumes | Communication Style |
|---------|------|----------|----------|-------------------|
| **Analyst** | Maya | `brief`, research reports | User input, market data | Curious explorer -- excited by insights, connects dots others miss |
| **Product Manager** | Jordan | `prd`, requirements | `brief`, user input | Relentless questioner -- asks "why?" until the answer is airtight |
| **UX Designer** | Sage | `ux-spec`, flows, wireframes | `prd`, `brief` | Empathetic advocate -- paints user journeys, challenges assumptions |
| **Architect** | Winston | `architecture`, `decision`, `epic` | `prd`, `ux-spec` | Calm pragmatist -- balances ideal with feasible, thinks in trade-offs |
| **Scrum Master** | Rex | `story`, sprint plans | `epic`, `architecture`, `prd`, `ux-spec` | Checklist-driven -- zero tolerance for ambiguity, crisp task breakdown |
| **Developer** | Nova | `code`, `test` | `story`, `architecture`, `regression` | Ultra-succinct -- speaks in file paths and acceptance criteria IDs |
| **Reviewer** | Crit | `review` | `code`, `test`, `story`, `architecture` | Precise critic -- flags issues with evidence, suggests specific fixes |
| **QA Engineer** | Quinn | `test`, test strategies | `story`, `code`, `prd` | Practical skeptic -- finds edge cases, thinks about what could break |
| **Orchestrator** | Forge | Task routing, delegation | Full graph access | Strategic commander -- classifies, delegates, verifies, never implements directly |

### 4.2 Persona Definition Structure

Each persona is defined by two files (BMAD-inspired pattern):

**`_forge/personas/{name}/manifest.yaml`** -- Machine-readable metadata:
```yaml
name: architect
displayName: Winston
title: System Architect
icon: "\U0001F3DB"   # classical building
category: solutioning
produces: [architecture, decision, epic]
consumes: [prd, ux-spec, brief]
model_preference:
  primary: opus        # Best model for this persona's task type
  fallback: [sonnet, gpt-4o, gemini-pro]
  budget: expensive    # Cost tier: free | cheap | moderate | expensive
temperature: 0.3
max_thinking_tokens: 32768
capabilities:
  - system-design
  - adr-creation
  - component-decomposition
  - api-design
  - data-modeling
  - technology-selection
delegation_triggers:
  - "design the system"
  - "create architecture"
  - "how should we structure"
  - "make a technical decision"
avoid_when:
  - "just fix this bug"
  - "write the code"
  - "run tests"
```

**`_forge/personas/{name}/PERSONA.md`** -- Full prompt instructions:
```markdown
# Winston -- System Architect

## Identity
You are Winston, a senior system architect with deep expertise in
distributed systems, cloud infrastructure, and API design. You think
in trade-offs and communicate in diagrams.

## Communication Style
Calm, pragmatic tones. You balance what could be with what should be.
You never advocate for over-engineering, but you never cut corners on
fundamentals (data model, API contracts, security boundaries).

## Principles
- Every architecture decision is an ADR with context, options, and rationale
- Design for the current requirement, not hypothetical futures
- Interfaces are contracts -- define them precisely before implementation
- Complexity must justify itself with measurable benefit
- Security boundaries are non-negotiable architectural elements

## Produces
- architecture nodes: system design documents with component diagrams,
  data models, API contracts, deployment topology
- decision nodes: Architecture Decision Records (ADR)
- epic nodes: feature groups with technical scope

## Workflow
1. Receive context package from orchestrator (assembled from graph)
2. Analyze all consumed nodes (PRD, UX spec, brief)
3. Identify components, boundaries, data flows
4. Produce architecture document with ADRs for non-obvious decisions
5. Decompose into epics with clear scope boundaries
6. Submit to quality gate validation

## Quality Gate: architecture-ready
- [ ] All PRD requirements have a home in the architecture
- [ ] Data model covers all entities mentioned in requirements
- [ ] API contracts defined for all cross-component communication
- [ ] Security boundaries identified and documented
- [ ] At least one ADR for each non-obvious technical choice
- [ ] Performance characteristics stated for critical paths
- [ ] No circular dependencies between components
```

### 4.3 Persona Activation Protocol

When a persona is activated (by orchestrator delegation or direct user invocation):

1. Load `manifest.yaml` for capabilities and constraints
2. Load `PERSONA.md` for full prompt instructions
3. Load project config (`_forge/config/forge.yaml`) for project-specific context
4. Load `project-context.md` if it exists (BMAD-inspired project constitution)
5. Receive context package from graph engine (all consumed node contents)
6. Greet user (if interactive) or begin work (if delegated)

### 4.4 Model-Specific Prompt Adaptation (OmO-inspired)

The runtime engine adapts persona prompts per model family:

```typescript
interface PromptAdapter {
  adaptForModel(persona: Persona, model: ModelFamily): string;
}

// Example adaptations:
// Claude: Uses XML tags for structure, leverages extended thinking
// GPT: Uses markdown headers, adds explicit chain-of-thought instructions
// Gemini: Adds attention anchors (lost-in-middle compensation), repeats critical instructions
```

Optional per-model prompt override files:
```
_forge/personas/architect/
  PERSONA.md           # Default prompt
  PERSONA.claude.md    # Claude-specific additions/overrides
  PERSONA.gpt.md       # GPT-specific additions/overrides
  PERSONA.gemini.md    # Gemini-specific additions/overrides
```

---

## 5. Adaptive Orchestrator

### 5.1 The Forge Orchestrator

The Forge orchestrator is a meta-agent that never implements directly. It:
- Receives user intent
- Queries the context graph
- Classifies task complexity
- Delegates to specialist personas
- Monitors progress
- Enforces quality gates
- Assembles final results

### 5.2 Intent Classification

```
User input → Intent Classifier → Task Profile

Task Profile:
  target_type: code | architecture | prd | story | ...
  scope: patch | feature | epic | project
  complexity: trivial | moderate | complex | massive
  domains: [auth, payments, ...]
  urgency: fix | enhancement | new | exploration
```

**Scope → Ceremony mapping:**
| Scope | Ceremony | Typical Agent Chain |
|-------|----------|-------------------|
| `patch` | Minimal | Developer only (or Developer + Reviewer) |
| `feature` | Moderate | Architect → Scrum Master → Developer → Reviewer |
| `epic` | Full | Analyst → PM → Architect → Scrum Master → Developer → QA → Reviewer |
| `project` | Complete | All personas, full lifecycle |

**The graph overrides this heuristic.** If gap detection shows that upstream artifacts already exist, the ceremony is shortened regardless of scope classification.

### 5.3 Delegation Protocol

When the orchestrator delegates to an agent:

```yaml
# Delegation message format
delegation:
  id: "del-20260326-001"
  to: architect                    # Persona name
  target_node: "architecture:auth" # What to produce
  context_package:                 # Assembled by graph engine
    - node: "prd:user-management"
      content: "<full PRD content>"
    - node: "ux-spec:login-flow"
      content: "<full UX spec>"
    - node: "regression:auth-*"
      content: "<all auth regressions>"
  constraints:
    quality_gate: "architecture-ready"
    time_budget: "1 session"
    model: "opus"                  # Or determined by manifest
  return_to: forge                 # Who reviews the output
```

### 5.4 Parallel Delegation (OmO-inspired)

When the graph identifies independent work:

```
Gap detection result:
  Missing: [architecture:auth, ux-spec:login-flow, architecture:payments]
  Dependencies: none between these three

Orchestrator action:
  Spawn 3 background agents in parallel:
    Agent 1 (Winston): Produce architecture:auth
    Agent 2 (Sage): Produce ux-spec:login-flow
    Agent 3 (Winston): Produce architecture:payments

  Monitor all three. When all complete:
    Run quality gates on each.
    If all pass → proceed to next graph layer.
    If any fail → report to user, request review.
```

### 5.5 Background Agent Management (OmO-inspired)

The runtime manages background agents with:

- **Concurrency limits** -- Per-provider and per-model caps (prevent API rate limiting)
- **Circuit breaker** -- If an agent fails 3 consecutive times, stop and escalate
- **Loop detector** -- If an agent produces the same output twice or delegates back to itself, halt
- **Fallback chain** -- If primary model is unavailable, try fallback models from persona manifest
- **Progress monitoring** -- Orchestrator polls agent status, reports to user
- **Context budget** -- Each agent has a max context window; orchestrator manages assembly to fit

### 5.6 Cross-Session Continuity

The graph persists to disk. When a new session starts:

1. Runtime loads `_forge/graph/` directory
2. Reads all node YAML frontmatter (not full content -- lazy loading)
3. Builds in-memory graph structure
4. Identifies nodes with status `in-progress` from previous session
5. Reports to user: "Resuming: architecture:auth (in-progress), story:auth-login (pending)"
6. User can continue, reprioritize, or start new work

---

## 6. Runtime Engine (Layer 3)

### 6.1 Technology Stack

```
Language:    TypeScript (strict mode)
Runtime:     Node.js 20+ (LTS)
Build:       tsup (fast, zero-config bundling)
Validation:  Zod v4 (configuration schemas)
Testing:     Vitest (unit + integration)
CLI:         Commander.js
Package:     npm (kitai-forge)
```

### 6.2 Project Structure

```
kitai-forge/
├── src/
│   ├── cli/                      # CLI entry points
│   │   ├── index.ts              # Main CLI (forge init, forge graph, forge status)
│   │   └── commands/             # Individual CLI commands
│   │
│   ├── core/                     # Core engine (Layer 2 logic)
│   │   ├── graph/
│   │   │   ├── engine.ts         # Graph operations (gap, parallel, impact, context)
│   │   │   ├── node.ts           # Node type definitions and validation
│   │   │   ├── edge.ts           # Edge type definitions
│   │   │   ├── loader.ts         # Load graph from filesystem
│   │   │   ├── writer.ts         # Persist graph changes to filesystem
│   │   │   └── validator.ts      # Graph integrity validation
│   │   │
│   │   ├── orchestrator/
│   │   │   ├── forge.ts          # Main orchestrator logic
│   │   │   ├── intent.ts         # Intent classification
│   │   │   ├── delegator.ts      # Delegation protocol
│   │   │   ├── monitor.ts        # Background agent monitoring
│   │   │   └── ceremony.ts       # Adaptive ceremony calculator
│   │   │
│   │   ├── personas/
│   │   │   ├── loader.ts         # Load persona definitions
│   │   │   ├── prompt-builder.ts # Dynamic prompt generation
│   │   │   ├── adapter.ts        # Model-specific prompt adaptation
│   │   │   └── registry.ts       # Persona registry and lookup
│   │   │
│   │   ├── quality/
│   │   │   ├── gates.ts          # Quality gate engine
│   │   │   ├── checklists.ts     # Checklist definitions and evaluation
│   │   │   └── validator.ts      # Artifact content validation
│   │   │
│   │   ├── sprint/
│   │   │   ├── state-machine.ts  # Sprint status state transitions
│   │   │   ├── tracker.ts        # Sprint progress tracking
│   │   │   └── planner.ts        # Sprint planning logic
│   │   │
│   │   └── config/
│   │       ├── schema/           # Zod schemas for all config files
│   │       ├── loader.ts         # Config loading with validation
│   │       └── defaults.ts       # Default configuration values
│   │
│   ├── runtime/                  # Runtime integrations (Layer 3)
│   │   ├── claude-code/
│   │   │   ├── skills/           # Claude Code skill definitions
│   │   │   ├── hooks/            # Lifecycle hooks
│   │   │   └── mcp/              # MCP server implementations
│   │   │
│   │   ├── agents/
│   │   │   ├── background.ts     # Background agent manager
│   │   │   ├── circuit-breaker.ts
│   │   │   ├── loop-detector.ts
│   │   │   ├── fallback.ts       # Model fallback chain
│   │   │   └── spawner.ts        # Agent spawning logic
│   │   │
│   │   └── providers/
│   │       ├── provider.ts       # Abstract provider interface
│   │       ├── anthropic.ts      # Claude provider
│   │       ├── openai.ts         # OpenAI provider
│   │       ├── google.ts         # Gemini provider
│   │       └── router.ts         # Model routing logic
│   │
│   └── governance/               # Layer 1 generation
│       ├── templates/            # Markdown templates for governance docs
│       ├── generator.ts          # Generate governance files from config
│       └── migrator.ts           # v1.0 → v2.0 migration helper
│
├── personas/                     # Default persona definitions
│   ├── analyst/
│   │   ├── manifest.yaml
│   │   └── PERSONA.md
│   ├── product-manager/
│   │   ├── manifest.yaml
│   │   └── PERSONA.md
│   ├── ux-designer/
│   │   ├── manifest.yaml
│   │   └── PERSONA.md
│   ├── architect/
│   │   ├── manifest.yaml
│   │   └── PERSONA.md
│   ├── scrum-master/
│   │   ├── manifest.yaml
│   │   └── PERSONA.md
│   ├── developer/
│   │   ├── manifest.yaml
│   │   └── PERSONA.md
│   ├── reviewer/
│   │   ├── manifest.yaml
│   │   └── PERSONA.md
│   ├── qa-engineer/
│   │   ├── manifest.yaml
│   │   └── PERSONA.md
│   └── forge-orchestrator/
│       ├── manifest.yaml
│       └── PERSONA.md
│
├── templates/                    # Governance core templates (Layer 1)
│   ├── FORGE.md                  # Authority document (replaces AGENTS.md)
│   ├── ACTIVATION.md             # Activation prompts
│   ├── PROJECT_CONTEXT.md        # Project constitution template
│   ├── workflows/                # Workflow templates (markdown DSL)
│   │   ├── bootstrap.md
│   │   ├── feature-lifecycle.md
│   │   ├── bug-fix.md
│   │   ├── code-review.md
│   │   ├── sprint-planning.md
│   │   └── retrospective.md
│   ├── checklists/               # Quality gate checklists
│   │   ├── story-ready.md
│   │   ├── architecture-ready.md
│   │   ├── code-complete.md
│   │   ├── review-complete.md
│   │   └── implementation-ready.md
│   └── node-templates/           # Templates for each graph node type
│       ├── brief.md
│       ├── prd.md
│       ├── architecture.md
│       ├── epic.md
│       ├── story.md
│       ├── decision.md
│       ├── regression.md
│       └── debt.md
│
├── test/
│   ├── unit/
│   │   ├── graph/
│   │   ├── orchestrator/
│   │   ├── personas/
│   │   └── quality/
│   └── integration/
│       ├── cli/
│       ├── delegation/
│       └── graph-operations/
│
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

### 6.3 Claude Code Skills

Each persona becomes a Claude Code skill (slash command):

```
/forge              -- Invoke orchestrator (auto-routes to right persona)
/forge:analyst      -- Invoke Maya directly
/forge:pm           -- Invoke Jordan directly
/forge:ux           -- Invoke Sage directly
/forge:architect    -- Invoke Winston directly
/forge:scrum        -- Invoke Rex directly
/forge:dev          -- Invoke Nova directly
/forge:reviewer     -- Invoke Crit directly
/forge:qa           -- Invoke Quinn directly
/forge:status       -- Show graph status, sprint progress
/forge:graph        -- Graph operations (gaps, impact, validate)
/forge:init         -- Initialize project (bootstrap)
/forge:help         -- Intelligent next-step recommendation
```

### 6.4 Lifecycle Hooks

Hooks that fire automatically during Claude Code operation:

| Hook | Trigger | Action |
|------|---------|--------|
| `pre-commit` | Before git commit | Run code-complete checklist, validate graph consistency |
| `post-edit` | After file edit | Check if edited file is referenced by graph nodes, flag if story context is stale |
| `session-start` | Session begins | Load graph, report in-progress work, suggest next actions |
| `session-end` | Session ends | Update graph node statuses, persist sprint state |
| `context-monitor` | Periodic | Monitor context window usage, trigger compaction if needed |
| `quality-gate` | Node status → done | Run the node's quality gate checklist automatically |
| `regression-check` | Before code changes in a domain | Search regression nodes for that domain, inject into context |

### 6.5 MCP Servers

Custom MCP servers that extend agent capabilities:

| MCP Server | Capability |
|------------|-----------|
| `forge-graph` | Graph queries: gaps, impact, context assembly, validation |
| `forge-sprint` | Sprint state: current status, story transitions, velocity |
| `forge-personas` | Persona lookup: who produces what, delegation triggers |
| `forge-quality` | Quality gate execution: run checklists, report results |

### 6.6 Dynamic Prompt Generation (OmO-inspired)

Prompts are not static files -- the runtime builds them programmatically:

```typescript
class PromptBuilder {
  buildForPersona(persona: Persona, context: {
    model: ModelFamily;
    graphContext: ContextPackage;    // Assembled from graph
    projectConfig: ProjectConfig;   // forge.yaml
    activeRegressions: Regression[];
    sprintState: SprintStatus;
    availableTools: Tool[];
  }): string {
    return [
      this.buildIdentitySection(persona),
      this.buildPrinciplesSection(persona),
      this.buildContextSection(context.graphContext),
      this.buildToolGuide(context.availableTools, persona),
      this.buildRegressionWarnings(context.activeRegressions),
      this.buildQualityGateSection(persona.produces),
      this.buildModelAdaptation(persona, context.model),
      this.buildHardBlocks(),        // Never-do rules
      this.buildAntiPatterns(),       // Common mistakes to avoid
    ].join('\n\n');
  }
}
```

Benefits over static prompts:
- Adding a tool automatically updates the tool guide in all persona prompts
- Regressions are injected only when relevant to the current domain
- Model-specific adaptations are applied transparently
- Project config changes are reflected immediately

---

## 7. Governance Core (Layer 1)

### 7.1 FORGE.md -- The Authority Document

Replaces v1.0's AGENTS.md. Restructured around the persona system:

```markdown
# FORGE.md -- KitAI Forge Authority Document

## 0. Prime Directives
   (7 core rules, evolved from v1.0 §0)

## 1. Persona Hierarchy
   - Forge Orchestrator: routes, delegates, never implements
   - Specialist Personas: produce specific artifact types
   - User (CEO): sets objectives, reviews gates, approves transitions

## 2. Context Graph Protocol
   - How to read the graph
   - How to produce nodes (content + metadata)
   - How to update edges
   - Gap detection before any implementation

## 3. Adaptive Ceremony
   - Scope classification rules
   - When full lifecycle applies vs surgical fix
   - The graph decides, not rules of thumb

## 4. Coding Standards
   (Evolved from v1.0 §5, per-language templates)

## 5. Security Rules
   (Evolved from v1.0 §9, 11 non-negotiable rules)

## 6. Testing Standards
   (Evolved from v1.0 §8, with quality gate integration)

## 7. Quality Gates
   - Gate definitions for each node type
   - What passes, what fails, what blocks

## 8. Anti-Patterns
   (Evolved from v1.0 §16, expanded to 20+)

## 9. Git & Change Management
   (Evolved from v1.0 §13)

## 10. Bootstrap Protocol
    (4-phase, now creates initial graph structure)
```

### 7.2 Navigation Files → Graph Nodes

v1.0's navigation files evolve into graph node types:

| v1.0 File | v2.0 Equivalent |
|-----------|-----------------|
| `PROJECT_MAP.md` | `architecture:project-map` node (auto-generated from graph) |
| `FEATURE_INDEX.md` | Graph query: all `story` and `code` nodes with edges |
| `MODULE_MANIFEST.md` | `architecture:module-{name}` nodes |
| `CHANGELOG.md` | Auto-generated from node `created`/`updated` timestamps |
| `REGRESSION_INDEX.md` | All `regression` type nodes |
| `DEBT_LEDGER.md` | All `debt` type nodes |

**Key improvement:** These are now queryable, validated, and automatically maintained rather than manually updated markdown files that can drift.

### 7.3 Workflow Templates (BMAD-inspired DSL)

Workflows use a structured markdown DSL with halt points:

```markdown
# Feature Lifecycle Workflow

<workflow id="feature-lifecycle">

<step n="1" goal="Classify intent and detect gaps">
  <action>Orchestrator classifies user intent into Task Profile</action>
  <action>Run `forge graph gaps` for target nodes</action>
  <check if="no gaps detected">
    <action>Route directly to Developer persona</action>
    <goto step="5"/>
  </check>
  <output>Missing artifacts: {{gap_list}}</output>
  <action>Present plan to user with estimated ceremony level</action>
  <halt reason="User must approve the plan before proceeding"/>
</step>

<step n="2" goal="Produce upstream artifacts (parallel where possible)">
  <action>Identify independent missing nodes via `forge graph parallel`</action>
  <action>Delegate each to appropriate persona</action>
  <action>Monitor background agents until all complete</action>
  <check if="any quality gate fails">
    <output>Quality gate failed for: {{failed_nodes}}</output>
    <halt reason="User must review failed gate before continuing"/>
  </check>
</step>

<step n="3" goal="Create implementation stories">
  <action>Scrum Master assembles context from graph</action>
  <action>Produces story nodes with tasks and acceptance criteria</action>
  <action>Run story-ready quality gate</action>
  <halt reason="User reviews story before development begins"/>
</step>

<step n="4" goal="Sprint planning">
  <action>Identify story execution order from graph edges</action>
  <action>Initialize sprint-status.yaml</action>
  <output>Sprint plan: {{story_order}}</output>
</step>

<step n="5" goal="Implementation">
  <action>Developer receives context package from graph</action>
  <action>TDD: write failing test → implement → pass → refactor</action>
  <action>Run code-complete quality gate</action>
  <action>Submit for review</action>
</step>

<step n="6" goal="Review and close">
  <action>Reviewer runs code-review checklist</action>
  <check if="review passes">
    <action>Update all node statuses to done</action>
    <action>Update sprint-status.yaml</action>
  </check>
  <check if="review fails">
    <output>Review findings: {{findings}}</output>
    <goto step="5"/>
  </check>
</step>

</workflow>
```

---

## 8. Configuration System

### 8.1 Configuration Hierarchy

```
_forge/
  config/
    forge.yaml          # Project-level config (checked into git)
    forge.local.yaml    # User-level overrides (gitignored)
    providers.yaml      # Model provider credentials (gitignored)
```

### 8.2 forge.yaml Schema

```yaml
# Project configuration
project:
  name: "my-project"
  description: "Short description"
  language: "typescript"          # Primary language
  framework: "nextjs"             # Primary framework

# Persona configuration
personas:
  enabled: [analyst, product-manager, architect, scrum-master, developer, reviewer, qa-engineer]
  custom: []                      # Paths to custom persona directories

# Model routing
models:
  default_provider: "anthropic"
  routing:
    expensive:                    # For architect, analyst decisions
      provider: anthropic
      model: claude-opus-4-6
    moderate:                     # For scrum-master, reviewer
      provider: anthropic
      model: claude-sonnet-4-6
    cheap:                        # For exploration, quick tasks
      provider: anthropic
      model: claude-haiku-4-5
  fallbacks:
    anthropic: [openai, google]   # If Anthropic is down, try these

# Orchestration
orchestration:
  max_parallel_agents: 3
  circuit_breaker_threshold: 3    # Failures before halting
  loop_detection: true
  auto_delegate: true             # false = always ask user before delegating

# Quality gates
quality:
  enforce_gates: true             # false = advisory only
  required_gates:
    - story-ready
    - architecture-ready
    - code-complete
  optional_gates:
    - review-complete

# Graph settings
graph:
  auto_validate: true             # Validate on every node change
  lazy_load: true                 # Only load node content when needed

# Sprint settings
sprint:
  story_states: [backlog, ready, in-progress, review, done]
  auto_track: true                # Update sprint status automatically
```

### 8.3 Zod Schema Validation

Every config file is validated at load time:

```typescript
// src/core/config/schema/forge.ts
import { z } from 'zod';

export const ForgeConfigSchema = z.object({
  project: z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    language: z.string(),
    framework: z.string().optional(),
  }),
  personas: z.object({
    enabled: z.array(z.string()),
    custom: z.array(z.string()).default([]),
  }),
  models: z.object({
    default_provider: z.enum(['anthropic', 'openai', 'google']),
    routing: z.record(z.object({
      provider: z.string(),
      model: z.string(),
    })),
    fallbacks: z.record(z.array(z.string())).optional(),
  }),
  // ... etc
});
```

---

## 9. Installation & Developer Experience

### 9.1 Installation Methods

**Method 1: npm (recommended for Claude Code users)**
```bash
npx kitai-forge init
```
Creates `_forge/` directory with config, personas, templates, and initial graph structure.

**Method 2: curl | bash (CI/CD, non-Node environments)**
```bash
curl -fsSL https://forge.kitai.dev/install.sh | bash
```

**Method 3: Manual (Cursor, Copilot, any tool)**
Copy governance templates from GitHub into project root. Layer 1 only.

### 9.2 Bootstrap Flow

```
npx kitai-forge init
  │
  ├─ Interactive prompts:
  │   - Project name, language, framework
  │   - Which personas to enable
  │   - Model provider (Anthropic/OpenAI/Google)
  │   - Team size (solo/team)
  │
  ├─ Creates:
  │   _forge/
  │     config/forge.yaml
  │     config/providers.yaml (gitignored)
  │     graph/                 (empty, ready for nodes)
  │     personas/              (copies enabled persona definitions)
  │   FORGE.md                 (authority document at project root)
  │   PROJECT_CONTEXT.md       (project constitution, agent fills on first session)
  │   .gitignore additions     (_forge/config/providers.yaml, _forge/config/*.local.yaml)
  │
  ├─ If Claude Code detected:
  │   Registers skills (/forge, /forge:architect, etc.)
  │   Registers hooks (pre-commit, session-start, etc.)
  │   Configures MCP servers
  │
  └─ Prints: "Run /forge to start your first session"
```

### 9.3 First Session (Claude Code)

```
User: /forge
Forge: "I'm Forge, your project orchestrator. Let me scan your codebase
        and build the initial context graph."

  → Scans directory structure, package manifests, entry points
  → Creates initial architecture:project-map node
  → Fills PROJECT_CONTEXT.md with detected stack, conventions, patterns
  → Creates initial graph with existing code nodes
  → Reports: "Graph initialized with 12 nodes. What would you like to build?"

User: "Build a user authentication system"
Forge: "Target: code:auth-*. Running gap detection...
        Missing: [prd:auth, architecture:auth, story:auth-login, story:auth-register]
        Recommended ceremony: FULL (new feature, no upstream artifacts)
        Plan:
          1. Jordan (PM) produces prd:auth
          2. Winston (Architect) produces architecture:auth (after PRD)
          3. Rex (Scrum Master) produces stories (after architecture)
          4. Nova (Developer) implements each story
        Approve this plan?"
```

### 9.4 Returning Session

```
User: /forge
Forge: "Welcome back. Graph status:
        - architecture:auth (done, gate: PASS)
        - story:auth-login (in-progress, 3/5 tasks complete)
        - story:auth-register (pending)
        Continue with story:auth-login?"
```

### 9.5 Quick Fix (Adaptive Ceremony)

```
User: /forge fix the login rate limiting bug
Forge: "Target: code:login-rate-limit-fix. Running gap detection...
        No missing upstream artifacts. code:auth-login exists.
        Checking regressions... 1 related: REG-003 (auth token expiry edge case)
        Routing directly to Nova (Developer) with context:
          - story:auth-login (for acceptance criteria)
          - regression:REG-003 (for prevention rules)
        No approval needed for patch-scope work. Proceeding..."
```

---

## 10. What's Carried Forward from v1.0

| v1.0 Concept | v2.0 Evolution |
|-------------|---------------|
| AGENTS.md (903 lines) | FORGE.md (restructured around personas + graph) |
| Surgical Context Protocol | Graph context assembly (`forge graph context <node>`) |
| CEO/CTO hierarchy | CEO + 9 specialist personas + Forge orchestrator |
| 5 navigation files | Graph node types (queryable, validated, auto-maintained) |
| Feature Address (`domain::module::action`) | Graph node IDs (`type:name`) |
| Sub-agent spawning | Full background agent orchestration with circuit breakers |
| Bootstrap protocol | Enhanced bootstrap that builds initial graph |
| Anti-patterns (15) | Expanded to 20+, injected dynamically into prompts |
| Context budgets (3-10 files) | Graph-driven context assembly (exactly what's needed) |
| REGRESSION_INDEX | `regression` node type with `validates` edges |
| DEBT_LEDGER | `debt` node type with impact scoring |

---

## 11. Differentiation: Why This Wins

| Dimension | BMAD | OmO | KitAI Forge v2 |
|-----------|------|-----|----------------|
| **Adaptive ceremony** | No (always 4 phases) | Partial (intent classification) | Yes (graph-driven, automatic) |
| **Context chain** | Excellent (progressive) | None (agents are independent) | Best (explicit graph with typed edges) |
| **Multi-agent** | Simulated (one LLM, multiple personas) | Real (background processes) | Real + graph-coordinated |
| **Quality gates** | Strong (checklists) | Weak (prompt-only) | Strong + automated (graph edge constraints) |
| **Model agnostic** | Yes (markdown prompts) | Yes (multi-provider routing) | Yes (abstract provider + routing + adaptation) |
| **Cross-session** | Weak (file-based state) | Weak (session IDs) | Strong (persistent graph) |
| **Universal + powered** | Universal (markdown only) | Powered (OpenCode only) | Both (Layer 1 universal, Layer 3 powered) |
| **Solo → Team** | Team-focused (heavy for solo) | Solo-focused | Solo-first, team-ready |
| **Parallelism** | Manual | Native (orchestrator) | Automatic (graph identifies independence) |
| **Impact analysis** | None | None | Native (graph traversal) |

---

## 12. Implementation Phases (High-Level)

### Phase 1: Foundation (Weeks 1-3)
- Project scaffolding (TypeScript, Vitest, tsup)
- Core graph engine (nodes, edges, CRUD, persistence, validation)
- Configuration system with Zod schemas
- CLI basics (`forge init`, `forge graph`, `forge status`)

### Phase 2: Personas & Governance (Weeks 4-5)
- Persona definition structure (manifest.yaml + PERSONA.md)
- Persona loader and registry
- FORGE.md authority document
- Workflow templates and checklist definitions
- All 9 persona definitions written

### Phase 3: Orchestrator (Weeks 6-8)
- Intent classifier
- Gap detection → task generation
- Adaptive ceremony calculator
- Delegation protocol
- Parallel work identification
- Dynamic prompt builder

### Phase 4: Runtime Integration (Weeks 9-11)
- Claude Code skill registration
- Lifecycle hooks
- MCP server implementations
- Background agent manager (spawner, monitor, circuit breaker)
- Model provider abstraction + routing

### Phase 5: Polish & Quality (Weeks 12-13)
- Quality gate automation
- Sprint state machine
- Cross-session continuity
- v1.0 → v2.0 migration helper
- Documentation and examples
- Integration tests

---

*End of design specification.*
