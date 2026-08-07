async function encryptWithCryptoJS(text: string, key: string) {
  const [
    {
      default: {
        mode: { CBC },
        lib: { WordArray },
      },
    },
    { default: Pkcs7 },
    { default: Base64 },
    { default: Utf8 },
    { default: SHA256 },
    {
      default: { encrypt },
    },
    /* v8 ignore start -- Vite browser-mode CJS/ESM interop branches (unreachable) */
  ] = await Promise.all([
    import('crypto-js/core.js'),
    import('crypto-js/pad-pkcs7.js'),
    import('crypto-js/enc-base64.js'),
    import('crypto-js/enc-utf8.js'),
    import('crypto-js/sha256.js'),
    import('crypto-js/aes.js'),
  ]);
  /* v8 ignore stop */

  try {
    // Convert text and key to WordArray objects
    const wordArray = Utf8.parse(text);
    const keyArray = SHA256(key);
    const iv = WordArray.random(16);

    const encryptedBase64 = Base64.stringify(
      encrypt(wordArray, keyArray, {
        iv,
        mode: CBC,
        padding: Pkcs7,
      }).ciphertext,
    );
    return `${Base64.stringify(iv)}:${encryptedBase64}`;
  } catch (error) {
    console.error('Encryption error:', error);
    throw error;
  }
}

export default encryptWithCryptoJS;
