import { Buffer as NodeBuffer } from 'node:buffer';
import { describe, expect, it, vi } from 'vitest';
import {
  arrayBufferToBase64,
  base64ToArrayBuffer,
  base64ToString,
  stringToBase64,
} from '../../src/utils/base64';

describe('base64 utils', () => {
  it('encodes and decodes standard and url-safe strings in node-like environments', () => {
    expect(stringToBase64('')).toBe('');
    expect(base64ToString('')).toBe('');

    const encoded = stringToBase64('hello world?');
    const urlSafeEncoded = stringToBase64('hello world?', { urlSafe: true });

    expect(encoded).toBe('aGVsbG8gd29ybGQ/');
    expect(urlSafeEncoded).toBe('aGVsbG8gd29ybGQ_');
    expect(base64ToString(encoded)).toBe('hello world?');
    expect(base64ToString(urlSafeEncoded, { urlSafe: true })).toBe('hello world?');

    const arrayBuffer = Uint8Array.from([0, 1, 2, 255]).buffer;
    const base64 = arrayBufferToBase64(arrayBuffer);

    expect(base64).toBe('AAEC/w==');
    expect(new Uint8Array(base64ToArrayBuffer(base64))).toEqual(new Uint8Array([0, 1, 2, 255]));
    expect(base64ToArrayBuffer('')).toEqual(new ArrayBuffer(0));
  });

  it('uses browser globals when Buffer is unavailable', () => {
    vi.stubGlobal('Buffer', undefined);
    vi.stubGlobal('btoa', (input: string) => NodeBuffer.from(input, 'binary').toString('base64'));
    vi.stubGlobal('atob', (input: string) => NodeBuffer.from(input, 'base64').toString('binary'));

    const arrayBuffer = Uint8Array.from([72, 105]).buffer;

    expect(stringToBase64('Hi')).toBe('SGk=');
    expect(base64ToString('SGk=')).toBe('Hi');
    expect(arrayBufferToBase64(arrayBuffer)).toBe('SGk=');
    expect(new Uint8Array(base64ToArrayBuffer('SGk='))).toEqual(new Uint8Array([72, 105]));
  });

  it('pads browser-generated array-buffer output when btoa omits trailing padding', () => {
    vi.stubGlobal('Buffer', undefined);
    vi.stubGlobal('btoa', () => 'QQ');

    expect(arrayBufferToBase64(Uint8Array.from([65]).buffer)).toBe('QQ==');
  });

  it('normalizes url-safe base64 array buffers', () => {
    const normalized = base64ToArrayBuffer('SGVsbG8_', { urlSafe: true });

    expect(new TextDecoder().decode(normalized)).toBe('Hello?');
  });

  it('restores stripped padding for base64 strings whose lengths mod 4 are 2 or 3', () => {
    expect(base64ToString('TQ')).toBe('M');
    expect(base64ToString('SGk')).toBe('Hi');
    expect(new Uint8Array(base64ToArrayBuffer('TQ'))).toEqual(new Uint8Array([77]));
    expect(new Uint8Array(base64ToArrayBuffer('SGk'))).toEqual(new Uint8Array([72, 105]));
  });

  it('throws on invalid input length and wraps decode errors', () => {
    expect(() => base64ToString('a')).toThrow('Invalid Base64 string length');
    expect(() => base64ToArrayBuffer('a')).toThrow('Invalid Base64 string length');

    vi.stubGlobal('Buffer', {
      from: () => {
        throw new Error('boom');
      },
    });

    expect(() => base64ToString('QQ==')).toThrow('Failed to decode Base64: boom');
    expect(() => base64ToArrayBuffer('QQ==')).toThrow('Failed to decode Base64: boom');
  });
});
