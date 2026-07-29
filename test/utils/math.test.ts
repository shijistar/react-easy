import { Buffer as NodeBuffer } from 'node:buffer';
import { describe, expect, it, vi } from 'vitest';
import { random } from '../../src/utils/math';

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

  it('uses randomBytes fallback when no web crypto is available', () => {
    vi.stubGlobal('crypto', undefined);
    const randomBytes = vi.fn(() => NodeBuffer.from([0x1f, 0, 0, 0, 0, 0, 0]));
    vi.stubGlobal(
      'require',
      ((moduleName: string) => {
        if (moduleName === 'crypto') {
          return { randomBytes };
        }
        throw new Error(`Unexpected module: ${moduleName}`);
      }) as unknown,
    );

    expect(random()).toBe(0.96875);
    expect(randomBytes).toHaveBeenCalledWith(7);
  });

  it('falls back to randomLikeMath for ranged calls when neither randomInt nor web crypto is available', () => {
    vi.stubGlobal('process', undefined);
    vi.stubGlobal('crypto', undefined);
    vi.stubGlobal(
      'eval',
      (() =>
        ((moduleName: string) =>
          moduleName === 'crypto' ? { randomBytes: () => NodeBuffer.from([0x1f, 0, 0, 0, 0, 0, 0]) } : {}) as never) as unknown,
    );

    expect(random(10, 12)).toBe(0.96875);
  });

  it('throws when no secure random source is available', () => {
    vi.stubGlobal('process', undefined);
    vi.stubGlobal('crypto', undefined);
    vi.stubGlobal('eval', () => {
      throw new Error('blocked');
    });

    expect(() => random()).toThrow('No secure random source available in this environment');
  });

  it('throws when the fallback crypto module does not provide randomBytes', () => {
    vi.stubGlobal('process', undefined);
    vi.stubGlobal('crypto', undefined);
    vi.stubGlobal('eval', (() => ((moduleName: string) => (moduleName === 'crypto' ? {} : {})) as never) as unknown);

    expect(() => random()).toThrow('No secure random source available in this environment');
  });

  it('validates range inputs', () => {
    expect(() => random(1, undefined as never)).toThrow('Both min and max must be provided');
    expect(() => random(Number.NaN, 2)).toThrow('min and max must be finite numbers');
    expect(() => random(1.2, 2)).toThrow('min and max must be integers');
  });
});
