import fs from 'node:fs/promises';
import { parse as parseYaml } from 'yaml';
import { ForgeConfigSchema, type ForgeConfig } from './schema.js';

export async function loadConfig(configPath: string): Promise<ForgeConfig> {
  const raw = await fs.readFile(configPath, 'utf-8');
  const parsed = parseYaml(raw);

  const result = ForgeConfigSchema.safeParse(parsed);
  if (!result.success) {
    const issues = result.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`);
    throw new Error(`Invalid forge config at ${configPath}:\n${issues.join('\n')}`);
  }

  return result.data;
}
