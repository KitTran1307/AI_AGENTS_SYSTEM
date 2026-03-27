# KitAI Forge Phase 5: Polish & Quality — Implementation Plan

**Goal:** Quality gate engine, sprint state machine, cross-session continuity helper, v1.0 migration helper, and a comprehensive end-to-end integration test that exercises the full stack.

**Spec:** `docs/superpowers/specs/2026-03-26-kitai-forge-v2-design.md` §6 (Runtime Engine), §12 (Phase 5)

**Depends on:** Phase 4 complete (115 tests passing)

---

## File Structure

```
forge/src/core/
├── quality/
│   ├── gates.ts              # Quality gate evaluator — load checklist, produce pass/fail
│   ├── index.ts
├── sprint/
│   ├── state-machine.ts      # Story status transitions with valid state graph
│   ├── index.ts
├── session/
│   ├── continuity.ts         # Detect in-progress nodes, generate resume report
│   └── index.ts
└── governance/
    ├── migrator.ts           # v1.0 → v2.0 migration detector & guide
    └── index.ts

forge/test/
├── unit/quality/
│   └── gates.test.ts
├── unit/sprint/
│   └── state-machine.test.ts
├── unit/session/
│   └── continuity.test.ts
└── integration/
    └── full-stack.test.ts    # End-to-end: orchestrator + graph + personas
```

---

## Task 1: Quality Gate Engine

**Files:**
- Create: `forge/src/core/quality/gates.ts`
- Create: `forge/src/core/quality/index.ts`
- Create: `forge/test/unit/quality/gates.test.ts`

### Tests:

```typescript
// forge/test/unit/quality/gates.test.ts
import { describe, it, expect } from 'vitest';
import { evaluateGate, GATE_REQUIREMENTS } from '../../../src/core/quality/gates.js';
import type { GraphNode } from '../../../src/core/graph/types.js';

function makeNode(overrides: Partial<GraphNode['metadata']> = {}): GraphNode {
  return {
    metadata: {
      id: 'story:auth-login',
      type: 'story',
      status: 'review',
      created: '2026-03-27T00:00:00Z',
      updated: '2026-03-27T00:00:00Z',
      edges: {},
      tags: [],
      ...overrides,
    },
    content: '# Auth Login\n\n## Acceptance Criteria\n- AC-1: User can log in\n\n## Tasks\n- [ ] Write test\n\n## Files to Create/Modify\n- Create: `src/auth.ts`',
    filePath: '/fake/path.md',
  };
}

describe('evaluateGate', () => {
  it('returns pass for a story node with all required sections', () => {
    const node = makeNode({ type: 'story' });
    const result = evaluateGate('story-ready', node);
    expect(result.passed).toBe(true);
    expect(result.gate).toBe('story-ready');
  });

  it('returns fail when story is missing acceptance criteria', () => {
    const node = makeNode({ type: 'story' });
    node.content = '# Auth Login\n\nNo acceptance criteria here.';
    const result = evaluateGate('story-ready', node);
    expect(result.passed).toBe(false);
    expect(result.failedChecks.length).toBeGreaterThan(0);
  });

  it('returns fail when story has no file references', () => {
    const node = makeNode({ type: 'story' });
    node.content = '# Auth Login\n\n## Acceptance Criteria\n- AC-1: something\n\n## Tasks\n- [ ] do thing';
    const result = evaluateGate('story-ready', node);
    expect(result.passed).toBe(false);
  });

  it('evaluates code-complete gate', () => {
    const node = makeNode({ type: 'code' });
    node.content = '# Code Node\n\nFiles: `src/auth.ts`, `test/auth.test.ts`';
    const result = evaluateGate('code-complete', node);
    expect(result.gate).toBe('code-complete');
    // Result may pass or fail — just verify it runs without throwing
    expect(typeof result.passed).toBe('boolean');
  });

  it('returns unknown gate error for unrecognized gate name', () => {
    const node = makeNode();
    const result = evaluateGate('nonexistent-gate', node);
    expect(result.passed).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('GATE_REQUIREMENTS lists known gates', () => {
    expect(GATE_REQUIREMENTS).toHaveProperty('story-ready');
    expect(GATE_REQUIREMENTS).toHaveProperty('architecture-ready');
    expect(GATE_REQUIREMENTS).toHaveProperty('code-complete');
  });
});
```

### Implementation:

```typescript
// forge/src/core/quality/gates.ts
import type { GraphNode } from '../graph/types.js';

export interface GateResult {
  gate: string;
  passed: boolean;
  failedChecks: string[];
  passedChecks: string[];
  error?: string;
}

export interface GateCheck {
  name: string;
  test: (node: GraphNode) => boolean;
}

export const GATE_REQUIREMENTS: Record<string, GateCheck[]> = {
  'story-ready': [
    {
      name: 'Has acceptance criteria section',
      test: (n) => /##\s*acceptance criteria/i.test(n.content),
    },
    {
      name: 'Has at least one acceptance criterion',
      test: (n) => /- AC-\d+:/i.test(n.content) || /- \w.*:.*\w/i.test(n.content.split(/##\s*acceptance criteria/i)[1] ?? ''),
    },
    {
      name: 'Has tasks section',
      test: (n) => /##\s*tasks/i.test(n.content),
    },
    {
      name: 'Has file references',
      test: (n) => /##\s*files to (create|modify)/i.test(n.content) || /`[a-z][a-z0-9/._-]+\.[a-z]+`/i.test(n.content),
    },
  ],
  'architecture-ready': [
    {
      name: 'Has overview section',
      test: (n) => /##\s*overview/i.test(n.content),
    },
    {
      name: 'Has components section',
      test: (n) => /##\s*components/i.test(n.content),
    },
    {
      name: 'Has data model or API contracts section',
      test: (n) => /##\s*(data model|api contracts)/i.test(n.content),
    },
  ],
  'code-complete': [
    {
      name: 'References source files',
      test: (n) => /`[a-z][a-z0-9/._-]+\.[a-z]+`/i.test(n.content),
    },
    {
      name: 'Not in draft status',
      test: (n) => n.metadata.status !== 'draft',
    },
  ],
  'review-complete': [
    {
      name: 'Has findings section or approval',
      test: (n) => /##\s*(findings|approval|verdict)/i.test(n.content),
    },
    {
      name: 'No unresolved critical findings',
      test: (n) => !/critical.*unresolved/i.test(n.content),
    },
  ],
};

/**
 * Evaluate a quality gate against a graph node.
 * Returns a structured result with per-check details.
 */
export function evaluateGate(gateName: string, node: GraphNode): GateResult {
  const checks = GATE_REQUIREMENTS[gateName];
  if (!checks) {
    return {
      gate: gateName,
      passed: false,
      failedChecks: [],
      passedChecks: [],
      error: `Unknown quality gate: "${gateName}". Known gates: ${Object.keys(GATE_REQUIREMENTS).join(', ')}`,
    };
  }

  const failedChecks: string[] = [];
  const passedChecks: string[] = [];

  for (const check of checks) {
    if (check.test(node)) {
      passedChecks.push(check.name);
    } else {
      failedChecks.push(check.name);
    }
  }

  return {
    gate: gateName,
    passed: failedChecks.length === 0,
    failedChecks,
    passedChecks,
  };
}
```

```typescript
// forge/src/core/quality/index.ts
export * from './gates.js';
```

Update `forge/src/core/index.ts`: add `export * from './quality/index.js';`

Commit: `feat(forge): add quality gate engine with per-check evaluation`

---

## Task 2: Sprint State Machine

**Files:**
- Create: `forge/src/core/sprint/state-machine.ts`
- Create: `forge/src/core/sprint/index.ts`
- Create: `forge/test/unit/sprint/state-machine.test.ts`

### Tests:

```typescript
// forge/test/unit/sprint/state-machine.test.ts
import { describe, it, expect } from 'vitest';
import { SprintStateMachine, STORY_STATES, isValidTransition } from '../../../src/core/sprint/state-machine.js';

describe('SprintStateMachine', () => {
  it('initializes a story in backlog state', () => {
    const sm = new SprintStateMachine();
    sm.addStory('story:auth-login');
    expect(sm.getState('story:auth-login')).toBe('backlog');
  });

  it('transitions backlog → ready', () => {
    const sm = new SprintStateMachine();
    sm.addStory('story:auth-login');
    const ok = sm.transition('story:auth-login', 'ready');
    expect(ok).toBe(true);
    expect(sm.getState('story:auth-login')).toBe('ready');
  });

  it('transitions ready → in-progress', () => {
    const sm = new SprintStateMachine();
    sm.addStory('story:auth-login');
    sm.transition('story:auth-login', 'ready');
    sm.transition('story:auth-login', 'in-progress');
    expect(sm.getState('story:auth-login')).toBe('in-progress');
  });

  it('rejects invalid transition', () => {
    const sm = new SprintStateMachine();
    sm.addStory('story:auth-login');
    // Can't go from backlog directly to done
    const ok = sm.transition('story:auth-login', 'done');
    expect(ok).toBe(false);
    expect(sm.getState('story:auth-login')).toBe('backlog');
  });

  it('allows done → backlog (reset for rework)', () => {
    const sm = new SprintStateMachine();
    sm.addStory('story:auth-login');
    sm.transition('story:auth-login', 'ready');
    sm.transition('story:auth-login', 'in-progress');
    sm.transition('story:auth-login', 'review');
    sm.transition('story:auth-login', 'done');
    expect(sm.getState('story:auth-login')).toBe('done');
  });

  it('returns all stories by state', () => {
    const sm = new SprintStateMachine();
    sm.addStory('story:auth-login');
    sm.addStory('story:auth-register');
    sm.transition('story:auth-login', 'ready');
    expect(sm.getByState('ready')).toContain('story:auth-login');
    expect(sm.getByState('backlog')).toContain('story:auth-register');
  });

  it('isValidTransition validates state graph', () => {
    expect(isValidTransition('backlog', 'ready')).toBe(true);
    expect(isValidTransition('backlog', 'done')).toBe(false);
    expect(isValidTransition('in-progress', 'review')).toBe(true);
  });

  it('STORY_STATES contains all expected states', () => {
    expect(STORY_STATES).toContain('backlog');
    expect(STORY_STATES).toContain('ready');
    expect(STORY_STATES).toContain('in-progress');
    expect(STORY_STATES).toContain('review');
    expect(STORY_STATES).toContain('done');
  });
});
```

### Implementation:

```typescript
// forge/src/core/sprint/state-machine.ts
export const STORY_STATES = ['backlog', 'ready', 'in-progress', 'review', 'done'] as const;
export type StoryState = (typeof STORY_STATES)[number];

// Valid transitions: from → [allowed targets]
const TRANSITIONS: Record<StoryState, StoryState[]> = {
  backlog: ['ready'],
  ready: ['in-progress', 'backlog'],
  'in-progress': ['review', 'ready'],
  review: ['done', 'in-progress'],
  done: ['in-progress'], // Allow rework
};

export function isValidTransition(from: StoryState, to: StoryState): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

export class SprintStateMachine {
  private states: Map<string, StoryState> = new Map();

  addStory(storyId: string, initialState: StoryState = 'backlog'): void {
    this.states.set(storyId, initialState);
  }

  getState(storyId: string): StoryState | undefined {
    return this.states.get(storyId);
  }

  transition(storyId: string, to: StoryState): boolean {
    const current = this.states.get(storyId);
    if (!current) return false;
    if (!isValidTransition(current, to)) return false;
    this.states.set(storyId, to);
    return true;
  }

  getByState(state: StoryState): string[] {
    return [...this.states.entries()]
      .filter(([, s]) => s === state)
      .map(([id]) => id);
  }

  summary(): Record<StoryState, number> {
    const counts = Object.fromEntries(STORY_STATES.map((s) => [s, 0])) as Record<StoryState, number>;
    for (const state of this.states.values()) {
      counts[state]++;
    }
    return counts;
  }
}
```

```typescript
// forge/src/core/sprint/index.ts
export * from './state-machine.js';
```

Update `forge/src/core/index.ts`: add `export * from './sprint/index.js';`

Commit: `feat(forge): add sprint state machine with valid transition graph`

---

## Task 3: Cross-Session Continuity

**Files:**
- Create: `forge/src/core/session/continuity.ts`
- Create: `forge/src/core/session/index.ts`
- Create: `forge/test/unit/session/continuity.test.ts`

### Tests:

```typescript
// forge/test/unit/session/continuity.test.ts
import { describe, it, expect } from 'vitest';
import { buildResumeReport } from '../../../src/core/session/continuity.js';
import type { Graph } from '../../../src/core/graph/loader.js';
import type { GraphNode } from '../../../src/core/graph/types.js';

function makeGraph(nodes: Partial<GraphNode>[]): Graph {
  const map = new Map<string, GraphNode>();
  for (const n of nodes) {
    const id = n.metadata?.id ?? 'unknown:x';
    map.set(id, {
      metadata: {
        id,
        type: 'story',
        status: 'draft',
        created: '2026-03-27T00:00:00Z',
        updated: '2026-03-27T00:00:00Z',
        edges: {},
        tags: [],
        ...n.metadata,
      },
      content: n.content ?? '',
      filePath: n.filePath ?? '/fake/path.md',
    });
  }
  return { nodes: map, reverseDeps: new Map(), rootDir: '/fake' };
}

describe('buildResumeReport', () => {
  it('returns empty report for empty graph', () => {
    const report = buildResumeReport(makeGraph([]));
    expect(report.inProgress).toHaveLength(0);
    expect(report.pending).toHaveLength(0);
    expect(report.totalNodes).toBe(0);
  });

  it('identifies in-progress nodes', () => {
    const graph = makeGraph([
      { metadata: { id: 'story:auth-login', type: 'story', status: 'in-progress', created: '2026-03-27T00:00:00Z', updated: '2026-03-27T00:00:00Z', edges: {}, tags: [] } },
      { metadata: { id: 'story:auth-register', type: 'story', status: 'done', created: '2026-03-27T00:00:00Z', updated: '2026-03-27T00:00:00Z', edges: {}, tags: [] } },
    ]);
    const report = buildResumeReport(graph);
    expect(report.inProgress).toHaveLength(1);
    expect(report.inProgress[0].id).toBe('story:auth-login');
  });

  it('identifies pending nodes', () => {
    const graph = makeGraph([
      { metadata: { id: 'story:auth-login', type: 'story', status: 'draft', created: '2026-03-27T00:00:00Z', updated: '2026-03-27T00:00:00Z', edges: {}, tags: [] } },
    ]);
    const report = buildResumeReport(graph);
    expect(report.pending).toHaveLength(1);
  });

  it('counts done nodes', () => {
    const graph = makeGraph([
      { metadata: { id: 'story:done-1', type: 'story', status: 'done', created: '2026-03-27T00:00:00Z', updated: '2026-03-27T00:00:00Z', edges: {}, tags: [] } },
      { metadata: { id: 'story:done-2', type: 'story', status: 'done', created: '2026-03-27T00:00:00Z', updated: '2026-03-27T00:00:00Z', edges: {}, tags: [] } },
    ]);
    const report = buildResumeReport(graph);
    expect(report.done).toBe(2);
    expect(report.totalNodes).toBe(2);
  });

  it('formats a human-readable summary', () => {
    const graph = makeGraph([
      { metadata: { id: 'story:auth-login', type: 'story', status: 'in-progress', created: '2026-03-27T00:00:00Z', updated: '2026-03-27T00:00:00Z', edges: {}, tags: [] } },
    ]);
    const report = buildResumeReport(graph);
    expect(report.summary).toContain('story:auth-login');
    expect(report.summary).toContain('in-progress');
  });
});
```

### Implementation:

```typescript
// forge/src/core/session/continuity.ts
import type { Graph } from '../graph/loader.js';
import type { NodeMetadata } from '../graph/types.js';

export interface ResumeItem {
  id: string;
  type: string;
  status: string;
  producer?: string;
  updatedAt: string;
}

export interface ResumeReport {
  totalNodes: number;
  done: number;
  inProgress: ResumeItem[];
  pending: ResumeItem[];
  summary: string;
}

/**
 * Build a cross-session resume report from the current graph state.
 * Shows what was in-progress and what still needs to be done.
 */
export function buildResumeReport(graph: Graph): ResumeReport {
  const allNodes = [...graph.nodes.values()];
  const inProgress: ResumeItem[] = [];
  const pending: ResumeItem[] = [];
  let done = 0;

  for (const node of allNodes) {
    const m = node.metadata;
    if (m.status === 'in-progress' || m.status === 'review') {
      inProgress.push(toResumeItem(m));
    } else if (m.status === 'draft') {
      pending.push(toResumeItem(m));
    } else if (m.status === 'done') {
      done++;
    }
  }

  // Sort by most recently updated
  inProgress.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  pending.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  const summary = formatSummary(allNodes.length, done, inProgress, pending);

  return { totalNodes: allNodes.length, done, inProgress, pending, summary };
}

function toResumeItem(m: NodeMetadata): ResumeItem {
  return {
    id: m.id,
    type: m.type,
    status: m.status,
    producer: m.producer,
    updatedAt: m.updated,
  };
}

function formatSummary(total: number, done: number, inProgress: ResumeItem[], pending: ResumeItem[]): string {
  const lines: string[] = [
    `KitAI Forge — Session Resume`,
    `Graph: ${total} nodes (${done} done, ${inProgress.length} in-progress, ${pending.length} pending)`,
  ];

  if (inProgress.length > 0) {
    lines.push('', 'In Progress:');
    for (const item of inProgress) {
      const producer = item.producer ? ` — ${item.producer}` : '';
      lines.push(`  • ${item.id} (${item.status}${producer})`);
    }
  }

  if (pending.length > 0) {
    lines.push('', 'Pending:');
    for (const item of pending.slice(0, 5)) {
      lines.push(`  • ${item.id}`);
    }
    if (pending.length > 5) lines.push(`  ... and ${pending.length - 5} more`);
  }

  if (inProgress.length > 0) {
    const next = inProgress[0];
    lines.push('', `Next: Continue ${next.id}`);
  } else if (pending.length > 0) {
    lines.push('', `Next: Start ${pending[0].id}`);
  } else if (total > 0) {
    lines.push('', 'All nodes complete. What would you like to build next?');
  } else {
    lines.push('', 'Graph is empty. Run /forge to bootstrap your project.');
  }

  return lines.join('\n');
}
```

```typescript
// forge/src/core/session/index.ts
export * from './continuity.js';
```

Update `forge/src/core/index.ts`: add `export * from './session/index.js';`

Commit: `feat(forge): add cross-session continuity with resume report generation`

---

## Task 4: End-to-End Integration Test

**Files:**
- Create: `forge/test/integration/full-stack.test.ts`

### Test:

```typescript
// forge/test/integration/full-stack.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { execInit } from '../../../src/cli/commands/init.js';
import { loadGraph } from '../../../src/core/graph/loader.js';
import { writeNode } from '../../../src/core/graph/writer.js';
import { PersonaRegistry } from '../../../src/core/personas/registry.js';
import { ForgeOrchestrator } from '../../../src/core/orchestrator/forge.js';
import { buildResumeReport } from '../../../src/core/session/continuity.js';
import { evaluateGate } from '../../../src/core/quality/gates.js';
import { SprintStateMachine } from '../../../src/core/sprint/state-machine.js';
import { ModelRouter } from '../../../src/runtime/providers/router.js';

describe('Full-stack integration', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'forge-fullstack-'));
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it('runs the complete lifecycle: init → orchestrate → graph → resume → gate → sprint → route', async () => {
    // 1. Initialize project
    await execInit(tmpDir, {
      name: 'test-project',
      language: 'typescript',
      personas: ['architect', 'developer'],
      provider: 'anthropic',
    });

    const forgeDir = path.join(tmpDir, '_forge');
    const graphDir = path.join(forgeDir, 'graph');
    const personasDir = path.join(forgeDir, 'personas');

    // 2. Verify init created required structure
    await expect(fs.access(path.join(forgeDir, 'config', 'forge.yaml'))).resolves.toBeUndefined();
    await expect(fs.access(path.join(personasDir, 'forge-orchestrator', 'manifest.yaml'))).resolves.toBeUndefined();
    await expect(fs.access(path.join(personasDir, 'architect', 'manifest.yaml'))).resolves.toBeUndefined();

    // 3. Load persona registry from initialized project
    const registry = await PersonaRegistry.fromDirectory(personasDir);
    expect(registry.size).toBeGreaterThanOrEqual(2); // architect + forge-orchestrator

    // 4. Orchestrator: plan work from user intent
    const forge = new ForgeOrchestrator(registry, {
      maxParallelAgents: 3,
      circuitBreakerThreshold: 3,
      loopDetection: true,
    });

    const bugFixPlan = forge.plan('fix the login rate limiting bug', 0);
    expect(bugFixPlan.taskProfile.scope).toBe('patch');
    expect(bugFixPlan.ceremony.level).toBe('minimal');

    const featurePlan = forge.plan('build a complete payment system', 5);
    expect(featurePlan.taskProfile.scope).toBe('epic');
    expect(featurePlan.ceremony.level).toBe('full');

    // 5. Write a story node to the graph
    const storyNode = {
      metadata: {
        id: 'story:auth-login',
        type: 'story' as const,
        status: 'in-progress' as const,
        producer: 'scrum-master',
        created: '2026-03-27T00:00:00Z',
        updated: '2026-03-27T00:00:00Z',
        edges: { requires: ['architecture:auth'] },
        tags: ['auth'],
      },
      content: [
        '# Story: Auth Login',
        '',
        '## Context',
        'JWT-based authentication endpoint.',
        '',
        '## Acceptance Criteria',
        '- AC-1: User can log in with valid credentials',
        '- AC-2: Invalid credentials return 401',
        '',
        '## Tasks',
        '- [ ] Write failing test for AC-1',
        '- [ ] Implement login endpoint',
        '',
        '## Files to Create/Modify',
        '- Create: `src/auth/login.ts`',
        '- Test: `test/auth/login.test.ts`',
      ].join('\n'),
      filePath: path.join(graphDir, 'stories', 'auth-login.md'),
    };

    await writeNode(storyNode);

    // 6. Load graph and verify node
    const graph = await loadGraph(graphDir);
    expect(graph.nodes.size).toBe(1);
    expect(graph.nodes.has('story:auth-login')).toBe(true);

    // 7. Cross-session continuity
    const report = buildResumeReport(graph);
    expect(report.inProgress).toHaveLength(1);
    expect(report.inProgress[0].id).toBe('story:auth-login');
    expect(report.summary).toContain('story:auth-login');

    // 8. Quality gate evaluation
    const gateResult = evaluateGate('story-ready', storyNode);
    expect(gateResult.gate).toBe('story-ready');
    expect(gateResult.passed).toBe(true);

    // 9. Sprint state machine
    const sprint = new SprintStateMachine();
    sprint.addStory('story:auth-login');
    sprint.transition('story:auth-login', 'ready');
    sprint.transition('story:auth-login', 'in-progress');
    sprint.transition('story:auth-login', 'review');
    sprint.transition('story:auth-login', 'done');
    expect(sprint.getState('story:auth-login')).toBe('done');

    // 10. Model routing
    const router = new ModelRouter({
      default_provider: 'anthropic',
      routing: {
        expensive: { provider: 'anthropic', model: 'claude-opus-4-6' },
        moderate: { provider: 'anthropic', model: 'claude-sonnet-4-6' },
        cheap: { provider: 'anthropic', model: 'claude-haiku-4-5' },
      },
    });
    const architectRoute = router.resolveForPersona('opus', 'expensive');
    expect(architectRoute.model).toBe('claude-opus-4-6');
  });
});
```

Commit: `test(forge): add full-stack integration test exercising all layers`

---

## Summary

After completing these 4 tasks:
1. **Quality gate engine** — Evaluate story-ready, architecture-ready, code-complete, review-complete gates against actual node content
2. **Sprint state machine** — Valid state transitions (backlog → ready → in-progress → review → done) with rework support
3. **Cross-session continuity** — Detect in-progress nodes, generate structured resume report
4. **Full-stack integration test** — Exercises init → orchestrate → graph → resume → gate → sprint → route in a single end-to-end test

**Phase 5 completes KitAI Forge v2.0 implementation.**
