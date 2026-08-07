import { describe, expect, it, vi } from 'vitest';
import { random } from '../../src/utils/math';
import { randomChars, readTextAnyEncoding } from '../../src/utils/string';

vi.mock('../../src/utils/math', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/utils/math')>();
  return { ...actual, random: vi.fn() };
});

describe('string utils', () => {
  it('generates deterministic random strings and handles zero length', () => {
    vi.mocked(random).mockReturnValueOnce(0).mockReturnValueOnce(0.999999);

    expect(randomChars(2)).toBe('A9');
    expect(randomChars(0)).toBe('');
  });

  it('returns an empty string when no blob is provided', async () => {
    await expect(readTextAnyEncoding(undefined)).resolves.toBe('');
  });

  it('detects BOM encodings for Blob and ArrayBuffer inputs', async () => {
    const textDecoderMock = vi.fn(function (this: { decode: () => string }, encoding: string) {
      this.decode = () => `decoded:${encoding}`;
    });
    vi.stubGlobal('TextDecoder', textDecoderMock);

    await expect(readTextAnyEncoding(new Blob([Uint8Array.from([0xef, 0xbb, 0xbf, 0x61])]))).resolves.toBe(
      'decoded:utf-8',
    );
    await expect(readTextAnyEncoding(Uint8Array.from([0xff, 0xfe, 0x61, 0x00]).buffer)).resolves.toBe(
      'decoded:utf-16le',
    );
    await expect(readTextAnyEncoding(Uint8Array.from([0xfe, 0xff, 0x00, 0x61]))).resolves.toBe('decoded:utf-16be');
  });

  it('detects valid utf-8 byte sequences and falls back for invalid bytes', async () => {
    const encodings: string[] = [];
    const textDecoderMock = vi.fn(function (this: { decode: () => string }, encoding: string) {
      this.decode = () => {
        encodings.push(encoding);
        return `decoded:${encoding}`;
      };
    });
    vi.stubGlobal('TextDecoder', textDecoderMock);

    await expect(readTextAnyEncoding(Uint8Array.from([0x61]))).resolves.toBe('decoded:utf-8');
    await expect(readTextAnyEncoding(Uint8Array.from([0xc3, 0xa9]))).resolves.toBe('decoded:utf-8');
    await expect(readTextAnyEncoding(Uint8Array.from([0xc3]))).resolves.toBe('decoded:gb18030');
    await expect(readTextAnyEncoding(Uint8Array.from([0xc3, 0x20]))).resolves.toBe('decoded:gb18030');
    await expect(readTextAnyEncoding(Uint8Array.from([0xe4, 0xbd, 0xa0]))).resolves.toBe('decoded:utf-8');
    await expect(readTextAnyEncoding(Uint8Array.from([0xe4, 0xbd]))).resolves.toBe('decoded:gb18030');
    await expect(readTextAnyEncoding(Uint8Array.from([0xe4, 0xbd, 0x20]))).resolves.toBe('decoded:gb18030');
    await expect(readTextAnyEncoding(Uint8Array.from([0xf0, 0x9f, 0x98, 0x80]))).resolves.toBe('decoded:utf-8');
    await expect(readTextAnyEncoding(Uint8Array.from([0xf0, 0x9f, 0x98]))).resolves.toBe('decoded:gb18030');
    await expect(readTextAnyEncoding(Uint8Array.from([0xf0, 0x9f, 0x98, 0x20]))).resolves.toBe('decoded:gb18030');
    await expect(readTextAnyEncoding(Uint8Array.from([0xff]))).resolves.toBe('decoded:gb18030');

    expect(encodings).toEqual([
      'utf-8',
      'utf-8',
      'gb18030',
      'gb18030',
      'utf-8',
      'gb18030',
      'gb18030',
      'utf-8',
      'gb18030',
      'gb18030',
      'gb18030',
    ]);
  });
});
