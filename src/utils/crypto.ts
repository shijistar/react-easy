import { random } from './math';
import { randomChars } from './string';

/** Secret. No description provided */
export async function advancedEncrypt(plainText: string, key: string) {
  const k1 = randomChars(36);
  let e = await encryptAES(plainText, k1);
  const b = toBase64(k1);
  const l = b.length;
  const s = random(0, e.length);
  e = e.substring(0, s) + b + e.substring(s);
  const r = toBase64(`${s}-${l}`);
  const t = `${e}.${r}`;
  return encryptAES(t, key);
}

/** Secret. No description provided */
export async function advancedDecrypt(encryptedText: string, key: string) {
  const decrypted = await decryptAES(encryptedText, key);
  const [e, r] = decrypted.split('.');
  const [s, l] = fromBase64(r).split('-').map(Number);
  const k1 = fromBase64(e.substring(s, s + l));
  return decryptAES(e.substring(0, s) + e.substring(s + l), k1);
}

/**
 * **EN**: General AES encryption function - supports both Node.js and browser environments
 *
 * **CN**: 通用 AES 加密函数 - 同时支持 Node.js 和浏览器环境
 *
 * @param {string} text The text to be encrypted | 要加密的文本
 * @param {string} key The encryption key | 加密密钥
 *
 * @returns {Promise<string>} The encrypted text | 加密后的文本
 */
export async function encryptAES(text: string, key: string): Promise<string> {
  const isNode = typeof process !== 'undefined' && process.versions != null && process.versions.node != null;

  if (isNode) {
    // Node.js
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const crypto = require('crypto');
    const derivedKey = crypto.createHash('sha256').update(key).digest();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', derivedKey, iv);
    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return `${iv.toString('base64')}:${encrypted}`;
  } else {
    // Browsers
    try {
      const iv = crypto.getRandomValues(new Uint8Array(16));
      const encoder = new TextEncoder();
      const keyData = encoder.encode(key);
      const hashBuffer = await crypto.subtle.digest('SHA-256', keyData);
      const cryptoKey = await crypto.subtle.importKey('raw', hashBuffer, { name: 'AES-CBC' }, false, ['encrypt']);
      const textBytes = encoder.encode(text);
      const encryptedBuffer = await crypto.subtle.encrypt({ name: 'AES-CBC', iv }, cryptoKey, textBytes);
      const ivBase64 = btoa(String.fromCharCode(...iv));
      const encryptedBase64 = btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer)));
      return `${ivBase64}:${encryptedBase64}`;
    } catch (error) {
      console.error('Encryption error:', error);
      throw error;
    }
  }
}

/**
 * **EN**: General AES decryption function - supports both Node.js and browser environments
 *
 * **CN**: 通用 AES 解密函数 - 同时支持 Node.js 和浏览器环境
 *
 * @param encryptedText The encrypted text (format: iv:encryptedContent, base64 encoded)
 * @param key The decryption key
 *
 * @returns The decrypted text
 */
export async function decryptAES(encryptedText: string, key: string): Promise<string> {
  const isNode = typeof process !== 'undefined' && process.versions != null && process.versions.node != null;
  try {
    const [ivBase64, encryptedBase64] = encryptedText.split(':');
    if (!ivBase64 || !encryptedBase64) {
      throw new Error('Invalid encrypted format');
    }
    if (isNode) {
      // Node.js
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const crypto = require('crypto');
      const iv = Buffer.from(ivBase64, 'base64');
      const encryptedBuffer = Buffer.from(encryptedBase64, 'base64');
      const derivedKey = crypto.createHash('sha256').update(key).digest();
      const decipher = crypto.createDecipheriv('aes-256-cbc', derivedKey, iv);
      let decrypted = decipher.update(encryptedBuffer);
      decrypted = Buffer.concat([decrypted, decipher.final()]);
      return decrypted.toString('utf8');
    } else {
      // Browsers
      const iv = Uint8Array.from(atob(ivBase64), (c) => c.charCodeAt(0));
      const encryptedData = Uint8Array.from(atob(encryptedBase64), (c) => c.charCodeAt(0));
      const encoder = new TextEncoder();
      const keyData = encoder.encode(key);
      const hashBuffer = await crypto.subtle.digest('SHA-256', keyData);
      const cryptoKey = await crypto.subtle.importKey('raw', hashBuffer, { name: 'AES-CBC' }, false, ['decrypt']);
      const decryptedBuffer = await crypto.subtle.decrypt({ name: 'AES-CBC', iv }, cryptoKey, encryptedData);
      const decoder = new TextDecoder();
      return decoder.decode(decryptedBuffer);
    }
  } catch (error) {
    console.error('Decryption error:', error);
    return '';
  }
}

/**
 * - **EN:** Encode a UTF-8 string into Base64 (standard or URL-safe).
 * - **CN:** 将 UTF-8 字符串编码为 Base64（标准或 URL 安全格式）。
 *
 * @param content Input text to encode | 要编码的输入文本
 *
 * @returns Base64 encoded string | Base64 编码后的字符串
 */
export function toBase64(
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
export function fromBase64(
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
