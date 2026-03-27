import { describe, it, expect } from 'vitest';
import { AgentMonitor } from '../../../src/core/orchestrator/monitor.js';

describe('AgentMonitor', () => {
  it('tracks agent state', () => {
    const monitor = new AgentMonitor({ circuitBreakerThreshold: 3, loopDetection: true });
    monitor.register('del-001', 'architect', 'architecture:auth');
    const state = monitor.getState('del-001');
    expect(state?.status).toBe('pending');
    expect(state?.persona).toBe('architect');
  });

  it('transitions agent to running', () => {
    const monitor = new AgentMonitor({ circuitBreakerThreshold: 3, loopDetection: true });
    monitor.register('del-001', 'architect', 'architecture:auth');
    monitor.markRunning('del-001');
    expect(monitor.getState('del-001')?.status).toBe('running');
  });

  it('transitions agent to completed', () => {
    const monitor = new AgentMonitor({ circuitBreakerThreshold: 3, loopDetection: true });
    monitor.register('del-001', 'architect', 'architecture:auth');
    monitor.markRunning('del-001');
    monitor.markCompleted('del-001', 'architecture doc produced');
    const state = monitor.getState('del-001');
    expect(state?.status).toBe('completed');
    expect(state?.lastOutput).toBe('architecture doc produced');
  });

  it('trips circuit breaker after threshold failures', () => {
    const monitor = new AgentMonitor({ circuitBreakerThreshold: 3, loopDetection: true });
    monitor.register('del-001', 'architect', 'architecture:auth');
    monitor.markRunning('del-001');
    monitor.markFailed('del-001');
    monitor.markRunning('del-001');
    monitor.markFailed('del-001');
    monitor.markRunning('del-001');
    monitor.markFailed('del-001');
    expect(monitor.getState('del-001')?.status).toBe('halted');
    expect(monitor.isCircuitBroken('del-001')).toBe(true);
  });

  it('detects output loops', () => {
    const monitor = new AgentMonitor({ circuitBreakerThreshold: 3, loopDetection: true });
    monitor.register('del-001', 'developer', 'code:auth');
    monitor.markRunning('del-001');
    monitor.markCompleted('del-001', 'same output');
    monitor.markRunning('del-001');
    expect(monitor.detectLoop('del-001', 'same output')).toBe(true);
  });

  it('does not detect loop with different output', () => {
    const monitor = new AgentMonitor({ circuitBreakerThreshold: 3, loopDetection: true });
    monitor.register('del-001', 'developer', 'code:auth');
    monitor.markRunning('del-001');
    monitor.markCompleted('del-001', 'first output');
    monitor.markRunning('del-001');
    expect(monitor.detectLoop('del-001', 'different output')).toBe(false);
  });

  it('lists all agents by status', () => {
    const monitor = new AgentMonitor({ circuitBreakerThreshold: 3, loopDetection: true });
    monitor.register('del-001', 'architect', 'architecture:auth');
    monitor.register('del-002', 'developer', 'code:auth');
    monitor.markRunning('del-001');
    const running = monitor.getByStatus('running');
    expect(running).toHaveLength(1);
    expect(running[0].delegationId).toBe('del-001');
  });

  it('provides summary of all agents', () => {
    const monitor = new AgentMonitor({ circuitBreakerThreshold: 3, loopDetection: true });
    monitor.register('del-001', 'architect', 'architecture:auth');
    monitor.markRunning('del-001');
    monitor.markCompleted('del-001', 'done');
    const summary = monitor.summary();
    expect(summary.total).toBe(1);
    expect(summary.completed).toBe(1);
    expect(summary.running).toBe(0);
  });
});
