/**
 * - **EN:** Convert an ArrayBuffer to a Base64 encoded string.
 * - **CN:** 将 ArrayBuffer 转换为 Base64 编码的字符串。
 *
 * @param buf The ArrayBuffer to convert | 要转换的 ArrayBuffer
 *
 * @returns The Base64 encoded string | Base64 编码的字符串
 */
function arrayBufferToBase64(buf: ArrayBuffer): string {
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

export default arrayBufferToBase64;
