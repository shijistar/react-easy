import { describe, expect, it } from 'vitest';
import { getColorLuminance } from '../../src/utils/color';

describe('getColorLuminance', () => {
  it('calculates luminance for shorthand hex colors', () => {
    expect(getColorLuminance('#fff')).toBeCloseTo(1, 6);
    expect(getColorLuminance('#000')).toBeCloseTo(0, 6);
  });

  it('calculates luminance for rgb and full hex colors', () => {
    expect(getColorLuminance('rgb(255, 0, 0)')).toBeCloseTo(0.2126, 4);
    expect(getColorLuminance('#00ff00')).toBeCloseTo(0.7152, 4);
  });

  it('falls back to zero for unsupported color formats and returns NaN for empty rgb payloads', () => {
    expect(getColorLuminance('transparent')).toBe(0);
    expect(Number.isNaN(getColorLuminance('rgb()'))).toBe(true);
  });
});
