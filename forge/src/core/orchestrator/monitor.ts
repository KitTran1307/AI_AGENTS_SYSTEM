import type { AgentState, AgentStatus } from './types.js';

export interface MonitorConfig {
  circuitBreakerThreshold: number;
  loopDetection: boolean;
}

export class AgentMonitor {
  private agents: Map<string, AgentState> = new Map();
  private config: MonitorConfig;

  constructor(config: MonitorConfig) {
    this.config = config;
  }

  register(delegationId: string, persona: string, targetNode: string): void {
    this.agents.set(delegationId, {
      delegationId,
      persona,
      targetNode,
      status: 'pending',
      attempts: 0,
    });
  }

  getState(delegationId: string): AgentState | undefined {
    return this.agents.get(delegationId);
  }

  markRunning(delegationId: string): void {
    const state = this.agents.get(delegationId);
    if (!state || state.status === 'halted') return;
    state.status = 'running';
    state.startedAt = new Date().toISOString();
  }

  markCompleted(delegationId: string, output: string): void {
    const state = this.agents.get(delegationId);
    if (!state) return;
    state.status = 'completed';
    state.lastOutput = output;
    state.completedAt = new Date().toISOString();
  }

  markFailed(delegationId: string): void {
    const state = this.agents.get(delegationId);
    if (!state) return;
    state.attempts++;
    state.status = state.attempts >= this.config.circuitBreakerThreshold ? 'halted' : 'failed';
  }

  isCircuitBroken(delegationId: string): boolean {
    return this.agents.get(delegationId)?.status === 'halted';
  }

  detectLoop(delegationId: string, newOutput: string): boolean {
    if (!this.config.loopDetection) return false;
    const state = this.agents.get(delegationId);
    return state?.lastOutput === newOutput;
  }

  getByStatus(status: AgentStatus): AgentState[] {
    return [...this.agents.values()].filter((a) => a.status === status);
  }

  summary() {
    const states = [...this.agents.values()];
    return {
      total: states.length,
      pending: states.filter((s) => s.status === 'pending').length,
      running: states.filter((s) => s.status === 'running').length,
      completed: states.filter((s) => s.status === 'completed').length,
      failed: states.filter((s) => s.status === 'failed').length,
      halted: states.filter((s) => s.status === 'halted').length,
    };
  }
}
