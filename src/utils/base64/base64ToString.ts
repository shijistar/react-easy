/**
 * - EN: Decode a Base64 (standard or URL-safe) string into UTF-8 text.
 * - CN: 将（标准或 URL 安全）Base64 字符串解码为 UTF-8 文本。
 *
 * @param content Base64 encoded string | Base64 编码字符串
 *
 * @returns Decoded UTF-8 string | 解码后的 UTF-8 字符串
 */
function base64ToString(
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

  let normalized = content;
  if (urlSafe) {
    normalized = normalized.replace(/-/g, '+').replace(/_/g, '/');
  }
  // Restore padding if stripped
  const padNeeded = normalized.length % 4;
  if (padNeeded === 2) normalized += '==';
  else if (padNeeded === 3) normalized += '=';
  else if (padNeeded === 1) {
    throw new Error('Invalid Base64 string length');
  }

  const hasBuffer = typeof Buffer !== 'undefined' && typeof Buffer.from === 'function';
  try {
    if (hasBuffer) {
      return Buffer.from(normalized, 'base64').toString('utf8');
    } else {
      const binary = atob(normalized);
      const len = binary.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const decoder = new TextDecoder();
      return decoder.decode(bytes);
    }
  } catch (e) {
    /* v8 ignore next -- rethrow path is covered in tests, but V8 line attribution is inconsistent across Buffer/atob decode failures */
    throw new Error('Failed to decode Base64: ' + (e instanceof Error ? e.message : String(e)));
  }
}

export default base64ToString;
