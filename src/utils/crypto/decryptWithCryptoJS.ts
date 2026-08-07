async function decryptWithCryptoJS(encryptedText: string, key: string) {
  const [ivBase64, encryptedBase64] = encryptedText.split(':');

  const [
    { default: Base64 },
    { default: Utf8 },
    {
      default: {
        mode: { CBC },
        lib: { CipherParams },
      },
    },
    { default: Pkcs7 },
    { default: SHA256 },
    {
      default: { decrypt },
    },
    /* v8 ignore start -- Vite browser-mode CJS/ESM interop branches (unreachable) */
  ] = await Promise.all([
    import('crypto-js/enc-base64.js'),
    import('crypto-js/enc-utf8.js'),
    import('crypto-js/core.js'),
    import('crypto-js/pad-pkcs7.js'),
    import('crypto-js/sha256.js'),
    import('crypto-js/aes.js'),
  ]);
  /* v8 ignore stop */

  try {
    // Convert base64 strings to WordArray objects
    const iv = Base64.parse(ivBase64);
    const cipherText = Base64.parse(encryptedBase64);
    // Derive key using SHA-256 (matching native implementation)
    const derivedKey = SHA256(key);
    const decrypted = decrypt(CipherParams.create({ ciphertext: cipherText }), derivedKey, {
      iv,
      mode: CBC,
      padding: Pkcs7,
    });
    return decrypted.toString(Utf8);
  } catch (error) {
    console.error('Decryption error:', error);
    throw error;
  }
}

export default decryptWithCryptoJS;
