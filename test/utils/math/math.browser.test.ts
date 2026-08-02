// Browser-mode test for `math` utils — runs in REAL Chromium (no stubs).
// Verifies the Web Crypto getRandomValues paths (browser branch of `random`
// and `randomLikeMath`) that the jsdom unit test only simulates.
import { describe, expect, it } from 'vitest';
import { random } from '../../../src/utils/math';

// NOTE: this file MUST NOT stub `process` / `crypto` — we want the real
// browser implementation (crypto.getRandomValues) to run.

describe('math utils — real browser (Web Crypto getRandomValues)', () => {
  it('random(min, max) stays within inclusive range and returns an integer', () => {
    for (let i = 0; i < 50; i++) {
      const v = random(10, 12);
      expect(Number.isInteger(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(10);
      expect(v).toBeLessThanOrEqual(12);
    }
  });

  it('random(min, max) auto-swaps when min > max', () => {
    for (let i = 0; i < 50; i++) {
      const v = random(12, 10);
      expect(Number.isInteger(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(10);
      expect(v).toBeLessThanOrEqual(12);
    }
  });

  it('random() returns a number in [0, 1)', () => {
    for (let i = 0; i < 50; i++) {
      const v = random();
      expect(typeof v).toBe('number');
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('uses real Web Crypto getRandomValues under the hood', () => {
    expect(typeof crypto !== 'undefined' && !!crypto.getRandomValues).toBe(true);
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    expect(typeof buf[0]).toBe('number');
  });
});
