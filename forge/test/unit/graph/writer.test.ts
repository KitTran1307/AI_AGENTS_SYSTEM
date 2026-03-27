import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { writeNode } from '../../../src/core/graph/writer.js';
import { readNode } from '../../../src/core/graph/node.js';
import type { GraphNode } from '../../../src/core/graph/types.js';

describe('writeNode', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'forge-test-'));
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it('writes a node to disk and can be read back', async () => {
    const node: GraphNode = {
      metadata: {
        id: 'story:auth-login',
        type: 'story',
        status: 'draft',
        producer: 'scrum-master',
        created: '2026-03-26T10:00:00Z',
        updated: '2026-03-26T10:00:00Z',
        edges: { requires: ['architecture:auth'] },
        tags: ['auth'],
      },
      content: '# Auth Login Story\n\nImplement login with email/password.',
      filePath: path.join(tmpDir, 'stories', 'auth-login.md'),
    };

    await writeNode(node);

    const readBack = await readNode(node.filePath);
    expect(readBack.metadata.id).toBe('story:auth-login');
    expect(readBack.metadata.status).toBe('draft');
    expect(readBack.metadata.edges.requires).toEqual(['architecture:auth']);
    expect(readBack.content).toContain('# Auth Login Story');
  });

  it('creates parent directories if they do not exist', async () => {
    const node: GraphNode = {
      metadata: {
        id: 'brief:vision',
        type: 'brief',
        status: 'draft',
        created: '2026-03-26T10:00:00Z',
        updated: '2026-03-26T10:00:00Z',
        edges: {},
        tags: [],
      },
      content: '# Product Vision',
      filePath: path.join(tmpDir, 'deep', 'nested', 'dir', 'vision.md'),
    };

    await writeNode(node);
    const stat = await fs.stat(node.filePath);
    expect(stat.isFile()).toBe(true);
  });
});
