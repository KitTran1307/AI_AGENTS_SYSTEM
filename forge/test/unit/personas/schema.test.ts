import { describe, it, expect } from 'vitest';
import { PersonaManifestSchema } from '../../../src/core/personas/schema.js';

describe('PersonaManifestSchema', () => {
  const validManifest = {
    name: 'architect',
    displayName: 'Winston',
    title: 'System Architect',
    icon: '🏛',
    category: 'solutioning',
    produces: ['architecture', 'decision', 'epic'],
    consumes: ['prd', 'ux-spec', 'brief'],
    model_preference: {
      primary: 'opus',
      fallback: ['sonnet', 'gpt-4o'],
      budget: 'expensive',
    },
    temperature: 0.3,
    max_thinking_tokens: 32768,
    capabilities: ['system-design', 'adr-creation', 'api-design'],
    delegation_triggers: ['design the system', 'create architecture'],
    avoid_when: ['just fix this bug', 'write the code'],
  };

  it('accepts valid persona manifest', () => {
    const result = PersonaManifestSchema.safeParse(validManifest);
    expect(result.success).toBe(true);
  });

  it('rejects missing name', () => {
    const { name, ...noName } = validManifest;
    const result = PersonaManifestSchema.safeParse(noName);
    expect(result.success).toBe(false);
  });

  it('rejects invalid category', () => {
    const result = PersonaManifestSchema.safeParse({
      ...validManifest,
      category: 'invalid-category',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid budget tier', () => {
    const result = PersonaManifestSchema.safeParse({
      ...validManifest,
      model_preference: { ...validManifest.model_preference, budget: 'ultra' },
    });
    expect(result.success).toBe(false);
  });

  it('applies defaults for optional fields', () => {
    const minimal = {
      name: 'dev',
      displayName: 'Nova',
      title: 'Developer',
      category: 'implementation',
      produces: ['code'],
      consumes: ['story'],
    };
    const result = PersonaManifestSchema.safeParse(minimal);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.temperature).toBe(0.3);
      expect(result.data.capabilities).toEqual([]);
      expect(result.data.delegation_triggers).toEqual([]);
      expect(result.data.avoid_when).toEqual([]);
      expect(result.data.model_preference.primary).toBe('sonnet');
      expect(result.data.model_preference.budget).toBe('moderate');
    }
  });

  it('validates produces contains valid node types', () => {
    const result = PersonaManifestSchema.safeParse({
      ...validManifest,
      produces: ['invalid-node-type'],
    });
    expect(result.success).toBe(false);
  });

  it('validates consumes contains valid node types', () => {
    const result = PersonaManifestSchema.safeParse({
      ...validManifest,
      consumes: ['invalid-node-type'],
    });
    expect(result.success).toBe(false);
  });
});
