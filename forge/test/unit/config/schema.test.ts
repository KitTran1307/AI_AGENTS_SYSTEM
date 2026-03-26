import { describe, it, expect } from 'vitest';
import { ForgeConfigSchema } from '../../../src/core/config/schema.js';

describe('ForgeConfigSchema', () => {
  it('accepts valid full configuration', () => {
    const config = {
      project: { name: 'my-project', language: 'typescript' },
      personas: { enabled: ['architect', 'developer'] },
      models: {
        default_provider: 'anthropic',
        routing: {
          expensive: { provider: 'anthropic', model: 'claude-opus-4-6' },
        },
      },
      orchestration: {
        max_parallel_agents: 3,
        circuit_breaker_threshold: 3,
        loop_detection: true,
        auto_delegate: true,
      },
      quality: {
        enforce_gates: true,
        required_gates: ['code-complete'],
      },
    };
    const result = ForgeConfigSchema.safeParse(config);
    expect(result.success).toBe(true);
  });

  it('applies defaults for optional fields', () => {
    const minimal = {
      project: { name: 'minimal', language: 'python' },
    };
    const result = ForgeConfigSchema.safeParse(minimal);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.orchestration.max_parallel_agents).toBe(3);
      expect(result.data.quality.enforce_gates).toBe(true);
      expect(result.data.personas.enabled).toEqual([]);
    }
  });

  it('rejects empty project name', () => {
    const result = ForgeConfigSchema.safeParse({
      project: { name: '', language: 'ts' },
    });
    expect(result.success).toBe(false);
  });
});
