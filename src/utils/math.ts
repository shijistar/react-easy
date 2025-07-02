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
  const array = new Uint32Array(1);
  globalThis.crypto.getRandomValues(array);
  const randomValue = array[0] / (0xffffffff + 1);
  return Math.floor(randomValue * (max - min + 1)) + min;
}
