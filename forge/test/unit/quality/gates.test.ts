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
