# Hook: post-edit

Fires after a file is edited in a Forge project.

## Actions

1. **Detect Forge project**: Check if `_forge/config/forge.yaml` exists. If not, skip.

2. **Find graph references**: Check if the edited file is referenced by any `code` or `story` node.

3. **Check regression nodes**: For any domain keywords in the file path (auth, payment, user, etc.),
   check if there are open `regression` nodes for that domain.

4. **Inject regression warnings** (if relevant regressions found):
   ```
   Regression warning for domain 'auth':
   * REG-003: Token expiry not validated on refresh endpoint
   * REG-007: Rate limiting bypass via header manipulation
   Check _forge/graph/regressions/ for full details.
   ```

5. **Flag stale context** (if story context is outdated):
   - If the edited file's `code` node has upstream nodes newer than the story it implements
   - Warn: "story:auth-login may have stale context — architecture:auth was updated after story creation"
