import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { execInit } from '../../src/cli/commands/init.js';
import { loadGraph } from '../../src/core/graph/loader.js';
import { writeNode } from '../../src/core/graph/writer.js';
import { PersonaRegistry } from '../../src/core/personas/registry.js';
import { ForgeOrchestrator } from '../../src/core/orchestrator/forge.js';
import { buildResumeReport } from '../../src/core/session/continuity.js';
import { evaluateGate } from '../../src/core/quality/gates.js';
import { SprintStateMachine } from '../../src/core/sprint/state-machine.js';
import { ModelRouter } from '../../src/runtime/providers/router.js';

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
