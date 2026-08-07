import { base64ToString } from '../base64';
import decryptAES from './decryptAES';

/** Secret. No description provided */
async function advancedDecrypt(encryptedText: string, key: string) {
  const decrypted = await decryptAES(encryptedText, key);
  const [e, r] = decrypted.split('.');
  const [s, l] = base64ToString(r).split('-').map(Number);
  const k1 = base64ToString(e.substring(s, s + l));
  return decryptAES(e.substring(0, s) + e.substring(s + l), k1);
}

export default advancedDecrypt;
