---
description: Run repo lint checks
agent: build
---

Run the main lint checks for this React + TypeScript component library.

Start with `npx eslint src .storybook scripts --ext .ts,.tsx,.js,.jsx`.

If relevant to the touched files, also run `npx prettier . --check`, or limit formatting checks to the affected files when that is more practical.

Summarize issues briefly, emphasizing hook rules, import order, JSDoc quality for public APIs, and Storybook-related lint errors.
