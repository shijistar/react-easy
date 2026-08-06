Renders icons from an iconfont.cn script, powered by Ant Design's `IconFont` loader. Point it at a script URL and reference icons by name.

## When to use

Use `Iconfont` when your project's icon set lives on iconfont.cn (or a self-hosted iconfont script) rather than the bundled Ant Design icon library — team-custom glyphs, brand icons, or a curated set.

## Key features

- **Script-based** — `scriptUrl` loads the iconfont script once; all icons in that script become available by `type`.
- **Standard props** — inherits Ant Design `IconFontProps` (`spin`, `rotate`, `style`, `onClick`, …), so usage mirrors the normal `Icon` component.
- **Size & color** — `size` (`control`) and `color` tune the glyph; `rotate` (`control`) sets a fixed angle.
- **Prefix handling** — `iconPrefix` (demo helper) is prepended to `type` unless already present.

## Sample code

```tsx
import { createIconfont } from '@tiny-codes/react-easy';

const IconFont = createIconfont('//at.alicdn.com/t/font_xxx.js');

export function Demo() {
  return (
    <>
      <IconFont type="icon-tuichu" size={32} color="#1677ff" />
      <IconFont type="icon-facebook" spin />
    </>
  );
}
```

## Usage notes

- Load the script via `scriptUrl` before icons render; a wrong/missing URL yields blank glyphs.
- `type` is the icon name from the iconfont project; the `iconPrefix` is auto-prepended when needed.
- Because it forwards Ant Design icon props, `spin`/`rotate`/`style` behave exactly as with `<Icon />`.
