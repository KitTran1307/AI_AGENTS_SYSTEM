import { describe, it, expect } from 'vitest';
import { validateGraph, type ValidationResult } from '../../../src/core/graph/validator.js';
import type { Graph } from '../../../src/core/graph/loader.js';
import type { GraphNode } from '../../../src/core/graph/types.js';

function makeNode(id: string, type: string, edges: Record<string, string[]> = {}): GraphNode {
  return {
    metadata: {
      id,
      type: type as any,
      status: 'done',
      created: '2026-03-26T10:00:00Z',
      updated: '2026-03-26T10:00:00Z',
      edges,
      tags: [],
    },
    content: `# ${id}`,
    filePath: `/fake/${id}.md`,
  };
}

function makeGraph(nodes: GraphNode[]): Graph {
  const nodeMap = new Map(nodes.map((n) => [n.metadata.id, n]));
  const reverseDeps = new Map<string, Set<string>>();
  for (const node of nodes) {
    for (const targets of Object.values(node.metadata.edges)) {
      if (!targets) continue;
      for (const t of targets) {
        if (!reverseDeps.has(t)) reverseDeps.set(t, new Set());
        reverseDeps.get(t)!.add(node.metadata.id);
      }
    }
  }
  return { nodes: nodeMap, reverseDeps, rootDir: '/fake' };
}

describe('validateGraph', () => {
  it('returns valid for a correct graph', () => {
    const graph = makeGraph([
      makeNode('prd:auth', 'prd'),
      makeNode('architecture:auth', 'architecture', { requires: ['prd:auth'] }),
      makeNode('story:login', 'story', { requires: ['architecture:auth'] }),
    ]);
    const result = validateGraph(graph);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('detects dangling edge targets (edge points to nonexistent node)', () => {
    const graph = makeGraph([
      makeNode('story:login', 'story', { requires: ['architecture:auth'] }),
    ]);
    const result = validateGraph(graph);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.type === 'dangling-edge')).toBe(true);
  });

  it('detects cycles', () => {
    const graph = makeGraph([
      makeNode('prd:a', 'prd', { requires: ['architecture:b'] }),
      makeNode('architecture:b', 'architecture', { requires: ['prd:a'] }),
    ]);
    const result = validateGraph(graph);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.type === 'cycle')).toBe(true);
  });

  it('passes with an empty graph', () => {
    const graph = makeGraph([]);
    const result = validateGraph(graph);
    expect(result.valid).toBe(true);
  });

  it('detects self-referencing cycles', () => {
    const graph = makeGraph([
      makeNode('prd:auth', 'prd', { requires: ['prd:auth'] }),
    ]);
    const result = validateGraph(graph);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.type === 'cycle')).toBe(true);
  });
});
