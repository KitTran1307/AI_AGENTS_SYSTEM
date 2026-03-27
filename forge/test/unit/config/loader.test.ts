import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { loadConfig } from '../../../src/core/config/loader.js';

const FIXTURES = path.resolve(import.meta.dirname, '../../fixtures/config');

describe('loadConfig', () => {
  it('loads and validates a config file', async () => {
    const config = await loadConfig(path.join(FIXTURES, 'forge.yaml'));
    expect(config.project.name).toBe('test-project');
    expect(config.project.language).toBe('typescript');
    expect(config.personas.enabled).toContain('architect');
    expect(config.models.default_provider).toBe('anthropic');
  });

  it('throws on invalid config', async () => {
    await expect(
      loadConfig(path.join(FIXTURES, 'forge-invalid.yaml')),
    ).rejects.toThrow();
  });

  it('throws on nonexistent file', async () => {
    await expect(loadConfig('/nonexistent.yaml')).rejects.toThrow();
  });
});
