import type { PersonaDefinition } from './types.js';

export interface ContextEntry {
  nodeId: string;
  content: string;
}

export interface RegressionEntry {
  id: string;
  summary: string;
}

export interface PromptContext {
  projectName: string;
  projectLanguage: string;
  projectFramework?: string;
  graphContext?: ContextEntry[];
  regressions?: RegressionEntry[];
}

/**
 * Build a runtime prompt for a persona by assembling sections from
 * persona definition + project context + graph context.
 */
export function buildPrompt(persona: PersonaDefinition, ctx: PromptContext): string {
  const sections: string[] = [];

  // Section 1: Persona identity
  sections.push(buildIdentitySection(persona));

  // Section 2: Persona prompt content (from PERSONA.md)
  sections.push(persona.prompt);

  // Section 3: Project context
  sections.push(buildProjectSection(ctx));

  // Section 4: Graph context (only if provided)
  if (ctx.graphContext && ctx.graphContext.length > 0) {
    sections.push(buildGraphContextSection(ctx.graphContext));
  }

  // Section 5: Regression warnings (only if provided)
  if (ctx.regressions && ctx.regressions.length > 0) {
    sections.push(buildRegressionsSection(ctx.regressions));
  }

  // Section 6: Hard blocks (always included)
  sections.push(buildHardBlocksSection());

  return sections.join('\n\n---\n\n');
}

function buildIdentitySection(persona: PersonaDefinition): string {
  const m = persona.manifest;
  return [
    `# ${m.displayName} — ${m.title}`,
    '',
    `**Role:** ${m.title}`,
    `**Category:** ${m.category}`,
    `**Produces:** ${m.produces.join(', ')}`,
    `**Consumes:** ${m.consumes.join(', ')}`,
    m.capabilities.length > 0 ? `**Capabilities:** ${m.capabilities.join(', ')}` : '',
  ].filter(Boolean).join('\n');
}

function buildProjectSection(ctx: PromptContext): string {
  const lines = [
    '## Project Context',
    '',
    `**Project:** ${ctx.projectName}`,
    `**Language:** ${ctx.projectLanguage}`,
  ];
  if (ctx.projectFramework) {
    lines.push(`**Framework:** ${ctx.projectFramework}`);
  }
  return lines.join('\n');
}

function buildGraphContextSection(entries: ContextEntry[]): string {
  const lines = ['## Context from Graph', ''];
  for (const entry of entries) {
    lines.push(`### ${entry.nodeId}`, '', entry.content, '');
  }
  return lines.join('\n');
}

function buildRegressionsSection(regressions: RegressionEntry[]): string {
  const lines = [
    '## Regression Warnings',
    '',
    'The following known regressions are relevant to your work. Do NOT reintroduce these bugs:',
    '',
  ];
  for (const reg of regressions) {
    lines.push(`- **${reg.id}**: ${reg.summary}`);
  }
  return lines.join('\n');
}

function buildHardBlocksSection(): string {
  return [
    '## HARD BLOCKS',
    '',
    'The following actions are NEVER permitted:',
    '',
    '- Never suppress type safety (no `any`, no `@ts-ignore` without justification)',
    '- Never commit secrets, credentials, or API keys',
    '- Never make unauthorized commits or pushes',
    '- Never delete or skip existing tests without explicit approval',
    '- Never speculate about behavior — verify with actual code or tests',
    '- Never modify files outside the scope of your assigned task',
    '- Never ignore quality gate failures',
  ].join('\n');
}
