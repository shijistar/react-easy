<!-- markdownlint-disable MD009, MD024 -->

# Changelog

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
