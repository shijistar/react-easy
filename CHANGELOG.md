<!-- markdownlint-disable MD009, MD024 -->

# Changelog

## Unreleased

2025-7-11

### Features

- ✨ Add a new `backgroundColor` prop to `Loading` component
- 💥 Changed two prop names of `Loading` component: `maskStyle` to `rootStyle`, `maskClassName` to `rootClassName`

## 1.1.3

2025-7-4

### Features

- 🔥 Add `EditableText` component
- ✨ `OverflowTags` component now supports `tag.icon`, and tries to use `tag.label`/`tag.name` as the label, tries to use `tag.value`/`tag.id` as the value

## 1.1.2

2025-7-3

### Features

- 🔥 Add `Loading` component
- 👀 The className prefix is changed to `ant-easy-***`

## 1.1.1

2025-7-2

### Bug Fixes

- 🐞 Fix wrong classPrefix of `OverflowTags` component

## 1.1.0

2025-7-1

### Features

- 🔥 Add `OverflowTags` component

## 1.0.12

2025-6-26

### Features

- 🐞 Preserve the `okButtonProps` while submitting

## 1.0.11

2025-6-26

### Features

- ✨ Enhance `ConfirmAction` and `ModalAction` components that disable the cancel button while submitting

## 1.0.10

2025-6-20

### Features

- Add `onResize` event prop to `FloatDrawer` component

## 1.0.9

2025-6-18

### Features

- Add export entries for utils
- Remove zIndex from `FloatDrawer` container

## 1.0.8

2025-6-18

### Features

- 🔥 add `getColorLuminance` util method

## 1.0.7

2025-6-15

### Features

- 🔥 add `FloatDrawer` component

## 1.0.6

2025-4-17

### Bug Fixes

- 🐞 fix null pointer issue when antd `App` is not provided

## 1.0.5

2025-4-14

### Features

- 🔥 Add `useRefValue` hook

## 1.0.4

2025-3-28

### Features

- 🔥 Add `triggerProps.show` prop to `ModalAction` component
- 🔥 Add `danger` prop to `ConfirmAction` and `DeleteConfirmAction` components

### Bug Fixes

- 🐞 Fix key warning in `BreakLines`

## 1.0.3

2025-2-17

### Features

- 🔥 Adds `BreakLines` component

## 1.0.2

2025-2-17

### Features

- 🔥 adds `useValidator` to build a custom validator
- 🔥 adds `useValidatorBuilder` to get a function that builds a custom validator

## 1.0.1

2025-2-13

### Features

- 🔥 Support internationalization

**ConfigProvider**

- 🔥 `lang` prop is added to provide the language
- 🔥 `locales` prop is added to customize built-in locale resources or add a new language

**Hooks**

- 🔥 adds `useValidators` to get built-in validator rules
- 🔥 adds `useValidator` to build a custom validator
- 🔥 adds `useValidatorBuilder` to get a function that builds a custom validator

## 1.0.0

2025-2-7

The first release ships the following contents

- **Components**

  - 🔥 `ConfirmAction` component that renders a button that triggers a confirmation modal before executing the action
  - 🔥 `DeleteConfirmAction` component that renders a button that triggers a deletion confirmation modal before deleting action
  - 🔥 `ModalAction` component that renders a button that triggers a modal with a form to collect user input
  - 🔥 `ConfigProvider` component that provides a global configuration for the components

- **Hooks**

  - 🔥 `useRefFunction` hook that wraps a function to an immutable function
