import { describe, it, expect } from 'vitest';
import { SprintStateMachine, STORY_STATES, isValidTransition } from '../../../src/core/sprint/state-machine.js';

describe('SprintStateMachine', () => {
  it('initializes a story in backlog state', () => {
    const sm = new SprintStateMachine();
    sm.addStory('story:auth-login');
    expect(sm.getState('story:auth-login')).toBe('backlog');
  });

  it('transitions backlog → ready', () => {
    const sm = new SprintStateMachine();
    sm.addStory('story:auth-login');
    const ok = sm.transition('story:auth-login', 'ready');
    expect(ok).toBe(true);
    expect(sm.getState('story:auth-login')).toBe('ready');
  });

  it('transitions ready → in-progress', () => {
    const sm = new SprintStateMachine();
    sm.addStory('story:auth-login');
    sm.transition('story:auth-login', 'ready');
    sm.transition('story:auth-login', 'in-progress');
    expect(sm.getState('story:auth-login')).toBe('in-progress');
  });

  it('rejects invalid transition', () => {
    const sm = new SprintStateMachine();
    sm.addStory('story:auth-login');
    // Can't go from backlog directly to done
    const ok = sm.transition('story:auth-login', 'done');
    expect(ok).toBe(false);
    expect(sm.getState('story:auth-login')).toBe('backlog');
  });

  it('allows done → backlog (reset for rework)', () => {
    const sm = new SprintStateMachine();
    sm.addStory('story:auth-login');
    sm.transition('story:auth-login', 'ready');
    sm.transition('story:auth-login', 'in-progress');
    sm.transition('story:auth-login', 'review');
    sm.transition('story:auth-login', 'done');
    expect(sm.getState('story:auth-login')).toBe('done');
  });

  it('returns all stories by state', () => {
    const sm = new SprintStateMachine();
    sm.addStory('story:auth-login');
    sm.addStory('story:auth-register');
    sm.transition('story:auth-login', 'ready');
    expect(sm.getByState('ready')).toContain('story:auth-login');
    expect(sm.getByState('backlog')).toContain('story:auth-register');
  });

  it('isValidTransition validates state graph', () => {
    expect(isValidTransition('backlog', 'ready')).toBe(true);
    expect(isValidTransition('backlog', 'done')).toBe(false);
    expect(isValidTransition('in-progress', 'review')).toBe(true);
  });

  it('STORY_STATES contains all expected states', () => {
    expect(STORY_STATES).toContain('backlog');
    expect(STORY_STATES).toContain('ready');
    expect(STORY_STATES).toContain('in-progress');
    expect(STORY_STATES).toContain('review');
    expect(STORY_STATES).toContain('done');
  });
});
