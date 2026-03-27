import type { PersonaDefinition } from '../personas/types.js';
import type { ContextEntry } from '../personas/prompt-builder.js';
import type { DelegationMessage, DelegationContext } from './types.js';

let delegationCounter = 0;

const QUALITY_GATE_MAP: Record<string, string> = {
  brief: 'brief-complete',
  prd: 'prd-complete',
  'ux-spec': 'ux-complete',
  architecture: 'architecture-ready',
  story: 'story-ready',
  code: 'code-complete',
  test: 'test-complete',
  review: 'review-complete',
};

export function buildDelegation(
  persona: PersonaDefinition,
  targetNode: string,
  contextEntries: ContextEntry[],
): DelegationMessage {
  delegationCounter++;
  const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
  const id = `del-${timestamp}-${String(delegationCounter).padStart(3, '0')}`;

  const nodeType = targetNode.split(':')[0] ?? '';

  const contextPackage: DelegationContext[] = contextEntries.map((entry) => ({
    nodeId: entry.nodeId,
    content: entry.content,
  }));

  return {
    id,
    to: persona.manifest.name,
    targetNode,
    contextPackage,
    constraints: {
      qualityGate: QUALITY_GATE_MAP[nodeType],
      model: persona.manifest.model_preference.primary,
      budget: persona.manifest.model_preference.budget,
    },
    returnTo: 'forge',
  };
}

export function _resetDelegationCounter(): void {
  delegationCounter = 0;
}
