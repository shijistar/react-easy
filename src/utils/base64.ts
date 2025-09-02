/**
 * - **EN:** Encode a UTF-8 string into Base64 (standard or URL-safe).
 * - **CN:** 将 UTF-8 字符串编码为 Base64（标准或 URL 安全格式）。
 *
 * @param content Input text to encode | 要编码的输入文本
 *
 * @returns Base64 encoded string | Base64 编码后的字符串
 */
export function stringToBase64(
  content: string,
  opts: {
    /**
     * - **EN:** Use URL-safe Base64 if true (replace +/ with -_ and strip =)
     * - **CN:** 为 true 时使用 URL 安全 Base64（将 +/ 替换为 -_ 并去掉 =）
     */
    urlSafe?: boolean;
  } = {}
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

/**
 * - EN: Decode a Base64 (standard or URL-safe) string into UTF-8 text.
 * - CN: 将（标准或 URL 安全）Base64 字符串解码为 UTF-8 文本。
 *
 * @param content Base64 encoded string | Base64 编码字符串
 *
 * @returns Decoded UTF-8 string | 解码后的 UTF-8 字符串
 */
export function base64ToString(
  content: string,
  opts: {
    /**
     * - **EN:** Use URL-safe Base64 if true (replace +/ with -_ and strip =)
     * - **CN:** 为 true 时使用 URL 安全 Base64（将 +/ 替换为 -_ 并去掉 =）
     */
    urlSafe?: boolean;
  } = {}
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
    throw new Error('Failed to decode Base64: ' + (e instanceof Error ? e.message : String(e)));
  }
}

/**
 * - **EN:** Convert an ArrayBuffer to a Base64 encoded string.
 * - **CN:** 将 ArrayBuffer 转换为 Base64 编码的字符串。
 *
 * @param buf The ArrayBuffer to convert | 要转换的 ArrayBuffer
 *
 * @returns The Base64 encoded string | Base64 编码的字符串
 */
export function arrayBufferToBase64(buf: ArrayBuffer): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(buf).toString('base64');
  }
  const bytes = new Uint8Array(buf);
  const chunk = 0x8000;
  let binary = '';
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  let base64 = btoa(binary);
  // Add padding for Base64
  const padding = (4 - (base64.length % 4)) % 4;
  if (padding) base64 += '='.repeat(padding);
  return base64;
}

/**
 * - **EN:** Decode a Base64 (standard or URL-safe) string into an ArrayBuffer.
 * - **CN:** 将（标准或 URL 安全）Base64 字符串解码为 ArrayBuffer。
 *
 * @param base64 The Base64 encoded string | Base64 编码的字符串
 *
 * @returns The decoded ArrayBuffer | 解码后的 ArrayBuffer
 */
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  if (typeof Buffer !== 'undefined') {
    const buffer = Buffer.from(base64, 'base64');
    return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  }
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}
