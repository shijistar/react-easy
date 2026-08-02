import { describe, expect, it, vi } from 'vitest';
import { random } from '../../../src/utils/math';

describe('random', () => {
  it('uses the node randomInt path and swaps reversed bounds into an inclusive range', () => {
    const value = random(5, 2);

    expect(Number.isInteger(value)).toBe(true);
    expect(value).toBeGreaterThanOrEqual(2);
    expect(value).toBeLessThanOrEqual(5);
  });

  it('uses web crypto for integer ranges when process is unavailable', () => {
    vi.stubGlobal('process', undefined);
    vi.stubGlobal('crypto', {
      getRandomValues(arr: Uint32Array) {
        arr[0] = 7;
        return arr;
      },
    });

    expect(random(10, 12)).toBe(11);
  });

  it('uses secure floating random via web crypto for no-arg calls', () => {
    vi.stubGlobal('crypto', {
      getRandomValues(arr: Uint32Array) {
        arr[0] = 0xffffffff;
        arr[1] = 0xffffffff;
        return arr;
      },
    });

    const value = random();
    const expected = ((0xffffffff >>> 5) * 67108864 + (0xffffffff >>> 6)) / 9007199254740992;

    expect(value).toBe(expected);
    expect(value).toBeLessThan(1);
  });

  it('uses randomBytes fallback via Node require when no web crypto is available', () => {
    vi.stubGlobal('crypto', undefined);

    const value = random();

    expect(value).toBeGreaterThanOrEqual(0);
    expect(value).toBeLessThan(1);
    expect(typeof value).toBe('number');
  });

  it('falls back to randomLikeMath for ranged calls when both randomInt and web crypto are unavailable', () => {
    vi.stubGlobal('process', undefined);
    vi.stubGlobal('crypto', undefined);

    const value = random(10, 20);

    // Falls through to randomLikeMath which returns a float in [0, 1)
    expect(value).toBeGreaterThanOrEqual(0);
    expect(value).toBeLessThan(1);
    expect(typeof value).toBe('number');
  });

  it('validates range inputs', () => {
    expect(() => random(1, undefined as never)).toThrow('Both min and max must be provided');
    expect(() => random(Number.NaN, 2)).toThrow('min and max must be finite numbers');
    expect(() => random(1.2, 2)).toThrow('min and max must be integers');
  });
});
