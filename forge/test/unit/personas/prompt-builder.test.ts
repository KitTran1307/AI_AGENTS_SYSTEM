import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { buildPrompt, type PromptContext } from '../../../src/core/personas/prompt-builder.js';
import { loadPersona } from '../../../src/core/personas/loader.js';

const FIXTURES = path.resolve(import.meta.dirname, '../../fixtures/personas');

describe('buildPrompt', () => {
  it('includes persona identity and prompt content', async () => {
    const persona = await loadPersona(path.join(FIXTURES, 'test-persona'));
    const ctx: PromptContext = {
      projectName: 'my-project',
      projectLanguage: 'typescript',
    };
    const prompt = buildPrompt(persona, ctx);
    expect(prompt).toContain('Tester');
    expect(prompt).toContain('Test Persona');
    expect(prompt).toContain('Edge cases are where bugs hide');
  });

  it('includes project context section', async () => {
    const persona = await loadPersona(path.join(FIXTURES, 'test-persona'));
    const ctx: PromptContext = {
      projectName: 'my-app',
      projectLanguage: 'python',
      projectFramework: 'fastapi',
    };
    const prompt = buildPrompt(persona, ctx);
    expect(prompt).toContain('my-app');
    expect(prompt).toContain('python');
    expect(prompt).toContain('fastapi');
  });

  it('includes graph context when provided', async () => {
    const persona = await loadPersona(path.join(FIXTURES, 'test-persona'));
    const ctx: PromptContext = {
      projectName: 'test',
      projectLanguage: 'ts',
      graphContext: [
        { nodeId: 'story:auth-login', content: '# Login Story\nAC-1: User can log in' },
        { nodeId: 'architecture:auth', content: '# Auth Architecture\nJWT tokens' },
      ],
    };
    const prompt = buildPrompt(persona, ctx);
    expect(prompt).toContain('story:auth-login');
    expect(prompt).toContain('AC-1: User can log in');
    expect(prompt).toContain('JWT tokens');
  });

  it('includes regression warnings when provided', async () => {
    const persona = await loadPersona(path.join(FIXTURES, 'test-persona'));
    const ctx: PromptContext = {
      projectName: 'test',
      projectLanguage: 'ts',
      regressions: [
        { id: 'REG-001', summary: 'Token expiry not checked on refresh' },
      ],
    };
    const prompt = buildPrompt(persona, ctx);
    expect(prompt).toContain('REG-001');
    expect(prompt).toContain('Token expiry not checked');
  });

  it('includes hard blocks section', async () => {
    const persona = await loadPersona(path.join(FIXTURES, 'test-persona'));
    const ctx: PromptContext = {
      projectName: 'test',
      projectLanguage: 'ts',
    };
    const prompt = buildPrompt(persona, ctx);
    expect(prompt).toContain('HARD BLOCKS');
    expect(prompt).toContain('Never suppress type safety');
  });

  it('omits empty sections gracefully', async () => {
    const persona = await loadPersona(path.join(FIXTURES, 'test-persona'));
    const ctx: PromptContext = {
      projectName: 'test',
      projectLanguage: 'ts',
    };
    const prompt = buildPrompt(persona, ctx);
    // No graph context or regressions — those sections should not appear
    expect(prompt).not.toContain('## Context from Graph');
    expect(prompt).not.toContain('## Regression Warnings');
  });
});
