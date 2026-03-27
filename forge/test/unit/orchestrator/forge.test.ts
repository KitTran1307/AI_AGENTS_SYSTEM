import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { ForgeOrchestrator } from '../../../src/core/orchestrator/forge.js';
import { PersonaRegistry } from '../../../src/core/personas/registry.js';

const FIXTURES = path.resolve(import.meta.dirname, '../../fixtures/personas');

describe('ForgeOrchestrator', () => {
  it('creates an orchestrator instance', async () => {
    const registry = await PersonaRegistry.fromDirectory(FIXTURES);
    const forge = new ForgeOrchestrator(registry, {
      maxParallelAgents: 3,
      circuitBreakerThreshold: 3,
      loopDetection: true,
    });
    expect(forge).toBeDefined();
  });

  it('plans work from user intent', async () => {
    const registry = await PersonaRegistry.fromDirectory(FIXTURES);
    const forge = new ForgeOrchestrator(registry, {
      maxParallelAgents: 3,
      circuitBreakerThreshold: 3,
      loopDetection: true,
    });
    const plan = forge.plan('fix the login bug', 0);
    expect(plan.taskProfile.scope).toBe('patch');
    expect(plan.ceremony.level).toBe('minimal');
  });

  it('plans full ceremony for new feature with many gaps', async () => {
    const registry = await PersonaRegistry.fromDirectory(FIXTURES);
    const forge = new ForgeOrchestrator(registry, {
      maxParallelAgents: 3,
      circuitBreakerThreshold: 3,
      loopDetection: true,
    });
    const plan = forge.plan('build a complete payment system', 5);
    expect(plan.taskProfile.scope).toBe('epic');
    expect(plan.ceremony.level).toBe('full');
  });

  it('shortens ceremony when gaps are zero even for large scope', async () => {
    const registry = await PersonaRegistry.fromDirectory(FIXTURES);
    const forge = new ForgeOrchestrator(registry, {
      maxParallelAgents: 3,
      circuitBreakerThreshold: 3,
      loopDetection: true,
    });
    const plan = forge.plan('add search feature to the system', 0);
    expect(plan.ceremony.level).toBe('minimal');
  });

  it('returns monitor summary', async () => {
    const registry = await PersonaRegistry.fromDirectory(FIXTURES);
    const forge = new ForgeOrchestrator(registry, {
      maxParallelAgents: 3,
      circuitBreakerThreshold: 3,
      loopDetection: true,
    });
    const summary = forge.status();
    expect(summary.total).toBe(0);
    expect(summary.running).toBe(0);
  });

  it('exposes the persona registry', async () => {
    const registry = await PersonaRegistry.fromDirectory(FIXTURES);
    const forge = new ForgeOrchestrator(registry, {
      maxParallelAgents: 3,
      circuitBreakerThreshold: 3,
      loopDetection: true,
    });
    expect(forge.getRegistry()).toBe(registry);
  });
});
