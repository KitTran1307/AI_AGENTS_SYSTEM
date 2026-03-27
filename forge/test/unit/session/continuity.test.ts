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
