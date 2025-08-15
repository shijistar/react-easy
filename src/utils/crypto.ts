import { random } from './math';
import { randomChars } from './string';

/** Secret. No description provided */
export async function advancedEncrypt(plainText: string, key: string) {
  const k1 = randomChars(36);
  let a = await encryptAES(plainText, k1);
  const b = toBase64(k1);
  const l = b.length;
  const s = random(0, a.length);
  a = a.substring(0, s) + b + a.substring(s);
  const m = toBase64(`${s}-${l}`);
  const t = `${a}.${m}`;
  return encryptAES(t, key);
}

/** Secret. No description provided */
export async function advancedDecrypt(encryptedText: string, key: string) {
  const decrypted = await decryptAES(encryptedText, key);
  const [a, m] = decrypted.split('.');
  const [s, l] = fromBase64(m).split('-').map(Number);
  const K1 = fromBase64(a.substring(s, s + l));
  return decryptAES(a.substring(0, s) + a.substring(s + l), K1);
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

export function toBase64(str: string) {
  // Node.js environment
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str, 'utf-8').toString('base64');
  }
  // Browser environment
  return btoa(unescape(encodeURIComponent(str)));
}

export function fromBase64(base64: string) {
  // Node.js environment
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(base64, 'base64').toString('utf-8');
  }
  // Browser environment
  return decodeURIComponent(escape(atob(base64)));
}
