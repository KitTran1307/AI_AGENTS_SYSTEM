// forge/test/integration/cli/init.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { execInit } from '../../../src/cli/commands/init.js';

describe('forge init', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'forge-init-'));
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it('creates _forge directory structure', async () => {
    await execInit(tmpDir, { name: 'test-project', language: 'typescript', framework: 'nextjs', personas: ['architect', 'developer'], provider: 'anthropic' });
    const configExists = await fs.access(path.join(tmpDir, '_forge', 'config', 'forge.yaml')).then(() => true).catch(() => false);
    const graphExists = await fs.access(path.join(tmpDir, '_forge', 'graph')).then(() => true).catch(() => false);
    expect(configExists).toBe(true);
    expect(graphExists).toBe(true);
  });

  it('creates a valid forge.yaml config', async () => {
    await execInit(tmpDir, { name: 'test-project', language: 'python', personas: ['developer'], provider: 'anthropic' });
    const configContent = await fs.readFile(path.join(tmpDir, '_forge', 'config', 'forge.yaml'), 'utf-8');
    expect(configContent).toContain('test-project');
    expect(configContent).toContain('python');
  });

  it('creates graph subdirectories for all node types', async () => {
    await execInit(tmpDir, { name: 'test', language: 'go', personas: [], provider: 'anthropic' });
    const graphDir = path.join(tmpDir, '_forge', 'graph');
    const dirs = await fs.readdir(graphDir);
    expect(dirs).toContain('briefs');
    expect(dirs).toContain('prds');
    expect(dirs).toContain('architecture');
    expect(dirs).toContain('stories');
    expect(dirs).toContain('code');
    expect(dirs).toContain('decisions');
  });

  it('does not overwrite existing config without force flag', async () => {
    await execInit(tmpDir, { name: 'first', language: 'ts', personas: [], provider: 'anthropic' });
    await expect(execInit(tmpDir, { name: 'second', language: 'py', personas: [], provider: 'anthropic' })).rejects.toThrow(/already initialized/);
  });
});
