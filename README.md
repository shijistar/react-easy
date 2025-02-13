# @tiny-codes/react-easy

[English](./README.md) | [中文](./README.zh-CN.md)

> Helps you use React and AntDesign more easily

[![npm version](https://img.shields.io/npm/v/@tiny-codes/react-easy.svg)](https://www.npmjs.com/package/@tiny-codes/react-easy)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/@tiny-codes/react-easy)](https://bundlephobia.com/result?p=@tiny-codes/react-easy)
[![npm downloads](https://img.shields.io/npm/dm/@tiny-codes/react-easy.svg)](https://www.npmjs.com/package/@tiny-codes/react-easy)
![GitHub License](https://img.shields.io/github/license/shijistar/react-easy?label=License)

⬇️ &nbsp;&nbsp; [Introduction](#introduction) | [Installation](#installation) | [Usage](#usage) | [Compatibility](#compatibility) &nbsp;&nbsp; ⬇️

## Introduction

Includes a series of React components, some of which are secondary encapsulations of AntDesign, helping you use the AntDesign component library more easily. In addition, it also includes some common Hooks and utility functions.

> The library is shipped in ECMAScript version `ES2016`

## Installation

Install using npm:

```bash
npm install @tiny-codes/react-easy
```

Install using pnpm:

```bash
pnpm add @tiny-codes/react-easy
```

Install using bun:

```bash
bun add @tiny-codes/react-easy
```

Or using yarn:

```bash
yarn add @tiny-codes/react-easy
```

## Usage

### ConfigProvider

You can use `ConfigProvider` to provide a global configuration for the components.

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

In the example above, the `localize` function uses `react-i18next`, you can also use other internationalization libraries, or directly pass in a custom function that satisfies your internationalization solution.

`defaultConfirmTitle` and `defaultConfirmContent` are the default confirmation box title and content, `defaultDeletionConfirmTitle` and `defaultDeletionConfirmContent` are the default deletion confirmation box title and content. You can use the key of the internationalization resource, or use plain text if you don't consider internationalization.

### ConfirmAction (Confirm box)

```jsx
import { ConfirmAction } from '@tiny-codes/react-easy';

<ConfirmAction.Button title="Are you sure?" content="This action cannot be undone!" onOk={handleTurnOff}>
  Turn off
</ConfirmAction.Button>;
```

With the default values of `ConfigProvider`, you can simplify the code further:

```jsx
<ConfirmAction.Button onOk={handleTurnOff}>Turn off</ConfirmAction.Button>
```

### DeleteConfirmAction (Deletion confirm box)

```jsx
import { DeleteConfirmAction } from '@tiny-codes/react-easy';

<DeleteConfirmAction.Button title="Are you sure?" content="This action cannot be undone!" onOk={handleDelete}>
  Delete
</DeleteConfirmAction.Button>;
```

With the default values of `ConfigProvider`, you can simplify the code further:

```jsx
<DeleteConfirmAction.Button onOk={handleDelete}>Delete</DeleteConfirmAction.Button>
```

### ModalAction (Modal box)

```jsx
import { ModalAction } from '@tiny-codes/react-easy';

<ModalAction.Button title="Edit" onOk={handleEdit}>
  Edit
</ModalAction.Button>;
```

### withModalAction

This is a higher-order component that wraps a form component into a modal, and when you click the button to display the modal, the content of the modal is the form component, which is used to edit data.

_**form.tsx**_

```jsx
import { withModalAction, FormCompPropsConstraint } from '@tiny-codes/react-easy';

type FormProps = { data?: FormData }; // Form component properties
type FormData = { name: string; age: number; } // Form binding data

const EditForm: React.FC<FormProps & FormCompPropsConstraint<FormData>> = (props) => {
  // The form instance is automatically injected by withModalAction, do not create the form instance yourself
  // onSave is to pass the submission function to withModalAction, which is called when the user clicks the OK button
  const { data, form, onSave } = props;

  // 3. Click the OK button to save the form data
  const handleSubmit = useRefFunction(async (values: FormData) => {
    await axios.put('/api/edit', values);
  });

  // 1. Register save event
  useEffect(() => { onSave(handleSubmit); }, [onSave, handleSubmit]);

  // 2. Bind form data
  return (
    <Form form={form} initialValues={data}>
      <Form.Item name="name" label="Name"> <Input /> </Form.Item>
      <Form.Item name="age" label="Age"> <InputNumber /> </Form.Item>
    </Form>
  );
};

export default withModalAction(EditForm);
```

_**app.tsx**_

```jsx
<EditModalAction>Edit</EditModalAction>
```

### useRefFunction

`useRefFunction` is used to wrap a function into an immutable function, which is suitable for scenarios that need to be used in `useEffect`, avoiding repeated execution of useEffect due to changes in function references. Another common scenario is that multiple variables are used in useEffect, but only one variable needs to be monitored in practice. We may have to use multiple `useRef` to save those other variables so that they do not appear in the dependency array of useEffect. At this time, we can use `useRefFunction` to solve this problem.

`useRefFunction` returns an immutable function, the reference of this function is immutable throughout the lifecycle of the component, but the variables used inside are real-time changes.

```jsx
import { useRefFunction } from '@tiny-codes/react-easy';

const Foo: React.FC<{ value: string; }> = (props) => {
  const printValue = useRefFunction(() => {
    // The value here changes in real time, but the reference of printValue is stable and unchanged
    console.log(props.value);
  });

  useEffect(() => {
    const timer = setInterval(() => { printValue(); }, 1000);
    return () => { clearInterval(timer); };
  }, [printValue])

  return null;
};
```

### useValidators

`useValidators` is used to get some built-in validator rules or build a custom rule.

```jsx
import { useValidators } from '@tiny-codes/react-easy';
import { Form } from 'antd';

const { number, email, code } = useValidators();

<Form>
  <Form.Item name="number" rules={[{ validator: number }]}>
    <Input />
  </Form.Item>
  <Form.Item name="email" rules={[{ validator: email }]}>
    <Input />
  </Form.Item>
  <Form.Item name="code" rules={[{ validator: code }]}>
    <Input />
  </Form.Item>
</Form>;
```

### useValidator

`useValidator` is used to build a custom validator rule.

```jsx
import { useValidator } from '@tiny-codes/react-easy';

const validator = useValidator({
  allowed: {
    number: true,
    letter: true,
  },
});

<Form.Item name="letterAndNumberOnly" rules={[{ validator }]}>
  <Input />
</Form.Item>;
```

### useValidatorBuilder

`useValidatorBuilder` is used to get a function that builds a custom validator rule.

```jsx
import { useValidatorBuilder } from '@tiny-codes/react-easy';

const build = useValidatorBuilder();

const validator = build({
  allowed: {
    number: true,
    letter: true,
  },
});
```

## Compatibility

- `react` >= 16.8.0
- `react-is` >= 16.8.0 _(Should be consistent with react)_
- `antd` >= 5.1.0

> To support different versions of npm dependencies, we use `peerDependencies` in the package.json declaration instead of `dependencies`, which requires you to explicitly install these dependencies in your project and ensure that they meet the version requirements. If these dependencies are not installed in the project, it may cause the installation of `@tiny-codes/react-easy` to fail.
>
> The ECMAScript version of shipped codes is `ES2016`, please ensure that your bundler tool supports this version

```

```

```

```
