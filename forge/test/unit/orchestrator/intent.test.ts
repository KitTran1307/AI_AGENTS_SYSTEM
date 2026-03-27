import { describe, it, expect } from 'vitest';
import { classifyIntent } from '../../../src/core/orchestrator/intent.js';

describe('classifyIntent', () => {
  it('classifies bug fix as patch scope', () => {
    const profile = classifyIntent('fix the login rate limiting bug');
    expect(profile.scope).toBe('patch');
    expect(profile.urgency).toBe('fix');
  });

  it('classifies new feature as feature scope', () => {
    const profile = classifyIntent('add user authentication with JWT tokens');
    expect(profile.scope).toBe('feature');
    expect(profile.urgency).toBe('new');
  });

  it('classifies system design as epic scope', () => {
    const profile = classifyIntent('build a complete payment processing system');
    expect(profile.scope).toBe('epic');
    expect(profile.urgency).toBe('new');
  });

  it('classifies architecture request as architecture target', () => {
    const profile = classifyIntent('design the system architecture for auth');
    expect(profile.targetType).toBe('architecture');
  });

  it('classifies code request as code target', () => {
    const profile = classifyIntent('implement the login endpoint');
    expect(profile.targetType).toBe('code');
  });

  it('classifies requirements request as prd target', () => {
    const profile = classifyIntent('write requirements for the payment feature');
    expect(profile.targetType).toBe('prd');
  });

  it('extracts domains from input', () => {
    const profile = classifyIntent('fix the auth login bug in the user module');
    expect(profile.domains).toContain('auth');
    expect(profile.domains).toContain('login');
  });

  it('classifies enhancement urgency', () => {
    const profile = classifyIntent('improve the error handling in auth');
    expect(profile.urgency).toBe('enhancement');
  });
});
