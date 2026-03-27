import { describe, it, expect } from 'vitest';
import { calculateCeremony } from '../../../src/core/orchestrator/ceremony.js';

describe('calculateCeremony', () => {
  it('returns minimal ceremony for patch scope', () => {
    const plan = calculateCeremony('patch', 0);
    expect(plan.level).toBe('minimal');
    expect(plan.requiredPersonas).toContain('developer');
  });

  it('returns moderate ceremony for feature scope', () => {
    const plan = calculateCeremony('feature', 3);
    expect(plan.level).toBe('moderate');
    expect(plan.requiredPersonas).toContain('architect');
    expect(plan.requiredPersonas).toContain('developer');
  });

  it('returns full ceremony for epic scope', () => {
    const plan = calculateCeremony('epic', 5);
    expect(plan.level).toBe('full');
    expect(plan.requiredPersonas).toContain('analyst');
    expect(plan.requiredPersonas).toContain('product-manager');
  });

  it('returns complete ceremony for project scope', () => {
    const plan = calculateCeremony('project', 8);
    expect(plan.level).toBe('complete');
  });

  it('shortens ceremony when no gaps exist', () => {
    const plan = calculateCeremony('feature', 0);
    expect(plan.level).toBe('minimal');
    expect(plan.requiredPersonas).toContain('developer');
  });

  it('shortens ceremony when few gaps exist for epic scope', () => {
    const plan = calculateCeremony('epic', 1);
    expect(plan.level).toBe('moderate');
  });

  it('includes reviewer for non-trivial ceremony', () => {
    const plan = calculateCeremony('feature', 2);
    expect(plan.requiredPersonas).toContain('reviewer');
  });

  it('steps are ordered correctly', () => {
    const plan = calculateCeremony('epic', 5);
    for (let i = 1; i < plan.steps.length; i++) {
      expect(plan.steps[i].order).toBeGreaterThanOrEqual(plan.steps[i - 1].order);
    }
  });
});
