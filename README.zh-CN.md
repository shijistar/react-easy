# @tiny-codes/react-easy

[English](./README.md) | [中文](./README.zh-CN.md) | [Changelog](./CHANGELOG.md)

> 一个围绕 Ant Design 构建的 React 组件、Hooks 与工具函数库

[![npm version](https://img.shields.io/npm/v/@tiny-codes/react-easy.svg)](https://www.npmjs.com/package/@tiny-codes/react-easy)
[![npm bundle size](https://img.shields.io/bundlejs/size/@tiny-codes/react-easy?logo=javascript&label=Minzipped&color=44cc11&cacheSeconds=86400)](https://bundlephobia.com/result?p=@tiny-codes/react-easy)
[![npm downloads](https://img.shields.io/npm/dm/@tiny-codes/react-easy.svg)](https://www.npmjs.com/package/@tiny-codes/react-easy)
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/shijistar/react-easy)
![GitHub License](https://img.shields.io/github/license/shijistar/react-easy?label=License)

## 简介

`@tiny-codes/react-easy` 是一个 TypeScript React 组件库，主要提供：

- 面向 Ant Design 使用场景的实用组件
- 与表单、状态、交互、通信相关的通用 Hooks
- 可同时用于浏览器和 Node 场景的一些工具函数

演示页面：https://shijistar.github.io/react-easy

当前产物包括：

- CommonJS：`lib/`
- ESM：`es/`
- 类型定义：`lib/index.d.ts`

发布代码的 JavaScript 目标版本为：`ES2016`

## 特性

- 提供带本地化能力和全局默认值的 `ConfigProvider`
- 提供 `ConfirmAction`、`DeleteConfirmAction`、`ModalAction` 等常见交互封装
- 提供 `withModalAction`、`EditableText`、校验 Hooks 等表单辅助能力
- 提供 `ColumnSetting`、`OverflowTags`、`FloatDrawer` 等界面增强组件
- 提供 `useSSE`、`useStompSocket` 等通信类 Hooks
- 提供 `base64`、加密、字符串、流、数学等工具函数

## 安装

安装包本体以及所需的 peer dependencies：

```bash
npm install @tiny-codes/react-easy react react-is antd i18next
```

或使用其他包管理器：

```bash
pnpm add @tiny-codes/react-easy react react-is antd i18next
```

```bash
yarn add @tiny-codes/react-easy react react-is antd i18next
```

```bash
bun add @tiny-codes/react-easy react react-is antd i18next
```

## 兼容性

- `react` >= 16.8.0
- `react-is` >= 16.8.0
- `antd` >= 5.1.0
- `i18next` >= 8.4.0

说明：

- 以上依赖使用的是 `peerDependencies`，需要由业务项目自行安装。
- 输出代码目标为 `ES2016`，请确保你的构建工具或运行环境支持该版本。

## 快速开始

查看全部功能演示，请点击 [https://shijistar.github.io/react-easy](https://shijistar.github.io/react-easy)

### 1. 在应用根部接入 ConfigProvider

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

### 2. 使用确认类组件

```tsx
import { ConfirmAction, DeleteConfirmAction } from '@tiny-codes/react-easy';

function DangerZone() {
  return (
    <>
      <ConfirmAction.Button onOk={() => console.log('confirmed')}>启用功能</ConfirmAction.Button>
      <DeleteConfirmAction.Button onOk={() => console.log('deleted')}>删除条目</DeleteConfirmAction.Button>
    </>
  );
}
```

### 3. 把表单包装成弹窗操作

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
      <Form.Item name="name" label="姓名">
        <Input />
      </Form.Item>
    </Form>
  );
}

const UserModalAction = withModalAction(UserForm);
```

### 4. 使用稳定回调和校验 Hooks

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

## 导出能力

### 组件

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

### 工具函数

- `AudioPlayer`
- `base64`
- `color`
- `crypto`
- `math`
- `stream`
- `string`

## 本地开发

安装依赖：

```bash
npm install
```

常用命令：

```bash
npm run build
npm run build-core
npm run storybook
npm run build-storybook
npx tsc -p tsconfig.json --noEmit
npx eslint src .storybook scripts --ext .ts,.tsx,.js,.jsx
npx prettier . --check
```

补充说明：

- 源码目录在 `src/`。
- `lib/` 和 `es/` 都是生成产物。
- Storybook 是组件和文档的主要本地预览环境。
- 仓库中安装了 Jest，但并不保证每个阶段都已经提交了测试文件或 Jest 配置。

## License

[MIT](./LICENSE)
