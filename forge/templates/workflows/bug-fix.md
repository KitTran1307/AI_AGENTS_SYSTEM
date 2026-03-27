# Bug Fix Workflow

Fast-path workflow for fixing bugs with minimal ceremony.

## Step 1: Classify & Check
- Classify as `patch` scope
- Run gap detection — typically 0 gaps for bug fixes
- Check regression nodes for the domain
- Route directly to Developer (no upstream artifacts needed)

## Step 2: Reproduce & Document
- Developer writes a failing test that reproduces the bug
- This test becomes the regression test

## Step 3: Fix & Verify
- Implement the minimal fix to make the test pass
- Verify no other tests broke
- Create a `regression` node documenting the bug and its fix

## Step 4: Optional Review
- For critical paths: route to Reviewer
- For trivial fixes: Developer self-reviews

## Step 5: Close
- Update code node status to done
- Run code-complete quality gate
- Commit with clear message referencing the bug
