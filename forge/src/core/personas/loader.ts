import fs from 'node:fs/promises';
import path from 'node:path';
import { parse as parseYaml } from 'yaml';
import { PersonaManifestSchema } from './schema.js';
import type { PersonaDefinition } from './types.js';

/**
 * Load a persona definition from a directory containing manifest.yaml and PERSONA.md.
 */
export async function loadPersona(personaDir: string): Promise<PersonaDefinition> {
  const manifestPath = path.join(personaDir, 'manifest.yaml');
  const promptPath = path.join(personaDir, 'PERSONA.md');

  const manifestRaw = await fs.readFile(manifestPath, 'utf-8');
  const manifestData = parseYaml(manifestRaw);

  const result = PersonaManifestSchema.safeParse(manifestData);
  if (!result.success) {
    const issues = result.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`);
    throw new Error(`Invalid persona manifest at ${manifestPath}:\n${issues.join('\n')}`);
  }

  const prompt = await fs.readFile(promptPath, 'utf-8');

  return {
    manifest: result.data,
    prompt: prompt.trim(),
    promptPath,
    manifestPath,
  };
}
