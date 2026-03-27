import { describe, it, expect } from 'vitest';
import { ModelRouter } from '../../../src/runtime/providers/router.js';

describe('ModelRouter', () => {
  const defaultConfig = {
    default_provider: 'anthropic' as const,
    routing: {
      expensive: { provider: 'anthropic', model: 'claude-opus-4-6' },
      moderate: { provider: 'anthropic', model: 'claude-sonnet-4-6' },
      cheap: { provider: 'anthropic', model: 'claude-haiku-4-5' },
    },
    fallbacks: { anthropic: ['openai', 'google'] },
  };

  it('routes expensive budget to opus', () => {
    const router = new ModelRouter(defaultConfig);
    const route = router.resolve('expensive');
    expect(route.model).toBe('claude-opus-4-6');
    expect(route.provider).toBe('anthropic');
  });

  it('routes moderate budget to sonnet', () => {
    const router = new ModelRouter(defaultConfig);
    const route = router.resolve('moderate');
    expect(route.model).toBe('claude-sonnet-4-6');
  });

  it('routes cheap budget to haiku', () => {
    const router = new ModelRouter(defaultConfig);
    const route = router.resolve('cheap');
    expect(route.model).toBe('claude-haiku-4-5');
  });

  it('resolves persona preferred model by name', () => {
    const router = new ModelRouter(defaultConfig);
    const route = router.resolveForPersona('opus', 'expensive');
    expect(route.model).toBe('claude-opus-4-6');
  });

  it('resolves sonnet preference', () => {
    const router = new ModelRouter(defaultConfig);
    const route = router.resolveForPersona('sonnet', 'moderate');
    expect(route.model).toBe('claude-sonnet-4-6');
  });

  it('falls back to budget routing when preference is unknown', () => {
    const router = new ModelRouter(defaultConfig);
    const route = router.resolveForPersona('unknown-model', 'moderate');
    expect(route.model).toBe('claude-sonnet-4-6');
  });

  it('returns fallback providers for a given provider', () => {
    const router = new ModelRouter(defaultConfig);
    const fallbacks = router.getFallbacks('anthropic');
    expect(fallbacks).toContain('openai');
  });
});
