import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { execInit } from '../../../src/cli/commands/init.js';
import { PersonaRegistry } from '../../../src/core/personas/registry.js';

describe('forge init — persona integration', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'forge-persona-'));
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it('copies enabled persona definitions to _forge/personas/', async () => {
    await execInit(tmpDir, {
      name: 'test',
      language: 'typescript',
      personas: ['architect', 'developer'],
      provider: 'anthropic',
    });

    const personasDir = path.join(tmpDir, '_forge', 'personas');
    const dirs = await fs.readdir(personasDir);
    expect(dirs).toContain('architect');
    expect(dirs).toContain('developer');
    expect(dirs).not.toContain('analyst'); // not enabled
  });

  it('copies personas that can be loaded by registry', async () => {
    await execInit(tmpDir, {
      name: 'test',
      language: 'typescript',
      personas: ['developer'],
      provider: 'anthropic',
    });

    const registry = await PersonaRegistry.fromDirectory(
      path.join(tmpDir, '_forge', 'personas'),
    );
    expect(registry.size).toBe(2); // developer + forge-orchestrator (always included)
    expect(registry.get('developer')).toBeDefined();
    expect(registry.get('developer')!.manifest.displayName).toBe('Nova');
  });

  it('always copies forge-orchestrator regardless of enabled list', async () => {
    await execInit(tmpDir, {
      name: 'test',
      language: 'typescript',
      personas: [],
      provider: 'anthropic',
    });

    const personasDir = path.join(tmpDir, '_forge', 'personas');
    const dirs = await fs.readdir(personasDir);
    expect(dirs).toContain('forge-orchestrator');
  });
});
