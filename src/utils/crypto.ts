import { base64ToString, stringToBase64 } from './base64';
import { random } from './math';
import { randomChars } from './string';

/** Secret. No description provided */
export async function advancedEncrypt(plainText: string, key: string) {
  const k1 = randomChars(36);
  let e = await encryptAES(plainText, k1);
  const b = stringToBase64(k1);
  const l = b.length;
  const s = random(0, e.length);
  e = e.substring(0, s) + b + e.substring(s);
  const r = stringToBase64(`${s}-${l}`);
  const t = `${e}.${r}`;
  return encryptAES(t, key);
}

/** Secret. No description provided */
export async function advancedDecrypt(encryptedText: string, key: string) {
  const decrypted = await decryptAES(encryptedText, key);
  const [e, r] = decrypted.split('.');
  const [s, l] = base64ToString(r).split('-').map(Number);
  const k1 = base64ToString(e.substring(s, s + l));
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
    if (crypto.subtle) {
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
    } else {
      // let encrypt: typeof CryptoJS.AES.encrypt;
      // try {
      //   const aes = await import('crypto-js/aes');
      //   encrypt = aes.encrypt;
      // } catch (error) {
      //   console.error('Load "crypto-js/aes" error:', error);
      //   throw error;
      // }
      // try {
      //   return encrypt(text, key).toString();
      // } catch (error) {
      //   console.error('Encryption error:', error);
      //   throw error;
      // }
      return encryptWithCryptoJS(text, key);
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
      if (crypto.subtle) {
        // Browsers with Web Crypto API, in secure contexts (HTTPS)
        const iv = Uint8Array.from(atob(ivBase64), (c) => c.charCodeAt(0));
        const encryptedData = Uint8Array.from(atob(encryptedBase64), (c) => c.charCodeAt(0));
        const encoder = new TextEncoder();
        const keyData = encoder.encode(key);
        const hashBuffer = await crypto.subtle.digest('SHA-256', keyData);
        const cryptoKey = await crypto.subtle.importKey('raw', hashBuffer, { name: 'AES-CBC' }, false, ['decrypt']);
        const decryptedBuffer = await crypto.subtle.decrypt({ name: 'AES-CBC', iv }, cryptoKey, encryptedData);
        const decoder = new TextDecoder();
        return decoder.decode(decryptedBuffer);
      } else {
        // Browsers without Web Crypto API, or insecure contexts (HTTP), fallback to CryptoJS
        // let decrypt: typeof CryptoJS.AES.decrypt;
        // let utf8: typeof CryptoJS.enc.Utf8;
        // try {
        //   const [aes, encUtf8] = await Promise.all([import('crypto-js/aes'), import('crypto-js/enc-utf8')]);
        //   decrypt = aes.decrypt;
        //   utf8 = encUtf8.default;
        // } catch (error) {
        //   console.error('Load "crypto-js/aes" error:', error);
        //   throw error;
        // }
        // try {
        //   const decrypted = decrypt(encryptedText, key);
        //   return decrypted.toString(utf8);
        // } catch (error) {
        //   console.error('Decryption error:', error);
        //   throw error;
        // }
        return decryptWithCryptoJS(encryptedText, key);
      }
    }
  } catch (error) {
    console.error('Decryption error:', error);
    return '';
  }
}
export async function encryptWithCryptoJS(text: string, key: string) {
  const [
    {
      default: {
        mode: { CBC },
        lib: { WordArray },
      },
    },
    { default: Pkcs7 },
    { default: Base64 },
    { default: Utf8 },
    { default: SHA256 },
    {
      default: { encrypt },
    },
  ] = await Promise.all([
    import('crypto-js/core.js'),
    import('crypto-js/pad-pkcs7.js'),
    import('crypto-js/enc-base64.js'),
    import('crypto-js/enc-utf8.js'),
    import('crypto-js/sha256.js'),
    import('crypto-js/aes.js'),
  ]);

  try {
    // Convert text and key to WordArray objects
    const wordArray = Utf8.parse(text);
    const keyArray = SHA256(key);
    const iv = WordArray.random(16);

    const encryptedBase64 = Base64.stringify(
      encrypt(wordArray, keyArray, {
        iv,
        mode: CBC,
        padding: Pkcs7,
      }).ciphertext
    );
    return `${Base64.stringify(iv)}:${encryptedBase64}`;
  } catch (error) {
    console.error('Encryption error:', error);
    throw error;
  }
}

export async function decryptWithCryptoJS(encryptedText: string, key: string) {
  const [ivBase64, encryptedBase64] = encryptedText.split(':');

  const [
    {
      default: {
        mode: { CBC },
      },
    },
    { default: Pkcs7 },
    { default: Base64 },
    { default: Utf8 },
    { default: SHA256 },
    {
      default: { decrypt },
    },
  ] = await Promise.all([
    import('crypto-js/core.js'),
    import('crypto-js/pad-pkcs7.js'),
    import('crypto-js/enc-base64.js'),
    import('crypto-js/enc-utf8.js'),
    import('crypto-js/sha256.js'),
    import('crypto-js/aes.js'),
  ]);

  try {
    // Convert base64 strings to WordArray objects
    const iv = Base64.parse(ivBase64);
    // Derive key using SHA-256 (matching native implementation)
    const derivedKey = SHA256(key);
    const decrypted = decrypt(encryptedBase64, derivedKey, {
      iv,
      mode: CBC,
      padding: Pkcs7,
    });
    return decrypted.toString(Utf8);
  } catch (error) {
    console.error('Decryption error:', error);
    throw error;
  }
}
