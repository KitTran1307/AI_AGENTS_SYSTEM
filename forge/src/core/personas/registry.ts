import fs from 'node:fs/promises';
import path from 'node:path';
import { loadPersona } from './loader.js';
import type { PersonaDefinition } from './types.js';
import type { NodeType } from '../graph/types.js';

export class PersonaRegistry {
  private personas: Map<string, PersonaDefinition>;

  private constructor(personas: Map<string, PersonaDefinition>) {
    this.personas = personas;
  }

  /**
   * Load all personas from a directory. Each subdirectory should contain
   * manifest.yaml + PERSONA.md.
   */
  static async fromDirectory(dir: string): Promise<PersonaRegistry> {
    const personas = new Map<string, PersonaDefinition>();

    let entries: Awaited<ReturnType<typeof fs.readdir>>;
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return new PersonaRegistry(personas);
    }

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const personaDir = path.join(dir, entry.name);
      try {
        const persona = await loadPersona(personaDir);
        personas.set(persona.manifest.name, persona);
      } catch {
        // Skip directories that don't have valid persona definitions
        continue;
      }
    }

    return new PersonaRegistry(personas);
  }

  /** Number of loaded personas. */
  get size(): number {
    return this.personas.size;
  }

  /** Get a persona by name. */
  get(name: string): PersonaDefinition | undefined {
    return this.personas.get(name);
  }

  /** List all persona names. */
  names(): string[] {
    return [...this.personas.keys()];
  }

  /** Find all personas that produce a given node type. */
  findProducers(nodeType: NodeType): PersonaDefinition[] {
    return [...this.personas.values()].filter((p) =>
      p.manifest.produces.includes(nodeType),
    );
  }

  /** Find personas whose delegation triggers match the input text. */
  matchTrigger(text: string): PersonaDefinition[] {
    const lower = text.toLowerCase();
    return [...this.personas.values()]
      .filter((p) => {
        // Check if any trigger phrase appears in the input
        const triggered = p.manifest.delegation_triggers.some((trigger) =>
          lower.includes(trigger.toLowerCase()),
        );
        // Check no avoid_when phrase matches
        const avoided = p.manifest.avoid_when.some((avoid) =>
          lower.includes(avoid.toLowerCase()),
        );
        return triggered && !avoided;
      })
      .sort((a, b) => {
        // Prefer more specific matches (longer trigger match)
        const aMax = Math.max(
          ...a.manifest.delegation_triggers
            .filter((t) => lower.includes(t.toLowerCase()))
            .map((t) => t.length),
          0,
        );
        const bMax = Math.max(
          ...b.manifest.delegation_triggers
            .filter((t) => lower.includes(t.toLowerCase()))
            .map((t) => t.length),
          0,
        );
        return bMax - aMax;
      });
  }

  /** Get all loaded persona definitions. */
  all(): PersonaDefinition[] {
    return [...this.personas.values()];
  }
}
