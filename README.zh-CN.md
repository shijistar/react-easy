# @tiny-codes/react-easy

[English](./README.md) | [中文](./README.zh-CN.md)

> 让使用 React 和 AntDesign 变得更简单

[![npm version](https://img.shields.io/npm/v/@tiny-codes/react-easy.svg)](https://www.npmjs.com/package/@tiny-codes/react-easy)
[![npm bundle size](https://img.shields.io/bundlejs/size/@tiny-codes/react-easy?logo=javascript&label=Minzipped&color=44cc11&cacheSeconds=86400)](https://bundlephobia.com/result?p=@tiny-codes/react-easy)
[![npm downloads](https://img.shields.io/npm/dm/@tiny-codes/react-easy.svg)](https://www.npmjs.com/package/@tiny-codes/react-easy)
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/shijistar/react-easy)
![GitHub License](https://img.shields.io/github/license/shijistar/react-easy?label=License)

⬇️ &nbsp;&nbsp; [介绍](#介绍) | [安装](#安装) | [使用](#使用) | [兼容性](#兼容性) &nbsp;&nbsp; ⬇️

## 介绍

包含一系列的React组件，其中一些是对AntDesign的二次封装，帮助你更方便地使用AntDesign组件库。除此之外还包含一些常用的Hooks和工具函数。

> 该库发布的ECMAScript版本为 `ES2016`

## 安装

使用 npm 安装:

```bash
npm install @tiny-codes/react-easy
```

使用 pnpm 安装:

```bash
pnpm add @tiny-codes/react-easy
```

使用 bun 安装:

```bash
bun add @tiny-codes/react-easy
```

或者使用 yarn 安装:

```bash
yarn add @tiny-codes/react-easy
```

## 使用

### ConfigProvider

你可以使用 `ConfigProvider` 为组件提供全局配置

```jsx
import { ConfigProvider } from '@tiny-codes/react-easy';
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();

<ConfigProvider
  localize={t}
  defaultConfirmTitle="common.confirm"
  defaultConfirmContent="common.confirm.content"
  defaultDeletionConfirmTitle="common.confirm"
  defaultDeletionConfirmContent="common.confirmDeleteValue"
>
  <App />
</ConfigProvider>;
```

在上面的例子中，`localize` 函数使用了`react-i18next`，你也可以使用其它的国际化库，或者直接传入一个自定义函数，使用适合你的国际化方案。

`defaultConfirmTitle` 和 `defaultConfirmContent` 是默认的确认框标题和内容，`defaultDeletionConfirmTitle` 和 `defaultDeletionConfirmContent` 是默认的删除确认框标题和内容。你可以使用国际化资源的键值，也可以使用普通文本，如果不考虑国际化的话。

### ConfirmAction (确认框)

```jsx
import { ConfirmAction } from '@tiny-codes/react-easy';

<ConfirmAction.Button title="是否确认？" content="这个操作无法撤销！" onOk={handleTurnOff}>
  关闭
</ConfirmAction.Button>;
```

借助 `ConfigProvider` 的默认值，你可以将代码进一步简化为：

```jsx
<ConfirmAction.Button onOk={handleTurnOff}>关闭</ConfirmAction.Button>
```

### DeleteConfirmAction（删除确认框）

```jsx
import { DeleteConfirmAction } from '@tiny-codes/react-easy';

<DeleteConfirmAction.Button title="确定删除吗？" content="删除动作无法撤销!" onOk={handleDelete}>
  删除
</DeleteConfirmAction.Button>;
```

借助 `ConfigProvider` 的默认值，你可以将代码进一步简化为：

```jsx
<DeleteConfirmAction.Button onOk={handleDelete}>删除</DeleteConfirmAction.Button>
```

### ModalAction (模态框)

```jsx
import { ModalAction } from '@tiny-codes/react-easy';

<ModalAction.Button title="Edit" onOk={handleEdit}>
  Edit
</ModalAction.Button>;
```

### withModalAction

这是一个高阶组件，用于将一个表单组件包装成一个模态框，当点击按钮显示模态框时，模态框内容就是这个表单组件，用于编辑数据。

_**form.tsx**_

```jsx
import { withModalAction, FormCompPropsConstraint } from '@tiny-codes/react-easy';

type FormProps = { data?: FormData }; // 表单组件的属性
type FormData = { name: string; age: number; } // 表单绑定数据

const EditForm: React.FC<FormProps & FormCompPropsConstraint<FormData>> = (props) => {
  // form实例是由 withModalAction 自动注入的，不要自己创建表单实例
  // onSave的作用是将提交函数传递给 withModalAction，在用户点击确定按钮时调用
  const { data, form, onSave } = props;

  // 3. 点击确定按钮，保存表单数据
  const handleSubmit = useRefFunction(async (values: FormData) => {
    await axios.put('/api/edit', values);
  });

  // 1. 注册保存事件
  useEffect(() => { onSave(handleSubmit); }, [onSave, handleSubmit]);

  // 2. 绑定表单数据
  return (
    <Form form={form} initialValues={data}>
      <Form.Item name="name" label="姓名"> <Input /> </Form.Item>
      <Form.Item name="age" label="年龄"> <InputNumber /> </Form.Item>
    </Form>
  );
};

export default withModalAction(EditForm);
```

_**app.tsx**_

```jsx
<EditModalAction>编辑</EditModalAction>
```

### useRefFunction

`useRefFunction` 用于将一个函数包装成不可变的函数, 适用于需要在 `useEffect` 中使用的场景，避免因为函数引用的变化导致 useEffect 重复执行。另外一个常见的场景是，在 useEffect 中使用了多个变量，但实际只需要监听某一个变量，我们可能不得不使用多个 `useRef` 来保存其它那些变量，以不让他们出现在 useEffect 的依赖数组中，这时候我们可以使用 `useRefFunction` 来解决这个问题。

`useRefFunction` 会返回一个不可变的函数，这个函数的引用在组件的整个生命周期中都是不变的，但在其内部使用的变量是实时变化的。

```jsx
import { useRefFunction } from '@tiny-codes/react-easy';

const Foo: React.FC<{ value: string; }> = (props) => {
  const printValue = useRefFunction(() => {
    // 这里的 value 是实时变化的，但 printValue 的引用是稳定不变的
    console.log(props.value);
  });

  useEffect(() => {
    const timer = setInterval(() => { printValue(); }, 1000);
    return () => { clearInterval(timer); };
  }, [printValue])

  return null;
};
```

## 兼容性

- `react` >= 16.8.0
- `react-is` >= 16.8.0 _(需要与 react 版本一致)_
- `antd` >= 5.1.0

> 为了支持不同版本的 npm 依赖库，我们在 package.json 声明中使用了`peerDependencies`，而不是`dependencies`，这需要在你的项目中显式安装这些依赖库，并且确保它们符合版本要求。如果项目中没有安装这些依赖库，可能会导致 `@tiny-codes/react-easy` 安装失败。
>
> npm 包输出的 ECMAScript 版本为 `ES2016`，请确保你的打包工具支持这个版本
