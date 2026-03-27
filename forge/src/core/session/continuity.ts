import type { Graph } from '../graph/loader.js';
import type { NodeMetadata } from '../graph/types.js';

export interface ResumeItem {
  id: string;
  type: string;
  status: string;
  producer?: string;
  updatedAt: string;
}

export interface ResumeReport {
  totalNodes: number;
  done: number;
  inProgress: ResumeItem[];
  pending: ResumeItem[];
  summary: string;
}

/**
 * Build a cross-session resume report from the current graph state.
 * Shows what was in-progress and what still needs to be done.
 */
export function buildResumeReport(graph: Graph): ResumeReport {
  const allNodes = [...graph.nodes.values()];
  const inProgress: ResumeItem[] = [];
  const pending: ResumeItem[] = [];
  let done = 0;

  for (const node of allNodes) {
    const m = node.metadata;
    if (m.status === 'in-progress' || m.status === 'review') {
      inProgress.push(toResumeItem(m));
    } else if (m.status === 'draft') {
      pending.push(toResumeItem(m));
    } else if (m.status === 'done') {
      done++;
    }
  }

  // Sort by most recently updated
  inProgress.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  pending.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  const summary = formatSummary(allNodes.length, done, inProgress, pending);

  return { totalNodes: allNodes.length, done, inProgress, pending, summary };
}

function toResumeItem(m: NodeMetadata): ResumeItem {
  return {
    id: m.id,
    type: m.type,
    status: m.status,
    producer: m.producer,
    updatedAt: m.updated,
  };
}

function formatSummary(total: number, done: number, inProgress: ResumeItem[], pending: ResumeItem[]): string {
  const lines: string[] = [
    `KitAI Forge — Session Resume`,
    `Graph: ${total} nodes (${done} done, ${inProgress.length} in-progress, ${pending.length} pending)`,
  ];

  if (inProgress.length > 0) {
    lines.push('', 'In Progress:');
    for (const item of inProgress) {
      const producer = item.producer ? ` — ${item.producer}` : '';
      lines.push(`  • ${item.id} (${item.status}${producer})`);
    }
  }

  if (pending.length > 0) {
    lines.push('', 'Pending:');
    for (const item of pending.slice(0, 5)) {
      lines.push(`  • ${item.id}`);
    }
    if (pending.length > 5) lines.push(`  ... and ${pending.length - 5} more`);
  }

  if (inProgress.length > 0) {
    const next = inProgress[0];
    lines.push('', `Next: Continue ${next.id}`);
  } else if (pending.length > 0) {
    lines.push('', `Next: Start ${pending[0].id}`);
  } else if (total > 0) {
    lines.push('', 'All nodes complete. What would you like to build next?');
  } else {
    lines.push('', 'Graph is empty. Run /forge to bootstrap your project.');
  }

  return lines.join('\n');
}
