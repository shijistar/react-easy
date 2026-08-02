import { Buffer as NodeBuffer } from 'node:buffer';
import { describe, expect, it, vi } from 'vitest';
import {
  advancedDecrypt,
  advancedEncrypt,
  decryptAES,
  decryptWithCryptoJS,
  encryptAES,
  encryptWithCryptoJS,
} from '../../../src/utils/crypto';

describe('crypto utils', () => {
  it('encrypts and decrypts with the node crypto implementation', async () => {
    const encrypted = await encryptAES('hello node', 'secret-key');

    expect(encrypted).toContain(':');
    await expect(decryptAES(encrypted, 'secret-key')).resolves.toBe('hello node');
  });

  it('supports advanced encrypt/decrypt round trips', async () => {
    const encrypted = await advancedEncrypt('nested secret', 'outer-key');

    expect(encrypted).toContain(':');
    await expect(advancedDecrypt(encrypted, 'outer-key')).resolves.toBe('nested secret');
  });

  it('returns an empty string for invalid encrypted payloads', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    await expect(decryptAES('invalid-payload', 'secret-key')).resolves.toBe('');
    expect(consoleError).toHaveBeenCalledWith('Decryption error:', expect.any(Error));
  });

  it('encrypts and decrypts with browser subtle crypto', async () => {
    vi.stubGlobal('btoa', (input: string) => NodeBuffer.from(input, 'binary').toString('base64'));
    vi.stubGlobal('atob', (input: string) => NodeBuffer.from(input, 'base64').toString('binary'));

    const iv = Uint8Array.from({ length: 16 }, (_, index) => index + 1);
    const encryptedBytes = Uint8Array.from([9, 8, 7]);
    const decryptedBytes = new TextEncoder().encode('browser text');
    const subtle = {
      digest: vi.fn(async () => new Uint8Array([1, 2, 3, 4]).buffer),
      importKey: vi.fn(async () => ({ type: 'secret' })),
      encrypt: vi.fn(async () => encryptedBytes.buffer),
      decrypt: vi.fn(async () => decryptedBytes.buffer),
    };
    vi.stubGlobal('crypto', {
      subtle,
      getRandomValues(arr: Uint8Array) {
        arr.set(iv);
        return arr;
      },
    });

    await withBrowserLikeProcess(async () => {
      const encrypted = await encryptAES('browser text', 'secret-key');
      const [ivBase64, payloadBase64] = encrypted.split(':');

      expect(ivBase64).toBe(NodeBuffer.from(iv).toString('base64'));
      expect(payloadBase64).toBe(NodeBuffer.from(encryptedBytes).toString('base64'));
      await expect(decryptAES(encrypted, 'secret-key')).resolves.toBe('browser text');
      expect(subtle.digest).toHaveBeenCalledTimes(2);
      expect(subtle.importKey).toHaveBeenCalledTimes(2);
    });
  });

  it('logs and rethrows browser subtle encryption errors', async () => {
    vi.stubGlobal('crypto', {
      subtle: {
        digest: vi.fn(async () => new Uint8Array([1, 2, 3, 4]).buffer),
        importKey: vi.fn(async () => ({ type: 'secret' })),
        encrypt: vi.fn(async () => {
          throw new Error('subtle failed');
        }),
      },
      getRandomValues(arr: Uint8Array) {
        return arr;
      },
    });
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    await withBrowserLikeProcess(async () => {
      await expect(encryptAES('browser text', 'secret-key')).rejects.toThrow('subtle failed');
    });
    expect(consoleError).toHaveBeenCalledWith('Encryption error:', expect.any(Error));
  });

  it('falls back to CryptoJS through encryptAES/decryptAES in browser-like environments without subtle crypto', async () => {
    vi.stubGlobal('crypto', {
      subtle: undefined,
      getRandomValues(arr: Uint8Array) {
        arr.set(Uint8Array.from({ length: arr.length }, (_, index) => index + 1));
        return arr;
      },
    });

    await withBrowserLikeProcess(async () => {
      const encrypted = await encryptAES('fallback text', 'cryptojs-key');

      expect(encrypted).toContain(':');
      await expect(decryptAES(encrypted, 'cryptojs-key')).resolves.toBe('fallback text');
    });
  });

  it('encrypts and decrypts directly with CryptoJS helpers', async () => {
    vi.stubGlobal('crypto', {
      getRandomValues(arr: Uint8Array) {
        arr.set(Uint8Array.from({ length: arr.length }, (_, index) => index + 2));
        return arr;
      },
    });

    const encrypted = await encryptWithCryptoJS('cryptojs text', 'direct-key');

    expect(encrypted).toContain(':');
    await expect(decryptWithCryptoJS(encrypted, 'direct-key')).resolves.toBe('cryptojs text');
  });

  it('logs and rethrows CryptoJS helper failures', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    await expect(encryptWithCryptoJS(Symbol('bad') as never, 'direct-key')).rejects.toThrow();
    expect(consoleError).toHaveBeenCalledWith('Encryption error:', expect.any(Error));

    await expect(decryptWithCryptoJS('bad-payload', 'direct-key')).rejects.toThrow();
    expect(consoleError).toHaveBeenCalledWith('Decryption error:', expect.any(Error));
  });
});

async function withBrowserLikeProcess<T>(run: () => Promise<T>) {
  const descriptor = Object.getOwnPropertyDescriptor(process, 'versions');
  Object.defineProperty(process, 'versions', {
    configurable: true,
    enumerable: true,
    value: undefined,
  });

  try {
    return await run();
  } finally {
    if (descriptor) {
      Object.defineProperty(process, 'versions', descriptor);
    }
  }
}
