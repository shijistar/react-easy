The color utility computes a single color's luminance so you can decide whether it reads as light or dark. `getColorLuminance` returns the WCAG relative luminance in the range `(0, 1)` from a `#hex` (three or six digits) or `rgb()` color string.

## When to use

- Assigning readable text or background colors automatically from a background color (light backgrounds use dark text, dark backgrounds use light text).
- Making contrast-sensitive decisions, such as which icon or badge variant to show.
- Normalizing a mix of color inputs (hex and `rgb()`) to one light/dark verdict before further processing.

## Key features

- **Light/dark verdict** — A luminance below `0.5` reads as dark; at or above `0.5` reads as light.
- **Multiple formats** — Accepts `#rrggbb`, `#rgb`, and `rgb(r, g, b)` strings.
- **Standard formula** — Follows the WCAG relative-luminance computation with sRGB gamma correction.
- **Returns `(0, 1)`** — Ready for thresholding or further contrast math.

## Sample code

```ts
import { getColorLuminance } from '@tiny-codes/react-easy';

getColorLuminance('#ffffff'); // 1 (light)
getColorLuminance('#000000'); // 0 (dark)
getColorLuminance('rgb(255, 87, 34)'); // ~0.21 (dark)

const luminance = getColorLuminance(candidate);
const textColor = luminance < 0.5 ? '#fff' : '#000';
```

## Usage notes

- Only `#hex` (with or without the leading `#`) and `rgb(r, g, b)` strings are recognized; other inputs fall back to `(0, 0, 0)`.
- Alpha channels are ignored — `rgba()` uses only its RGB components.
- The result is a float in `[0, 1]`; treat `0.5` as the light-color baseline when choosing contrast colors.
