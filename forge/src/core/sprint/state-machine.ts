export const STORY_STATES = ['backlog', 'ready', 'in-progress', 'review', 'done'] as const;
export type StoryState = (typeof STORY_STATES)[number];

// Valid transitions: from → [allowed targets]
const TRANSITIONS: Record<StoryState, StoryState[]> = {
  backlog: ['ready'],
  ready: ['in-progress', 'backlog'],
  'in-progress': ['review', 'ready'],
  review: ['done', 'in-progress'],
  done: ['in-progress'], // Allow rework
};

export function isValidTransition(from: StoryState, to: StoryState): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

export class SprintStateMachine {
  private states: Map<string, StoryState> = new Map();

  addStory(storyId: string, initialState: StoryState = 'backlog'): void {
    this.states.set(storyId, initialState);
  }

  getState(storyId: string): StoryState | undefined {
    return this.states.get(storyId);
  }

  transition(storyId: string, to: StoryState): boolean {
    const current = this.states.get(storyId);
    if (!current) return false;
    if (!isValidTransition(current, to)) return false;
    this.states.set(storyId, to);
    return true;
  }

  getByState(state: StoryState): string[] {
    return [...this.states.entries()]
      .filter(([, s]) => s === state)
      .map(([id]) => id);
  }

  summary(): Record<StoryState, number> {
    const counts = Object.fromEntries(STORY_STATES.map((s) => [s, 0])) as Record<StoryState, number>;
    for (const state of this.states.values()) {
      counts[state]++;
    }
    return counts;
  }
}
