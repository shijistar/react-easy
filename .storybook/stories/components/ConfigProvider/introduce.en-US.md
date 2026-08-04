Provides global configuration for ReactEasy, including language, default confirm/delete dialog titles and content, and CSS prefix customization. Wrap your app (or a subtree) with it once.

## When to use

Use `ConfigProvider` at the root of your application (or around any subtree that should share settings) whenever you need to:

- Switch or override the UI language for ReactEasy components.
- Set default titles/content for the global confirm and delete-confirm dialogs.
- Register custom i18n resource bundles.
- Customize the component CSS class prefix.

## Key features

- **Language control** — set `lang` to switch the active locale; child components re-render automatically.
- **Global dialog defaults** — supply default `title`/`content` (and more) for `ConfirmAction` and `DeleteConfirmAction` so you don't repeat them per instance.
- **Custom i18n** — pass `locales` to override an existing language pack or register a brand-new one.
- **Prefix customization** — `prefixCls` retunes the generated CSS class namespace.

## Usage notes

- It must wrap the parts of the tree that should inherit the configuration; nesting multiple providers creates scoped overrides.
- `lang` changes i18n at runtime, but you should keep a single source of truth to avoid flicker.
- `locales` merges with (not replaces) the built-in bundles; omit a language to keep the default.
