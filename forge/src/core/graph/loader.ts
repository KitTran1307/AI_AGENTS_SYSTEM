import fs from 'node:fs/promises';
import path from 'node:path';
import { readNode } from './node.js';
import type { GraphNode } from './types.js';

export interface Graph {
  /** All nodes keyed by their ID (e.g., "story:auth-login") */
  nodes: Map<string, GraphNode>;
  /** Reverse dependency index: nodeId -> Set of nodeIds that reference it via any edge */
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
      results.push(...(await findMarkdownFiles(fullPath)));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      results.push(fullPath);
    }
  }

  return results;
}
