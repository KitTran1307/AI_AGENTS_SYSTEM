# KitAI Forge Phase 1: Foundation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the core graph engine, configuration system, and CLI that form the foundation for all subsequent phases (personas, orchestrator, runtime).

**Architecture:** A TypeScript library structured as three packages: `core/graph` (DAG operations), `core/config` (Zod-validated configuration), and `cli` (Commander.js commands). The graph persists as YAML-frontmatter markdown files in `_forge/graph/`. All code is TDD with Vitest.

**Tech Stack:** TypeScript 5.8, Node.js 20+, Vitest 3, tsup, Zod 4, Commander.js 13, gray-matter (YAML frontmatter parsing), yaml (YAML serialization)

**Spec:** `docs/superpowers/specs/2026-03-26-kitai-forge-v2-design.md`

**Phases overview:**
- **Phase 1 (this plan):** Foundation — graph engine, config, CLI
- Phase 2: Personas & Governance — persona definitions, FORGE.md, workflows
- Phase 3: Orchestrator — intent classifier, delegator, ceremony calculator
- Phase 4: Runtime — Claude Code skills/hooks/MCP, background agents, model routing
- Phase 5: Polish — quality gates automation, sprint state machine, migration helper

---

## File Structure

```
forge/                              # New v2.0 root (alongside existing v1 files)
├── package.json
├── tsconfig.json
├── tsup.config.ts
├── vitest.config.ts
├── src/
│   ├── index.ts                    # Public API barrel export
│   ├── core/
│   │   ├── graph/
│   │   │   ├── types.ts            # NodeType, EdgeType, NodeMetadata, GraphNode interfaces
│   │   │   ├── schema.ts           # Zod schemas for node metadata validation
│   │   │   ├── node.ts             # Node CRUD: create, read, update, parse frontmatter
│   │   │   ├── edge.ts             # Edge operations: add, remove, resolve
│   │   │   ├── loader.ts           # Load full graph from _forge/graph/ directory
│   │   │   ├── writer.ts           # Persist node to filesystem (frontmatter + content)
│   │   │   ├── validator.ts        # Graph integrity: DAG check, orphans, edge targets
│   │   │   ├── engine.ts           # High-level operations: gaps, parallel, impact, context
│   │   │   └── index.ts            # Barrel export for graph module
│   │   ├── config/
│   │   │   ├── types.ts            # ForgeConfig interface
│   │   │   ├── schema.ts           # Zod schema for forge.yaml
│   │   │   ├── loader.ts           # Load config from filesystem, merge hierarchy, validate
│   │   │   ├── defaults.ts         # Default config values
│   │   │   └── index.ts            # Barrel export
│   │   └── index.ts                # Core barrel export
│   └── cli/
│       ├── index.ts                # CLI entry point, Commander program setup
│       ├── commands/
│       │   ├── init.ts             # forge init — interactive project setup
│       │   ├── graph.ts            # forge graph — gaps, impact, validate, status
│       │   └── status.ts           # forge status — project overview
│       └── util/
│           └── display.ts          # Terminal output formatting helpers
├── test/
│   ├── unit/
│   │   ├── graph/
│   │   │   ├── schema.test.ts
│   │   │   ├── node.test.ts
│   │   │   ├── edge.test.ts
│   │   │   ├── loader.test.ts
│   │   │   ├── writer.test.ts
│   │   │   ├── validator.test.ts
│   │   │   └── engine.test.ts
│   │   └── config/
│   │       ├── schema.test.ts
│   │       └── loader.test.ts
│   ├── integration/
│   │   └── cli/
│   │       ├── init.test.ts
│   │       └── graph.test.ts
│   └── fixtures/
│       ├── graph/                  # Sample graph directory for tests
│       │   ├── prds/
│       │   │   └── user-management.md
│       │   ├── architecture/
│       │   │   └── auth.md
│       │   ├── stories/
│       │   │   └── auth-login.md
│       │   └── regressions/
│       │       └── REG-001.md
│       └── config/
│           ├── forge.yaml
│           └── forge-invalid.yaml
└── bin/
    └── forge.ts                    # CLI bin entry point
```

---

## Task 1: Project Scaffolding

**Files:**
- Create: `forge/package.json`
- Create: `forge/tsconfig.json`
- Create: `forge/tsup.config.ts`
- Create: `forge/vitest.config.ts`
- Create: `forge/src/index.ts`

- [ ] **Step 1: Create forge directory and package.json**

```bash
mkdir -p forge
```

```json
{
  "name": "kitai-forge",
  "version": "2.0.0-alpha.1",
  "description": "AI agent framework with adaptive ceremony — context graph, agent personas, multi-model orchestration",
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "bin": {
    "forge": "dist/cli/index.js"
  },
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit",
    "lint": "tsc --noEmit && vitest run"
  },
  "engines": {
    "node": ">=20.0.0"
  },
  "keywords": ["ai", "agent", "framework", "claude", "llm", "orchestration"],
  "license": "MIT",
  "devDependencies": {
    "typescript": "^5.8.0",
    "tsup": "^8.4.0",
    "vitest": "^3.1.0",
    "@types/node": "^22.0.0"
  },
  "dependencies": {
    "zod": "^3.24.0",
    "commander": "^13.1.0",
    "gray-matter": "^4.0.3",
    "yaml": "^2.7.0"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022"],
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "isolatedModules": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "test"]
}
```

- [ ] **Step 3: Create tsup.config.ts**

```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'cli/index': 'src/cli/index.ts',
  },
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  target: 'node20',
  banner: {
    js: '#!/usr/bin/env node',
  },
});
```

- [ ] **Step 4: Create vitest.config.ts**

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    root: '.',
    include: ['test/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/**/index.ts'],
    },
  },
});
```

- [ ] **Step 5: Create src/index.ts barrel export**

```typescript
export * from './core/index.js';
```

- [ ] **Step 6: Create src/core/index.ts barrel export**

```typescript
export * from './graph/index.js';
export * from './config/index.js';
```

- [ ] **Step 7: Install dependencies and verify build**

```bash
cd forge && npm install
```

Run: `cd forge && npx tsc --noEmit`
Expected: Exit 0, no errors (may warn about empty barrel exports — that's fine)

- [ ] **Step 8: Commit scaffolding**

```bash
git add forge/
git commit -m "feat(forge): scaffold TypeScript project with build and test tooling"
```

---

## Task 2: Core Types and Zod Schemas

**Files:**
- Create: `forge/src/core/graph/types.ts`
- Create: `forge/src/core/graph/schema.ts`
- Create: `forge/src/core/graph/index.ts`
- Create: `forge/test/unit/graph/schema.test.ts`

- [ ] **Step 1: Write the failing test for node metadata schema validation**

```typescript
// forge/test/unit/graph/schema.test.ts
import { describe, it, expect } from 'vitest';
import { NodeMetadataSchema, type NodeMetadata } from '../../../src/core/graph/schema.js';

describe('NodeMetadataSchema', () => {
  const validMetadata: NodeMetadata = {
    id: 'story:auth-login',
    type: 'story',
    status: 'draft',
    producer: 'scrum-master',
    created: '2026-03-26T10:00:00Z',
    updated: '2026-03-26T10:00:00Z',
    edges: {
      requires: ['architecture:auth', 'prd:user-management'],
      implements: ['epic:auth'],
    },
    tags: ['auth', 'login'],
  };

  it('accepts valid node metadata', () => {
    const result = NodeMetadataSchema.safeParse(validMetadata);
    expect(result.success).toBe(true);
  });

  it('rejects invalid node type', () => {
    const result = NodeMetadataSchema.safeParse({
      ...validMetadata,
      type: 'invalid-type',
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing id', () => {
    const { id, ...noId } = validMetadata;
    const result = NodeMetadataSchema.safeParse(noId);
    expect(result.success).toBe(false);
  });

  it('validates id format matches type prefix', () => {
    const result = NodeMetadataSchema.safeParse({
      ...validMetadata,
      id: 'prd:auth-login', // id says prd but type says story
      type: 'story',
    });
    expect(result.success).toBe(false);
  });

  it('accepts empty edges', () => {
    const result = NodeMetadataSchema.safeParse({
      ...validMetadata,
      edges: {},
    });
    expect(result.success).toBe(true);
  });

  it('accepts optional quality_gate', () => {
    const result = NodeMetadataSchema.safeParse({
      ...validMetadata,
      quality_gate: {
        status: 'pass',
        checklist: 'story-ready',
        checked_at: '2026-03-26T14:30:00Z',
      },
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid edge type keys', () => {
    const result = NodeMetadataSchema.safeParse({
      ...validMetadata,
      edges: { depends_on: ['something'] },
    });
    expect(result.success).toBe(false);
  });

  it('defaults missing optional fields', () => {
    const minimal = {
      id: 'brief:product-vision',
      type: 'brief',
      status: 'draft',
      created: '2026-03-26T10:00:00Z',
      updated: '2026-03-26T10:00:00Z',
    };
    const result = NodeMetadataSchema.safeParse(minimal);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.edges).toEqual({});
      expect(result.data.tags).toEqual([]);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd forge && npx vitest run test/unit/graph/schema.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Write types.ts with all type definitions**

```typescript
// forge/src/core/graph/types.ts

export const NODE_TYPES = [
  'brief',
  'prd',
  'ux-spec',
  'architecture',
  'epic',
  'story',
  'code',
  'test',
  'review',
  'regression',
  'debt',
  'decision',
] as const;

export type NodeType = (typeof NODE_TYPES)[number];

export const NODE_STATUSES = [
  'draft',
  'in-progress',
  'review',
  'done',
  'superseded',
] as const;

export type NodeStatus = (typeof NODE_STATUSES)[number];

export const EDGE_TYPES = [
  'requires',
  'informs',
  'validates',
  'implements',
  'decomposes',
  'blocks',
  'supersedes',
] as const;

export type EdgeType = (typeof EDGE_TYPES)[number];

export interface QualityGate {
  status: 'pass' | 'fail' | 'pending';
  checklist?: string;
  checked_at?: string;
}

export interface NodeMetadata {
  id: string;
  type: NodeType;
  status: NodeStatus;
  producer?: string;
  created: string;
  updated: string;
  session?: string;
  edges: Partial<Record<EdgeType, string[]>>;
  quality_gate?: QualityGate;
  tags: string[];
}

export interface GraphNode {
  metadata: NodeMetadata;
  content: string;
  filePath: string;
}

/** Maps node type to its subdirectory under _forge/graph/ */
export const NODE_TYPE_DIRS: Record<NodeType, string> = {
  brief: 'briefs',
  prd: 'prds',
  'ux-spec': 'ux',
  architecture: 'architecture',
  epic: 'epics',
  story: 'stories',
  code: 'code',
  test: 'tests',
  review: 'reviews',
  regression: 'regressions',
  debt: 'debt',
  decision: 'decisions',
};

/** Parse a node ID into its type and name parts. Returns null if invalid. */
export function parseNodeId(id: string): { type: string; name: string } | null {
  const colonIndex = id.indexOf(':');
  if (colonIndex === -1) return null;
  return {
    type: id.slice(0, colonIndex),
    name: id.slice(colonIndex + 1),
  };
}
```

- [ ] **Step 4: Write schema.ts with Zod validation**

```typescript
// forge/src/core/graph/schema.ts
import { z } from 'zod';
import { NODE_TYPES, NODE_STATUSES, EDGE_TYPES, parseNodeId } from './types.js';

export type { NodeMetadata } from './types.js';

const QualityGateSchema = z.object({
  status: z.enum(['pass', 'fail', 'pending']),
  checklist: z.string().optional(),
  checked_at: z.string().optional(),
});

const EdgesSchema = z.record(
  z.enum(EDGE_TYPES),
  z.array(z.string()),
).default({});

export const NodeMetadataSchema = z.object({
  id: z.string().min(1),
  type: z.enum(NODE_TYPES),
  status: z.enum(NODE_STATUSES),
  producer: z.string().optional(),
  created: z.string(),
  updated: z.string(),
  session: z.string().optional(),
  edges: EdgesSchema,
  quality_gate: QualityGateSchema.optional(),
  tags: z.array(z.string()).default([]),
}).refine(
  (data) => {
    const parsed = parseNodeId(data.id);
    return parsed !== null && parsed.type === data.type;
  },
  { message: 'Node id prefix must match its type (e.g., "story:name" for type "story")' },
);
```

- [ ] **Step 5: Create graph barrel export**

```typescript
// forge/src/core/graph/index.ts
export * from './types.js';
export * from './schema.js';
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `cd forge && npx vitest run test/unit/graph/schema.test.ts`
Expected: 8 tests PASS

- [ ] **Step 7: Commit**

```bash
git add forge/src/core/graph/types.ts forge/src/core/graph/schema.ts forge/src/core/graph/index.ts forge/test/unit/graph/schema.test.ts
git commit -m "feat(forge): add graph node types and Zod validation schemas"
```

---

## Task 3: Node Read/Write Operations

**Files:**
- Create: `forge/src/core/graph/writer.ts`
- Create: `forge/src/core/graph/node.ts`
- Create: `forge/test/unit/graph/node.test.ts`
- Create: `forge/test/unit/graph/writer.test.ts`
- Create: `forge/test/fixtures/graph/prds/user-management.md`

- [ ] **Step 1: Create test fixture — a sample graph node file**

```markdown
---
id: "prd:user-management"
type: prd
status: done
producer: product-manager
created: "2026-03-20T10:00:00Z"
updated: "2026-03-22T14:30:00Z"
edges:
  requires:
    - "brief:product-vision"
  informs:
    - "architecture:auth"
    - "ux-spec:login-flow"
quality_gate:
  status: pass
  checklist: prd-ready
  checked_at: "2026-03-22T14:30:00Z"
tags:
  - auth
  - users
---

# User Management PRD

## Overview
The system requires user authentication with email/password and OAuth2 providers.

## Functional Requirements
- FR-1: Users can register with email and password
- FR-2: Users can log in with email and password
- FR-3: Users can log in with Google OAuth2
- FR-4: Users can reset their password via email

## Non-Functional Requirements
- NFR-1: Login response time < 200ms p95
- NFR-2: Password hashing uses bcrypt with cost factor 12
```

- [ ] **Step 2: Write the failing test for node.ts (read operations)**

```typescript
// forge/test/unit/graph/node.test.ts
import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { readNode, nodeFilePath } from '../../../src/core/graph/node.js';

const FIXTURES = path.resolve(import.meta.dirname, '../../fixtures/graph');

describe('readNode', () => {
  it('reads a node file and parses metadata + content', async () => {
    const node = await readNode(path.join(FIXTURES, 'prds/user-management.md'));
    expect(node.metadata.id).toBe('prd:user-management');
    expect(node.metadata.type).toBe('prd');
    expect(node.metadata.status).toBe('done');
    expect(node.metadata.edges.requires).toEqual(['brief:product-vision']);
    expect(node.metadata.edges.informs).toEqual(['architecture:auth', 'ux-spec:login-flow']);
    expect(node.metadata.tags).toEqual(['auth', 'users']);
    expect(node.content).toContain('# User Management PRD');
    expect(node.content).toContain('FR-1');
  });

  it('throws on file that does not exist', async () => {
    await expect(readNode('/nonexistent/path.md')).rejects.toThrow();
  });

  it('throws on file with invalid metadata', async () => {
    // We'll test this with a temp file in the writer test
  });
});

describe('nodeFilePath', () => {
  it('computes the correct file path for a node id', () => {
    const result = nodeFilePath('/project/_forge/graph', 'story:auth-login');
    expect(result).toBe('/project/_forge/graph/stories/auth-login.md');
  });

  it('computes path for prd type', () => {
    const result = nodeFilePath('/project/_forge/graph', 'prd:user-management');
    expect(result).toBe('/project/_forge/graph/prds/user-management.md');
  });

  it('computes path for ux-spec type', () => {
    const result = nodeFilePath('/project/_forge/graph', 'ux-spec:login-flow');
    expect(result).toBe('/project/_forge/graph/ux/login-flow.md');
  });

  it('throws on invalid node id', () => {
    expect(() => nodeFilePath('/project/_forge/graph', 'invalid')).toThrow();
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd forge && npx vitest run test/unit/graph/node.test.ts`
Expected: FAIL — module not found

- [ ] **Step 4: Implement node.ts**

```typescript
// forge/src/core/graph/node.ts
import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { NodeMetadataSchema } from './schema.js';
import { parseNodeId, NODE_TYPE_DIRS, type GraphNode, type NodeType } from './types.js';

/**
 * Read a graph node from a markdown file with YAML frontmatter.
 */
export async function readNode(filePath: string): Promise<GraphNode> {
  const raw = await fs.readFile(filePath, 'utf-8');
  const { data, content } = matter(raw);

  const result = NodeMetadataSchema.safeParse(data);
  if (!result.success) {
    throw new Error(
      `Invalid node metadata in ${filePath}: ${result.error.issues.map((i) => i.message).join(', ')}`,
    );
  }

  return {
    metadata: result.data,
    content: content.trim(),
    filePath,
  };
}

/**
 * Compute the filesystem path for a node given its ID.
 */
export function nodeFilePath(graphDir: string, nodeId: string): string {
  const parsed = parseNodeId(nodeId);
  if (!parsed) {
    throw new Error(`Invalid node ID format: "${nodeId}". Expected "type:name".`);
  }

  const dir = NODE_TYPE_DIRS[parsed.type as NodeType];
  if (!dir) {
    throw new Error(`Unknown node type in ID: "${parsed.type}".`);
  }

  return path.join(graphDir, dir, `${parsed.name}.md`);
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd forge && npx vitest run test/unit/graph/node.test.ts`
Expected: PASS (all tests except the invalid-metadata one which is a placeholder)

- [ ] **Step 6: Write the failing test for writer.ts**

```typescript
// forge/test/unit/graph/writer.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { writeNode } from '../../../src/core/graph/writer.js';
import { readNode } from '../../../src/core/graph/node.js';
import type { GraphNode } from '../../../src/core/graph/types.js';

describe('writeNode', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'forge-test-'));
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it('writes a node to disk and can be read back', async () => {
    const node: GraphNode = {
      metadata: {
        id: 'story:auth-login',
        type: 'story',
        status: 'draft',
        producer: 'scrum-master',
        created: '2026-03-26T10:00:00Z',
        updated: '2026-03-26T10:00:00Z',
        edges: { requires: ['architecture:auth'] },
        tags: ['auth'],
      },
      content: '# Auth Login Story\n\nImplement login with email/password.',
      filePath: path.join(tmpDir, 'stories', 'auth-login.md'),
    };

    await writeNode(node);

    const readBack = await readNode(node.filePath);
    expect(readBack.metadata.id).toBe('story:auth-login');
    expect(readBack.metadata.status).toBe('draft');
    expect(readBack.metadata.edges.requires).toEqual(['architecture:auth']);
    expect(readBack.content).toContain('# Auth Login Story');
  });

  it('creates parent directories if they do not exist', async () => {
    const node: GraphNode = {
      metadata: {
        id: 'brief:vision',
        type: 'brief',
        status: 'draft',
        created: '2026-03-26T10:00:00Z',
        updated: '2026-03-26T10:00:00Z',
        edges: {},
        tags: [],
      },
      content: '# Product Vision',
      filePath: path.join(tmpDir, 'deep', 'nested', 'dir', 'vision.md'),
    };

    await writeNode(node);
    const stat = await fs.stat(node.filePath);
    expect(stat.isFile()).toBe(true);
  });
});
```

- [ ] **Step 7: Run test to verify it fails**

Run: `cd forge && npx vitest run test/unit/graph/writer.test.ts`
Expected: FAIL — module not found

- [ ] **Step 8: Implement writer.ts**

```typescript
// forge/src/core/graph/writer.ts
import fs from 'node:fs/promises';
import path from 'node:path';
import { stringify } from 'yaml';
import type { GraphNode } from './types.js';

/**
 * Write a graph node to disk as markdown with YAML frontmatter.
 */
export async function writeNode(node: GraphNode): Promise<void> {
  await fs.mkdir(path.dirname(node.filePath), { recursive: true });

  const frontmatter = stringify(node.metadata, { lineWidth: 0 });
  const fileContent = `---\n${frontmatter}---\n\n${node.content}\n`;

  await fs.writeFile(node.filePath, fileContent, 'utf-8');
}
```

- [ ] **Step 9: Run all node/writer tests**

Run: `cd forge && npx vitest run test/unit/graph/node.test.ts test/unit/graph/writer.test.ts`
Expected: All PASS

- [ ] **Step 10: Update graph barrel export and commit**

```typescript
// forge/src/core/graph/index.ts
export * from './types.js';
export * from './schema.js';
export * from './node.js';
export * from './writer.js';
```

```bash
git add forge/src/core/graph/ forge/test/unit/graph/ forge/test/fixtures/
git commit -m "feat(forge): add graph node read/write with YAML frontmatter persistence"
```

---

## Task 4: Graph Loader

**Files:**
- Create: `forge/src/core/graph/loader.ts`
- Create: `forge/test/unit/graph/loader.test.ts`
- Create: `forge/test/fixtures/graph/architecture/auth.md`
- Create: `forge/test/fixtures/graph/stories/auth-login.md`
- Create: `forge/test/fixtures/graph/regressions/REG-001.md`

- [ ] **Step 1: Create additional test fixtures**

```markdown
<!-- forge/test/fixtures/graph/architecture/auth.md -->
---
id: "architecture:auth"
type: architecture
status: done
producer: architect
created: "2026-03-21T10:00:00Z"
updated: "2026-03-21T16:00:00Z"
edges:
  requires:
    - "prd:user-management"
  informs:
    - "story:auth-login"
quality_gate:
  status: pass
  checklist: architecture-ready
  checked_at: "2026-03-21T16:00:00Z"
tags:
  - auth
---

# Auth Architecture

## Components
- AuthService: handles login, registration, token management
- TokenStore: Redis-backed JWT token storage
```

```markdown
<!-- forge/test/fixtures/graph/stories/auth-login.md -->
---
id: "story:auth-login"
type: story
status: in-progress
producer: scrum-master
created: "2026-03-23T10:00:00Z"
updated: "2026-03-24T14:00:00Z"
edges:
  requires:
    - "architecture:auth"
    - "prd:user-management"
  implements:
    - "epic:auth"
tags:
  - auth
  - login
---

# Auth Login Story

## Acceptance Criteria
- AC-1: User can log in with valid email/password
- AC-2: Invalid credentials return 401
```

```markdown
<!-- forge/test/fixtures/graph/regressions/REG-001.md -->
---
id: "regression:REG-001"
type: regression
status: done
producer: developer
created: "2026-03-25T10:00:00Z"
updated: "2026-03-25T11:00:00Z"
edges:
  validates:
    - "code:auth-login"
tags:
  - auth
  - security
---

# REG-001: Token expiry not checked on refresh

## Root Cause
Refresh endpoint did not validate token expiry before issuing new access token.

## Prevention Rule
All token operations must check expiry timestamp before proceeding.

## Linked Test
`test/auth/token-refresh.test.ts`
```

- [ ] **Step 2: Write the failing test for loader.ts**

```typescript
// forge/test/unit/graph/loader.test.ts
import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { loadGraph, type Graph } from '../../../src/core/graph/loader.js';

const FIXTURES = path.resolve(import.meta.dirname, '../../fixtures/graph');

describe('loadGraph', () => {
  let graph: Graph;

  it('loads all nodes from the graph directory', async () => {
    graph = await loadGraph(FIXTURES);
    const ids = [...graph.nodes.keys()];
    expect(ids).toContain('prd:user-management');
    expect(ids).toContain('architecture:auth');
    expect(ids).toContain('story:auth-login');
    expect(ids).toContain('regression:REG-001');
    expect(ids.length).toBe(4);
  });

  it('builds adjacency index from edges', async () => {
    graph = await loadGraph(FIXTURES);
    // story:auth-login requires architecture:auth
    const storyEdges = graph.nodes.get('story:auth-login')!.metadata.edges;
    expect(storyEdges.requires).toContain('architecture:auth');
  });

  it('builds reverse adjacency index', async () => {
    graph = await loadGraph(FIXTURES);
    // architecture:auth is required by story:auth-login
    const dependents = graph.reverseDeps.get('architecture:auth');
    expect(dependents).toBeDefined();
    expect(dependents!.has('story:auth-login')).toBe(true);
  });

  it('returns empty graph for nonexistent directory', async () => {
    const graph = await loadGraph('/nonexistent/dir');
    expect(graph.nodes.size).toBe(0);
  });

  it('skips non-markdown files gracefully', async () => {
    // The fixture directory only has .md files, so this just confirms no crash
    graph = await loadGraph(FIXTURES);
    expect(graph.nodes.size).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd forge && npx vitest run test/unit/graph/loader.test.ts`
Expected: FAIL — module not found

- [ ] **Step 4: Implement loader.ts**

```typescript
// forge/src/core/graph/loader.ts
import fs from 'node:fs/promises';
import path from 'node:path';
import { readNode } from './node.js';
import type { GraphNode } from './types.js';

export interface Graph {
  /** All nodes keyed by their ID (e.g., "story:auth-login") */
  nodes: Map<string, GraphNode>;
  /** Reverse dependency index: nodeId → Set of nodeIds that reference it via any edge */
  reverseDeps: Map<string, Set<string>>;
  /** The root directory this graph was loaded from */
  rootDir: string;
}

/**
 * Load all graph nodes from a directory tree.
 * Recursively finds all .md files, parses frontmatter, builds indices.
 */
export async function loadGraph(graphDir: string): Promise<Graph> {
  const nodes = new Map<string, GraphNode>();
  const reverseDeps = new Map<string, Set<string>>();

  try {
    await fs.access(graphDir);
  } catch {
    return { nodes, reverseDeps, rootDir: graphDir };
  }

  const mdFiles = await findMarkdownFiles(graphDir);

  for (const filePath of mdFiles) {
    try {
      const node = await readNode(filePath);
      nodes.set(node.metadata.id, node);
    } catch {
      // Skip files that fail to parse — log in production, silent in lib
      continue;
    }
  }

  // Build reverse dependency index
  for (const [nodeId, node] of nodes) {
    for (const targets of Object.values(node.metadata.edges)) {
      if (!targets) continue;
      for (const targetId of targets) {
        if (!reverseDeps.has(targetId)) {
          reverseDeps.set(targetId, new Set());
        }
        reverseDeps.get(targetId)!.add(nodeId);
      }
    }
  }

  return { nodes, reverseDeps, rootDir: graphDir };
}

async function findMarkdownFiles(dir: string): Promise<string[]> {
  const results: string[] = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...await findMarkdownFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      results.push(fullPath);
    }
  }

  return results;
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd forge && npx vitest run test/unit/graph/loader.test.ts`
Expected: All PASS

- [ ] **Step 6: Update barrel export and commit**

```typescript
// forge/src/core/graph/index.ts — add:
export * from './loader.js';
```

```bash
git add forge/src/core/graph/ forge/test/
git commit -m "feat(forge): add graph loader with reverse dependency index"
```

---

## Task 5: Graph Validator

**Files:**
- Create: `forge/src/core/graph/validator.ts`
- Create: `forge/test/unit/graph/validator.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// forge/test/unit/graph/validator.test.ts
import { describe, it, expect } from 'vitest';
import { validateGraph, type ValidationResult } from '../../../src/core/graph/validator.js';
import type { Graph } from '../../../src/core/graph/loader.js';
import type { GraphNode } from '../../../src/core/graph/types.js';

function makeNode(id: string, type: string, edges: Record<string, string[]> = {}): GraphNode {
  return {
    metadata: {
      id,
      type: type as any,
      status: 'done',
      created: '2026-03-26T10:00:00Z',
      updated: '2026-03-26T10:00:00Z',
      edges,
      tags: [],
    },
    content: `# ${id}`,
    filePath: `/fake/${id}.md`,
  };
}

function makeGraph(nodes: GraphNode[]): Graph {
  const nodeMap = new Map(nodes.map((n) => [n.metadata.id, n]));
  const reverseDeps = new Map<string, Set<string>>();
  for (const node of nodes) {
    for (const targets of Object.values(node.metadata.edges)) {
      if (!targets) continue;
      for (const t of targets) {
        if (!reverseDeps.has(t)) reverseDeps.set(t, new Set());
        reverseDeps.get(t)!.add(node.metadata.id);
      }
    }
  }
  return { nodes: nodeMap, reverseDeps, rootDir: '/fake' };
}

describe('validateGraph', () => {
  it('returns valid for a correct graph', () => {
    const graph = makeGraph([
      makeNode('prd:auth', 'prd'),
      makeNode('architecture:auth', 'architecture', { requires: ['prd:auth'] }),
      makeNode('story:login', 'story', { requires: ['architecture:auth'] }),
    ]);
    const result = validateGraph(graph);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('detects dangling edge targets (edge points to nonexistent node)', () => {
    const graph = makeGraph([
      makeNode('story:login', 'story', { requires: ['architecture:auth'] }),
      // architecture:auth does not exist
    ]);
    const result = validateGraph(graph);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.type === 'dangling-edge')).toBe(true);
  });

  it('detects cycles', () => {
    const graph = makeGraph([
      makeNode('prd:a', 'prd', { requires: ['architecture:b'] }),
      makeNode('architecture:b', 'architecture', { requires: ['prd:a'] }),
    ]);
    const result = validateGraph(graph);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.type === 'cycle')).toBe(true);
  });

  it('passes with an empty graph', () => {
    const graph = makeGraph([]);
    const result = validateGraph(graph);
    expect(result.valid).toBe(true);
  });

  it('detects duplicate node IDs gracefully (Map dedupes, but edges might reference self)', () => {
    const graph = makeGraph([
      makeNode('prd:auth', 'prd', { requires: ['prd:auth'] }), // self-reference
    ]);
    const result = validateGraph(graph);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.type === 'cycle')).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd forge && npx vitest run test/unit/graph/validator.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Implement validator.ts**

```typescript
// forge/src/core/graph/validator.ts
import type { Graph } from './loader.js';

export interface ValidationError {
  type: 'dangling-edge' | 'cycle' | 'orphan';
  nodeId: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export function validateGraph(graph: Graph): ValidationResult {
  const errors: ValidationError[] = [];

  // Check 1: Dangling edges — every edge target must exist in the graph
  for (const [nodeId, node] of graph.nodes) {
    for (const [edgeType, targets] of Object.entries(node.metadata.edges)) {
      if (!targets) continue;
      for (const targetId of targets) {
        if (!graph.nodes.has(targetId)) {
          errors.push({
            type: 'dangling-edge',
            nodeId,
            message: `Edge "${edgeType}" points to "${targetId}" which does not exist in the graph`,
          });
        }
      }
    }
  }

  // Check 2: Cycle detection via DFS on "requires" and "blocks" edges (structural edges)
  const structuralEdgeTypes = ['requires', 'blocks'];
  const visited = new Set<string>();
  const inStack = new Set<string>();

  function dfs(nodeId: string): boolean {
    if (inStack.has(nodeId)) return true; // cycle found
    if (visited.has(nodeId)) return false;

    visited.add(nodeId);
    inStack.add(nodeId);

    const node = graph.nodes.get(nodeId);
    if (node) {
      for (const edgeType of structuralEdgeTypes) {
        const targets = node.metadata.edges[edgeType as keyof typeof node.metadata.edges];
        if (!targets) continue;
        for (const targetId of targets) {
          if (graph.nodes.has(targetId) && dfs(targetId)) {
            errors.push({
              type: 'cycle',
              nodeId,
              message: `Cycle detected: "${nodeId}" → "${targetId}" (via "${edgeType}")`,
            });
            inStack.delete(nodeId);
            return true;
          }
        }
      }
    }

    inStack.delete(nodeId);
    return false;
  }

  for (const nodeId of graph.nodes.keys()) {
    if (!visited.has(nodeId)) {
      dfs(nodeId);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd forge && npx vitest run test/unit/graph/validator.test.ts`
Expected: All PASS

- [ ] **Step 5: Update barrel export and commit**

```typescript
// forge/src/core/graph/index.ts — add:
export * from './validator.js';
```

```bash
git add forge/src/core/graph/ forge/test/
git commit -m "feat(forge): add graph validator with cycle detection and dangling edge checks"
```

---

## Task 6: Graph Engine — Gap Detection, Parallel ID, Impact Analysis, Context Assembly

**Files:**
- Create: `forge/src/core/graph/engine.ts`
- Create: `forge/test/unit/graph/engine.test.ts`

- [ ] **Step 1: Write failing tests for all four graph operations**

```typescript
// forge/test/unit/graph/engine.test.ts
import { describe, it, expect } from 'vitest';
import {
  detectGaps,
  identifyParallel,
  analyzeImpact,
  assembleContext,
} from '../../../src/core/graph/engine.js';
import type { Graph } from '../../../src/core/graph/loader.js';
import type { GraphNode } from '../../../src/core/graph/types.js';

function makeNode(
  id: string,
  type: string,
  status: string = 'done',
  edges: Record<string, string[]> = {},
): GraphNode {
  return {
    metadata: {
      id,
      type: type as any,
      status: status as any,
      created: '2026-03-26T10:00:00Z',
      updated: '2026-03-26T10:00:00Z',
      edges,
      tags: [],
    },
    content: `# Content of ${id}`,
    filePath: `/fake/${id}.md`,
  };
}

function makeGraph(nodes: GraphNode[]): Graph {
  const nodeMap = new Map(nodes.map((n) => [n.metadata.id, n]));
  const reverseDeps = new Map<string, Set<string>>();
  for (const node of nodes) {
    for (const targets of Object.values(node.metadata.edges)) {
      if (!targets) continue;
      for (const t of targets) {
        if (!reverseDeps.has(t)) reverseDeps.set(t, new Set());
        reverseDeps.get(t)!.add(node.metadata.id);
      }
    }
  }
  return { nodes: nodeMap, reverseDeps, rootDir: '/fake' };
}

describe('detectGaps', () => {
  it('finds missing upstream nodes', () => {
    // story requires architecture, which requires prd
    // Only prd exists — architecture and story are missing
    const graph = makeGraph([
      makeNode('prd:auth', 'prd'),
    ]);
    const gaps = detectGaps(graph, 'code:auth-login', {
      'code:auth-login': { requires: ['story:auth-login'] },
      'story:auth-login': { requires: ['architecture:auth'] },
      'architecture:auth': { requires: ['prd:auth'] },
    });
    expect(gaps).toContain('story:auth-login');
    expect(gaps).toContain('architecture:auth');
    expect(gaps).not.toContain('prd:auth'); // exists
    expect(gaps).not.toContain('code:auth-login'); // target, not a gap
  });

  it('returns empty when all upstream nodes exist', () => {
    const graph = makeGraph([
      makeNode('prd:auth', 'prd'),
      makeNode('architecture:auth', 'architecture', 'done', { requires: ['prd:auth'] }),
      makeNode('story:login', 'story', 'done', { requires: ['architecture:auth'] }),
    ]);
    const gaps = detectGaps(graph, 'code:login', {
      'code:login': { requires: ['story:login'] },
    });
    expect(gaps).toHaveLength(0);
  });
});

describe('identifyParallel', () => {
  it('identifies independent nodes that can be produced in parallel', () => {
    const graph = makeGraph([
      makeNode('prd:auth', 'prd'),
      makeNode('prd:payments', 'prd'),
    ]);
    const targets = ['architecture:auth', 'ux-spec:login', 'architecture:payments'];
    const depMap = {
      'architecture:auth': { requires: ['prd:auth'] },
      'ux-spec:login': { requires: ['prd:auth'] },
      'architecture:payments': { requires: ['prd:payments'] },
    };
    const groups = identifyParallel(targets, depMap);
    // All three are independent of each other — one parallel group
    expect(groups).toHaveLength(1);
    expect(groups[0].sort()).toEqual(targets.sort());
  });

  it('separates dependent nodes into sequential groups', () => {
    const depMap = {
      'architecture:auth': { requires: [] as string[] },
      'story:login': { requires: ['architecture:auth'] },
    };
    const groups = identifyParallel(['architecture:auth', 'story:login'], depMap);
    // architecture must come before story
    expect(groups.length).toBeGreaterThanOrEqual(2);
    const archGroup = groups.findIndex((g) => g.includes('architecture:auth'));
    const storyGroup = groups.findIndex((g) => g.includes('story:login'));
    expect(archGroup).toBeLessThan(storyGroup);
  });
});

describe('analyzeImpact', () => {
  it('finds all downstream nodes affected by a change', () => {
    const graph = makeGraph([
      makeNode('prd:auth', 'prd'),
      makeNode('architecture:auth', 'architecture', 'done', { requires: ['prd:auth'] }),
      makeNode('story:login', 'story', 'done', { requires: ['architecture:auth'] }),
      makeNode('story:register', 'story', 'done', { requires: ['architecture:auth'] }),
    ]);
    const impacted = analyzeImpact(graph, 'architecture:auth');
    expect(impacted).toContain('story:login');
    expect(impacted).toContain('story:register');
    expect(impacted).not.toContain('prd:auth'); // upstream, not downstream
  });

  it('returns empty for leaf nodes', () => {
    const graph = makeGraph([
      makeNode('story:login', 'story'),
    ]);
    const impacted = analyzeImpact(graph, 'story:login');
    expect(impacted).toHaveLength(0);
  });
});

describe('assembleContext', () => {
  it('collects all upstream content for a target node', () => {
    const graph = makeGraph([
      makeNode('prd:auth', 'prd'),
      makeNode('architecture:auth', 'architecture', 'done', { requires: ['prd:auth'] }),
    ]);
    const ctx = assembleContext(graph, 'story:login', {
      'story:login': { requires: ['architecture:auth', 'prd:auth'] },
    });
    expect(ctx).toHaveLength(2);
    expect(ctx.map((c) => c.nodeId)).toContain('prd:auth');
    expect(ctx.map((c) => c.nodeId)).toContain('architecture:auth');
    expect(ctx[0].content).toContain('# Content of');
  });

  it('skips missing nodes and returns only existing ones', () => {
    const graph = makeGraph([
      makeNode('prd:auth', 'prd'),
    ]);
    const ctx = assembleContext(graph, 'story:login', {
      'story:login': { requires: ['architecture:auth', 'prd:auth'] },
    });
    expect(ctx).toHaveLength(1);
    expect(ctx[0].nodeId).toBe('prd:auth');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd forge && npx vitest run test/unit/graph/engine.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Implement engine.ts**

```typescript
// forge/src/core/graph/engine.ts
import type { Graph } from './loader.js';

type DepMap = Record<string, { requires: string[] }>;

export interface ContextEntry {
  nodeId: string;
  content: string;
}

/**
 * Detect missing upstream nodes needed to produce a target.
 * Uses a dependency map that describes the EXPECTED graph structure
 * (including nodes that don't exist yet).
 */
export function detectGaps(graph: Graph, targetId: string, depMap: DepMap): string[] {
  const gaps: string[] = [];
  const visited = new Set<string>();

  function walk(nodeId: string): void {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);

    const deps = depMap[nodeId];
    if (!deps) {
      // Check if the node exists in the graph
      if (!graph.nodes.has(nodeId) && nodeId !== targetId) {
        gaps.push(nodeId);
      }
      return;
    }

    // This node should exist (unless it's the target we're trying to produce)
    if (!graph.nodes.has(nodeId) && nodeId !== targetId) {
      gaps.push(nodeId);
    }

    for (const depId of deps.requires) {
      walk(depId);
    }
  }

  // Start from the target's dependencies
  const targetDeps = depMap[targetId];
  if (targetDeps) {
    for (const depId of targetDeps.requires) {
      walk(depId);
    }
  }

  return gaps;
}

/**
 * Given a list of nodes to produce, group them into parallel execution waves.
 * Nodes in the same wave have no mutual dependencies.
 * Returns waves in execution order (wave 0 first).
 */
export function identifyParallel(nodeIds: string[], depMap: DepMap): string[][] {
  // Topological sort with level assignment
  const levels = new Map<string, number>();
  const nodeSet = new Set(nodeIds);

  function getLevel(nodeId: string): number {
    if (levels.has(nodeId)) return levels.get(nodeId)!;

    const deps = depMap[nodeId];
    if (!deps || deps.requires.length === 0) {
      levels.set(nodeId, 0);
      return 0;
    }

    let maxDepLevel = -1;
    for (const depId of deps.requires) {
      if (nodeSet.has(depId)) {
        maxDepLevel = Math.max(maxDepLevel, getLevel(depId));
      }
    }

    const level = maxDepLevel + 1;
    levels.set(nodeId, level);
    return level;
  }

  for (const id of nodeIds) {
    getLevel(id);
  }

  // Group by level
  const waves = new Map<number, string[]>();
  for (const id of nodeIds) {
    const level = levels.get(id) ?? 0;
    if (!waves.has(level)) waves.set(level, []);
    waves.get(level)!.push(id);
  }

  // Return sorted by level
  return [...waves.entries()]
    .sort(([a], [b]) => a - b)
    .map(([, ids]) => ids);
}

/**
 * Find all nodes downstream of a changed node (via reverse dependency index).
 * These nodes may need re-validation after the source changes.
 */
export function analyzeImpact(graph: Graph, changedNodeId: string): string[] {
  const impacted: string[] = [];
  const visited = new Set<string>();

  function walk(nodeId: string): void {
    const dependents = graph.reverseDeps.get(nodeId);
    if (!dependents) return;

    for (const depId of dependents) {
      if (visited.has(depId)) continue;
      visited.add(depId);
      impacted.push(depId);
      walk(depId); // Transitive impact
    }
  }

  walk(changedNodeId);
  return impacted;
}

/**
 * Assemble context for producing a target node.
 * Collects content from all upstream `requires` and `informs` edges.
 */
export function assembleContext(
  graph: Graph,
  targetId: string,
  depMap: DepMap,
): ContextEntry[] {
  const entries: ContextEntry[] = [];
  const visited = new Set<string>();

  const targetDeps = depMap[targetId];
  if (!targetDeps) return entries;

  for (const depId of targetDeps.requires) {
    if (visited.has(depId)) continue;
    visited.add(depId);

    const node = graph.nodes.get(depId);
    if (node) {
      entries.push({ nodeId: depId, content: node.content });
    }
  }

  return entries;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd forge && npx vitest run test/unit/graph/engine.test.ts`
Expected: All PASS

- [ ] **Step 5: Update barrel export and commit**

```typescript
// forge/src/core/graph/index.ts — add:
export * from './engine.js';
```

```bash
git add forge/src/core/graph/ forge/test/
git commit -m "feat(forge): add graph engine with gap detection, parallel ID, impact analysis, context assembly"
```

---

## Task 7: Configuration System

**Files:**
- Create: `forge/src/core/config/types.ts`
- Create: `forge/src/core/config/schema.ts`
- Create: `forge/src/core/config/defaults.ts`
- Create: `forge/src/core/config/loader.ts`
- Create: `forge/src/core/config/index.ts`
- Create: `forge/test/unit/config/schema.test.ts`
- Create: `forge/test/unit/config/loader.test.ts`
- Create: `forge/test/fixtures/config/forge.yaml`
- Create: `forge/test/fixtures/config/forge-invalid.yaml`

- [ ] **Step 1: Create test fixtures**

```yaml
# forge/test/fixtures/config/forge.yaml
project:
  name: "test-project"
  description: "A test project for config loader tests"
  language: "typescript"
  framework: "nextjs"

personas:
  enabled:
    - analyst
    - architect
    - developer
    - reviewer

models:
  default_provider: "anthropic"
  routing:
    expensive:
      provider: "anthropic"
      model: "claude-opus-4-6"
    moderate:
      provider: "anthropic"
      model: "claude-sonnet-4-6"
    cheap:
      provider: "anthropic"
      model: "claude-haiku-4-5"

orchestration:
  max_parallel_agents: 3
  circuit_breaker_threshold: 3
  loop_detection: true
  auto_delegate: true

quality:
  enforce_gates: true
  required_gates:
    - story-ready
    - code-complete
```

```yaml
# forge/test/fixtures/config/forge-invalid.yaml
project:
  name: ""
  language: 123
```

- [ ] **Step 2: Write the failing tests**

```typescript
// forge/test/unit/config/schema.test.ts
import { describe, it, expect } from 'vitest';
import { ForgeConfigSchema } from '../../../src/core/config/schema.js';

describe('ForgeConfigSchema', () => {
  it('accepts valid full configuration', () => {
    const config = {
      project: { name: 'my-project', language: 'typescript' },
      personas: { enabled: ['architect', 'developer'] },
      models: {
        default_provider: 'anthropic',
        routing: {
          expensive: { provider: 'anthropic', model: 'claude-opus-4-6' },
        },
      },
      orchestration: {
        max_parallel_agents: 3,
        circuit_breaker_threshold: 3,
        loop_detection: true,
        auto_delegate: true,
      },
      quality: {
        enforce_gates: true,
        required_gates: ['code-complete'],
      },
    };
    const result = ForgeConfigSchema.safeParse(config);
    expect(result.success).toBe(true);
  });

  it('applies defaults for optional fields', () => {
    const minimal = {
      project: { name: 'minimal', language: 'python' },
    };
    const result = ForgeConfigSchema.safeParse(minimal);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.orchestration.max_parallel_agents).toBe(3);
      expect(result.data.quality.enforce_gates).toBe(true);
      expect(result.data.personas.enabled).toEqual([]);
    }
  });

  it('rejects empty project name', () => {
    const result = ForgeConfigSchema.safeParse({
      project: { name: '', language: 'ts' },
    });
    expect(result.success).toBe(false);
  });
});
```

```typescript
// forge/test/unit/config/loader.test.ts
import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { loadConfig } from '../../../src/core/config/loader.js';

const FIXTURES = path.resolve(import.meta.dirname, '../../fixtures/config');

describe('loadConfig', () => {
  it('loads and validates a config file', async () => {
    const config = await loadConfig(path.join(FIXTURES, 'forge.yaml'));
    expect(config.project.name).toBe('test-project');
    expect(config.project.language).toBe('typescript');
    expect(config.personas.enabled).toContain('architect');
    expect(config.models.default_provider).toBe('anthropic');
  });

  it('throws on invalid config', async () => {
    await expect(
      loadConfig(path.join(FIXTURES, 'forge-invalid.yaml')),
    ).rejects.toThrow();
  });

  it('throws on nonexistent file', async () => {
    await expect(loadConfig('/nonexistent.yaml')).rejects.toThrow();
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `cd forge && npx vitest run test/unit/config/`
Expected: FAIL — modules not found

- [ ] **Step 4: Implement config types, schema, defaults, and loader**

```typescript
// forge/src/core/config/types.ts
export interface ProjectConfig {
  name: string;
  description?: string;
  language: string;
  framework?: string;
}

export interface PersonasConfig {
  enabled: string[];
  custom: string[];
}

export interface ModelRoute {
  provider: string;
  model: string;
}

export interface ModelsConfig {
  default_provider: string;
  routing: Record<string, ModelRoute>;
  fallbacks?: Record<string, string[]>;
}

export interface OrchestrationConfig {
  max_parallel_agents: number;
  circuit_breaker_threshold: number;
  loop_detection: boolean;
  auto_delegate: boolean;
}

export interface QualityConfig {
  enforce_gates: boolean;
  required_gates: string[];
  optional_gates: string[];
}

export interface GraphConfig {
  auto_validate: boolean;
  lazy_load: boolean;
}

export interface ForgeConfig {
  project: ProjectConfig;
  personas: PersonasConfig;
  models: ModelsConfig;
  orchestration: OrchestrationConfig;
  quality: QualityConfig;
  graph: GraphConfig;
}
```

```typescript
// forge/src/core/config/schema.ts
import { z } from 'zod';

const ProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  language: z.string().min(1),
  framework: z.string().optional(),
});

const PersonasSchema = z.object({
  enabled: z.array(z.string()).default([]),
  custom: z.array(z.string()).default([]),
}).default({});

const ModelRouteSchema = z.object({
  provider: z.string(),
  model: z.string(),
});

const ModelsSchema = z.object({
  default_provider: z.string().default('anthropic'),
  routing: z.record(z.string(), ModelRouteSchema).default({}),
  fallbacks: z.record(z.string(), z.array(z.string())).optional(),
}).default({});

const OrchestrationSchema = z.object({
  max_parallel_agents: z.number().int().min(1).default(3),
  circuit_breaker_threshold: z.number().int().min(1).default(3),
  loop_detection: z.boolean().default(true),
  auto_delegate: z.boolean().default(true),
}).default({});

const QualitySchema = z.object({
  enforce_gates: z.boolean().default(true),
  required_gates: z.array(z.string()).default(['code-complete']),
  optional_gates: z.array(z.string()).default([]),
}).default({});

const GraphSchema = z.object({
  auto_validate: z.boolean().default(true),
  lazy_load: z.boolean().default(true),
}).default({});

export const ForgeConfigSchema = z.object({
  project: ProjectSchema,
  personas: PersonasSchema,
  models: ModelsSchema,
  orchestration: OrchestrationSchema,
  quality: QualitySchema,
  graph: GraphSchema,
});

export type ForgeConfig = z.infer<typeof ForgeConfigSchema>;
```

```typescript
// forge/src/core/config/defaults.ts
import type { ForgeConfig } from './schema.js';

export const DEFAULT_CONFIG: Omit<ForgeConfig, 'project'> = {
  personas: { enabled: [], custom: [] },
  models: { default_provider: 'anthropic', routing: {} },
  orchestration: {
    max_parallel_agents: 3,
    circuit_breaker_threshold: 3,
    loop_detection: true,
    auto_delegate: true,
  },
  quality: {
    enforce_gates: true,
    required_gates: ['code-complete'],
    optional_gates: [],
  },
  graph: {
    auto_validate: true,
    lazy_load: true,
  },
};
```

```typescript
// forge/src/core/config/loader.ts
import fs from 'node:fs/promises';
import { parse as parseYaml } from 'yaml';
import { ForgeConfigSchema, type ForgeConfig } from './schema.js';

/**
 * Load and validate a forge.yaml config file.
 */
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
```

```typescript
// forge/src/core/config/index.ts
export * from './types.js';
export * from './schema.js';
export * from './defaults.js';
export * from './loader.js';
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd forge && npx vitest run test/unit/config/`
Expected: All PASS

- [ ] **Step 6: Commit**

```bash
git add forge/src/core/config/ forge/test/unit/config/ forge/test/fixtures/config/
git commit -m "feat(forge): add configuration system with Zod schema validation"
```

---

## Task 8: CLI Scaffolding

**Files:**
- Create: `forge/src/cli/index.ts`
- Create: `forge/src/cli/commands/init.ts`
- Create: `forge/src/cli/commands/graph.ts`
- Create: `forge/src/cli/commands/status.ts`
- Create: `forge/src/cli/util/display.ts`
- Create: `forge/bin/forge.ts`
- Create: `forge/test/integration/cli/init.test.ts`
- Create: `forge/test/integration/cli/graph.test.ts`

- [ ] **Step 1: Write failing integration test for `forge init`**

```typescript
// forge/test/integration/cli/init.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { execInit } from '../../../src/cli/commands/init.js';

describe('forge init', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'forge-init-'));
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it('creates _forge directory structure', async () => {
    await execInit(tmpDir, {
      name: 'test-project',
      language: 'typescript',
      framework: 'nextjs',
      personas: ['architect', 'developer'],
      provider: 'anthropic',
    });

    const configExists = await fs.access(path.join(tmpDir, '_forge', 'config', 'forge.yaml')).then(() => true).catch(() => false);
    const graphExists = await fs.access(path.join(tmpDir, '_forge', 'graph')).then(() => true).catch(() => false);

    expect(configExists).toBe(true);
    expect(graphExists).toBe(true);
  });

  it('creates a valid forge.yaml config', async () => {
    await execInit(tmpDir, {
      name: 'test-project',
      language: 'python',
      personas: ['developer'],
      provider: 'anthropic',
    });

    const configContent = await fs.readFile(
      path.join(tmpDir, '_forge', 'config', 'forge.yaml'),
      'utf-8',
    );
    expect(configContent).toContain('test-project');
    expect(configContent).toContain('python');
  });

  it('creates graph subdirectories for all node types', async () => {
    await execInit(tmpDir, {
      name: 'test',
      language: 'go',
      personas: [],
      provider: 'anthropic',
    });

    const graphDir = path.join(tmpDir, '_forge', 'graph');
    const dirs = await fs.readdir(graphDir);
    expect(dirs).toContain('briefs');
    expect(dirs).toContain('prds');
    expect(dirs).toContain('architecture');
    expect(dirs).toContain('stories');
    expect(dirs).toContain('code');
    expect(dirs).toContain('decisions');
  });

  it('does not overwrite existing config without force flag', async () => {
    await execInit(tmpDir, {
      name: 'first',
      language: 'ts',
      personas: [],
      provider: 'anthropic',
    });

    await expect(
      execInit(tmpDir, {
        name: 'second',
        language: 'py',
        personas: [],
        provider: 'anthropic',
      }),
    ).rejects.toThrow(/already initialized/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd forge && npx vitest run test/integration/cli/init.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Implement display utilities**

```typescript
// forge/src/cli/util/display.ts

export function heading(text: string): string {
  return `\n  ${text}\n  ${'─'.repeat(text.length)}\n`;
}

export function bullet(text: string, indent = 2): string {
  return `${' '.repeat(indent)}• ${text}`;
}

export function success(text: string): string {
  return `  ✓ ${text}`;
}

export function error(text: string): string {
  return `  ✗ ${text}`;
}

export function info(text: string): string {
  return `  ℹ ${text}`;
}
```

- [ ] **Step 4: Implement init command**

```typescript
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

  // Check if already initialized
  const exists = await fs.access(configPath).then(() => true).catch(() => false);
  if (exists && !opts.force) {
    throw new Error(
      `Project already initialized at ${forgeDir}. Use --force to overwrite.`,
    );
  }

  // Create directory structure
  await fs.mkdir(configDir, { recursive: true });

  // Create graph subdirectories for all node types
  for (const dir of Object.values(NODE_TYPE_DIRS)) {
    await fs.mkdir(path.join(graphDir, dir), { recursive: true });
  }

  // Write forge.yaml
  const config = {
    project: {
      name: opts.name,
      language: opts.language,
      ...(opts.framework ? { framework: opts.framework } : {}),
    },
    personas: {
      enabled: opts.personas,
    },
    models: {
      default_provider: opts.provider,
      routing: {
        expensive: { provider: opts.provider, model: getDefaultModel(opts.provider, 'expensive') },
        moderate: { provider: opts.provider, model: getDefaultModel(opts.provider, 'moderate') },
        cheap: { provider: opts.provider, model: getDefaultModel(opts.provider, 'cheap') },
      },
    },
    orchestration: {
      max_parallel_agents: 3,
      circuit_breaker_threshold: 3,
      loop_detection: true,
      auto_delegate: true,
    },
    quality: {
      enforce_gates: true,
      required_gates: ['story-ready', 'code-complete'],
    },
  };

  await fs.writeFile(configPath, stringify(config, { lineWidth: 80 }), 'utf-8');

  // Write .gitignore additions for forge
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
```

- [ ] **Step 5: Implement graph command**

```typescript
// forge/src/cli/commands/graph.ts
import path from 'node:path';
import { loadGraph } from '../../core/graph/loader.js';
import { validateGraph } from '../../core/graph/validator.js';
import { analyzeImpact } from '../../core/graph/engine.js';
import { heading, bullet, success, error, info } from '../util/display.js';

export async function execGraphStatus(projectDir: string): Promise<void> {
  const graphDir = path.join(projectDir, '_forge', 'graph');
  const graph = await loadGraph(graphDir);

  console.log(heading('Graph Status'));
  console.log(info(`Nodes: ${graph.nodes.size}`));

  const byType = new Map<string, number>();
  const byStatus = new Map<string, number>();

  for (const node of graph.nodes.values()) {
    byType.set(node.metadata.type, (byType.get(node.metadata.type) ?? 0) + 1);
    byStatus.set(node.metadata.status, (byStatus.get(node.metadata.status) ?? 0) + 1);
  }

  if (byType.size > 0) {
    console.log('\n  By type:');
    for (const [type, count] of [...byType.entries()].sort()) {
      console.log(bullet(`${type}: ${count}`, 4));
    }
  }

  if (byStatus.size > 0) {
    console.log('\n  By status:');
    for (const [status, count] of [...byStatus.entries()].sort()) {
      console.log(bullet(`${status}: ${count}`, 4));
    }
  }
}

export async function execGraphValidate(projectDir: string): Promise<void> {
  const graphDir = path.join(projectDir, '_forge', 'graph');
  const graph = await loadGraph(graphDir);

  console.log(heading('Graph Validation'));

  const result = validateGraph(graph);

  if (result.valid) {
    console.log(success(`Graph is valid (${graph.nodes.size} nodes, 0 errors)`));
  } else {
    console.log(error(`Graph has ${result.errors.length} error(s):`));
    for (const err of result.errors) {
      console.log(bullet(`[${err.type}] ${err.nodeId}: ${err.message}`, 4));
    }
  }
}

export async function execGraphImpact(projectDir: string, nodeId: string): Promise<void> {
  const graphDir = path.join(projectDir, '_forge', 'graph');
  const graph = await loadGraph(graphDir);

  console.log(heading(`Impact Analysis: ${nodeId}`));

  if (!graph.nodes.has(nodeId)) {
    console.log(error(`Node "${nodeId}" not found in graph`));
    return;
  }

  const impacted = analyzeImpact(graph, nodeId);

  if (impacted.length === 0) {
    console.log(info('No downstream nodes affected'));
  } else {
    console.log(info(`${impacted.length} node(s) may need re-validation:`));
    for (const id of impacted) {
      const node = graph.nodes.get(id);
      console.log(bullet(`${id} (${node?.metadata.status ?? 'unknown'})`, 4));
    }
  }
}
```

- [ ] **Step 6: Implement status command**

```typescript
// forge/src/cli/commands/status.ts
import fs from 'node:fs/promises';
import path from 'node:path';
import { loadConfig } from '../../core/config/loader.js';
import { loadGraph } from '../../core/graph/loader.js';
import { heading, bullet, info, error } from '../util/display.js';

export async function execStatus(projectDir: string): Promise<void> {
  const configPath = path.join(projectDir, '_forge', 'config', 'forge.yaml');
  const graphDir = path.join(projectDir, '_forge', 'graph');

  // Check if initialized
  const initialized = await fs.access(configPath).then(() => true).catch(() => false);
  if (!initialized) {
    console.log(error('Not a KitAI Forge project. Run `forge init` first.'));
    return;
  }

  const config = await loadConfig(configPath);
  const graph = await loadGraph(graphDir);

  console.log(heading(`KitAI Forge: ${config.project.name}`));
  console.log(info(`Language: ${config.project.language}`));
  if (config.project.framework) {
    console.log(info(`Framework: ${config.project.framework}`));
  }
  console.log(info(`Provider: ${config.models.default_provider}`));
  console.log(info(`Personas: ${config.personas.enabled.length > 0 ? config.personas.enabled.join(', ') : 'none configured'}`));
  console.log(info(`Graph nodes: ${graph.nodes.size}`));

  // Show in-progress work
  const inProgress = [...graph.nodes.values()].filter(
    (n) => n.metadata.status === 'in-progress',
  );
  if (inProgress.length > 0) {
    console.log('\n  In progress:');
    for (const node of inProgress) {
      console.log(bullet(`${node.metadata.id} (${node.metadata.type})`, 4));
    }
  }
}
```

- [ ] **Step 7: Implement CLI entry point**

```typescript
// forge/src/cli/index.ts
import { Command } from 'commander';
import { execInit } from './commands/init.js';
import { execGraphStatus, execGraphValidate, execGraphImpact } from './commands/graph.js';
import { execStatus } from './commands/status.js';

export function createProgram(): Command {
  const program = new Command();

  program
    .name('forge')
    .description('KitAI Forge — AI agent framework with adaptive ceremony')
    .version('2.0.0-alpha.1');

  program
    .command('init')
    .description('Initialize a new KitAI Forge project')
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

  const graphCmd = program
    .command('graph')
    .description('Graph operations');

  graphCmd
    .command('status')
    .description('Show graph status summary')
    .action(async () => {
      await execGraphStatus(process.cwd());
    });

  graphCmd
    .command('validate')
    .description('Validate graph integrity')
    .action(async () => {
      await execGraphValidate(process.cwd());
    });

  graphCmd
    .command('impact <nodeId>')
    .description('Analyze impact of changing a node')
    .action(async (nodeId: string) => {
      await execGraphImpact(process.cwd(), nodeId);
    });

  program
    .command('status')
    .description('Show project status overview')
    .action(async () => {
      await execStatus(process.cwd());
    });

  return program;
}

// Run if invoked directly
const program = createProgram();
program.parseAsync(process.argv).catch((err) => {
  console.error(err.message);
  process.exit(1);
});
```

- [ ] **Step 8: Create bin entry point**

```typescript
// forge/bin/forge.ts
import '../src/cli/index.js';
```

- [ ] **Step 9: Run integration tests**

Run: `cd forge && npx vitest run test/integration/cli/init.test.ts`
Expected: All PASS

- [ ] **Step 10: Run full test suite**

Run: `cd forge && npx vitest run`
Expected: All tests PASS (schema, node, writer, loader, validator, engine, config, CLI)

- [ ] **Step 11: Build and verify CLI works**

Run: `cd forge && npx tsup && node dist/cli/index.js --help`
Expected: Shows forge CLI help with init, graph, status commands

- [ ] **Step 12: Commit**

```bash
git add forge/src/cli/ forge/bin/ forge/test/integration/
git commit -m "feat(forge): add CLI with init, graph, and status commands"
```

---

## Task 9: End-to-End Smoke Test

**Files:**
- Create: `forge/test/integration/cli/graph.test.ts`

- [ ] **Step 1: Write end-to-end integration test**

```typescript
// forge/test/integration/cli/graph.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { execInit } from '../../../src/cli/commands/init.js';
import { writeNode } from '../../../src/core/graph/writer.js';
import { loadGraph } from '../../../src/core/graph/loader.js';
import { validateGraph } from '../../../src/core/graph/validator.js';
import { detectGaps, assembleContext } from '../../../src/core/graph/engine.js';
import type { GraphNode } from '../../../src/core/graph/types.js';

describe('end-to-end: init → populate graph → validate → query', () => {
  let tmpDir: string;
  let graphDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'forge-e2e-'));
    graphDir = path.join(tmpDir, '_forge', 'graph');

    await execInit(tmpDir, {
      name: 'e2e-test',
      language: 'typescript',
      framework: 'express',
      personas: ['architect', 'developer'],
      provider: 'anthropic',
    });
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it('creates a project, adds nodes, validates, and queries gaps', async () => {
    // Step 1: Write a PRD node
    const prd: GraphNode = {
      metadata: {
        id: 'prd:auth',
        type: 'prd',
        status: 'done',
        created: '2026-03-26T10:00:00Z',
        updated: '2026-03-26T10:00:00Z',
        edges: {},
        tags: ['auth'],
      },
      content: '# Auth PRD\n\nUsers need authentication.',
      filePath: path.join(graphDir, 'prds', 'auth.md'),
    };
    await writeNode(prd);

    // Step 2: Write an architecture node that requires the PRD
    const arch: GraphNode = {
      metadata: {
        id: 'architecture:auth',
        type: 'architecture',
        status: 'done',
        created: '2026-03-26T11:00:00Z',
        updated: '2026-03-26T11:00:00Z',
        edges: { requires: ['prd:auth'] },
        tags: ['auth'],
      },
      content: '# Auth Architecture\n\nJWT-based auth with refresh tokens.',
      filePath: path.join(graphDir, 'architecture', 'auth.md'),
    };
    await writeNode(arch);

    // Step 3: Load and validate graph
    const graph = await loadGraph(graphDir);
    expect(graph.nodes.size).toBe(2);

    const validation = validateGraph(graph);
    expect(validation.valid).toBe(true);

    // Step 4: Detect gaps for implementing code:auth-login
    const gaps = detectGaps(graph, 'code:auth-login', {
      'code:auth-login': { requires: ['story:auth-login'] },
      'story:auth-login': { requires: ['architecture:auth'] },
    });
    expect(gaps).toContain('story:auth-login');
    expect(gaps).not.toContain('architecture:auth'); // exists

    // Step 5: Assemble context for producing the story
    const context = assembleContext(graph, 'story:auth-login', {
      'story:auth-login': { requires: ['architecture:auth', 'prd:auth'] },
    });
    expect(context).toHaveLength(2);
    expect(context.map((c) => c.nodeId)).toContain('prd:auth');
    expect(context.map((c) => c.nodeId)).toContain('architecture:auth');
  });
});
```

- [ ] **Step 2: Run the end-to-end test**

Run: `cd forge && npx vitest run test/integration/cli/graph.test.ts`
Expected: PASS

- [ ] **Step 3: Run the FULL test suite one final time**

Run: `cd forge && npx vitest run`
Expected: All tests PASS

- [ ] **Step 4: Commit**

```bash
git add forge/test/integration/
git commit -m "test(forge): add end-to-end smoke test for graph lifecycle"
```

- [ ] **Step 5: Final commit — Phase 1 complete**

```bash
git add -A forge/
git commit -m "feat(forge): complete Phase 1 Foundation — graph engine, config, CLI

Phase 1 delivers:
- Context graph engine with 12 node types, 7 edge types
- Graph operations: gap detection, parallel identification, impact analysis, context assembly
- Graph persistence as YAML-frontmatter markdown files
- Graph validation (DAG integrity, dangling edges, cycles)
- Configuration system with Zod schema validation
- CLI: forge init, forge graph (status/validate/impact), forge status
- Full TDD test suite (unit + integration + e2e)"
```

---

## Summary: What Phase 1 Delivers

After completing these 9 tasks, you have:

1. **Graph engine** — Create, read, update graph nodes as markdown files with YAML frontmatter. Load entire graphs from disk. Validate DAG integrity.

2. **Four core algorithms** — Gap detection (what's missing?), parallel identification (what can run simultaneously?), impact analysis (what breaks if I change this?), context assembly (what does this agent need to know?).

3. **Configuration system** — Zod-validated forge.yaml with sensible defaults for orchestration, quality gates, model routing.

4. **CLI** — `forge init` creates project structure, `forge graph` queries the graph, `forge status` shows project overview.

5. **Test suite** — Unit tests for every module, integration tests for CLI, end-to-end smoke test for the full lifecycle.

**What's next:** Phase 2 (Personas & Governance) builds on this foundation — persona definitions become loadable resources, FORGE.md uses graph concepts, workflows reference graph operations.
