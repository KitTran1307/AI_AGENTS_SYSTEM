import type { ScopeLevel, CeremonyLevel, CeremonyPlan, CeremonyStep } from './types.js';

const CEREMONY_CHAINS: Record<CeremonyLevel, string[]> = {
  minimal: ['developer'],
  moderate: ['architect', 'scrum-master', 'developer', 'reviewer'],
  full: ['analyst', 'product-manager', 'architect', 'scrum-master', 'developer', 'qa-engineer', 'reviewer'],
  complete: ['analyst', 'product-manager', 'ux-designer', 'architect', 'scrum-master', 'developer', 'qa-engineer', 'reviewer'],
};

const SCOPE_TO_CEREMONY: Record<ScopeLevel, CeremonyLevel> = {
  patch: 'minimal',
  feature: 'moderate',
  epic: 'full',
  project: 'complete',
};

export function calculateCeremony(scope: ScopeLevel, gapCount: number): CeremonyPlan {
  let level = SCOPE_TO_CEREMONY[scope];

  // Graph overrides: shorten ceremony based on gaps
  if (gapCount === 0) {
    level = 'minimal';
  } else if (gapCount <= 2 && (level === 'full' || level === 'complete')) {
    level = 'moderate';
  }

  const requiredPersonas = CEREMONY_CHAINS[level];
  const steps = buildSteps(requiredPersonas);

  return {
    level,
    requiredPersonas: [...requiredPersonas],
    steps,
    parallelGroups: identifyParallelSteps(steps),
    estimatedNodes: gapCount + 1,
  };
}

function buildSteps(personas: string[]): CeremonyStep[] {
  return personas.map((persona, i) => ({
    order: i,
    persona,
    targetNode: `${persona}:output`,
    dependsOn: i > 0 ? [`${personas[i - 1]}:output`] : [],
  }));
}

function identifyParallelSteps(steps: CeremonyStep[]): string[][] {
  const groups = new Map<number, string[]>();
  for (const step of steps) {
    const existing = groups.get(step.order) ?? [];
    existing.push(step.persona);
    groups.set(step.order, existing);
  }
  return [...groups.values()];
}
