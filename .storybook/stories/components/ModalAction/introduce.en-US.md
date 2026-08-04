Opens a modal containing a form before running an action. Like `ConfirmAction` it binds to a trigger, but instead of a simple confirm box it renders a full editable form and wires the form instance for you.

## When to use

Use `ModalAction` when the pre-action step needs structured input — creating or editing a record, collecting parameters, or any flow where `ConfirmAction`'s plain dialog is not enough but a separate page is overkill.

## Key features

- **Form-in-modal** — supply `formComp` (your form component) and ModalAction creates the `Form` instance and the `Modal`, then injects `form` + save handlers into your component.
- **Trigger-agnostic** — `triggerComponent` / `triggerProps` / `triggerEvent` pick any trigger, just like `ConfirmAction`.
- **Async save** — `onOk` receives the form data and can be async; returning `SubmitWithoutClosingSymbol` keeps the modal open (useful for "save and continue").
- **afterOk** — fires only after a successful save, for navigation/refresh.
- **Inherits antd** — all `ModalProps` (title, width, okText, …) are available.

## Usage notes

- Do not render a `<Form>` inside `formComp`; the parent already provides the instance — use the injected `form` and register save via `onSave`.
- `onOk` returning `SubmitWithoutClosingSymbol` prevents auto-close; any other return value is forwarded to `afterOk`.
- Keep the actual submit logic in `onOk`; `afterOk` is purely for post-success side effects.
