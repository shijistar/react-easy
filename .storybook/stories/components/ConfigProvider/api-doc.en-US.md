## API

`ConfigProvider` extends the ReactEasy context props (`ReactEasyContextProps`), so global settings like `lang`, default confirm/delete titles and content, and component defaults are accepted. The props below are specific to the provider wrapper.

| Prop        | Description                                                                         | Type                        | Default |
| ----------- | ----------------------------------------------------------------------------------- | --------------------------- | ------- |
| `children`  | Child elements wrapped by the provider.                                             | `ReactNode`                 | -       |
| `lang`      | Active UI language (e.g. `en-US`, `zh-CN`). Changing it switches i18n at runtime.   | `string`                    | `en-US` |
| `locales`   | Custom i18n resource bundle; overrides an existing language or registers a new one. | `Partial<typeof localesEn>` | -       |
| `prefixCls` | Custom CSS class prefix for the provider root.                                      | `string`                    | -       |
| `className` | Class name of the root element.                                                     | `string`                    | -       |
| `style`     | Inline style of the root element.                                                   | `CSSProperties`             | -       |

> Inherits `ReactEasyContextProps` (e.g. `defaultConfirmTitle`, `defaultConfirmContent`, `ConfirmAction`, `DeletionConfirmAction`, …) — see the context definition for the full set.
