/**
 * - **EN:** Encode a UTF-8 string into Base64 (standard or URL-safe).
 * - **CN:** 将 UTF-8 字符串编码为 Base64（标准或 URL 安全格式）。
 *
 * @param content Input text to encode | 要编码的输入文本
 *
 * @returns Base64 encoded string | Base64 编码后的字符串
 */
function stringToBase64(
  content: string,
  opts: {
    /**
     * - **EN:** Use URL-safe Base64 if true (replace +/ with -_ and strip =)
     * - **CN:** 为 true 时使用 URL 安全 Base64（将 +/ 替换为 -_ 并去掉 =）
     */
    urlSafe?: boolean;
  } = {},
): string {
  const { urlSafe = false } = opts;
  if (content == null || content === '') return '';

  let base64: string;
  const hasBuffer = typeof Buffer !== 'undefined' && typeof Buffer.from === 'function';
  if (hasBuffer) {
    // Node.js
    base64 = Buffer.from(content, 'utf8').toString('base64');
  } else {
    // Browser
    const encoder = new TextEncoder();
    const bytes = encoder.encode(content);
    let binary = '';
    for (const i of bytes) {
      binary += String.fromCharCode(i);
    }
    base64 = btoa(binary);
  }

  if (urlSafe) {
    // Replace chars and strip padding for URL-safe variant
    base64 = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/u, '');
  }
  return base64;
}

export default stringToBase64;
