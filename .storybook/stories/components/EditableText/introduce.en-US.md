An inline-editable text component built on Ant Design Typography. It shows content as read-only text and switches to an input/textarea editor on demand, supporting `Text`, `Paragraph`, `Title`, and `Link` renderers.

## When to use

Use `EditableText` when a piece of text should be both displayed and quickly edited in place — user profiles, inline labels, configurable captions, or any field where a full form feels heavy.

## Key features

- **Typography-native** — renders as `Text`/`Paragraph`/`Title`/`Link` in view mode, so styling and ellipsis behavior match Ant Design.
- **Inline editing** — toggles to an `Input`/`TextArea` editor without leaving the layout; `editable` controls whether the edit affordance shows.
- **Controlled & async save** — `value`/`onChange` for the data, `editing` to force edit mode, and `onOk`/`afterOk` for save flow; `required` and `textComp` tune validation and typography.
- **Custom renderers** — `displayText`/`children` override the read-only presentation, while `renderView`/`renderEdit`/`renderInput` (from `EditableFormProps`) customize each phase.
- **Block or inline** — the `block` prop chooses full-width block vs inline display in view/edit modes.

## Usage notes

- `editable={false}` hides the edit button entirely; drive `editing` from outside for programmatic control.
- Save failures should be handled inside `onOk`; throwing keeps the editor open.
- In view mode the text can still use Ant Design ellipsis config, but `children`/`displayText` overrides disable truncation.
