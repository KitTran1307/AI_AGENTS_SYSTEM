import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { readNode, nodeFilePath } from '../../../src/core/graph/node.js';

const FIXTURES = path.resolve(import.meta.dirname, '../../fixtures/graph');

describe('readNode', () => {
  it('reads a node file and parses metadata + content', async () => {
    const node = await readNode(path.join(FIXTURES, 'prds/user-management.md'));
    expect(node.metadata.id).toBe('prd:user-management');
    expect(node.metadata.type).toBe('prd');
    expect(node.metadata.status).toBe('done');
    expect(node.metadata.edges.requires).toEqual(['brief:product-vision']);
    expect(node.metadata.edges.informs).toEqual(['architecture:auth', 'ux-spec:login-flow']);
    expect(node.metadata.tags).toEqual(['auth', 'users']);
    expect(node.content).toContain('# User Management PRD');
    expect(node.content).toContain('FR-1');
  });

  it('throws on file that does not exist', async () => {
    await expect(readNode('/nonexistent/path.md')).rejects.toThrow();
  });
});

describe('nodeFilePath', () => {
  it('computes the correct file path for a node id', () => {
    const result = nodeFilePath('/project/_forge/graph', 'story:auth-login');
    expect(result).toBe('/project/_forge/graph/stories/auth-login.md');
  });

  it('computes path for prd type', () => {
    const result = nodeFilePath('/project/_forge/graph', 'prd:user-management');
    expect(result).toBe('/project/_forge/graph/prds/user-management.md');
  });

  it('computes path for ux-spec type', () => {
    const result = nodeFilePath('/project/_forge/graph', 'ux-spec:login-flow');
    expect(result).toBe('/project/_forge/graph/ux/login-flow.md');
  });

  it('throws on invalid node id', () => {
    expect(() => nodeFilePath('/project/_forge/graph', 'invalid')).toThrow();
  });
});
