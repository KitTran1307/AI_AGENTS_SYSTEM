// forge/src/core/graph/schema.ts
import { z } from 'zod';
import { NODE_TYPES, NODE_STATUSES, EDGE_TYPES, parseNodeId } from './types.js';

export type { NodeMetadata } from './types.js';

const QualityGateSchema = z.object({
  status: z.enum(['pass', 'fail', 'pending']),
  checklist: z.string().optional(),
  checked_at: z.string().optional(),
});

const EdgesSchema = z.record(
  z.enum(EDGE_TYPES),
  z.array(z.string()),
).default({});

export const NodeMetadataSchema = z.object({
  id: z.string().min(1),
  type: z.enum(NODE_TYPES),
  status: z.enum(NODE_STATUSES),
  producer: z.string().optional(),
  created: z.string(),
  updated: z.string(),
  session: z.string().optional(),
  edges: EdgesSchema,
  quality_gate: QualityGateSchema.optional(),
  tags: z.array(z.string()).default([]),
}).refine(
  (data) => {
    const parsed = parseNodeId(data.id);
    return parsed !== null && parsed.type === data.type;
  },
  { message: 'Node id prefix must match its type (e.g., "story:name" for type "story")' },
);
