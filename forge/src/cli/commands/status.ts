// forge/src/cli/commands/status.ts
import fs from 'node:fs/promises';
import path from 'node:path';
import { loadConfig } from '../../core/config/loader.js';
import { loadGraph } from '../../core/graph/loader.js';
import { heading, bullet, info, error } from '../util/display.js';

export async function execStatus(projectDir: string): Promise<void> {
  const configPath = path.join(projectDir, '_forge', 'config', 'forge.yaml');
  const graphDir = path.join(projectDir, '_forge', 'graph');
  const initialized = await fs.access(configPath).then(() => true).catch(() => false);
  if (!initialized) {
    console.log(error('Not a KitAI Forge project. Run `forge init` first.'));
    return;
  }
  const config = await loadConfig(configPath);
  const graph = await loadGraph(graphDir);
  console.log(heading(`KitAI Forge: ${config.project.name}`));
  console.log(info(`Language: ${config.project.language}`));
  if (config.project.framework) console.log(info(`Framework: ${config.project.framework}`));
  console.log(info(`Provider: ${config.models.default_provider}`));
  console.log(info(`Personas: ${config.personas.enabled.length > 0 ? config.personas.enabled.join(', ') : 'none configured'}`));
  console.log(info(`Graph nodes: ${graph.nodes.size}`));
  const inProgress = [...graph.nodes.values()].filter((n) => n.metadata.status === 'in-progress');
  if (inProgress.length > 0) {
    console.log('\n  In progress:');
    for (const node of inProgress) console.log(bullet(`${node.metadata.id} (${node.metadata.type})`, 4));
  }
}
