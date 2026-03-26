import { z } from 'zod';

const ProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  language: z.string().min(1),
  framework: z.string().optional(),
});

const PersonasSchema = z.object({
  enabled: z.array(z.string()).default([]),
  custom: z.array(z.string()).default([]),
}).default({});

const ModelRouteSchema = z.object({
  provider: z.string(),
  model: z.string(),
});

const ModelsSchema = z.object({
  default_provider: z.string().default('anthropic'),
  routing: z.record(z.string(), ModelRouteSchema).default({}),
  fallbacks: z.record(z.string(), z.array(z.string())).optional(),
}).default({});

const OrchestrationSchema = z.object({
  max_parallel_agents: z.number().int().min(1).default(3),
  circuit_breaker_threshold: z.number().int().min(1).default(3),
  loop_detection: z.boolean().default(true),
  auto_delegate: z.boolean().default(true),
}).default({});

const QualitySchema = z.object({
  enforce_gates: z.boolean().default(true),
  required_gates: z.array(z.string()).default(['code-complete']),
  optional_gates: z.array(z.string()).default([]),
}).default({});

const GraphSchema = z.object({
  auto_validate: z.boolean().default(true),
  lazy_load: z.boolean().default(true),
}).default({});

export const ForgeConfigSchema = z.object({
  project: ProjectSchema,
  personas: PersonasSchema,
  models: ModelsSchema,
  orchestration: OrchestrationSchema,
  quality: QualitySchema,
  graph: GraphSchema,
});

export type ForgeConfig = z.infer<typeof ForgeConfigSchema>;
