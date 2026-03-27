// forge/test/integration/cli/graph.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { execInit } from '../../../src/cli/commands/init.js';
import { writeNode } from '../../../src/core/graph/writer.js';
import { loadGraph } from '../../../src/core/graph/loader.js';
import { validateGraph } from '../../../src/core/graph/validator.js';
import { detectGaps, assembleContext } from '../../../src/core/graph/engine.js';
import type { GraphNode } from '../../../src/core/graph/types.js';

describe('end-to-end: init → populate graph → validate → query', () => {
  let tmpDir: string;
  let graphDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'forge-e2e-'));
    graphDir = path.join(tmpDir, '_forge', 'graph');

    await execInit(tmpDir, {
      name: 'e2e-test',
      language: 'typescript',
      framework: 'express',
      personas: ['architect', 'developer'],
      provider: 'anthropic',
    });
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it('creates a project, adds nodes, validates, and queries gaps', async () => {
    // Step 1: Write a PRD node
    const prd: GraphNode = {
      metadata: {
        id: 'prd:auth',
        type: 'prd',
        status: 'done',
        created: '2026-03-26T10:00:00Z',
        updated: '2026-03-26T10:00:00Z',
        edges: {},
        tags: ['auth'],
      },
      content: '# Auth PRD\n\nUsers need authentication.',
      filePath: path.join(graphDir, 'prds', 'auth.md'),
    };
    await writeNode(prd);

    // Step 2: Write an architecture node that requires the PRD
    const arch: GraphNode = {
      metadata: {
        id: 'architecture:auth',
        type: 'architecture',
        status: 'done',
        created: '2026-03-26T11:00:00Z',
        updated: '2026-03-26T11:00:00Z',
        edges: { requires: ['prd:auth'] },
        tags: ['auth'],
      },
      content: '# Auth Architecture\n\nJWT-based auth with refresh tokens.',
      filePath: path.join(graphDir, 'architecture', 'auth.md'),
    };
    await writeNode(arch);

    // Step 3: Load and validate graph
    const graph = await loadGraph(graphDir);
    expect(graph.nodes.size).toBe(2);

    const validation = validateGraph(graph);
    expect(validation.valid).toBe(true);

    // Step 4: Detect gaps for implementing code:auth-login
    const gaps = detectGaps(graph, 'code:auth-login', {
      'code:auth-login': { requires: ['story:auth-login'] },
      'story:auth-login': { requires: ['architecture:auth'] },
    });
    expect(gaps).toContain('story:auth-login');
    expect(gaps).not.toContain('architecture:auth'); // exists

    // Step 5: Assemble context for producing the story
    const context = assembleContext(graph, 'story:auth-login', {
      'story:auth-login': { requires: ['architecture:auth', 'prd:auth'] },
    });
    expect(context).toHaveLength(2);
    expect(context.map((c) => c.nodeId)).toContain('prd:auth');
    expect(context.map((c) => c.nodeId)).toContain('architecture:auth');
  });
});
