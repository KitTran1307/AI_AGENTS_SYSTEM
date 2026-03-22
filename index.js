#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const FRAMEWORK_FILES = [
  'AGENTS.md',
  'ACTIVATION_PROMPT.md',
  'FEATURE_INDEX.md',
  'MODULE_MANIFEST_TEMPLATE.md',
  'DEBT_LEDGER.md',
  'REGRESSION_INDEX.md',
];

const args = process.argv.slice(2);
const force = args.includes('--force');
const command = args.find((a) => !a.startsWith('--'));

if (command !== 'init') {
  console.log('');
  console.log('kitai-ai-agents-system-framework');
  console.log('');
  console.log('Usage: npx kitai-ai-agents-system-framework init [--force]');
  console.log('');
  console.log('  init           Copy framework files to current directory');
  console.log('  --force        Overwrite existing files (default: skip with warning)');
  console.log('');
  process.exit(command ? 1 : 0);
}

const srcDir = __dirname;
const destDir = process.cwd();

console.log('');
console.log('kitai-ai-agents-system-framework');
console.log('=================================');
console.log('Installing to: ' + destDir);
console.log('');

let installed = 0;
let skipped = 0;

for (const file of FRAMEWORK_FILES) {
  const src = path.join(srcDir, file);
  const dest = path.join(destDir, file);

  if (fs.existsSync(dest) && !force) {
    console.log('  SKIP  ' + file + ' (already exists — use --force to overwrite)');
    skipped++;
    continue;
  }

  try {
    fs.copyFileSync(src, dest);
    console.log('  OK    ' + file);
    installed++;
  } catch (err) {
    console.error('  ERROR ' + file + ': ' + err.message);
    process.exit(1);
  }
}

console.log('');
console.log('Done! ' + installed + ' file(s) installed, ' + skipped + ' skipped.');
console.log('');
console.log('Next steps:');
console.log('  1. Attach these 4 files to your AI session:');
console.log('       AGENTS.md');
console.log('       ACTIVATION_PROMPT.md');
console.log('       FEATURE_INDEX.md');
console.log('       MODULE_MANIFEST_TEMPLATE.md');
console.log('     (DEBT_LEDGER.md and REGRESSION_INDEX.md are populated by the agent after bootstrap)');
console.log('  2. Copy the Bootstrap Activation Prompt from ACTIVATION_PROMPT.md');
console.log('  3. Paste it into your AI session — the agent will scan and bootstrap your project');
console.log('');
