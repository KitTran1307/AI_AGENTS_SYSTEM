import type { NodeType } from '../graph/types.js';
import type { TaskProfile, ScopeLevel, UrgencyType, ComplexityLevel } from './types.js';

interface PatternRule {
  patterns: RegExp[];
  value: string;
}

const SCOPE_PATTERNS: PatternRule[] = [
  { patterns: [/\bfix\b/i, /\bbug\b/i, /\bpatch\b/i, /\bhotfix\b/i, /\bquick\b/i], value: 'patch' },
  { patterns: [/\bbuild\s+(a\s+)?complete\b/i, /\bsystem\b/i, /\bentire\b/i, /\bfull\b/i], value: 'epic' },
  { patterns: [/\bproject\b/i, /\bfrom\s+scratch\b/i, /\bnew\s+app\b/i], value: 'project' },
];

const URGENCY_PATTERNS: PatternRule[] = [
  { patterns: [/\bimprove\b/i, /\benhance\b/i, /\brefactor\b/i, /\boptimize\b/i, /\bupgrade\b/i], value: 'enhancement' },
  { patterns: [/\bexplore\b/i, /\bresearch\b/i, /\binvestigate\b/i, /\banalyze\b/i], value: 'exploration' },
  { patterns: [/\bfix\b/i, /\bbug\b/i, /\bbroken\b/i, /\bcrash\b/i, /\berror\b/i], value: 'fix' },
];

const TARGET_PATTERNS: { patterns: RegExp[]; type: NodeType }[] = [
  { patterns: [/\barchitecture\b/i, /\bdesign\s+the\s+system\b/i, /\bsystem\s+design\b/i], type: 'architecture' },
  { patterns: [/\brequirements?\b/i, /\bprd\b/i, /\bproduct\s+requirements\b/i], type: 'prd' },
  { patterns: [/\bbrief\b/i, /\banalyze\s+the\s+market\b/i], type: 'brief' },
  { patterns: [/\bux\b/i, /\buser\s+experience\b/i, /\buser\s+flow\b/i], type: 'ux-spec' },
  { patterns: [/\bstory\b/i, /\bstories\b/i, /\bbreak\s+(this\s+)?down\b/i], type: 'story' },
  { patterns: [/\btest\s+strategy\b/i], type: 'test' },
  { patterns: [/\breview\b/i, /\baudit\b/i], type: 'review' },
];

const DOMAIN_PATTERNS = /\b(auth|login|user|payment|api|database|cache|search|notification|email|admin|dashboard|profile|settings|upload|file|chat|message|session|token|billing|order|cart|product|inventory)\b/gi;

export function classifyIntent(input: string): TaskProfile {
  const targetType = classifyTargetType(input);
  const scope = classifyScope(input);
  const urgency = classifyUrgency(input);
  const complexity = estimateComplexity(scope);
  const domains = extractDomains(input);
  return { targetType, scope, complexity, domains, urgency };
}

function classifyTargetType(input: string): NodeType {
  for (const rule of TARGET_PATTERNS) {
    if (rule.patterns.some((p) => p.test(input))) return rule.type;
  }
  return 'code';
}

function classifyScope(input: string): ScopeLevel {
  for (const rule of SCOPE_PATTERNS) {
    if (rule.patterns.some((p) => p.test(input))) return rule.value as ScopeLevel;
  }
  return 'feature';
}

function classifyUrgency(input: string): UrgencyType {
  for (const rule of URGENCY_PATTERNS) {
    if (rule.patterns.some((p) => p.test(input))) return rule.value as UrgencyType;
  }
  return 'new';
}

function estimateComplexity(scope: ScopeLevel): ComplexityLevel {
  const map: Record<ScopeLevel, ComplexityLevel> = {
    patch: 'trivial', feature: 'moderate', epic: 'complex', project: 'massive',
  };
  return map[scope];
}

function extractDomains(input: string): string[] {
  const matches = input.match(DOMAIN_PATTERNS);
  if (!matches) return [];
  return [...new Set(matches.map((m) => m.toLowerCase()))];
}
