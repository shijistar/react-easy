/**
 * - EN: Generate a random string of alphanumeric characters.
 * - CN: 生成一个随机的字母数字字符串。
 *
 * @param length Length of the random string | 随机字符串的长度
 */
export function randomChars(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * - EN: Read text from a Blob or Uint8Array with automatic encoding detection.
 * - CN: 从 Blob 或 Uint8Array 中读取文本，并自动检测编码。
 *
 * @param blob Blob or Uint8Array | Blob 或 Uint8Array
 */
export async function readTextAnyEncoding(blob: Blob | ArrayBuffer | Uint8Array | undefined): Promise<string> {
  if (!blob) return '';
  let bytes: Uint8Array | undefined;
  if (blob instanceof Blob) {
    const buffer = await blob.arrayBuffer();
    bytes = new Uint8Array(buffer);
  } else if (blob instanceof ArrayBuffer) {
    bytes = new Uint8Array(blob);
  } else {
    bytes = blob;
  }

  const encoding = detectTextEncoding(bytes);
  return new TextDecoder(encoding).decode(bytes);
}

function detectBomEncoding(bytes: Uint8Array): string | undefined {
  if (bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    return 'utf-8';
  }
  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) {
    return 'utf-16le';
  }
  if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
    return 'utf-16be';
  }
  return undefined;
}

function isValidUtf8(bytes: Uint8Array): boolean {
  let index = 0;

  while (index < bytes.length) {
    const current = bytes[index];

    if ((current & 0x80) === 0) {
      index += 1;
      continue;
    }

    if ((current & 0xe0) === 0xc0) {
      if (index + 1 >= bytes.length) return false;
      if ((bytes[index + 1] & 0xc0) !== 0x80) return false;
      index += 2;
      continue;
    }

    if ((current & 0xf0) === 0xe0) {
      if (index + 2 >= bytes.length) return false;
      if ((bytes[index + 1] & 0xc0) !== 0x80 || (bytes[index + 2] & 0xc0) !== 0x80) return false;
      index += 3;
      continue;
    }

    if ((current & 0xf8) === 0xf0) {
      if (index + 3 >= bytes.length) return false;
      if (
        (bytes[index + 1] & 0xc0) !== 0x80 ||
        (bytes[index + 2] & 0xc0) !== 0x80 ||
        (bytes[index + 3] & 0xc0) !== 0x80
      ) {
        return false;
      }
      index += 4;
      continue;
    }

    return false;
  }

  return true;
}

function detectTextEncoding(bytes: Uint8Array): string {
  const bomEncoding = detectBomEncoding(bytes);
  if (bomEncoding) {
    return bomEncoding;
  }

  if (isValidUtf8(bytes)) {
    return 'utf-8';
  }

  return 'gb18030';
}
