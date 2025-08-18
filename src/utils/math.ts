/**
 * **EN**: Generate a random number within a specified range (inclusive on both ends)
 *
 * **CN**: 生成指定范围（两端包含）内的随机数
 *
 * @param min The minimum value (inclusive) | 最小值（包含）
 * @param max The maximum value (inclusive) | 最大值（包含）
 *
 * @returns The generated random number | 生成的随机数
 */
export function random(min: number, max: number): number {
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    throw new TypeError('min and max must be finite numbers');
  }
  if (Math.floor(min) !== min || Math.floor(max) !== max) {
    throw new TypeError('min and max must be integers');
  }
  if (min > max) {
    [min, max] = [max, min];
  }

  // Try to require Node.js crypto
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let nodeCrypto: any;
  if (typeof process !== 'undefined' && process.versions?.node) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      nodeCrypto = require('crypto');
    } catch {
      // ignore
    }
  }

  // 1. Node.js crypto.randomInt
  if (nodeCrypto?.randomInt) {
    return nodeCrypto.randomInt(min, max + 1);
  }

  // 2. Web Crypto (Browsers or Node 19+ webcrypto)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const webCrypto: Crypto | undefined = (globalThis as any).crypto || nodeCrypto?.webcrypto;

  if (webCrypto?.getRandomValues) {
    const range = max - min + 1;
    if (range <= 0) return min;

    // 使用拒绝采样避免 (2^32 % range) 造成的微小偏差
    const maxUint32 = 0xffffffff;
    const limit = Math.floor((maxUint32 + 1) / range) * range;
    const arr = new Uint32Array(1);
    let v: number;
    do {
      webCrypto.getRandomValues(arr);
      v = arr[0];
    } while (v >= limit);
    return min + (v % range);
  }

  // 3. Fallback, should not be used for cryptographic purposes
  const _math = Math;
  return Math.floor(_math.random() * (max - min + 1)) + min;
}
