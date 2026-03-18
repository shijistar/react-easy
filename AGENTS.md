# AGENTS.md

## Purpose

- This repository is `@tiny-codes/react-easy`, a TypeScript React component/hooks library built on top of Ant Design.
- Source of truth is `src/`.
- Build outputs are `lib/` (CommonJS) and `es/` (ESM); treat both as generated artifacts.
- Storybook lives in `.storybook/` and is the main local playground/documentation surface.
- There are currently no repo-local Cursor rules in `.cursor/rules/`, no `.cursorrules`, and no Copilot rules in `.github/copilot-instructions.md`.

## Repository Layout

- `src/components/` - exported React UI components.
- `src/hooks/` - exported hooks and hook utilities.
- `src/utils/` - exported utility modules.
- `src/locales/` - i18n resources used by components/stories.
- `.storybook/` - stories, docs configuration, and preview wiring.
- `scripts/` - small maintenance scripts such as sourcemap fixes.
- `.fatherrc.ts` - library build configuration.
- `package.json` - canonical script list.

## Install And Tooling

- Package manager: `npm` is the only one explicitly committed (`package-lock.json` exists).
- Install dependencies with `npm install`.
- Node tooling is standard CLI-based; prefer `npx <tool>` when no npm script exists.
- Husky is enabled via `npm run prepare`.
- `lint-staged` config is delegated to `@tiny-codes/code-style-all-in-one`.

## Build Commands

- Full library build: `npm run build`
- Core build only: `npm run build-core`
- Fix generated asset sourcemaps after build: `npm run correct-sourcemap`
- Storybook dev server: `npm run storybook`
- Static Storybook build: `npm run build-storybook`
- Publish-time build hook: `npm run prepublishOnly`

## Lint / Format Commands

- There is no dedicated `lint` script in `package.json`; use the underlying tools directly.
- ESLint all source-like files:
  - `npx eslint src .storybook scripts --ext .ts,.tsx,.js,.jsx`
- ESLint one file:
  - `npx eslint src/components/Loading/index.tsx`
- Prettier check repo:
  - `npx prettier . --check`
- Prettier write repo:
  - `npx prettier . --write`
- Prettier one file:
  - `npx prettier src/hooks/useLocalStorage.ts --write`
- Stylelint config exists, but there is no repo script and styles are mostly TS/CSS-in-JS. Only run if you add stylelint-covered files or a script:
  - `npx stylelint "**/*.{css,less,scss}"`

## Test Commands

- There is no `test` script in `package.json`.
- Jest is installed as a dependency, but no committed Jest config or test files were found in the repo snapshot.
- Before adding tests, verify whether you should create a Jest config or use Father/Umi defaults.
- If you add or discover Jest tests, the expected invocation is:
  - All tests: `npx jest --passWithNoTests`
  - Watch mode: `npx jest --watch`
  - Single test file: `npx jest path/to/file.test.ts --runTestsByPath`
  - Single test by name: `npx jest --runTestsByPath path/to/file.test.ts -t "case name"`
- Useful discovery command for agents:
  - `npx jest --listTests`
- Because no tests are currently committed, do not claim test coverage unless you actually added and ran tests.

## Type Checking

- There is no dedicated `typecheck` script.
- Use TypeScript directly when needed:
  - `npx tsc -p tsconfig.json --noEmit`
- ESLint-specific TS config is `tsconfig.eslint.json`; it includes `src`, `test`, `scripts`, and `.storybook/**/*`.

## Build System Notes

- `father build` is the library bundler.
- `.fatherrc.ts` builds:
  - CommonJS from `src` into `lib/` for Node.
  - ESM from `src` into `es/` for browser usage.
- Sourcemaps are enabled and then corrected by `scripts/correct-sourcemap.ts`.
- Avoid hand-editing `lib/` or `es/`; regenerate them.

## Style Sources Of Truth

- ESLint: `.eslintrc.js`
- Prettier: `.prettierrc.js`
- TypeScript strictness: `tsconfig.json`
- Stylelint: `stylelint.config.js`
- Shared style presets come from `@tiny-codes/code-style-all-in-one`.

## Formatting Rules

- Use 2 spaces, not tabs.
- Use semicolons.
- Use single quotes in TS/JS.
- Keep line width near 120 characters.
- Use trailing commas where Prettier allows them (`es5`).
- Preserve LF line endings.
- Let Prettier sort imports; do not fight the configured import order.

## Import Conventions

- Order follows the shared Prettier import-sort config:
  - `react`
  - React subpaths
  - other framework/router packages
  - third-party packages
  - `@ant-design` packages
  - internal absolute-ish imports (`@/`, `src/`) if introduced
  - parent relative imports
  - same-folder relative imports
  - style imports
  - other file imports
- In practice, current files typically group imports as:
  - React types and hooks first.
  - Ant Design types, then Ant Design values.
  - third-party utilities like `classnames`.
  - local project modules.
  - side-effect CSS imports last.
- Prefer `import type` for type-only imports.
- It is common here to write `import { type FC, useMemo } from 'react';`.

## TypeScript Rules

- `strict` is enabled; code should typecheck without implicit `any`.
- `noImplicitAny: true`, `noImplicitReturns: true`, `noUnusedLocals: true`.
- `noUnusedParameters` is disabled, so unused params are tolerated when APIs require them.
- Prefer explicit exported prop and option types.
- Generic hooks/components are common; preserve generic signatures when extending APIs.
- Use `Record<string, unknown>` or constrained generics instead of broad `object` when practical.
- Use `as const` for stable tuple returns, e.g. hooks.
- Avoid introducing `any`; if unavoidable, keep it local and justify with existing patterns.

## React And Component Conventions

- Components are mostly function components typed with `FC` or explicit generic function signatures.
- Hooks use the `useXxx` naming convention and default export from their own file.
- Public components/hooks/utils are re-exported from `src/components/index.tsx`, `src/hooks/index.ts`, and `src/utils/index.ts`.
- Set `displayName` on `forwardRef` or HOC-generated components when useful.
- Use `useMemo`, `useCallback`, and stable refs intentionally, especially for exported hooks/components.
- Custom stable-callback patterns like `useRefFunction` are already used; prefer existing repo patterns over inventing new abstractions.

## Naming Conventions

- Components: PascalCase (`ConfigProvider`, `FloatDrawer`).
- Hooks: camelCase with `use` prefix (`useRowSelection`).
- Utilities: camelCase function names.
- Props/types/interfaces: PascalCase with descriptive suffixes like `Props`, `Ref`, `Options`, `Constraint`.
- Internal prefix class variables are usually named `prefixCls` or `prefixClsInProps`.
- CSS class composition often uses `${prefixCls}-suffix` string patterns.

## Error Handling

- Follow existing local patterns first.
- For recoverable UI-side async handlers, the repo often uses `try/catch`, logs with `console.error`, and continues gracefully.
- For low-level utilities, either rethrow after logging or return a safe fallback if the API contract already does so.
- Do not silently swallow errors unless the existing function contract clearly expects best-effort behavior.
- If you add new error handling, keep behavior consistent with neighboring code.

## Comments And Docs

- Public APIs often carry JSDoc.
- Existing JSDoc style is bilingual English/Chinese; preserve that in exported/public APIs.
- Storybook docs extract JSDoc descriptions, so keep public prop docs clean and useful.
- Use comments sparingly for non-obvious logic; avoid redundant narration.

## Styling Patterns

- Many components use `useStyle` hooks and prefixed class names rather than separate CSS files.
- `classnames` is the standard class merging helper.
- Preserve semantic `classNames`/`styles` prop shapes where a component already exposes them.
- When adding styles, align with the existing prefix-based naming and Ant Design integration.

## Agent Workflow Guidance

- Check `package.json`, `.fatherrc.ts`, `.eslintrc.js`, `.prettierrc.js`, and `tsconfig.json` before large edits.
- Prefer editing source files under `src/`; only rebuild generated outputs when the task calls for it.
- If you add tests, also add the command needed to run them and keep single-test execution easy.
- If you introduce a new required workflow command, add an npm script rather than relying only on ad hoc `npx` usage.
- Do not invent Cursor/Copilot rule requirements; none are currently present.
