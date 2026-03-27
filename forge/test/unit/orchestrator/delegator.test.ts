import { describe, it, expect, beforeEach } from 'vitest';
import { buildDelegation, _resetDelegationCounter } from '../../../src/core/orchestrator/delegator.js';
import type { PersonaDefinition } from '../../../src/core/personas/types.js';
import type { ContextEntry } from '../../../src/core/personas/prompt-builder.js';

const mockPersona: PersonaDefinition = {
  manifest: {
    name: 'architect',
    displayName: 'Winston',
    title: 'System Architect',
    category: 'solutioning',
    produces: ['architecture', 'decision', 'epic'],
    consumes: ['prd', 'ux-spec', 'brief'],
    model_preference: { primary: 'opus', fallback: ['sonnet'], budget: 'expensive' },
    temperature: 0.3,
    capabilities: ['system-design'],
    delegation_triggers: ['design the system'],
    avoid_when: [],
  },
  prompt: '# Winston',
  promptPath: '/path/to/PERSONA.md',
  manifestPath: '/path/to/manifest.yaml',
};

describe('buildDelegation', () => {
  beforeEach(() => {
    _resetDelegationCounter();
  });

  it('creates a delegation message with persona and target', () => {
    const del = buildDelegation(mockPersona, 'architecture:auth', []);
    expect(del.to).toBe('architect');
    expect(del.targetNode).toBe('architecture:auth');
    expect(del.returnTo).toBe('forge');
  });

  it('includes context package', () => {
    const context: ContextEntry[] = [
      { nodeId: 'prd:user-mgmt', content: '# PRD content' },
    ];
    const del = buildDelegation(mockPersona, 'architecture:auth', context);
    expect(del.contextPackage).toHaveLength(1);
    expect(del.contextPackage[0].nodeId).toBe('prd:user-mgmt');
  });

  it('sets constraints from persona manifest', () => {
    const del = buildDelegation(mockPersona, 'architecture:auth', []);
    expect(del.constraints.model).toBe('opus');
    expect(del.constraints.budget).toBe('expensive');
  });

  it('generates unique delegation IDs', () => {
    const del1 = buildDelegation(mockPersona, 'architecture:auth', []);
    const del2 = buildDelegation(mockPersona, 'architecture:payments', []);
    expect(del1.id).not.toBe(del2.id);
  });

  it('sets quality gate based on target node type', () => {
    const del = buildDelegation(mockPersona, 'architecture:auth', []);
    expect(del.constraints.qualityGate).toBe('architecture-ready');
  });

  it('sets story quality gate for story nodes', () => {
    const del = buildDelegation(mockPersona, 'story:auth-login', []);
    expect(del.constraints.qualityGate).toBe('story-ready');
  });

  it('sets code quality gate for code nodes', () => {
    const del = buildDelegation(mockPersona, 'code:auth-login', []);
    expect(del.constraints.qualityGate).toBe('code-complete');
  });
});
