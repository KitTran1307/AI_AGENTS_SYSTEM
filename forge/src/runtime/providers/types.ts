export const MODEL_PROVIDERS = ['anthropic', 'openai', 'google'] as const;
export type ModelProvider = (typeof MODEL_PROVIDERS)[number];

export interface ModelRoute {
  provider: string;
  model: string;
}

export interface RoutingConfig {
  default_provider: ModelProvider;
  routing: Record<string, ModelRoute>;
  fallbacks?: Record<string, string[]>;
}
