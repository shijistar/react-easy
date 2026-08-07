import decryptWithCryptoJS from './decryptWithCryptoJS';

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
async function decryptAES(encryptedText: string, key: string): Promise<string> {
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

export default decryptAES;
