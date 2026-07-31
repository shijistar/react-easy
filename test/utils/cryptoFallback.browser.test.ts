// 方案 C 专用：在真实浏览器中强制 crypto-js 抛错，触发
// encryptWithCryptoJS / decryptWithCryptoJS 的 catch 分支（crypto.ts line 194 / 239）。
// 独立文件，顶层 vi.mock 始终让 crypto-js/aes 的 encrypt/decrypt 抛错，
// 不影响 crypto.browser.test.ts 的无 stub 真验证用例。
import { describe, expect, it, vi } from 'vitest';
import { decryptWithCryptoJS, encryptWithCryptoJS } from '../../src/utils/crypto';

const throwFn = () => {
  throw new Error('forced crypto-js failure');
};

// 覆盖 CJS/ESM 两种 interop 形态，确保 crypto.ts 解构到的 encrypt/decrypt 都会抛错
vi.mock('crypto-js/aes.js', () => ({
  encrypt: throwFn,
  decrypt: throwFn,
  default: { encrypt: throwFn, decrypt: throwFn },
}));

describe('crypto utils — CryptoJS fallback catch branch (forced in real browser)', () => {
  it('encryptWithCryptoJS surfaces error when crypto-js aes encrypt throws', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    await expect(encryptWithCryptoJS('x', 'k')).rejects.toThrow('forced crypto-js failure');
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it('decryptWithCryptoJS surfaces error when crypto-js aes decrypt throws', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    await expect(decryptWithCryptoJS('a:b', 'k')).rejects.toThrow('forced crypto-js failure');
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
