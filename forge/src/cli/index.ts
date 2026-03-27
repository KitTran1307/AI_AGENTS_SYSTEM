// forge/src/cli/index.ts
import { Command } from 'commander';
import { execInit } from './commands/init.js';
import { execGraphStatus, execGraphValidate, execGraphImpact } from './commands/graph.js';
import { execStatus } from './commands/status.js';

export function createProgram(): Command {
  const program = new Command();
  program.name('forge').description('KitAI Forge — AI agent framework with adaptive ceremony').version('2.0.0-alpha.1');

  program.command('init').description('Initialize a new KitAI Forge project')
    .option('-n, --name <name>', 'Project name')
    .option('-l, --language <lang>', 'Primary language')
    .option('-f, --framework <framework>', 'Primary framework')
    .option('-p, --provider <provider>', 'Default model provider', 'anthropic')
    .option('--personas <personas...>', 'Personas to enable')
    .option('--force', 'Overwrite existing configuration')
    .action(async (opts) => {
      await execInit(process.cwd(), {
        name: opts.name ?? 'my-project',
        language: opts.language ?? 'typescript',
        framework: opts.framework,
        personas: opts.personas ?? ['architect', 'developer', 'reviewer'],
        provider: opts.provider,
        force: opts.force,
      });
    });

  const graphCmd = program.command('graph').description('Graph operations');
  graphCmd.command('status').description('Show graph status summary').action(async () => { await execGraphStatus(process.cwd()); });
  graphCmd.command('validate').description('Validate graph integrity').action(async () => { await execGraphValidate(process.cwd()); });
  graphCmd.command('impact <nodeId>').description('Analyze impact of changing a node').action(async (nodeId: string) => { await execGraphImpact(process.cwd(), nodeId); });

  program.command('status').description('Show project status overview').action(async () => { await execStatus(process.cwd()); });

  return program;
}

const program = createProgram();
program.parseAsync(process.argv).catch((err) => { console.error(err.message); process.exit(1); });
