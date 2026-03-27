# Feature Lifecycle Workflow

Standard workflow for building a new feature from brief to code.

## Step 1: Intent Classification & Gap Detection
- Orchestrator classifies user intent into TaskProfile
- Run graph gap detection for target nodes
- If no gaps: skip to Step 4 (implementation)
- Present plan with ceremony level; wait for user approval

## Step 2: Produce Upstream Artifacts (Parallel Where Possible)
- Identify independent missing nodes
- Delegate each to appropriate persona
- Wait for all to complete; check quality gates
- If any gate fails: surface to user, do not proceed

## Step 3: Create Implementation Stories
- Scrum Master assembles context from graph
- Produces story nodes with tasks and acceptance criteria
- Runs story-ready quality gate on each story
- User reviews stories before development begins

## Step 4: Implementation
- Developer receives context package from graph
- TDD: write failing test → implement → pass → refactor
- Run code-complete quality gate

## Step 5: Review & Close
- Reviewer runs code-review checklist
- If pass: update all node statuses to done
- If fail: return to Developer with specific findings

## Halt Points (User Must Approve Before Proceeding)
- After Step 1: User approves ceremony plan
- After Step 3: User reviews stories before development
- After Step 5: User approves merge
