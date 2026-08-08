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

- [`BreakLines`](https://shijistar.github.io/react-easy/?path=/docs/components-breaklines--api)
- [`ColumnSetting`](https://shijistar.github.io/react-easy/?path=/docs/components-columnsetting--api)
- [`ConfigProvider`](https://shijistar.github.io/react-easy/?path=/docs/components-configprovider--api)
- [`ConfirmAction`](https://shijistar.github.io/react-easy/?path=/docs/components-confirmaction--api)
- [`ContextMenu`](https://shijistar.github.io/react-easy/?path=/docs/components-contextmenu--api)
- [`DeleteConfirmAction`](https://shijistar.github.io/react-easy/?path=/docs/components-deleteconfirmaction--api)
- [`EditableText`](https://shijistar.github.io/react-easy/?path=/docs/components-editabletext--api)
- [`EllipsisParagraph`](https://shijistar.github.io/react-easy/?path=/docs/components-ellipsistypography--api)
- [`EllipsisText`](https://shijistar.github.io/react-easy/?path=/docs/components-ellipsistypography--api)
- [`EllipsisTitle`](https://shijistar.github.io/react-easy/?path=/docs/components-ellipsistypography--api)
- [`EllipsisLink`](https://shijistar.github.io/react-easy/?path=/docs/components-ellipsistypography--api)
- [`FloatDrawer`](https://shijistar.github.io/react-easy/?path=/docs/components-floatdrawer--api)
- [`FormItemControl`](https://shijistar.github.io/react-easy/?path=/docs/components-formitemcontrol--api)
- [`Iconfont`](https://shijistar.github.io/react-easy/?path=/docs/components-iconfont--api)
- [`Loading`](https://shijistar.github.io/react-easy/?path=/docs/components-loading--api)
- [`ModalAction`](https://shijistar.github.io/react-easy/?path=/docs/components-modalaction--api)
- [`OverflowTags`](https://shijistar.github.io/react-easy/?path=/docs/components-overflowtags--api)
- [`PulseAnimation`](https://shijistar.github.io/react-easy/?path=/docs/components-pulseanimation--api)
- [`VirtualTextViewer`](https://shijistar.github.io/react-easy/?path=/docs/components-virtualtextviewer--api)
- [`ReactEasyContext`](https://shijistar.github.io/react-easy/?path=/docs/components-configprovider--api)
- [`withConfirmAction`](https://shijistar.github.io/react-easy/?path=/docs/components-confirmaction--api)
- [`withDeleteConfirmAction`](https://shijistar.github.io/react-easy/?path=/docs/components-deleteconfirmaction--api)
- [`withModalAction`](https://shijistar.github.io/react-easy/?path=/docs/components-modalaction--api)
- [`withDefaultConfirmActionProps`](https://shijistar.github.io/react-easy/?path=/docs/components-confirmaction--api)
- [`withDefaultModalActionProps`](https://shijistar.github.io/react-easy/?path=/docs/components-modalaction--api)

### Hooks

- [`useAudioPlayer`](https://shijistar.github.io/react-easy/?path=/docs/hooks-useaudioplayer--api)
- [`useDebounce`](https://shijistar.github.io/react-easy/?path=/docs/hooks-usedebounce--api)
- [`useLocalStorage`](https://shijistar.github.io/react-easy/?path=/docs/hooks-uselocalstorage--api)
- [`useMovable`](https://shijistar.github.io/react-easy/?path=/docs/hooks-usemovable--api)
- [`useProcessingText`](https://shijistar.github.io/react-easy/?path=/docs/hooks-useprocessingtext--api)
- [`useRefFunction`](https://shijistar.github.io/react-easy/?path=/docs/hooks-usereffunction--api)
- [`useRefValue`](https://shijistar.github.io/react-easy/?path=/docs/hooks-userefvalue--api)
- [`useRowSelection`](https://shijistar.github.io/react-easy/?path=/docs/hooks-userowselection--api)
- [`useSplitter`](https://shijistar.github.io/react-easy/?path=/docs/hooks-usesplitter--api)
- [`useSSE`](https://shijistar.github.io/react-easy/?path=/docs/hooks-usesse--api)
- [`useStompSocket`](https://shijistar.github.io/react-easy/?path=/docs/hooks-usestompsocket--api)
- [`useStreamDownloader`](https://shijistar.github.io/react-easy/?path=/docs/hooks-usestreamdownloader--api)
- [`useUserMedia`](https://shijistar.github.io/react-easy/?path=/docs/hooks-useusermedia--api)
- [`useValidators`](https://shijistar.github.io/react-easy/?path=/docs/hooks-usevalidators--api)
- [`useValidator`](https://shijistar.github.io/react-easy/?path=/docs/hooks-usevalidator--api)
- [`useValidatorBuilder`](https://shijistar.github.io/react-easy/?path=/docs/hooks-usevalidatorbuilder--api)

### Utilities

- [`AudioPlayer`](https://shijistar.github.io/react-easy/?path=/docs/utils-audioplayer--api)
- [`base64`](https://shijistar.github.io/react-easy/?path=/docs/utils-base64--api)
- [`color`](https://shijistar.github.io/react-easy/?path=/docs/utils-color--api)
- [`crypto`](https://shijistar.github.io/react-easy/?path=/docs/utils-crypto--api)
- [`math`](https://shijistar.github.io/react-easy/?path=/docs/utils-math--api)
- [`stream`](https://shijistar.github.io/react-easy/?path=/docs/utils-stream--api)
- [`StreamDownloader`](https://shijistar.github.io/react-easy/?path=/docs/utils-streamdownloader--api)
- [`string`](https://shijistar.github.io/react-easy/?path=/docs/utils-string--api)

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
