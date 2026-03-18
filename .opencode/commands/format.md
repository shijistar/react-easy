---
description: Format changed files
agent: build
---

Format this repository using the existing Prettier setup from `@tiny-codes/code-style-all-in-one`.

Prefer formatting only the changed files when arguments are provided; otherwise use `npx prettier . --write`.

Preserve import sorting and existing public API JSDoc structure.
