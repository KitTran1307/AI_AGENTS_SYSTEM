import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { loadGraph, type Graph } from '../../../src/core/graph/loader.js';

const FIXTURES = path.resolve(import.meta.dirname, '../../fixtures/graph');

describe('loadGraph', () => {
  let graph: Graph;

  it('loads all nodes from the graph directory', async () => {
    graph = await loadGraph(FIXTURES);
    const ids = [...graph.nodes.keys()];
    expect(ids).toContain('prd:user-management');
    expect(ids).toContain('architecture:auth');
    expect(ids).toContain('story:auth-login');
    expect(ids).toContain('regression:REG-001');
    expect(ids.length).toBe(4);
  });

  it('builds adjacency index from edges', async () => {
    graph = await loadGraph(FIXTURES);
    const storyEdges = graph.nodes.get('story:auth-login')!.metadata.edges;
    expect(storyEdges.requires).toContain('architecture:auth');
  });

  it('builds reverse adjacency index', async () => {
    graph = await loadGraph(FIXTURES);
    const dependents = graph.reverseDeps.get('architecture:auth');
    expect(dependents).toBeDefined();
    expect(dependents!.has('story:auth-login')).toBe(true);
  });

  it('returns empty graph for nonexistent directory', async () => {
    const graph = await loadGraph('/nonexistent/dir');
    expect(graph.nodes.size).toBe(0);
  });

  it('skips non-markdown files gracefully', async () => {
    graph = await loadGraph(FIXTURES);
    expect(graph.nodes.size).toBeGreaterThan(0);
  });
});
