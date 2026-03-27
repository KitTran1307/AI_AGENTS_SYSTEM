import type { RoutingConfig, ModelRoute } from './types.js';

const ANTHROPIC_MODEL_MAP: Record<string, string> = {
  opus: 'claude-opus-4-6',
  sonnet: 'claude-sonnet-4-6',
  haiku: 'claude-haiku-4-5',
};

const OPENAI_MODEL_MAP: Record<string, string> = {
  'gpt-4o': 'gpt-4o',
  'gpt-4o-mini': 'gpt-4o-mini',
};

export class ModelRouter {
  private config: RoutingConfig;

  constructor(config: RoutingConfig) {
    this.config = config;
  }

  resolve(budget: string): ModelRoute {
    return (
      this.config.routing[budget] ??
      this.config.routing['moderate'] ?? {
        provider: this.config.default_provider,
        model: 'claude-sonnet-4-6',
      }
    );
  }

  resolveForPersona(preference: string, budget: string): ModelRoute {
    const provider = this.config.default_provider;
    if (provider === 'anthropic' && ANTHROPIC_MODEL_MAP[preference]) {
      return { provider, model: ANTHROPIC_MODEL_MAP[preference] };
    }
    if (provider === 'openai' && OPENAI_MODEL_MAP[preference]) {
      return { provider, model: OPENAI_MODEL_MAP[preference] };
    }
    return this.resolve(budget);
  }

  getFallbacks(provider: string): string[] {
    return this.config.fallbacks?.[provider] ?? [];
  }
}
