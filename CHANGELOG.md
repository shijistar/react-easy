<!-- markdownlint-disable MD009, MD024 -->

# Changelog

## UNRELEASED

2026-?-?

### Features

- **useLocalStorage**
  - ✨ Add `useLocalStorage` hook for managing state with localStorage.
- **utils.math.random**
  - ✨ Add an override method with zero parameters for generating random float numbers between 0 and 1.

### Bug Fixes

- Fix the issue where the `storageKey` is empty in `ColumnSetting` and `useMovable`.
- Fix the issue where the reset button in `ColumnSetting` is always disabled.

## 1.7.5

2026-2-24

### Features

- **EllipsisLink**
  - ✨ Add `EllipsisLink` component with automatic ellipsis and tooltip functionality.

## 1.7.4

2026-2-24

### Features

- **OverflowTags**
  - ✨ Add `ellipsisDropdownProps` property to customize the dropdown when tags are overflowed.

## 1.7.3

2026-2-12

### Features

- **EllipsisText**, **EllipsisParagraph**, **EllipsisTitle**
  - ✨ Make `text` prop optional.

## 1.7.2

2026-2-12

### Features

- **EllipsisText**, **EllipsisParagraph**, **EllipsisTitle**
  - ✨ Support `children` as the fallback of `text` prop.

## 1.7.1

2026-2-12

### Features

- **withEllipsisTypography**
  - ✨ Set default value for `ellipsis` prop to `true`. It affects `EllipsisTitle`, `EllipsisText`, and `EllipsisParagraph` components.

## 1.7.0

2026-2-6

### Features

- **ConfigProvider**
  - ✨ Enhance global configuration for `ConfirmAction`, `DeleteConfirmAction` and `ModalAction` components to allow setting default props for all instances in the application.
  - ⚠️ Deprecate `defaultConfirmTitle`, `defaultConfirmContent`, `defaultDeletionConfirmTitle`, and `defaultDeletionConfirmContent` in favor of the new global configuration approach.

## 1.6.5

2026-2-4

### Features

- **useValidatorBuilder**
  - ✨ Improve `useValidatorBuilder` for better format of special characters in validation messages.
- **OverflowTags**
  - ✨ Enhance `tagProps` and `ellipsisTagProps` to provide more context in the function parameters.
  - ✨ Support any data types

## 1.6.4

2026-1-15

### Features

- 🛠️ improve `easy-full-height-table` class styles

## 1.6.3

2026-1-7

### Features

- ✨ Add `easy-full-height-table` class to make table full height inside a container.

### Bug Fixes

- **withEllipsisTypography**

  - 🐞 Fix Tooltip not accepting custom `ellipsis.tooltip` props issue.

## 1.6.2

2026-1-2

### Features

- **withEllipsisTypography**
  - 🛠️ accept custom `ellipsis.tooltip` props.

## 1.6.1

2026-1-1

### Features

- 🛠️ update EllipsisTypography components for better generic type support.

## 1.6.0

2026-1-1

### Features

- ✨ Add some `EllipsisTypography` components: `EllipsisTitle`, `EllipsisText`, and `EllipsisParagraph` with auto tooltip functionality.

## 1.5.6

2025-12-8

### Features

- **useSplitter**

  - ✨ Add `className` and `style` props to customize the splitter element.

## 1.5.5

2025-12-3

### Bug Fixes

- **ModalAction**

  - 🐞 Respect `open` prop when it's changed to `false`.

## 1.5.4

2025-12-2

### Features

- **useUserMedia**

  - ✨ Show permission confirmation and user guide at the same time.

## 1.5.3

2025-12-1

### Features

- ✨ Refactor `useSplitter` to use container directly and improve width initialization.

## 1.5.2

2025-11-28

### Features

- ✨ Enhance `useSplitter` hook to support customizable splitter width and hover state.

## 1.5.1

2025-11-18

### Features

- 🔥 Add `useSplitter` hook

## 1.5.0

2025-11-17

### Features

- 🔥 Add `ColumnSetting` component for table column visibility management.

## 1.4.23

2025-11-11

### Features

#### `withModalAction`

- 🐞 Refactor modal action props handling to use `state` instead of `ref`

## 1.4.22

2025-11-10

### Features

#### `withModalAction`

- ✨ Add a second argument `ref` to the `defaultProps` function to access the internal ref of the `ModalAction` component.

## 1.4.21

2025-10-22

### Features

#### `useMovable`

- ✨ Improve position clamping on window resize, and make sure the movable element always stays within the viewport.

## 1.4.20

2025-10-17

### Features

- ✨ Add new hooks: `useMovable` and `useProcessingText`.
- ✨ Add new component `PulseAnimation` for loading indication.

## 1.4.19

2025-9-29

### Features

- 🛠️ move `i18next` to peerDependencies

## 1.4.18

2025-9-23

### Features

#### `FloatDrawer`

- ✨ add `destroyOnClose` prop to control whether to destroy the drawer content when closed

## 1.4.17

2025-9-23

### Features

#### `useDebounce`

- ✨ enhance `useDebounce` with `cancel`, `disable`, `enable`, and `isDisabled` methods

## 1.4.16

2025-9-18

### Features

#### `useDebounce`

- ✨ add `useDebounce` hook

## 1.4.15

2025-9-16

### Bug Fixes

#### `useSSE`

- 🐞 revert the changes in `v1.4.14`

## 1.4.14

2025-9-10

### Bug Fixes

#### `useSSE`

- 🐞 Correct abort logic in useSSE.

## 1.4.13

2025-9-8

### Features

#### `AudioPlayer`

- ✨ Enhance `AudioPlayer` for streaming support and better error handling.

#### `useSSE`

- ✨ Reject the promise when first connection fails, should not fire `onError` callback in this case.

### Notable Changes

#### `useSSE`

- 👀 `close` method in the return result is changed to `abort`.

## 1.4.12

2025-9-5

### Bug Fixes

#### `utils.crypto`

- 🐞 Optimize the order of `crypto-js` imports

## 1.4.11

2025-9-3

### Features

#### `utils.crypto`

- ✨ improve the compatibility of `advancedEncrypt` and `advancedDecrypt` methods to support insecure contexts, such as HTTP.

## 1.4.10

2025-9-3

### Features

#### `AudioPlayer`

- ✨ audio source is extended to support `ArrayBuffer`, `Uint8Array`, and `Blob` types
- ✨ add `seekForward` and `seekBackward` methods for seeking audio playback
- ✨ add `seek` method for setting the current playback time

#### `useUserMedia`

- ✨ add `streamSliceMode` and `streamSliceValue` options for controlling the slicing behavior of the media stream.

### Notable Changes

#### `AudioPlayer`

- 👀 `getVolume` method is renamed to `volume` getter
- 👀 `getCurrentTime` method is renamed to `currentTime` getter
- 👀 `getDuration` method is renamed to `duration` getter
- 👀 `gotoTime` method is removed
- 👀 `gotoPercent` method is removed

#### `useUserMedia`

- 👀 `streamSliceMs` is removed, please use `streamSliceMode` and `streamSliceValue` instead.

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
