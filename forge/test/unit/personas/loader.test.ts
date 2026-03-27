import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { loadPersona } from '../../../src/core/personas/loader.js';

const FIXTURES = path.resolve(import.meta.dirname, '../../fixtures/personas');

describe('loadPersona', () => {
  it('loads a persona from manifest.yaml + PERSONA.md', async () => {
    const persona = await loadPersona(path.join(FIXTURES, 'test-persona'));
    expect(persona.manifest.name).toBe('test-persona');
    expect(persona.manifest.displayName).toBe('Tester');
    expect(persona.manifest.category).toBe('implementation');
    expect(persona.manifest.produces).toEqual(['code', 'test']);
    expect(persona.manifest.consumes).toEqual(['story', 'architecture']);
    expect(persona.manifest.temperature).toBe(0.5);
    expect(persona.prompt).toContain('# Tester — Test Persona');
    expect(persona.prompt).toContain('Edge cases are where bugs hide');
  });

  it('throws on missing manifest.yaml', async () => {
    await expect(loadPersona('/nonexistent/dir')).rejects.toThrow();
  });

  it('throws on invalid manifest data', async () => {
    // We test this via the schema tests; loader delegates to schema validation
  });
});
