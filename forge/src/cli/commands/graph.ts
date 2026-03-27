// forge/src/cli/commands/graph.ts
import path from 'node:path';
import { loadGraph } from '../../core/graph/loader.js';
import { validateGraph } from '../../core/graph/validator.js';
import { analyzeImpact } from '../../core/graph/engine.js';
import { heading, bullet, success, error, info } from '../util/display.js';

export async function execGraphStatus(projectDir: string): Promise<void> {
  const graphDir = path.join(projectDir, '_forge', 'graph');
  const graph = await loadGraph(graphDir);
  console.log(heading('Graph Status'));
  console.log(info(`Nodes: ${graph.nodes.size}`));
  const byType = new Map<string, number>();
  const byStatus = new Map<string, number>();
  for (const node of graph.nodes.values()) {
    byType.set(node.metadata.type, (byType.get(node.metadata.type) ?? 0) + 1);
    byStatus.set(node.metadata.status, (byStatus.get(node.metadata.status) ?? 0) + 1);
  }
  if (byType.size > 0) {
    console.log('\n  By type:');
    for (const [type, count] of [...byType.entries()].sort()) {
      console.log(bullet(`${type}: ${count}`, 4));
    }
  }
  if (byStatus.size > 0) {
    console.log('\n  By status:');
    for (const [st, count] of [...byStatus.entries()].sort()) {
      console.log(bullet(`${st}: ${count}`, 4));
    }
  }
}

export async function execGraphValidate(projectDir: string): Promise<void> {
  const graphDir = path.join(projectDir, '_forge', 'graph');
  const graph = await loadGraph(graphDir);
  console.log(heading('Graph Validation'));
  const result = validateGraph(graph);
  if (result.valid) {
    console.log(success(`Graph is valid (${graph.nodes.size} nodes, 0 errors)`));
  } else {
    console.log(error(`Graph has ${result.errors.length} error(s):`));
    for (const err of result.errors) {
      console.log(bullet(`[${err.type}] ${err.nodeId}: ${err.message}`, 4));
    }
  }
}

export async function execGraphImpact(projectDir: string, nodeId: string): Promise<void> {
  const graphDir = path.join(projectDir, '_forge', 'graph');
  const graph = await loadGraph(graphDir);
  console.log(heading(`Impact Analysis: ${nodeId}`));
  if (!graph.nodes.has(nodeId)) {
    console.log(error(`Node "${nodeId}" not found in graph`));
    return;
  }
  const impacted = analyzeImpact(graph, nodeId);
  if (impacted.length === 0) {
    console.log(info('No downstream nodes affected'));
  } else {
    console.log(info(`${impacted.length} node(s) may need re-validation:`));
    for (const id of impacted) {
      const node = graph.nodes.get(id);
      console.log(bullet(`${id} (${node?.metadata.status ?? 'unknown'})`, 4));
    }
  }
}
