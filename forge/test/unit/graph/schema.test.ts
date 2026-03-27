// forge/test/unit/graph/schema.test.ts
import { describe, it, expect } from 'vitest';
import { NodeMetadataSchema, type NodeMetadata } from '../../../src/core/graph/schema.js';

describe('NodeMetadataSchema', () => {
  const validMetadata: NodeMetadata = {
    id: 'story:auth-login',
    type: 'story',
    status: 'draft',
    producer: 'scrum-master',
    created: '2026-03-26T10:00:00Z',
    updated: '2026-03-26T10:00:00Z',
    edges: {
      requires: ['architecture:auth', 'prd:user-management'],
      implements: ['epic:auth'],
    },
    tags: ['auth', 'login'],
  };

  it('accepts valid node metadata', () => {
    const result = NodeMetadataSchema.safeParse(validMetadata);
    expect(result.success).toBe(true);
  });

  it('rejects invalid node type', () => {
    const result = NodeMetadataSchema.safeParse({
      ...validMetadata,
      type: 'invalid-type',
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing id', () => {
    const { id, ...noId } = validMetadata;
    const result = NodeMetadataSchema.safeParse(noId);
    expect(result.success).toBe(false);
  });

  it('validates id format matches type prefix', () => {
    const result = NodeMetadataSchema.safeParse({
      ...validMetadata,
      id: 'prd:auth-login',
      type: 'story',
    });
    expect(result.success).toBe(false);
  });

  it('accepts empty edges', () => {
    const result = NodeMetadataSchema.safeParse({
      ...validMetadata,
      edges: {},
    });
    expect(result.success).toBe(true);
  });

  it('accepts optional quality_gate', () => {
    const result = NodeMetadataSchema.safeParse({
      ...validMetadata,
      quality_gate: {
        status: 'pass',
        checklist: 'story-ready',
        checked_at: '2026-03-26T14:30:00Z',
      },
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid edge type keys', () => {
    const result = NodeMetadataSchema.safeParse({
      ...validMetadata,
      edges: { depends_on: ['something'] },
    });
    expect(result.success).toBe(false);
  });

  it('defaults missing optional fields', () => {
    const minimal = {
      id: 'brief:product-vision',
      type: 'brief',
      status: 'draft',
      created: '2026-03-26T10:00:00Z',
      updated: '2026-03-26T10:00:00Z',
    };
    const result = NodeMetadataSchema.safeParse(minimal);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.edges).toEqual({});
      expect(result.data.tags).toEqual([]);
    }
  });
});
