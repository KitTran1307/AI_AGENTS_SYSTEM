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
