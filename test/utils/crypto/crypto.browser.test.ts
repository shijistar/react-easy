// Browser-mode test for `crypto` utils — runs in REAL Chromium (no stubs).
// Verifies the Web Crypto code paths (crypto.subtle / getRandomValues) that the
// jsdom unit test only simulates via vi.stubGlobal('crypto', ...).
import { describe, expect, it } from 'vitest';
import {
  advancedDecrypt,
  advancedEncrypt,
  decryptAES,
  decryptWithCryptoJS,
  encryptAES,
  encryptWithCryptoJS,
} from '../../../src/utils/crypto';

// NOTE: this file MUST NOT call vi.stubGlobal('crypto', ...) or switch
// process.versions — we want the real browser implementation to run.

describe('crypto utils — real browser (Web Crypto)', () => {
  it('encryptAES -> decryptAES round-trip returns original plaintext', async () => {
    const encrypted = await encryptAES('hello react-easy', 'secret-key');
    expect(encrypted).toContain(':');
    const decrypted = await decryptAES(encrypted, 'secret-key');
    expect(decrypted).toBe('hello react-easy');
  });

  it('decryptAES returns empty string on malformed input (catch branch)', async () => {
    const decrypted = await decryptAES('not-a-valid-format', 'secret-key');
    expect(decrypted).toBe('');
  });

  it('advancedEncrypt -> advancedDecrypt round-trip returns original plaintext', async () => {
    const encrypted = await advancedEncrypt('nested secret payload', 'outer-key');
    // advancedEncrypt wraps the payload as `encryptAES(t, key)` -> format is `iv:encrypted`
    expect(encrypted).toContain(':');
    const decrypted = await advancedDecrypt(encrypted, 'outer-key');
    expect(decrypted).toBe('nested secret payload');
  });

  it('encryptWithCryptoJS -> decryptWithCryptoJS round-trip returns original plaintext', async () => {
    const encrypted = await encryptWithCryptoJS('cryptojs text', 'direct-key');
    expect(encrypted).toContain(':');
    const decrypted = await decryptWithCryptoJS(encrypted, 'direct-key');
    expect(decrypted).toBe('cryptojs text');
  });

  it('uses real Web Crypto (crypto.subtle) under the hood', async () => {
    // If crypto.subtle is missing, encryptAES throws and this would fail —
    // proving the real browser API is exercised, not a stub.
    expect(typeof crypto !== 'undefined' && !!crypto.subtle).toBe(true);
    const encrypted = await encryptAES('probe', 'key');
    expect(encrypted.split(':')).toHaveLength(2);
  });
});
