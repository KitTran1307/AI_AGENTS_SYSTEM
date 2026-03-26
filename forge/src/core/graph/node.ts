import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { parse as parseYaml } from 'yaml';
import { NodeMetadataSchema } from './schema.js';
import { parseNodeId, NODE_TYPE_DIRS, type GraphNode, type NodeType } from './types.js';

/**
 * Read a graph node from a markdown file with YAML frontmatter.
 *
 * Uses `yaml` as the gray-matter engine to prevent auto-casting of ISO date
 * strings to Date objects (the default js-yaml behaviour in gray-matter).
 */
export async function readNode(filePath: string): Promise<GraphNode> {
  const raw = await fs.readFile(filePath, 'utf-8');
  const { data, content } = matter(raw, {
    engines: { yaml: (str: string) => parseYaml(str) },
  });

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
