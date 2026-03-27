import type { GraphNode } from '../graph/types.js';

export interface GateResult {
  gate: string;
  passed: boolean;
  failedChecks: string[];
  passedChecks: string[];
  error?: string;
}

export interface GateCheck {
  name: string;
  test: (node: GraphNode) => boolean;
}

export const GATE_REQUIREMENTS: Record<string, GateCheck[]> = {
  'story-ready': [
    {
      name: 'Has acceptance criteria section',
      test: (n) => /##\s*acceptance criteria/i.test(n.content),
    },
    {
      name: 'Has at least one acceptance criterion',
      test: (n) => /- AC-\d+:/i.test(n.content) || /- \w.*:.*\w/i.test(n.content.split(/##\s*acceptance criteria/i)[1] ?? ''),
    },
    {
      name: 'Has tasks section',
      test: (n) => /##\s*tasks/i.test(n.content),
    },
    {
      name: 'Has file references',
      test: (n) => /##\s*files to (create|modify)/i.test(n.content) || /`[a-z][a-z0-9/._-]+\.[a-z]+`/i.test(n.content),
    },
  ],
  'architecture-ready': [
    {
      name: 'Has overview section',
      test: (n) => /##\s*overview/i.test(n.content),
    },
    {
      name: 'Has components section',
      test: (n) => /##\s*components/i.test(n.content),
    },
    {
      name: 'Has data model or API contracts section',
      test: (n) => /##\s*(data model|api contracts)/i.test(n.content),
    },
  ],
  'code-complete': [
    {
      name: 'References source files',
      test: (n) => /`[a-z][a-z0-9/._-]+\.[a-z]+`/i.test(n.content),
    },
    {
      name: 'Not in draft status',
      test: (n) => n.metadata.status !== 'draft',
    },
  ],
  'review-complete': [
    {
      name: 'Has findings section or approval',
      test: (n) => /##\s*(findings|approval|verdict)/i.test(n.content),
    },
    {
      name: 'No unresolved critical findings',
      test: (n) => !/critical.*unresolved/i.test(n.content),
    },
  ],
};

/**
 * Evaluate a quality gate against a graph node.
 * Returns a structured result with per-check details.
 */
export function evaluateGate(gateName: string, node: GraphNode): GateResult {
  const checks = GATE_REQUIREMENTS[gateName];
  if (!checks) {
    return {
      gate: gateName,
      passed: false,
      failedChecks: [],
      passedChecks: [],
      error: `Unknown quality gate: "${gateName}". Known gates: ${Object.keys(GATE_REQUIREMENTS).join(', ')}`,
    };
  }

  const failedChecks: string[] = [];
  const passedChecks: string[] = [];

  for (const check of checks) {
    if (check.test(node)) {
      passedChecks.push(check.name);
    } else {
      failedChecks.push(check.name);
    }
  }

  return {
    gate: gateName,
    passed: failedChecks.length === 0,
    failedChecks,
    passedChecks,
  };
}
