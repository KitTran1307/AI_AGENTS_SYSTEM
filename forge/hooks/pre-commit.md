# Hook: pre-commit

Fires before every git commit in a Forge project.

## Actions

1. **Detect Forge project**: Check if `_forge/config/forge.yaml` exists. If not, pass through.

2. **Check quality gate config**: Read `quality.enforce_gates` from forge.yaml.
   - If `enforce_gates: false`, pass through with a warning.

3. **Find affected nodes**: For each staged file, check if any `code` or `test` graph nodes reference it.

4. **Validate code-complete gate**: For any affected nodes with `status: done`, verify:
   - `quality_gate.status: pass` (not `fail` or `pending`)

5. **Block or warn**:
   - If enforce_gates is true and gate fails: block commit, show what failed
   - If enforce_gates is false: warn but allow

## Output on failure
```
KitAI Forge pre-commit gate FAILED

code:auth-login — quality_gate: pending (not yet evaluated)
Run: /forge:reviewer to complete the review before committing.
```
