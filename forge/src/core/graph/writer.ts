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
