import { describe, it, expect } from 'vitest';
import {
  detectGaps,
  identifyParallel,
  analyzeImpact,
  assembleContext,
} from '../../../src/core/graph/engine.js';
import type { Graph } from '../../../src/core/graph/loader.js';
import type { GraphNode } from '../../../src/core/graph/types.js';

function makeNode(
  id: string,
  type: string,
  status: string = 'done',
  edges: Record<string, string[]> = {},
): GraphNode {
  return {
    metadata: {
      id,
      type: type as any,
      status: status as any,
      created: '2026-03-26T10:00:00Z',
      updated: '2026-03-26T10:00:00Z',
      edges,
      tags: [],
    },
    content: `# Content of ${id}`,
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

describe('detectGaps', () => {
  it('finds missing upstream nodes', () => {
    const graph = makeGraph([
      makeNode('prd:auth', 'prd'),
    ]);
    const gaps = detectGaps(graph, 'code:auth-login', {
      'code:auth-login': { requires: ['story:auth-login'] },
      'story:auth-login': { requires: ['architecture:auth'] },
      'architecture:auth': { requires: ['prd:auth'] },
    });
    expect(gaps).toContain('story:auth-login');
    expect(gaps).toContain('architecture:auth');
    expect(gaps).not.toContain('prd:auth');
    expect(gaps).not.toContain('code:auth-login');
  });

  it('returns empty when all upstream nodes exist', () => {
    const graph = makeGraph([
      makeNode('prd:auth', 'prd'),
      makeNode('architecture:auth', 'architecture', 'done', { requires: ['prd:auth'] }),
      makeNode('story:login', 'story', 'done', { requires: ['architecture:auth'] }),
    ]);
    const gaps = detectGaps(graph, 'code:login', {
      'code:login': { requires: ['story:login'] },
    });
    expect(gaps).toHaveLength(0);
  });
});

describe('identifyParallel', () => {
  it('identifies independent nodes that can be produced in parallel', () => {
    const graph = makeGraph([
      makeNode('prd:auth', 'prd'),
      makeNode('prd:payments', 'prd'),
    ]);
    const targets = ['architecture:auth', 'ux-spec:login', 'architecture:payments'];
    const depMap = {
      'architecture:auth': { requires: ['prd:auth'] },
      'ux-spec:login': { requires: ['prd:auth'] },
      'architecture:payments': { requires: ['prd:payments'] },
    };
    const groups = identifyParallel(targets, depMap);
    expect(groups).toHaveLength(1);
    expect(groups[0].sort()).toEqual(targets.sort());
  });

  it('separates dependent nodes into sequential groups', () => {
    const depMap = {
      'architecture:auth': { requires: [] as string[] },
      'story:login': { requires: ['architecture:auth'] },
    };
    const groups = identifyParallel(['architecture:auth', 'story:login'], depMap);
    expect(groups.length).toBeGreaterThanOrEqual(2);
    const archGroup = groups.findIndex((g) => g.includes('architecture:auth'));
    const storyGroup = groups.findIndex((g) => g.includes('story:login'));
    expect(archGroup).toBeLessThan(storyGroup);
  });
});

describe('analyzeImpact', () => {
  it('finds all downstream nodes affected by a change', () => {
    const graph = makeGraph([
      makeNode('prd:auth', 'prd'),
      makeNode('architecture:auth', 'architecture', 'done', { requires: ['prd:auth'] }),
      makeNode('story:login', 'story', 'done', { requires: ['architecture:auth'] }),
      makeNode('story:register', 'story', 'done', { requires: ['architecture:auth'] }),
    ]);
    const impacted = analyzeImpact(graph, 'architecture:auth');
    expect(impacted).toContain('story:login');
    expect(impacted).toContain('story:register');
    expect(impacted).not.toContain('prd:auth');
  });

  it('returns empty for leaf nodes', () => {
    const graph = makeGraph([
      makeNode('story:login', 'story'),
    ]);
    const impacted = analyzeImpact(graph, 'story:login');
    expect(impacted).toHaveLength(0);
  });
});

describe('assembleContext', () => {
  it('collects all upstream content for a target node', () => {
    const graph = makeGraph([
      makeNode('prd:auth', 'prd'),
      makeNode('architecture:auth', 'architecture', 'done', { requires: ['prd:auth'] }),
    ]);
    const ctx = assembleContext(graph, 'story:login', {
      'story:login': { requires: ['architecture:auth', 'prd:auth'] },
    });
    expect(ctx).toHaveLength(2);
    expect(ctx.map((c) => c.nodeId)).toContain('prd:auth');
    expect(ctx.map((c) => c.nodeId)).toContain('architecture:auth');
    expect(ctx[0].content).toContain('# Content of');
  });

  it('skips missing nodes and returns only existing ones', () => {
    const graph = makeGraph([
      makeNode('prd:auth', 'prd'),
    ]);
    const ctx = assembleContext(graph, 'story:login', {
      'story:login': { requires: ['architecture:auth', 'prd:auth'] },
    });
    expect(ctx).toHaveLength(1);
    expect(ctx[0].nodeId).toBe('prd:auth');
  });
});
