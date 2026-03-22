# FEATURE_INDEX — [PROJECT NAME]

> **Navigation index for AI Agents.** Given a task, search this file first.
> Every implemented feature in the codebase has an entry here.
> Format: `domain::module::feature_name` — searchable by keyword.
> Never delete entries. Mark obsolete features `[deprecated]` and link to replacement.
>
> **On bootstrap**: The Agent scans the codebase and populates all entries.
> **During development**: Every session that touches a feature updates its entry.
> Last updated: [AGENT: INSERT DATE]

---

## HOW TO USE THIS FILE

```
1. Parse your task into a Feature Address: <domain>::<module>::<feature>
2. Ctrl+F / grep for the domain, module, or keyword
3. The entry tells you exactly which files to open — nothing more
4. No entry found → feature is new → create the entry as part of your work
5. Entry is [deprecated] → read the "replaced by" link before doing anything
```

---

## HOW TO WRITE AN ENTRY

```markdown
## domain::module::feature_name

**Status**: active | deprecated | in-progress
**Owner module**: path/to/module/
**Primary files**:
  - path/to/file.ext    # one-line description of what lives here
**Interface files** (read, do not modify unless changing the contract):
  - path/to/interface   # what interface this exposes/consumes
**Test files**:
  - path/to/test.ext    # what is being tested
**Also read if modifying**:
  - path/to/related     # why you need to read this too
**Depends on features**:
  - domain::module::feature   # this feature calls into that one
**Depended on by features**:
  - domain::module::feature   # those features call into this one
**Last modified**: YYYY-MM-DD
**Change summary**: one-line description of last change
```

---

## ENTRY TEMPLATE (copy this for new features)

```markdown
## domain::module::feature_name

**Status**: active
**Owner module**: 
**Primary files**:
  - 
**Interface files**:
  - 
**Test files**:
  - 
**Also read if modifying**:
  - 
**Depends on features**:
  - 
**Depended on by features**:
  - 
**Last modified**: YYYY-MM-DD
**Change summary**: Initial implementation
```

---

<!-- ============================================================ -->
<!-- AGENT: On bootstrap, delete everything below this line       -->
<!-- and replace with actual entries scanned from the codebase.   -->
<!-- Use the format above. One entry per discoverable feature.    -->
<!-- Group entries by domain (alphabetical within each domain).   -->
<!-- ============================================================ -->

---

## [BOOTSTRAP MARKER — AGENT: SCAN AND FILL BELOW THIS LINE]

<!--
AGENT INSTRUCTIONS FOR BOOTSTRAP SCAN:

1. Walk the entire directory tree
2. For each module/package directory, create one or more Feature Address entries
3. Group by domain (the top-level architectural concern)
4. For each feature entry:
   - Primary files: the files that implement this feature
   - Interface files: the contracts this feature exposes or consumes
   - Test files: tests that cover this feature
   - Dependency links: trace both directions (calls and is-called-by)
5. Sort entries alphabetically within each domain group
6. Add a domain header comment above each group:
   ## [DOMAIN: auth] ─────────────────────────────────────────────────
7. Start with the most foundational modules (no dependencies) first

SCAN STRATEGY:
  - Entry points: main.*, index.*, app.*, server.*
  - Route definitions: routes.*, router.*, controllers/*
  - Service layer: services/*, lib/*, domain/*
  - Data layer: models/*, repositories/*, db/*
  - External adapters: adapters/*, clients/*, integrations/*
  - Infrastructure: infra/*, docker/*, terraform/*
  - Config: config.*, settings.*, env.*
  - Shared utilities: utils/*, helpers/*, common/*
  - Tests: tests/*, __tests__/*, spec/*
-->

---

## DEPRECATION LOG

<!--
When a feature is deprecated, move its entry here and add:
**Deprecated**: YYYY-MM-DD
**Reason**: [why]
**Replaced by**: domain::module::new_feature_name
Keep all deprecated entries permanently for audit trail.
-->
