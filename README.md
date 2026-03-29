# @tiny-codes/react-easy

[English](./README.md) | [中文](./README.zh-CN.md) | [Changelog](./CHANGELOG.md)

> Practical React components, hooks, and utilities built around Ant Design.

[![npm version](https://img.shields.io/npm/v/@tiny-codes/react-easy.svg)](https://www.npmjs.com/package/@tiny-codes/react-easy)
[![npm bundle size](https://img.shields.io/bundlejs/size/@tiny-codes/react-easy?logo=javascript&label=Minzipped&color=44cc11&cacheSeconds=86400)](https://bundlephobia.com/result?p=@tiny-codes/react-easy)
[![npm downloads](https://img.shields.io/npm/dm/@tiny-codes/react-easy.svg)](https://www.npmjs.com/package/@tiny-codes/react-easy)
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/shijistar/react-easy)
![GitHub License](https://img.shields.io/github/license/shijistar/react-easy?label=License)

## Overview

`@tiny-codes/react-easy` is a TypeScript React library that packages:

- Ant Design oriented UI components for common product workflows
- reusable hooks for state, validation, communication, and interaction
- utility helpers for browser and Node-friendly data handling

Demo: https://shijistar.github.io/react-easy

The library is published as:

- CommonJS: `lib/`
- ESM: `es/`
- types: `lib/index.d.ts`

Shipped JavaScript target: `ES2016`

## Highlights

- Global `ConfigProvider` with localization support and shared defaults
- confirm / delete-confirm / modal action abstractions for repetitive dialogs
- form-oriented helpers such as `withModalAction`, `EditableText`, and validation hooks
- table and layout helpers such as `ColumnSetting`, `OverflowTags`, and `FloatDrawer`
- communication hooks such as `useSSE` and `useStompSocket`
- browser-friendly helpers for `base64`, crypto, strings, streams, and math

## Installation

Install the package and required peer dependencies:

```bash
npm install @tiny-codes/react-easy react react-is antd i18next
```

Or with other package managers:

```bash
pnpm add @tiny-codes/react-easy react react-is antd i18next
```

```bash
yarn add @tiny-codes/react-easy react react-is antd i18next
```

```bash
bun add @tiny-codes/react-easy react react-is antd i18next
```

## Compatibility

- `react` >= 16.8.0
- `react-is` >= 16.8.0
- `antd` >= 5.1.0
- `i18next` >= 8.4.0

Notes:

- Peer dependencies must be installed by the consuming app.
- Output code targets `ES2016`, so your bundler/runtime should support it.

## Get Started

Click [https://shijistar.github.io/react-easy](https://shijistar.github.io/react-easy) to see all features in action.

### 1. Wrap your app

```tsx
import { ConfigProvider } from '@tiny-codes/react-easy';
import { useTranslation } from 'react-i18next';

function Root() {
  const { t, i18n } = useTranslation();

  return (
    <ConfigProvider
      lang={i18n.language}
      localize={t}
      defaultConfirmTitle="common.confirm"
      defaultConfirmContent="common.confirm.content"
      defaultDeletionConfirmTitle="common.deleteConfirm"
      defaultDeletionConfirmContent="common.deleteConfirm.content"
    >
      <App />
    </ConfigProvider>
  );
}
```

### 2. Use action components

```tsx
import { ConfirmAction, DeleteConfirmAction } from '@tiny-codes/react-easy';

function DangerZone() {
  return (
    <>
      <ConfirmAction.Button onOk={() => console.log('confirmed')}>Enable feature</ConfirmAction.Button>
      <DeleteConfirmAction.Button onOk={() => console.log('deleted')}>Delete item</DeleteConfirmAction.Button>
    </>
  );
}
```

### 3. Turn a form into a modal action

```tsx
import { type FormCompPropsConstraint, withModalAction } from '@tiny-codes/react-easy';
import { Form, Input } from 'antd';

type User = { name: string };
type UserFormProps = { data?: User };

function UserForm(props: UserFormProps & FormCompPropsConstraint<User>) {
  const { form, data, onSave } = props;

  onSave(async (values) => {
    await api.save(values);
  });

  return (
    <Form form={form} initialValues={data}>
      <Form.Item name="name" label="Name">
        <Input />
      </Form.Item>
    </Form>
  );
}

const UserModalAction = withModalAction(UserForm);
```

### 4. Use stable callback and validator hooks

```tsx
import { useRefFunction, useValidators } from '@tiny-codes/react-easy';
import { Form, Input } from 'antd';

function Demo() {
  const { email, codeMax20 } = useValidators();
  const handleSubmit = useRefFunction(() => {
    console.log('stable callback');
  });

  return (
    <Form onFinish={handleSubmit}>
      <Form.Item name="email" rules={[{ validator: email }]}>
        <Input />
      </Form.Item>
      <Form.Item name="code" rules={[codeMax20]}>
        <Input />
      </Form.Item>
    </Form>
  );
}
```

## Exported API

### Components

- `BreakLines`
- `ColumnSetting`
- `ConfigProvider`
- `ConfirmAction`
- `ContextMenu`
- `DeleteConfirmAction`
- `EditableText`
- `EllipsisParagraph`
- `EllipsisText`
- `EllipsisTitle`
- `EllipsisLink`
- `FloatDrawer`
- `FormItemControl`
- `Iconfont`
- `Loading`
- `ModalAction`
- `OverflowTags`
- `PulseAnimation`

### Hooks

- `useAudioPlayer`
- `useDebounce`
- `useLocalStorage`
- `useMovable`
- `useProcessingText`
- `useRefFunction`
- `useRefValue`
- `useRowSelection`
- `useSplitter`
- `useSSE`
- `useStompSocket`
- `useUserMedia`
- `useValidators`
- `useValidator`
- `useValidatorBuilder`

### Utilities

- `AudioPlayer`
- `base64`
- `color`
- `crypto`
- `math`
- `stream`
- `string`

## Development

Install dependencies:

```bash
npm install
```

Common commands:

```bash
npm run build
npm run build-core
npm run storybook
npm run build-storybook
npx tsc -p tsconfig.json --noEmit
npx eslint src .storybook scripts --ext .ts,.tsx,.js,.jsx
npx prettier . --check
```

Notes for contributors:

- Source code lives in `src/`.
- `lib/` and `es/` are generated outputs.
- Storybook is the main local playground for components and docs.
- Jest is installed, but this repository may not always contain committed test files/config.

## License

[MIT](./LICENSE)
