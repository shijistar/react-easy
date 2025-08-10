/**
 * - EN: Generate a random string of alphanumeric characters.
 * - CN: 生成一个随机的字母数字字符串。
 *
 * @param length Length of the random string | 随机字符串的长度
 */
export function randomChars(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
