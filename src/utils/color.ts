/**
 * Get the luminance of a color (0, 1) to determine if it is light or dark.
 *
 * @param color - The color to get the luminance for
 *
 * @returns The luminance of the color
 */
export function getColorLuminance(color: string): number {
  let r = 0,
    g = 0,
    b = 0;

  if (color.startsWith('#')) {
    let hex = color.substring(1);
    if (hex.length === 3) {
      hex = hex
        .split('')
        .map((c) => c + c)
        .join('');
    }
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  } else if (color.startsWith('rgb')) {
    const values = color.match(/\d+/g)?.map(Number) || [];
    [r, g, b] = values;
  }
  r = r / 255;
  g = g / 255;
  b = b / 255;

  r = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  g = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  b = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

  return luminance;
}
