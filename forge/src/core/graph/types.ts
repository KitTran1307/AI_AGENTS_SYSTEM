// forge/src/core/graph/types.ts

export const NODE_TYPES = [
  'brief',
  'prd',
  'ux-spec',
  'architecture',
  'epic',
  'story',
  'code',
  'test',
  'review',
  'regression',
  'debt',
  'decision',
] as const;

export type NodeType = (typeof NODE_TYPES)[number];

export const NODE_STATUSES = [
  'draft',
  'in-progress',
  'review',
  'done',
  'superseded',
] as const;

export type NodeStatus = (typeof NODE_STATUSES)[number];

export const EDGE_TYPES = [
  'requires',
  'informs',
  'validates',
  'implements',
  'decomposes',
  'blocks',
  'supersedes',
] as const;

export type EdgeType = (typeof EDGE_TYPES)[number];

export interface QualityGate {
  status: 'pass' | 'fail' | 'pending';
  checklist?: string;
  checked_at?: string;
}

export interface NodeMetadata {
  id: string;
  type: NodeType;
  status: NodeStatus;
  producer?: string;
  created: string;
  updated: string;
  session?: string;
  edges: Partial<Record<EdgeType, string[]>>;
  quality_gate?: QualityGate;
  tags: string[];
}

export interface GraphNode {
  metadata: NodeMetadata;
  content: string;
  filePath: string;
}

/** Maps node type to its subdirectory under _forge/graph/ */
export const NODE_TYPE_DIRS: Record<NodeType, string> = {
  brief: 'briefs',
  prd: 'prds',
  'ux-spec': 'ux',
  architecture: 'architecture',
  epic: 'epics',
  story: 'stories',
  code: 'code',
  test: 'tests',
  review: 'reviews',
  regression: 'regressions',
  debt: 'debt',
  decision: 'decisions',
};

/** Parse a node ID into its type and name parts. Returns null if invalid. */
export function parseNodeId(id: string): { type: string; name: string } | null {
  const colonIndex = id.indexOf(':');
  if (colonIndex === -1) return null;
  return {
    type: id.slice(0, colonIndex),
    name: id.slice(colonIndex + 1),
  };
}
