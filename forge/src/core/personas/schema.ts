import { z } from 'zod';
import { NODE_TYPES } from '../graph/types.js';
import { PERSONA_CATEGORIES, BUDGET_TIERS } from './types.js';

const ModelPreferenceSchema = z.object({
  primary: z.string().default('sonnet'),
  fallback: z.array(z.string()).default([]),
  budget: z.enum(BUDGET_TIERS).default('moderate'),
}).default({});

export const PersonaManifestSchema = z.object({
  name: z.string().min(1),
  displayName: z.string().min(1),
  title: z.string().min(1),
  icon: z.string().optional(),
  category: z.enum(PERSONA_CATEGORIES),
  produces: z.array(z.enum(NODE_TYPES)).min(1),
  consumes: z.array(z.enum(NODE_TYPES)),
  model_preference: ModelPreferenceSchema,
  temperature: z.number().min(0).max(2).default(0.3),
  max_thinking_tokens: z.number().int().positive().optional(),
  capabilities: z.array(z.string()).default([]),
  delegation_triggers: z.array(z.string()).default([]),
  avoid_when: z.array(z.string()).default([]),
});

export type PersonaManifest = z.infer<typeof PersonaManifestSchema>;
