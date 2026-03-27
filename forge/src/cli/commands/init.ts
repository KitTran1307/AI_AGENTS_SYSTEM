// forge/src/cli/commands/init.ts
import fs from 'node:fs/promises';
import path from 'node:path';
import { stringify } from 'yaml';
import { NODE_TYPE_DIRS } from '../../core/graph/types.js';
import { success, info } from '../util/display.js';

export interface InitOptions {
  name: string;
  language: string;
  framework?: string;
  personas: string[];
  provider: string;
  force?: boolean;
}

export async function execInit(projectDir: string, opts: InitOptions): Promise<void> {
  const forgeDir = path.join(projectDir, '_forge');
  const configDir = path.join(forgeDir, 'config');
  const graphDir = path.join(forgeDir, 'graph');
  const configPath = path.join(configDir, 'forge.yaml');

  const exists = await fs.access(configPath).then(() => true).catch(() => false);
  if (exists && !opts.force) {
    throw new Error(`Project already initialized at ${forgeDir}. Use --force to overwrite.`);
  }

  await fs.mkdir(configDir, { recursive: true });
  for (const dir of Object.values(NODE_TYPE_DIRS)) {
    await fs.mkdir(path.join(graphDir, dir), { recursive: true });
  }

  const config = {
    project: {
      name: opts.name,
      language: opts.language,
      ...(opts.framework ? { framework: opts.framework } : {}),
    },
    personas: { enabled: opts.personas },
    models: {
      default_provider: opts.provider,
      routing: {
        expensive: { provider: opts.provider, model: getDefaultModel(opts.provider, 'expensive') },
        moderate: { provider: opts.provider, model: getDefaultModel(opts.provider, 'moderate') },
        cheap: { provider: opts.provider, model: getDefaultModel(opts.provider, 'cheap') },
      },
    },
    orchestration: { max_parallel_agents: 3, circuit_breaker_threshold: 3, loop_detection: true, auto_delegate: true },
    quality: { enforce_gates: true, required_gates: ['story-ready', 'code-complete'] },
  };

  await fs.writeFile(configPath, stringify(config, { lineWidth: 80 }), 'utf-8');
  const gitignorePath = path.join(forgeDir, '.gitignore');
  await fs.writeFile(gitignorePath, 'config/providers.yaml\nconfig/*.local.yaml\n', 'utf-8');

  console.log(success(`Initialized KitAI Forge in ${forgeDir}`));
  console.log(info(`Config: ${configPath}`));
  console.log(info(`Graph: ${graphDir} (${Object.keys(NODE_TYPE_DIRS).length} node type directories)`));
}

function getDefaultModel(provider: string, tier: string): string {
  const models: Record<string, Record<string, string>> = {
    anthropic: { expensive: 'claude-opus-4-6', moderate: 'claude-sonnet-4-6', cheap: 'claude-haiku-4-5' },
    openai: { expensive: 'gpt-4o', moderate: 'gpt-4o-mini', cheap: 'gpt-4o-mini' },
    google: { expensive: 'gemini-2.5-pro', moderate: 'gemini-2.5-flash', cheap: 'gemini-2.5-flash' },
  };
  return models[provider]?.[tier] ?? 'unknown';
}
