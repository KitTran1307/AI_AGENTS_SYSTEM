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
