# OpenCode Commands

This directory stores project-specific OpenCode slash commands for the `@tiny-codes/react-easy` workflow.

## When To Use Each Command

- `/build`

  - Use after source changes under `src/` when you want the full library build.
  - Best for verifying publishable outputs in `lib/` and `es/`.

- `/build-core`

  - Use when you only want the Father build step.
  - Best for quick iteration when you do not need the extra sourcemap correction summary yet.

- `/storybook`

  - Use when developing or previewing components locally.
  - Best for visual verification of component behavior, props, and docs.

- `/build-storybook`

  - Use after changing stories, docs, or public component props.
  - Best for checking whether static Storybook docs still build correctly.

- `/typecheck`

  - Use after touching exported types, generics, hooks, or component props.
  - Best for catching strict TypeScript regressions early.

- `/lint`

  - Use after most code edits, especially public API and Storybook changes.
  - Best for validating ESLint rules, import order, and formatting expectations.

- `/format`

  - Use when you want OpenCode to apply the repo's Prettier style.
  - Best after patching several files or before committing.

- `/test`

  - Use when Jest tests exist or when you want OpenCode to confirm whether tests are currently present.
  - Best for repo-wide or file-targeted Jest execution.

- `/test-name`

  - Use when you want to run one Jest file or a specific test case.
  - Best for focused debugging and faster feedback loops.

- `/verify`
  - Use as the default final validation command after meaningful changes.
  - Best when you want one concise verification pass covering typecheck, lint, and the most relevant build step.

## Suggested Workflow

1. During implementation, use `/storybook`, `/typecheck`, or `/test-name` for quick feedback.
2. Before wrapping up, use `/lint` and `/format` if needed.
3. Finish with `/verify` for a compact final check.
4. If the change affects packaged output, also run `/build`.
5. If the change affects stories or docs, also run `/build-storybook`.

## Repo Notes

- Source of truth is `src/`.
- `lib/` and `es/` are generated artifacts.
- Storybook is the main local playground for components.
- Jest is installed, but committed tests/config may be absent in some states of the repo.
