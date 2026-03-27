# KitAI Forge Phase 3: Orchestrator — Implementation Plan

**Goal:** Build the adaptive orchestrator that classifies intent, calculates ceremony, delegates to personas, and monitors agent execution.

**Architecture:** The orchestrator is a pipeline: Intent Classification → Gap Detection (existing) → Ceremony Calculation → Delegation → Monitoring. Each step is a pure function or class with clear inputs/outputs.

**Tech Stack:** TypeScript 5.8, Zod 4, Vitest 3 (existing deps)

**Spec:** `docs/superpowers/specs/2026-03-26-kitai-forge-v2-design.md` §5 (Adaptive Orchestrator)

**Depends on:** Phase 2 complete (persona system, 71 tests passing)

---

## File Structure

```
forge/src/core/orchestrator/
├── types.ts              # TaskProfile, CeremonyLevel, DelegationMessage types
├── intent.ts             # Intent classification → TaskProfile
├── ceremony.ts           # Adaptive ceremony calculator
├── delegator.ts          # Delegation protocol — builds delegation messages
├── monitor.ts            # Agent execution monitor (circuit breaker, loop detection)
├── forge.ts              # Main orchestrator — ties it all together
└── index.ts              # Barrel export
forge/test/
├── unit/orchestrator/
│   ├── intent.test.ts
│   ├── ceremony.test.ts
│   ├── delegator.test.ts
│   ├── monitor.test.ts
│   └── forge.test.ts
```

---

## Task 1: Orchestrator Types

**Files:**
- Create: `forge/src/core/orchestrator/types.ts`
- Create: `forge/src/core/orchestrator/index.ts`

```typescript
// forge/src/core/orchestrator/types.ts
import type { NodeType } from '../graph/types.js';
import type { PersonaDefinition } from '../personas/types.js';

export const SCOPE_LEVELS = ['patch', 'feature', 'epic', 'project'] as const;
export type ScopeLevel = (typeof SCOPE_LEVELS)[number];

export const COMPLEXITY_LEVELS = ['trivial', 'moderate', 'complex', 'massive'] as const;
export type ComplexityLevel = (typeof COMPLEXITY_LEVELS)[number];

export const URGENCY_TYPES = ['fix', 'enhancement', 'new', 'exploration'] as const;
export type UrgencyType = (typeof URGENCY_TYPES)[number];

export const CEREMONY_LEVELS = ['minimal', 'moderate', 'full', 'complete'] as const;
export type CeremonyLevel = (typeof CEREMONY_LEVELS)[number];

export interface TaskProfile {
  targetType: NodeType;
  scope: ScopeLevel;
  complexity: ComplexityLevel;
  domains: string[];
  urgency: UrgencyType;
}

export interface CeremonyPlan {
  level: CeremonyLevel;
  requiredPersonas: string[];
  steps: CeremonyStep[];
  parallelGroups: string[][];
  estimatedNodes: number;
}

export interface CeremonyStep {
  order: number;
  persona: string;
  targetNode: string;
  dependsOn: string[];
}

export interface DelegationMessage {
  id: string;
  to: string;
  targetNode: string;
  contextPackage: DelegationContext[];
  constraints: DelegationConstraints;
  returnTo: string;
}

export interface DelegationContext {
  nodeId: string;
  content: string;
}

export interface DelegationConstraints {
  qualityGate?: string;
  model?: string;
  budget?: string;
}

export type AgentStatus = 'pending' | 'running' | 'completed' | 'failed' | 'halted';

export interface AgentState {
  delegationId: string;
  persona: string;
  targetNode: string;
  status: AgentStatus;
  attempts: number;
  lastOutput?: string;
  startedAt?: string;
  completedAt?: string;
}
```

```typescript
// forge/src/core/orchestrator/index.ts
export * from './types.js';
```

Update `forge/src/core/index.ts` to add: `export * from './orchestrator/index.js';`

No tests needed for pure types. Commit: `feat(forge): add orchestrator types — TaskProfile, CeremonyPlan, DelegationMessage`

---

## Task 2: Intent Classifier

**Files:**
- Create: `forge/src/core/orchestrator/intent.ts`
- Create: `forge/test/unit/orchestrator/intent.test.ts`

### Tests:

```typescript
// forge/test/unit/orchestrator/intent.test.ts
import { describe, it, expect } from 'vitest';
import { classifyIntent } from '../../../src/core/orchestrator/intent.js';

describe('classifyIntent', () => {
  it('classifies bug fix as patch scope', () => {
    const profile = classifyIntent('fix the login rate limiting bug');
    expect(profile.scope).toBe('patch');
    expect(profile.urgency).toBe('fix');
  });

  it('classifies new feature as feature scope', () => {
    const profile = classifyIntent('add user authentication with JWT tokens');
    expect(profile.scope).toBe('feature');
    expect(profile.urgency).toBe('new');
  });

  it('classifies system design as epic scope', () => {
    const profile = classifyIntent('build a complete payment processing system');
    expect(profile.scope).toBe('epic');
    expect(profile.urgency).toBe('new');
  });

  it('classifies architecture request as architecture target', () => {
    const profile = classifyIntent('design the system architecture for auth');
    expect(profile.targetType).toBe('architecture');
  });

  it('classifies code request as code target', () => {
    const profile = classifyIntent('implement the login endpoint');
    expect(profile.targetType).toBe('code');
  });

  it('classifies requirements request as prd target', () => {
    const profile = classifyIntent('write requirements for the payment feature');
    expect(profile.targetType).toBe('prd');
  });

  it('extracts domains from input', () => {
    const profile = classifyIntent('fix the auth login bug in the user module');
    expect(profile.domains).toContain('auth');
    expect(profile.domains).toContain('login');
  });

  it('classifies enhancement as feature scope with enhancement urgency', () => {
    const profile = classifyIntent('improve the error handling in auth');
    expect(profile.scope).toBe('feature');
    expect(profile.urgency).toBe('enhancement');
  });
});
```

### Implementation:

```typescript
// forge/src/core/orchestrator/intent.ts
import type { NodeType } from '../graph/types.js';
import type { TaskProfile, ScopeLevel, UrgencyType, ComplexityLevel } from './types.js';

interface PatternRule {
  patterns: RegExp[];
  value: string;
}

const SCOPE_PATTERNS: PatternRule[] = [
  { patterns: [/\bfix\b/i, /\bbug\b/i, /\bpatch\b/i, /\bhotfix\b/i, /\bquick\b/i], value: 'patch' },
  { patterns: [/\bbuild\s+(a\s+)?complete\b/i, /\bsystem\b/i, /\bentire\b/i, /\bfull\b/i], value: 'epic' },
  { patterns: [/\bproject\b/i, /\bfrom\s+scratch\b/i, /\bnew\s+app\b/i], value: 'project' },
];

const URGENCY_PATTERNS: PatternRule[] = [
  { patterns: [/\bfix\b/i, /\bbug\b/i, /\bbroken\b/i, /\bcrash\b/i, /\berror\b/i], value: 'fix' },
  { patterns: [/\bimprove\b/i, /\benhance\b/i, /\brefactor\b/i, /\boptimize\b/i, /\bupgrade\b/i], value: 'enhancement' },
  { patterns: [/\bexplore\b/i, /\bresearch\b/i, /\binvestigate\b/i, /\banalyze\b/i], value: 'exploration' },
];

const TARGET_PATTERNS: { patterns: RegExp[]; type: NodeType }[] = [
  { patterns: [/\barchitecture\b/i, /\bdesign\s+the\s+system\b/i, /\bsystem\s+design\b/i], type: 'architecture' },
  { patterns: [/\brequirements?\b/i, /\bprd\b/i, /\bproduct\s+requirements\b/i], type: 'prd' },
  { patterns: [/\bbrief\b/i, /\banalyze\s+the\s+market\b/i, /\bresearch\b/i], type: 'brief' },
  { patterns: [/\bux\b/i, /\buser\s+experience\b/i, /\buser\s+flow\b/i], type: 'ux-spec' },
  { patterns: [/\bstory\b/i, /\bstories\b/i, /\bbreak\s+(this\s+)?down\b/i], type: 'story' },
  { patterns: [/\btest\b/i, /\btests\b/i, /\btest\s+strategy\b/i], type: 'test' },
  { patterns: [/\breview\b/i, /\baudit\b/i], type: 'review' },
];

const DOMAIN_PATTERNS = /\b(auth|login|user|payment|api|database|cache|search|notification|email|admin|dashboard|profile|settings|upload|file|chat|message|session|token|billing|order|cart|product|inventory)\b/gi;

/**
 * Classify user intent into a TaskProfile.
 * Uses pattern matching on the input text. This is a heuristic classifier —
 * the orchestrator can refine with LLM classification when available.
 */
export function classifyIntent(input: string): TaskProfile {
  const targetType = classifyTargetType(input);
  const scope = classifyScope(input);
  const urgency = classifyUrgency(input);
  const complexity = estimateComplexity(input, scope);
  const domains = extractDomains(input);

  return { targetType, scope, complexity, domains, urgency };
}

function classifyTargetType(input: string): NodeType {
  for (const rule of TARGET_PATTERNS) {
    if (rule.patterns.some((p) => p.test(input))) {
      return rule.type;
    }
  }
  // Default: if it looks like implementation work, target code
  return 'code';
}

function classifyScope(input: string): ScopeLevel {
  for (const rule of SCOPE_PATTERNS) {
    if (rule.patterns.some((p) => p.test(input))) {
      return rule.value as ScopeLevel;
    }
  }
  return 'feature';
}

function classifyUrgency(input: string): UrgencyType {
  for (const rule of URGENCY_PATTERNS) {
    if (rule.patterns.some((p) => p.test(input))) {
      return rule.value as UrgencyType;
    }
  }
  return 'new';
}

function estimateComplexity(input: string, scope: ScopeLevel): ComplexityLevel {
  const complexityMap: Record<ScopeLevel, ComplexityLevel> = {
    patch: 'trivial',
    feature: 'moderate',
    epic: 'complex',
    project: 'massive',
  };
  return complexityMap[scope];
}

function extractDomains(input: string): string[] {
  const matches = input.match(DOMAIN_PATTERNS);
  if (!matches) return [];
  return [...new Set(matches.map((m) => m.toLowerCase()))];
}
```

Update barrel. Commit: `feat(forge): add intent classifier with pattern-based task profiling`

---

## Task 3: Ceremony Calculator

**Files:**
- Create: `forge/src/core/orchestrator/ceremony.ts`
- Create: `forge/test/unit/orchestrator/ceremony.test.ts`

### Tests:

```typescript
// forge/test/unit/orchestrator/ceremony.test.ts
import { describe, it, expect } from 'vitest';
import { calculateCeremony } from '../../../src/core/orchestrator/ceremony.js';

describe('calculateCeremony', () => {
  it('returns minimal ceremony for patch scope', () => {
    const plan = calculateCeremony('patch', 0);
    expect(plan.level).toBe('minimal');
    expect(plan.requiredPersonas).toContain('developer');
  });

  it('returns moderate ceremony for feature scope', () => {
    const plan = calculateCeremony('feature', 3);
    expect(plan.level).toBe('moderate');
    expect(plan.requiredPersonas).toContain('architect');
    expect(plan.requiredPersonas).toContain('developer');
  });

  it('returns full ceremony for epic scope', () => {
    const plan = calculateCeremony('epic', 5);
    expect(plan.level).toBe('full');
    expect(plan.requiredPersonas).toContain('analyst');
    expect(plan.requiredPersonas).toContain('product-manager');
  });

  it('returns complete ceremony for project scope', () => {
    const plan = calculateCeremony('project', 8);
    expect(plan.level).toBe('complete');
  });

  it('shortens ceremony when no gaps exist', () => {
    const plan = calculateCeremony('feature', 0);
    expect(plan.level).toBe('minimal');
    expect(plan.requiredPersonas).toContain('developer');
  });

  it('shortens ceremony when few gaps exist for epic scope', () => {
    const plan = calculateCeremony('epic', 1);
    expect(plan.level).toBe('moderate');
  });

  it('includes reviewer for non-trivial ceremony', () => {
    const plan = calculateCeremony('feature', 2);
    expect(plan.requiredPersonas).toContain('reviewer');
  });

  it('steps are ordered correctly', () => {
    const plan = calculateCeremony('epic', 5);
    for (let i = 1; i < plan.steps.length; i++) {
      expect(plan.steps[i].order).toBeGreaterThanOrEqual(plan.steps[i - 1].order);
    }
  });
});
```

### Implementation:

```typescript
// forge/src/core/orchestrator/ceremony.ts
import type { ScopeLevel, CeremonyLevel, CeremonyPlan, CeremonyStep } from './types.js';

const CEREMONY_CHAINS: Record<CeremonyLevel, string[]> = {
  minimal: ['developer'],
  moderate: ['architect', 'scrum-master', 'developer', 'reviewer'],
  full: ['analyst', 'product-manager', 'architect', 'scrum-master', 'developer', 'qa-engineer', 'reviewer'],
  complete: ['analyst', 'product-manager', 'ux-designer', 'architect', 'scrum-master', 'developer', 'qa-engineer', 'reviewer'],
};

const SCOPE_TO_CEREMONY: Record<ScopeLevel, CeremonyLevel> = {
  patch: 'minimal',
  feature: 'moderate',
  epic: 'full',
  project: 'complete',
};

/**
 * Calculate the ceremony level and execution plan.
 * The graph overrides the scope heuristic: if gaps are few/none,
 * ceremony is shortened regardless of scope classification.
 */
export function calculateCeremony(scope: ScopeLevel, gapCount: number): CeremonyPlan {
  let level = SCOPE_TO_CEREMONY[scope];

  // Graph overrides: shorten ceremony based on gaps
  if (gapCount === 0) {
    level = 'minimal';
  } else if (gapCount <= 2 && (level === 'full' || level === 'complete')) {
    level = 'moderate';
  }

  const requiredPersonas = CEREMONY_CHAINS[level];
  const steps = buildSteps(requiredPersonas);

  return {
    level,
    requiredPersonas: [...requiredPersonas],
    steps,
    parallelGroups: identifyParallelSteps(steps),
    estimatedNodes: gapCount + 1, // gaps + target
  };
}

function buildSteps(personas: string[]): CeremonyStep[] {
  return personas.map((persona, i) => ({
    order: i,
    persona,
    targetNode: `${persona}:output`,
    dependsOn: i > 0 ? [`${personas[i - 1]}:output`] : [],
  }));
}

function identifyParallelSteps(steps: CeremonyStep[]): string[][] {
  // Group steps that share the same order (no mutual dependencies)
  const groups = new Map<number, string[]>();
  for (const step of steps) {
    const existing = groups.get(step.order) ?? [];
    existing.push(step.persona);
    groups.set(step.order, existing);
  }
  return [...groups.values()];
}
```

Update barrel. Commit: `feat(forge): add adaptive ceremony calculator with graph-based overrides`

---

## Task 4: Delegation Protocol

**Files:**
- Create: `forge/src/core/orchestrator/delegator.ts`
- Create: `forge/test/unit/orchestrator/delegator.test.ts`

### Tests:

```typescript
// forge/test/unit/orchestrator/delegator.test.ts
import { describe, it, expect } from 'vitest';
import { buildDelegation } from '../../../src/core/orchestrator/delegator.js';
import type { PersonaDefinition } from '../../../src/core/personas/types.js';
import type { ContextEntry } from '../../../src/core/personas/prompt-builder.js';

const mockPersona: PersonaDefinition = {
  manifest: {
    name: 'architect',
    displayName: 'Winston',
    title: 'System Architect',
    category: 'solutioning',
    produces: ['architecture', 'decision', 'epic'],
    consumes: ['prd', 'ux-spec', 'brief'],
    model_preference: { primary: 'opus', fallback: ['sonnet'], budget: 'expensive' },
    temperature: 0.3,
    capabilities: ['system-design'],
    delegation_triggers: ['design the system'],
    avoid_when: [],
  },
  prompt: '# Winston',
  promptPath: '/path/to/PERSONA.md',
  manifestPath: '/path/to/manifest.yaml',
};

describe('buildDelegation', () => {
  it('creates a delegation message with persona and target', () => {
    const del = buildDelegation(mockPersona, 'architecture:auth', []);
    expect(del.to).toBe('architect');
    expect(del.targetNode).toBe('architecture:auth');
    expect(del.returnTo).toBe('forge');
  });

  it('includes context package', () => {
    const context: ContextEntry[] = [
      { nodeId: 'prd:user-mgmt', content: '# PRD content' },
    ];
    const del = buildDelegation(mockPersona, 'architecture:auth', context);
    expect(del.contextPackage).toHaveLength(1);
    expect(del.contextPackage[0].nodeId).toBe('prd:user-mgmt');
  });

  it('sets constraints from persona manifest', () => {
    const del = buildDelegation(mockPersona, 'architecture:auth', []);
    expect(del.constraints.model).toBe('opus');
    expect(del.constraints.budget).toBe('expensive');
  });

  it('generates unique delegation IDs', () => {
    const del1 = buildDelegation(mockPersona, 'architecture:auth', []);
    const del2 = buildDelegation(mockPersona, 'architecture:payments', []);
    expect(del1.id).not.toBe(del2.id);
  });

  it('sets quality gate based on target node type', () => {
    const del = buildDelegation(mockPersona, 'architecture:auth', []);
    expect(del.constraints.qualityGate).toBe('architecture-ready');
  });
});
```

### Implementation:

```typescript
// forge/src/core/orchestrator/delegator.ts
import type { PersonaDefinition } from '../personas/types.js';
import type { ContextEntry } from '../personas/prompt-builder.js';
import type { DelegationMessage, DelegationContext } from './types.js';

let delegationCounter = 0;

const QUALITY_GATE_MAP: Record<string, string> = {
  brief: 'brief-complete',
  prd: 'prd-complete',
  'ux-spec': 'ux-complete',
  architecture: 'architecture-ready',
  story: 'story-ready',
  code: 'code-complete',
  test: 'test-complete',
  review: 'review-complete',
};

/**
 * Build a delegation message for a persona to produce a target node.
 */
export function buildDelegation(
  persona: PersonaDefinition,
  targetNode: string,
  contextEntries: ContextEntry[],
): DelegationMessage {
  delegationCounter++;
  const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
  const id = `del-${timestamp}-${String(delegationCounter).padStart(3, '0')}`;

  const nodeType = targetNode.split(':')[0] ?? '';

  const contextPackage: DelegationContext[] = contextEntries.map((entry) => ({
    nodeId: entry.nodeId,
    content: entry.content,
  }));

  return {
    id,
    to: persona.manifest.name,
    targetNode,
    contextPackage,
    constraints: {
      qualityGate: QUALITY_GATE_MAP[nodeType],
      model: persona.manifest.model_preference.primary,
      budget: persona.manifest.model_preference.budget,
    },
    returnTo: 'forge',
  };
}

/** Reset counter (for testing). */
export function _resetDelegationCounter(): void {
  delegationCounter = 0;
}
```

Update barrel. Commit: `feat(forge): add delegation protocol for persona task assignment`

---

## Task 5: Agent Monitor

**Files:**
- Create: `forge/src/core/orchestrator/monitor.ts`
- Create: `forge/test/unit/orchestrator/monitor.test.ts`

### Tests:

```typescript
// forge/test/unit/orchestrator/monitor.test.ts
import { describe, it, expect } from 'vitest';
import { AgentMonitor } from '../../../src/core/orchestrator/monitor.js';

describe('AgentMonitor', () => {
  it('tracks agent state', () => {
    const monitor = new AgentMonitor({ circuitBreakerThreshold: 3, loopDetection: true });
    monitor.register('del-001', 'architect', 'architecture:auth');
    const state = monitor.getState('del-001');
    expect(state?.status).toBe('pending');
    expect(state?.persona).toBe('architect');
  });

  it('transitions agent to running', () => {
    const monitor = new AgentMonitor({ circuitBreakerThreshold: 3, loopDetection: true });
    monitor.register('del-001', 'architect', 'architecture:auth');
    monitor.markRunning('del-001');
    expect(monitor.getState('del-001')?.status).toBe('running');
  });

  it('transitions agent to completed', () => {
    const monitor = new AgentMonitor({ circuitBreakerThreshold: 3, loopDetection: true });
    monitor.register('del-001', 'architect', 'architecture:auth');
    monitor.markRunning('del-001');
    monitor.markCompleted('del-001', 'architecture doc produced');
    const state = monitor.getState('del-001');
    expect(state?.status).toBe('completed');
    expect(state?.lastOutput).toBe('architecture doc produced');
  });

  it('trips circuit breaker after threshold failures', () => {
    const monitor = new AgentMonitor({ circuitBreakerThreshold: 3, loopDetection: true });
    monitor.register('del-001', 'architect', 'architecture:auth');
    monitor.markRunning('del-001');
    monitor.markFailed('del-001');
    monitor.markRunning('del-001');
    monitor.markFailed('del-001');
    monitor.markRunning('del-001');
    monitor.markFailed('del-001');
    expect(monitor.getState('del-001')?.status).toBe('halted');
    expect(monitor.isCircuitBroken('del-001')).toBe(true);
  });

  it('detects output loops', () => {
    const monitor = new AgentMonitor({ circuitBreakerThreshold: 3, loopDetection: true });
    monitor.register('del-001', 'developer', 'code:auth');
    monitor.markRunning('del-001');
    monitor.markCompleted('del-001', 'same output');
    // Simulate retry with same output
    monitor.markRunning('del-001');
    expect(monitor.detectLoop('del-001', 'same output')).toBe(true);
  });

  it('does not detect loop with different output', () => {
    const monitor = new AgentMonitor({ circuitBreakerThreshold: 3, loopDetection: true });
    monitor.register('del-001', 'developer', 'code:auth');
    monitor.markRunning('del-001');
    monitor.markCompleted('del-001', 'first output');
    monitor.markRunning('del-001');
    expect(monitor.detectLoop('del-001', 'different output')).toBe(false);
  });

  it('lists all agents by status', () => {
    const monitor = new AgentMonitor({ circuitBreakerThreshold: 3, loopDetection: true });
    monitor.register('del-001', 'architect', 'architecture:auth');
    monitor.register('del-002', 'developer', 'code:auth');
    monitor.markRunning('del-001');
    const running = monitor.getByStatus('running');
    expect(running).toHaveLength(1);
    expect(running[0].delegationId).toBe('del-001');
  });

  it('provides summary of all agents', () => {
    const monitor = new AgentMonitor({ circuitBreakerThreshold: 3, loopDetection: true });
    monitor.register('del-001', 'architect', 'architecture:auth');
    monitor.markRunning('del-001');
    monitor.markCompleted('del-001', 'done');
    const summary = monitor.summary();
    expect(summary.total).toBe(1);
    expect(summary.completed).toBe(1);
    expect(summary.running).toBe(0);
  });
});
```

### Implementation:

```typescript
// forge/src/core/orchestrator/monitor.ts
import type { AgentState, AgentStatus } from './types.js';

export interface MonitorConfig {
  circuitBreakerThreshold: number;
  loopDetection: boolean;
}

export class AgentMonitor {
  private agents: Map<string, AgentState> = new Map();
  private config: MonitorConfig;

  constructor(config: MonitorConfig) {
    this.config = config;
  }

  register(delegationId: string, persona: string, targetNode: string): void {
    this.agents.set(delegationId, {
      delegationId,
      persona,
      targetNode,
      status: 'pending',
      attempts: 0,
    });
  }

  getState(delegationId: string): AgentState | undefined {
    return this.agents.get(delegationId);
  }

  markRunning(delegationId: string): void {
    const state = this.agents.get(delegationId);
    if (!state || state.status === 'halted') return;
    state.status = 'running';
    state.startedAt = new Date().toISOString();
  }

  markCompleted(delegationId: string, output: string): void {
    const state = this.agents.get(delegationId);
    if (!state) return;
    state.status = 'completed';
    state.lastOutput = output;
    state.completedAt = new Date().toISOString();
  }

  markFailed(delegationId: string): void {
    const state = this.agents.get(delegationId);
    if (!state) return;
    state.attempts++;
    if (state.attempts >= this.config.circuitBreakerThreshold) {
      state.status = 'halted';
    } else {
      state.status = 'failed';
    }
  }

  isCircuitBroken(delegationId: string): boolean {
    const state = this.agents.get(delegationId);
    return state?.status === 'halted';
  }

  detectLoop(delegationId: string, newOutput: string): boolean {
    if (!this.config.loopDetection) return false;
    const state = this.agents.get(delegationId);
    if (!state?.lastOutput) return false;
    return state.lastOutput === newOutput;
  }

  getByStatus(status: AgentStatus): AgentState[] {
    return [...this.agents.values()].filter((a) => a.status === status);
  }

  summary(): { total: number; pending: number; running: number; completed: number; failed: number; halted: number } {
    const states = [...this.agents.values()];
    return {
      total: states.length,
      pending: states.filter((s) => s.status === 'pending').length,
      running: states.filter((s) => s.status === 'running').length,
      completed: states.filter((s) => s.status === 'completed').length,
      failed: states.filter((s) => s.status === 'failed').length,
      halted: states.filter((s) => s.status === 'halted').length,
    };
  }
}
```

Update barrel. Commit: `feat(forge): add agent monitor with circuit breaker and loop detection`

---

## Task 6: Main Orchestrator (Forge)

**Files:**
- Create: `forge/src/core/orchestrator/forge.ts`
- Create: `forge/test/unit/orchestrator/forge.test.ts`

### Tests:

```typescript
// forge/test/unit/orchestrator/forge.test.ts
import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { ForgeOrchestrator } from '../../../src/core/orchestrator/forge.js';
import { PersonaRegistry } from '../../../src/core/personas/registry.js';

const FIXTURES = path.resolve(import.meta.dirname, '../../fixtures/personas');

describe('ForgeOrchestrator', () => {
  it('creates an orchestrator instance', async () => {
    const registry = await PersonaRegistry.fromDirectory(FIXTURES);
    const forge = new ForgeOrchestrator(registry, {
      maxParallelAgents: 3,
      circuitBreakerThreshold: 3,
      loopDetection: true,
    });
    expect(forge).toBeDefined();
  });

  it('plans work from user intent', async () => {
    const registry = await PersonaRegistry.fromDirectory(FIXTURES);
    const forge = new ForgeOrchestrator(registry, {
      maxParallelAgents: 3,
      circuitBreakerThreshold: 3,
      loopDetection: true,
    });
    const plan = forge.plan('fix the login bug', 0);
    expect(plan.taskProfile.scope).toBe('patch');
    expect(plan.ceremony.level).toBe('minimal');
  });

  it('plans full ceremony for new feature with gaps', async () => {
    const registry = await PersonaRegistry.fromDirectory(FIXTURES);
    const forge = new ForgeOrchestrator(registry, {
      maxParallelAgents: 3,
      circuitBreakerThreshold: 3,
      loopDetection: true,
    });
    const plan = forge.plan('build a complete payment system', 5);
    expect(plan.taskProfile.scope).toBe('epic');
    expect(plan.ceremony.level).toBe('full');
  });

  it('shortens ceremony when gaps are zero', async () => {
    const registry = await PersonaRegistry.fromDirectory(FIXTURES);
    const forge = new ForgeOrchestrator(registry, {
      maxParallelAgents: 3,
      circuitBreakerThreshold: 3,
      loopDetection: true,
    });
    const plan = forge.plan('add search feature', 0);
    expect(plan.ceremony.level).toBe('minimal');
  });

  it('returns monitor summary', async () => {
    const registry = await PersonaRegistry.fromDirectory(FIXTURES);
    const forge = new ForgeOrchestrator(registry, {
      maxParallelAgents: 3,
      circuitBreakerThreshold: 3,
      loopDetection: true,
    });
    const summary = forge.status();
    expect(summary.total).toBe(0);
  });
});
```

### Implementation:

```typescript
// forge/src/core/orchestrator/forge.ts
import { classifyIntent } from './intent.js';
import { calculateCeremony } from './ceremony.js';
import { AgentMonitor } from './monitor.js';
import type { PersonaRegistry } from '../personas/registry.js';
import type { TaskProfile, CeremonyPlan } from './types.js';

export interface OrchestratorConfig {
  maxParallelAgents: number;
  circuitBreakerThreshold: number;
  loopDetection: boolean;
}

export interface WorkPlan {
  taskProfile: TaskProfile;
  ceremony: CeremonyPlan;
}

export class ForgeOrchestrator {
  private registry: PersonaRegistry;
  private monitor: AgentMonitor;
  private config: OrchestratorConfig;

  constructor(registry: PersonaRegistry, config: OrchestratorConfig) {
    this.registry = registry;
    this.config = config;
    this.monitor = new AgentMonitor({
      circuitBreakerThreshold: config.circuitBreakerThreshold,
      loopDetection: config.loopDetection,
    });
  }

  /**
   * Classify intent and calculate ceremony for a user request.
   * gapCount comes from running graph gap detection externally.
   */
  plan(userInput: string, gapCount: number): WorkPlan {
    const taskProfile = classifyIntent(userInput);
    const ceremony = calculateCeremony(taskProfile.scope, gapCount);
    return { taskProfile, ceremony };
  }

  /** Get current agent execution status. */
  status() {
    return this.monitor.summary();
  }

  /** Get the persona registry. */
  getRegistry(): PersonaRegistry {
    return this.registry;
  }

  /** Get the agent monitor. */
  getMonitor(): AgentMonitor {
    return this.monitor;
  }
}
```

Update barrel with all exports. Commit: `feat(forge): add ForgeOrchestrator — plan work from intent + graph gaps`

---

## Summary

After completing these 6 tasks:
1. **Orchestrator types** — TaskProfile, CeremonyPlan, DelegationMessage, AgentState
2. **Intent classifier** — Pattern-based classification of user intent into task profiles
3. **Ceremony calculator** — Adaptive ceremony with graph-based override
4. **Delegation protocol** — Builds structured delegation messages
5. **Agent monitor** — Circuit breaker, loop detection, status tracking
6. **Main orchestrator** — ForgeOrchestrator ties classification + ceremony + monitoring

**What's next:** Phase 4 (Runtime Integration) — Claude Code skills, hooks, MCP, providers.
