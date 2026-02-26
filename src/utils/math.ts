/**
 * **EN**: Generate a random decimal number between 0 and 1
 *
 * **CN**: 生成一个0~1之间的小数
 *
 * @returns The generated random number | 生成的随机数
 */
export function random(): number;
/**
 * **EN**: Generate a random integer within a specified range (inclusive on both ends)
 *
 * **CN**: 生成指定范围（两端包含）内的随机整数
 *
 * @param min The minimum value (inclusive) | 最小值（包含）
 * @param max The maximum value (inclusive) | 最大值（包含）
 *
 * @returns The generated random integer | 生成的随机整数
 */
export function random(min: number, max: number): number;
export function random(min?: number, max?: number): number {
  if (min == null && max == null) {
    return randomLikeMath();
  }
  if (min == null || max == null) {
    throw new TypeError('Both min and max must be provided');
  }
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    throw new TypeError('min and max must be finite numbers');
  }
  if (Math.floor(min) !== min || Math.floor(max) !== max) {
    throw new TypeError('min and max must be integers');
  }
  const globalThat =
    typeof globalThis !== 'undefined'
      ? globalThis
      : typeof window !== 'undefined'
        ? window
        : typeof global !== 'undefined'
          ? global
          : ({} as typeof globalThis);
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
    } catch (error) {
      // ignore
    }
  }

  // 1. Node.js crypto.randomInt
  if (nodeCrypto?.randomInt) {
    return nodeCrypto.randomInt(min, max + 1);
  }

  // 2. Web Crypto (Browsers or Node 19+ webcrypto)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const webCrypto: Crypto | undefined = globalThat.crypto || nodeCrypto?.webcrypto;

  if (webCrypto?.getRandomValues) {
    const range = max - min + 1;
    if (range <= 0) return min;

    // Use rejection sampling to avoid the slight bias caused by (2^32 % range).
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

  // 3. Fallback
  return randomLikeMath();
}

function randomLikeMath(): number {
  const globalThat =
    typeof globalThis !== 'undefined'
      ? globalThis
      : typeof window !== 'undefined'
        ? window
        : typeof global !== 'undefined'
          ? global
          : ({} as typeof globalThis);
  // Browser / Node(with webcrypto)
  const cryptoObj = globalThat.crypto;
  if (cryptoObj?.getRandomValues) {
    const buf = new Uint32Array(2);
    cryptoObj.getRandomValues(buf);

    // 53-bit precision, mapped to [0, 1)
    const high = buf[0] >>> 5; // 27 bits
    const low = buf[1] >>> 6; // 26 bits
    return (high * 67108864 + low) / 9007199254740992; // 2^53
  }

  // Old Node fallback (No webcrypto)
  // Use eval('require') to avoid "require is not defined" error during browser bundling
  const req: NodeRequire | undefined =
    typeof process !== 'undefined' &&
    process.versions?.node &&
    typeof (globalThat as unknown as { require?: unknown }).require === 'function'
      ? (globalThat as unknown as { require: NodeRequire }).require
      : (() => {
          try {
            // eslint-disable-next-line no-eval
            return eval('require') as NodeRequire;
          } catch (error) {
            return undefined;
          }
        })();

  if (!req) {
    throw new Error('No secure random source available in this environment');
  }

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const nodeCrypto = req('crypto') as { randomBytes?: (size: number) => Uint8Array };
  if (typeof nodeCrypto.randomBytes !== 'function') {
    throw new Error('No secure random source available in this environment');
  }

  const b = nodeCrypto.randomBytes(7); // 56 bits
  const x =
    (b[0] & 0x1f) * 2 ** 48 + b[1] * 2 ** 40 + b[2] * 2 ** 32 + b[3] * 2 ** 24 + b[4] * 2 ** 16 + b[5] * 2 ** 8 + b[6];

  return x / 9007199254740992; // 2^53 => [0,1)
}
