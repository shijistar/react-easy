import encryptWithCryptoJS from './encryptWithCryptoJS';

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
async function encryptAES(text: string, key: string): Promise<string> {
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

export default encryptAES;
