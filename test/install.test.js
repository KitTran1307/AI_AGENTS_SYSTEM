#!/usr/bin/env node
'use strict';
/**
 * Smoke tests for the kitai-ai-agents-system-framework installer (index.js).
 * Run with: npm test
 */

const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CLI = path.join(ROOT, 'index.js');
const FRAMEWORK_FILES = [
  'AGENTS.md',
  'ACTIVATION_PROMPT.md',
  'FEATURE_INDEX.md',
  'MODULE_MANIFEST_TEMPLATE.md',
  'DEBT_LEDGER.md',
  'REGRESSION_INDEX.md',
];

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log('  PASS  ' + message);
    passed++;
  } else {
    console.error('  FAIL  ' + message);
    failed++;
  }
}

function run(args) {
  return spawnSync(process.execPath, [CLI, ...args], { encoding: 'utf8' });
}

// --- Test 1: no args exits 0 ---
console.log('\nTest 1: no args prints usage and exits 0');
const t1 = run([]);
assert(t1.status === 0, 'exit code is 0');
assert(t1.stdout.includes('Usage:'), 'stdout contains Usage:');

// --- Test 2: unknown command exits 1 ---
console.log('\nTest 2: unknown command exits 1');
const t2 = run(['unknown-command']);
assert(t2.status === 1, 'exit code is 1');
assert(t2.stdout.includes('Usage:'), 'stdout contains Usage:');

// --- Test 3: init installs all 6 files ---
console.log('\nTest 3: init copies all 6 framework files');
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kitai-test-'));
try {
  const t3 = spawnSync(process.execPath, [CLI, 'init'], { cwd: tmpDir, encoding: 'utf8' });
  assert(t3.status === 0, 'exit code is 0');
  for (const file of FRAMEWORK_FILES) {
    assert(fs.existsSync(path.join(tmpDir, file)), file + ' was created');
  }
  assert(t3.stdout.includes('6 file(s) installed'), 'reports 6 installed');

  // --- Test 4: re-run without --force skips all ---
  console.log('\nTest 4: re-run without --force skips all 6 files');
  const t4 = spawnSync(process.execPath, [CLI, 'init'], { cwd: tmpDir, encoding: 'utf8' });
  assert(t4.status === 0, 'exit code is 0');
  assert(t4.stdout.includes('6 skipped'), 'reports 6 skipped');

  // --- Test 5: --force overwrites ---
  console.log('\nTest 5: --force overwrites all 6 files');
  const t5 = spawnSync(process.execPath, [CLI, 'init', '--force'], { cwd: tmpDir, encoding: 'utf8' });
  assert(t5.status === 0, 'exit code is 0');
  assert(t5.stdout.includes('6 file(s) installed'), 'reports 6 installed');
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

// --- Summary ---
console.log('\n' + (failed === 0 ? 'ALL TESTS PASSED' : failed + ' TEST(S) FAILED') +
  ' (' + passed + ' passed, ' + failed + ' failed)\n');
process.exit(failed > 0 ? 1 : 0);
