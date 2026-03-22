# MODULE_MANIFEST_TEMPLATE — Universal AI Agent System Framework

> This file defines the MODULE_MANIFEST.md standard for every module in the codebase.
> Each module directory contains exactly ONE MODULE_MANIFEST.md.
> Maximum 80 lines per manifest. If you need more, the module is too large — split it.
> The Agent creates and updates these during bootstrap and after every session that touches a module.

---

## WHY MODULE_MANIFEST.md EXISTS

When an AI Agent receives a task touching a module, it should read ONE file and know:
- What the module does (skip reading 6 source files to understand this)
- What its public API is (skip reading every file to find callable functions)
- What patterns are in use (skip discovering async style, error handling, DI pattern)
- What the known constraints are (skip making a mistake already documented)

This file is the difference between a 5-file context load and a 25-file context load.
It is NOT documentation for humans — it is structured context compression for AI Agents.

---

## UNIVERSAL TEMPLATE

```markdown
# MODULE_MANIFEST — <module_path>

## Purpose
<2–3 sentences. What problem does this module solve?>
<What is it NOT responsible for? Where does its authority end?>

## Public API
<Every function/class/endpoint that external modules may call.>
<Include signature + one-line description. Precision matters here.>
  function_name(param: Type, param2: Type) → ReturnType   # description

## Internal Structure
  filename.ext    — one-line description of what lives here
  subdir/         — what this subdirectory contains

## Imports from other modules
  <module_path>   — which types/functions/interfaces are consumed

## Exports to other modules
  <what this module exposes and who consumes it>

## Patterns in use
  - <Pattern name>: <one-line explanation of how it's applied here>

## Known constraints / gotchas
  - <anything that will cause bugs if the next agent doesn't know it>
  - <quirks of the framework/library in use here>
  - <non-obvious business rules embedded in this module>

## Performance characteristics
  - <latency targets, throughput limits, cache TTLs — if relevant>

## Security boundary
  - <what auth/authz this module enforces, if any>
  - <what data it handles (PII? payments? secrets?)>

## Last updated: YYYY-MM-DD
```

---

## EXAMPLES

---

### Example: core/ (foundational shared primitives)

```markdown
# MODULE_MANIFEST — core/

## Purpose
Shared primitives for the entire application. Provides types, errors, config,
logging, and the event bus. Has zero dependencies on other application modules.
All other modules import from core; core never imports from other modules.

## Public API
  loadConfig() → Config                         # Load and validate all env vars at startup
  getLogger(name: string) → Logger              # Structured logger factory
  EventBus.emit(event: DomainEvent) → void      # Publish domain event to all subscribers
  EventBus.subscribe(type, handler) → void      # Register handler for event type

## Internal Structure
  config.ts      — Config type, loadConfig(), env validation
  errors.ts      — AppError hierarchy (ValidationError, NotFoundError, ExternalError, ...)
  logger.ts      — Logger setup, structured JSON format
  events.ts      — EventBus class, all DomainEvent type definitions
  types/
    common.ts    — Shared primitives: ID types, Pagination, SortOrder
    domain.ts    — Core domain types (project-specific)

## Imports from other modules
  (none)

## Exports to other modules
  Used by: all modules

## Patterns in use
  - All domain types are immutable after construction (readonly / frozen)
  - All config loaded once at startup; passed via DI; never re-read at runtime
  - EventBus is a singleton; never instantiate a new one — import the module-level instance
  - Config validation throws AppError at startup if any required var is missing

## Known constraints / gotchas
  - EventBus is a singleton — do not instantiate; import the singleton
  - Config is validated at startup; missing vars crash early — this is intentional
  - Never add domain-specific logic to core types; they must be domain-agnostic
  - Circular: if you need core to know about another module, you have a design problem

## Last updated: YYYY-MM-DD
```

---

### Example: api/ (HTTP API layer)

```markdown
# MODULE_MANIFEST — api/

## Purpose
HTTP API layer. Handles request parsing, authentication, authorization, input validation,
and response serialization. Contains zero business logic — all logic lives in services/.
Controllers call services; services do not know about HTTP.

## Public API
  [External callers are HTTP clients — see OpenAPI spec at /docs]
  Internal:
  createRouter() → Router          # Compose all route handlers
  authMiddleware() → Middleware    # JWT validation + user context injection
  errorMiddleware() → Middleware   # Global error → HTTP response mapping

## Internal Structure
  routes/          — Route definitions grouped by domain
  controllers/     — One controller per domain; thin wrappers around service calls
  middleware/      — auth, rate-limit, cors, error, request-id
  validators/      — Input schema validation (zod/joi/pydantic schemas)
  serializers/     — Domain types → API response shapes

## Imports from other modules
  services/        — All business logic lives here; controllers call services
  core/errors      — Maps to HTTP status codes in error middleware
  core/logger      — Request logging with request_id injection

## Exports to other modules
  (none — this is a leaf module; nothing imports from api/)

## Patterns in use
  - Controllers are thin: parse input → call service → serialize output
  - Validation at controller boundary — services receive clean typed inputs
  - Auth middleware injects user context into request; controllers read context
  - All errors thrown as AppError subclasses; error middleware maps to HTTP status

## Known constraints / gotchas
  - Never add business logic to controllers — only validation and delegation
  - Rate limiting configured per-route in routes/ — check before adding new endpoints
  - Request IDs generated in middleware; always present in logs; returned in response header
  - File uploads limited to [X]MB — configured in middleware/upload.ts

## Security boundary
  - JWT validated in authMiddleware — all protected routes MUST use this middleware
  - Input validated via schemas before reaching any controller logic
  - Never log request bodies (may contain PII or secrets)

## Last updated: YYYY-MM-DD
```

---

### Example: services/ (business logic layer)

```markdown
# MODULE_MANIFEST — services/

## Purpose
Business logic for the entire application. Services orchestrate domain rules,
enforce invariants, and coordinate between the data layer and external services.
Services do NOT know about HTTP, queues, or UI — they receive and return domain types.

## Public API
  UserService.createUser(data: CreateUserInput) → User
  UserService.getUserById(id: UserId) → User | null
  UserService.updateUser(id: UserId, data: UpdateUserInput) → User
  [AGENT: complete this list by scanning the service files]

## Internal Structure
  user.service.ts       — User lifecycle: create, update, deactivate, auth
  [AGENT: list all service files]

## Imports from other modules
  repositories/    — Data persistence
  core/events      — Domain events emitted on state changes
  core/errors      — Domain error types
  adapters/        — External API calls (email, payments, etc.)

## Exports to other modules
  api/controllers/ — HTTP layer calls services
  workers/         — Background jobs call services

## Patterns in use
  - Services are stateless; no instance variables holding mutable state
  - Transactions managed in services, not in repositories
  - Domain events emitted after successful state changes, not before
  - Never return ORM entities directly — map to domain types before returning

## Known constraints / gotchas
  - Transactions: if an operation spans multiple repositories, wrap in a transaction
  - Event emission is async — errors in handlers do NOT roll back the triggering operation
  - Services do not handle HTTP errors — they throw domain errors; the API layer maps them

## Last updated: YYYY-MM-DD
```

---

### Example: adapters/ (external service integrations)

```markdown
# MODULE_MANIFEST — adapters/

## Purpose
Adapter layer isolating all third-party API integrations. Every external HTTP call,
webhook, or SDK call lives here. Nothing outside this module imports third-party SDKs.
All adapters normalize external responses to internal domain types before returning.

## Public API
  EmailAdapter.sendTransactional(to: Email, template: TemplateId, vars: Record) → void
  PaymentAdapter.createPaymentIntent(amount: Money, currency: Currency) → PaymentIntent
  [AGENT: complete this list]

## Internal Structure
  email/            — Transactional email adapter (SendGrid / SES / Postmark)
  payments/         — Payment processing adapter (Stripe / Braintree)
  [AGENT: list all adapters]

## Patterns in use
  - Adapter constructor receives config; never reads config directly
  - All external responses normalized to domain types before exit
  - All adapters have a mock/stub implementation for test environments
  - Retry logic with exponential backoff + jitter for all external calls
  - Circuit breaker pattern for services with instability history

## Known constraints / gotchas
  - Never leak SDK types (e.g., Stripe.PaymentIntent) outside this module
  - Webhook payloads must be verified (signature validation) before processing
  - Rate limits tracked per adapter — see rate_limiter.ts in each adapter dir
  - Timeouts configured per adapter — default 10s; payment: 30s

## Security boundary
  - API keys/secrets loaded from config; never re-read per request
  - Webhook signatures validated before any processing
  - External response data sanitized before logging (mask card numbers, tokens)

## Last updated: YYYY-MM-DD
```

---

### Example: workers/ (background job processing)

```markdown
# MODULE_MANIFEST — workers/

## Purpose
Background job processing: scheduled tasks, queue consumers, async workflows.
Workers use the same service layer as the API — they are alternate entry points,
not a separate application logic layer.

## Public API
  [Workers are triggered by scheduler or queue — no direct call API]
  registerWorkers(scheduler: Scheduler) → void   # Called at app startup

## Internal Structure
  jobs/               — Individual job implementations
  scheduler.ts        — Job registration and schedule configuration
  queue-consumer.ts   — Message queue consumer setup

## Patterns in use
  - Every job is idempotent — safe to run multiple times on same input
  - Jobs call services — no business logic in job handlers
  - Failed jobs: retry with exponential backoff, dead-letter after N attempts
  - Job concurrency limits configured per job type in scheduler.ts

## Known constraints / gotchas
  - Idempotency is required — jobs may execute more than once (at-least-once delivery)
  - Long-running jobs must checkpoint progress — do not assume they won't be interrupted
  - Job execution logs must include job_id for correlation

## Last updated: YYYY-MM-DD
```

---

## MANIFEST WRITING RULES

1. **Maximum 80 lines.** If you need more, the module is too large — split it.
2. **Write for a future AI Agent, not a human developer.** Include the non-obvious.
3. **Public API must be exhaustive.** If a function is callable from outside the module, list it.
4. **Known constraints are the most valuable section.** Document what caused bugs.
5. **Update after every session.** A stale manifest is worse than no manifest (it misleads).
6. **No prose paragraphs.** Use the structured format. Bullet points and code blocks only.
7. **One manifest per module.** If a directory has subdirectories that are logically distinct modules, each gets its own manifest.

---

## MANIFEST STALENESS DETECTION

An Agent reading a manifest should flag it as potentially stale if:
- `Last updated` is more than 30 days ago AND the module was modified recently (check CHANGELOG.md)
- The Public API section lists functions that no longer exist in the source files
- The Internal Structure lists files that don't exist in the directory

If staleness is detected: update the manifest as part of the current session before coding.
