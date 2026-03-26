import type { Graph } from './loader.js';

type DepMap = Record<string, { requires: string[] }>;

export interface ContextEntry {
  nodeId: string;
  content: string;
}

/**
 * Detect missing upstream nodes needed to produce a target.
 * Uses a dependency map that describes the EXPECTED graph structure
 * (including nodes that don't exist yet).
 */
export function detectGaps(graph: Graph, targetId: string, depMap: DepMap): string[] {
  const gaps: string[] = [];
  const visited = new Set<string>();

  function walk(nodeId: string): void {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);

    const deps = depMap[nodeId];
    if (!deps) {
      if (!graph.nodes.has(nodeId) && nodeId !== targetId) {
        gaps.push(nodeId);
      }
      return;
    }

    if (!graph.nodes.has(nodeId) && nodeId !== targetId) {
      gaps.push(nodeId);
    }

    for (const depId of deps.requires) {
      walk(depId);
    }
  }

  const targetDeps = depMap[targetId];
  if (targetDeps) {
    for (const depId of targetDeps.requires) {
      walk(depId);
    }
  }

  return gaps;
}

/**
 * Given a list of nodes to produce, group them into parallel execution waves.
 * Nodes in the same wave have no mutual dependencies.
 * Returns waves in execution order (wave 0 first).
 */
export function identifyParallel(nodeIds: string[], depMap: DepMap): string[][] {
  const levels = new Map<string, number>();
  const nodeSet = new Set(nodeIds);

  function getLevel(nodeId: string): number {
    if (levels.has(nodeId)) return levels.get(nodeId)!;

    const deps = depMap[nodeId];
    if (!deps || deps.requires.length === 0) {
      levels.set(nodeId, 0);
      return 0;
    }

    let maxDepLevel = -1;
    for (const depId of deps.requires) {
      if (nodeSet.has(depId)) {
        maxDepLevel = Math.max(maxDepLevel, getLevel(depId));
      }
    }

    const level = maxDepLevel + 1;
    levels.set(nodeId, level);
    return level;
  }

  for (const id of nodeIds) {
    getLevel(id);
  }

  const waves = new Map<number, string[]>();
  for (const id of nodeIds) {
    const level = levels.get(id) ?? 0;
    if (!waves.has(level)) waves.set(level, []);
    waves.get(level)!.push(id);
  }

  return [...waves.entries()]
    .sort(([a], [b]) => a - b)
    .map(([, ids]) => ids);
}

/**
 * Find all nodes downstream of a changed node (via reverse dependency index).
 */
export function analyzeImpact(graph: Graph, changedNodeId: string): string[] {
  const impacted: string[] = [];
  const visited = new Set<string>();

  function walk(nodeId: string): void {
    const dependents = graph.reverseDeps.get(nodeId);
    if (!dependents) return;

    for (const depId of dependents) {
      if (visited.has(depId)) continue;
      visited.add(depId);
      impacted.push(depId);
      walk(depId);
    }
  }

  walk(changedNodeId);
  return impacted;
}

/**
 * Assemble context for producing a target node.
 * Collects content from all upstream requires edges.
 */
export function assembleContext(
  graph: Graph,
  targetId: string,
  depMap: DepMap,
): ContextEntry[] {
  const entries: ContextEntry[] = [];
  const visited = new Set<string>();

  const targetDeps = depMap[targetId];
  if (!targetDeps) return entries;

  for (const depId of targetDeps.requires) {
    if (visited.has(depId)) continue;
    visited.add(depId);

    const node = graph.nodes.get(depId);
    if (node) {
      entries.push({ nodeId: depId, content: node.content });
    }
  }

  return entries;
}
