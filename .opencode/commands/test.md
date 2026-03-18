---
description: Run Jest tests
agent: build
---

Run tests for this repository with awareness that Jest is installed but committed tests/config may be absent.

If arguments are provided, prefer `npx jest --runTestsByPath $ARGUMENTS`.

Otherwise run `npx jest --passWithNoTests`.

If no tests are found, report that clearly instead of treating it as a failure.

When tests do run, summarize failures briefly and call out any component, hook, or utility regressions.
