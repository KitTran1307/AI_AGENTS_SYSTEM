import type { NodeType } from '../graph/types.js';

export const PERSONA_CATEGORIES = [
  'analysis',
  'planning',
  'solutioning',
  'implementation',
  'utility',
  'orchestration',
] as const;

export type PersonaCategory = (typeof PERSONA_CATEGORIES)[number];

export const BUDGET_TIERS = ['free', 'cheap', 'moderate', 'expensive'] as const;

export type BudgetTier = (typeof BUDGET_TIERS)[number];

export interface ModelPreference {
  primary: string;
  fallback: string[];
  budget: BudgetTier;
}

export interface PersonaManifest {
  name: string;
  displayName: string;
  title: string;
  icon?: string;
  category: PersonaCategory;
  produces: NodeType[];
  consumes: NodeType[];
  model_preference: ModelPreference;
  temperature: number;
  max_thinking_tokens?: number;
  capabilities: string[];
  delegation_triggers: string[];
  avoid_when: string[];
}

export interface PersonaDefinition {
  manifest: PersonaManifest;
  prompt: string;
  promptPath: string;
  manifestPath: string;
}
