import type { Graph } from './loader.js';

export interface ValidationError {
  type: 'dangling-edge' | 'cycle' | 'orphan';
  nodeId: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export function validateGraph(graph: Graph): ValidationResult {
  const errors: ValidationError[] = [];

  // Check 1: Dangling edges — every edge target must exist in the graph
  for (const [nodeId, node] of graph.nodes) {
    for (const [edgeType, targets] of Object.entries(node.metadata.edges)) {
      if (!targets) continue;
      for (const targetId of targets) {
        if (!graph.nodes.has(targetId)) {
          errors.push({
            type: 'dangling-edge',
            nodeId,
            message: `Edge "${edgeType}" points to "${targetId}" which does not exist in the graph`,
          });
        }
      }
    }
  }

  // Check 2: Cycle detection via DFS on "requires" and "blocks" edges (structural edges)
  const structuralEdgeTypes = ['requires', 'blocks'];
  const visited = new Set<string>();
  const inStack = new Set<string>();

  function dfs(nodeId: string): boolean {
    if (inStack.has(nodeId)) return true; // cycle found
    if (visited.has(nodeId)) return false;

    visited.add(nodeId);
    inStack.add(nodeId);

    const node = graph.nodes.get(nodeId);
    if (node) {
      for (const edgeType of structuralEdgeTypes) {
        const targets = node.metadata.edges[edgeType as keyof typeof node.metadata.edges];
        if (!targets) continue;
        for (const targetId of targets) {
          if (graph.nodes.has(targetId) && dfs(targetId)) {
            errors.push({
              type: 'cycle',
              nodeId,
              message: `Cycle detected: "${nodeId}" -> "${targetId}" (via "${edgeType}")`,
            });
            inStack.delete(nodeId);
            return true;
          }
        }
      }
    }

    inStack.delete(nodeId);
    return false;
  }

  for (const nodeId of graph.nodes.keys()) {
    if (!visited.has(nodeId)) {
      dfs(nodeId);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
