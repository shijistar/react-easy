---
description: Run library verification suite
agent: build
---

Run a practical verification pass for this React component library after changes.

Unless the user asked for something narrower, run `npx tsc -p tsconfig.json --noEmit`, `npx eslint src .storybook scripts --ext .ts,.tsx,.js,.jsx`, and then choose the most relevant final check: `npm run build` for source/library changes or `npm run build-storybook` for docs/story changes.

Summarize failures in execution order and keep the report concise.
