---
name: do-work
description: "Execute a unit of work end-to-end: plan, implement, validate with typecheck and tests, then commit. Use when user wants to do work, build a feature, fix a bug, or implement a phase from a plan."
disable-model-invocation: true
---

# Do Work

Execute a complete unit of work: plan it, build it, validate it, commit it.

## Workflow

### 1. Understand the task

Read any referenced plan or PRD. Explore the codebase to understand the relevant files, patterns, and conventions. If the task is ambiguous, ask the user to clarify scope before proceeding.

#### Reading a GitHub issue

Use `gh api --jq`, not `gh issue view` — long bodies get truncated.

```bash
gh api repos/OWNER/REPO/issues/N --jq '.body' > /tmp/issue-N.md
```

If the text ends in `... (truncated)`, page it in slices:

```bash
gh api repos/OWNER/REPO/issues/N --jq '.body[1200:2400]'
```

Read linked `## Parent` / `## Blocked by` issues the same way.

### 2. Plan the implementation (optional)

If the task has not already been planned, create a plan for it.

### 3. Implement

Work through the plan step by step. Make sure to follow [coding standards](../coding-standards/SKILL.md)

### 4. Validate

Run the feedback loops and fix any issues. Repeat until both pass cleanly.

```
pnpm run typecheck
pnpm run test
```

### 5. Commit

Once typecheck and tests pass, pause to let the user review, then commit the work.
Never add a `Co-Authored-By: Claude` line (or any co-authorship line) to commit messages

### 6. The Issue

If the task is complete, and was coming from a github issue, hand it off for QA:

1. Remove the `ready-for-agent` label (if present) and add the `ready-for-qa` label
2. Leave a QA checklist comment so a human (or a later QA pass) can verify the
   work before closing. The checklist must be:
   - Specific to what this issue changed, not generic boilerplate.
   - Written as GitHub task-list items (`- [ ] ...`) so they can be ticked off.
   - Framed as observable outcomes ("Creating a séance shows the new duration
     field"), not implementation notes.
   - Include how to exercise each item (route, action, expected result) and any
     edge cases or regressions worth spot-checking.

   Use this shape:

   ```
   ## QA checklist

   How to verify before closing:

   - [ ] <observable behavior> — <how to trigger> → <expected result>
   - [ ] <edge case to spot-check>
   - [ ] No regression in <adjacent area touched>
   ```

If the task is NOT complete, keep the `ready-for-agent` label and leave a
comment on the GitHub issue describing what was done and what remains.
