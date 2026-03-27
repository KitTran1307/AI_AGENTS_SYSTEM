import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { PersonaRegistry } from '../../../src/core/personas/registry.js';

const FIXTURES = path.resolve(import.meta.dirname, '../../fixtures/personas');

describe('PersonaRegistry', () => {
  it('loads personas from a directory', async () => {
    const registry = await PersonaRegistry.fromDirectory(FIXTURES);
    expect(registry.size).toBe(1); // test-persona fixture
  });

  it('looks up persona by name', async () => {
    const registry = await PersonaRegistry.fromDirectory(FIXTURES);
    const persona = registry.get('test-persona');
    expect(persona).toBeDefined();
    expect(persona!.manifest.displayName).toBe('Tester');
  });

  it('returns undefined for unknown name', async () => {
    const registry = await PersonaRegistry.fromDirectory(FIXTURES);
    expect(registry.get('nonexistent')).toBeUndefined();
  });

  it('finds personas by node type they produce', async () => {
    const registry = await PersonaRegistry.fromDirectory(FIXTURES);
    const producers = registry.findProducers('code');
    expect(producers.length).toBe(1);
    expect(producers[0].manifest.name).toBe('test-persona');
  });

  it('finds personas by delegation trigger', async () => {
    const registry = await PersonaRegistry.fromDirectory(FIXTURES);
    const matches = registry.matchTrigger('write tests for this module');
    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0].manifest.name).toBe('test-persona');
  });

  it('returns empty for no matching trigger', async () => {
    const registry = await PersonaRegistry.fromDirectory(FIXTURES);
    const matches = registry.matchTrigger('deploy to production');
    expect(matches.length).toBe(0);
  });

  it('lists all persona names', async () => {
    const registry = await PersonaRegistry.fromDirectory(FIXTURES);
    const names = registry.names();
    expect(names).toContain('test-persona');
  });
});
