import { classifyIntent } from './intent.js';
import { calculateCeremony } from './ceremony.js';
import { AgentMonitor } from './monitor.js';
import type { PersonaRegistry } from '../personas/registry.js';
import type { TaskProfile, CeremonyPlan } from './types.js';

export interface OrchestratorConfig {
  maxParallelAgents: number;
  circuitBreakerThreshold: number;
  loopDetection: boolean;
}

export interface WorkPlan {
  taskProfile: TaskProfile;
  ceremony: CeremonyPlan;
}

export class ForgeOrchestrator {
  private registry: PersonaRegistry;
  private monitor: AgentMonitor;
  private config: OrchestratorConfig;

  constructor(registry: PersonaRegistry, config: OrchestratorConfig) {
    this.registry = registry;
    this.config = config;
    this.monitor = new AgentMonitor({
      circuitBreakerThreshold: config.circuitBreakerThreshold,
      loopDetection: config.loopDetection,
    });
  }

  /**
   * Classify intent and calculate ceremony for a user request.
   * gapCount comes from running graph gap detection externally.
   */
  plan(userInput: string, gapCount: number): WorkPlan {
    const taskProfile = classifyIntent(userInput);
    const ceremony = calculateCeremony(taskProfile.scope, gapCount);
    return { taskProfile, ceremony };
  }

  /** Get current agent execution status. */
  status() {
    return this.monitor.summary();
  }

  /** Get the persona registry. */
  getRegistry(): PersonaRegistry {
    return this.registry;
  }

  /** Get the agent monitor. */
  getMonitor(): AgentMonitor {
    return this.monitor;
  }
}
