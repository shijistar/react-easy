<!-- markdownlint-disable MD009, MD024 -->

# Changelog

## 1.4.9

2025-9-2

### Features

#### hooks

- ✨ add a new hook `useSSE` which provides a simple way to connect and communicate with a Server-Sent Events (SSE) server.
- ✨ add a new hook `useAudioPlayer` used to play audio from a given source URL or streaming data.
- ✨ add a new util `utils.arrayBufferToBase64` used to convert an ArrayBuffer to a Base64 encoded string.
- ✨ add a new util `utils.base64ToArrayBuffer` used to convert a Base64 encoded string to an ArrayBuffer.

### Notable Changes

- 🔥 `utils.toBase64` method is renamed to `utils.stringToBase64`.
- 🔥 `utils.fromBase64` method is renamed to `utils.base64ToString`.

### Bug Fixes

- 🐞 Fix sourcemap are not referenced correctly in `assets`

## 1.4.8

2025-9-1

### Features

#### hooks

- ✨ add a new hook `useStompSocket` which provides a simple way to connect and communicate with a STOMP WebSocket server.

### Bug Fixes

- 🐞 Fix sourcemap are not referenced correctly in `assets`

## 1.4.7

2025-8-20

### Features

#### hooks

- ✨ add a new hook `useUserMedia` which provides a simple way to access user media devices (e.g. camera, microphone).

## 1.4.6

2025-8-18

### Features

#### utils

- ✨ Improve the compatibility of `utils.random`.

## 1.4.5

2025-8-16

### Features

#### Crypto

- ✨ Improve `toBase64` and `fromBase64` to make node.js and browser compatible each other.

### Breaking Changes

- Remove `exports` from the package.json.

## 1.4.4

2025-8-15

### Features

#### Crypto

- ✨ Add `advancedEncrypt` and `advancedDecrypt` methods for enhanced security encryption and decryption.
- ✨ Add `encryptAES` and `decryptAES` methods for general AES encryption and decryption.
- ✨ Add `toBase64` and `fromBase64` utility functions for base64 encoding and decoding.

## 1.4.3

2025-8-10

### Features

#### Lexical components

- ✨ rename `getPropValue` to `getProp`
- ✨ rename `setProps` to `updateProps`

## 1.4.2

2025-8-10

### Features

- ✨ `SelectNode` component now supports `onXXX` event props like `onClick`, `onMouseEnter`, etc.

## 1.4.1

2025-8-10

### Features

- 🔥 Add `CloseIcon` component for `Lexical`.

## 1.4.0

2025-8-7

### Features

- 🔥 Add some custom nodes and helpers for `Lexical`.

## 1.3.1

2025-8-1

### Bug Fixes

- 🐞 Fix `onOK` handler is not fired in `withConfirmAction` HOC.

## 1.3.0

2025-7-28

### Features

- 🔥 Add `FormItemControl` component used to wrap custom content into a valid `Form.Item` control.

## 1.2.3

2025-7-22

### Bug Fixes

#### ModalAction

- 🐞 the issue of `defaultProps.formProps` missing is fixed

## 1.2.2

2025-7-22

### Bug Fixes

#### ModalAction

- 🐞 `defaultProps` priority issue fixed

## 1.2.1

2025-7-17

### Features

#### ConfirmAction

- 🔥 Add `withConfirmAction` hoc

#### DeleteConfirmAction

- 🔥 Add `withDeleteConfirmAction` hoc

#### ModalAction

- ✨ `withModalAction` allows to access the incoming props in the defaultProps function, and the result will override the incoming props. `withConfirmAction` and `withDeleteConfirmAction` have the same behavior.

## 1.2.0

2025-7-16

### Features

- 🔥 Add `ContextMenu` component
- `EditableText` component
  - ✨ now supports `block` prop to control both view and editing mode
  - ✨ `inputComp` prop allows for custom input components
- `Loading` component
  - 💥 Renamed two properties:
    - `maskStyle` to `rootStyle`
    - `maskClassName` to `rootClassName`

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
