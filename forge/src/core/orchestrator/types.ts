// forge/src/core/orchestrator/types.ts
import type { NodeType } from '../graph/types.js';

export const SCOPE_LEVELS = ['patch', 'feature', 'epic', 'project'] as const;
export type ScopeLevel = (typeof SCOPE_LEVELS)[number];

export const COMPLEXITY_LEVELS = ['trivial', 'moderate', 'complex', 'massive'] as const;
export type ComplexityLevel = (typeof COMPLEXITY_LEVELS)[number];

export const URGENCY_TYPES = ['fix', 'enhancement', 'new', 'exploration'] as const;
export type UrgencyType = (typeof URGENCY_TYPES)[number];

export const CEREMONY_LEVELS = ['minimal', 'moderate', 'full', 'complete'] as const;
export type CeremonyLevel = (typeof CEREMONY_LEVELS)[number];

export interface TaskProfile {
  targetType: NodeType;
  scope: ScopeLevel;
  complexity: ComplexityLevel;
  domains: string[];
  urgency: UrgencyType;
}

export interface CeremonyPlan {
  level: CeremonyLevel;
  requiredPersonas: string[];
  steps: CeremonyStep[];
  parallelGroups: string[][];
  estimatedNodes: number;
}

export interface CeremonyStep {
  order: number;
  persona: string;
  targetNode: string;
  dependsOn: string[];
}

export interface DelegationMessage {
  id: string;
  to: string;
  targetNode: string;
  contextPackage: DelegationContext[];
  constraints: DelegationConstraints;
  returnTo: string;
}

export interface DelegationContext {
  nodeId: string;
  content: string;
}

export interface DelegationConstraints {
  qualityGate?: string;
  model?: string;
  budget?: string;
}

export type AgentStatus = 'pending' | 'running' | 'completed' | 'failed' | 'halted';

export interface AgentState {
  delegationId: string;
  persona: string;
  targetNode: string;
  status: AgentStatus;
  attempts: number;
  lastOutput?: string;
  startedAt?: string;
  completedAt?: string;
}
