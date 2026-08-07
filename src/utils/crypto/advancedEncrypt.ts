import { stringToBase64 } from '../base64';
import { random } from '../math';
import { randomChars } from '../string';
import encryptAES from './encryptAES';

/** Secret. No description provided */
async function advancedEncrypt(plainText: string, key: string) {
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

export default advancedEncrypt;
