import { pickLangDoc } from './doc';

/** Removes the `@example` block (up to the next `@tag` or the end) from a JSDoc description. */
export function stripExampleBlock(input = '') {
  return input.replace(/\n?@example[\s\S]*?(?=\n@\w+|$)/g, '').trim();
}

/** Strips the example block and picks the description matching the current language. */
export function processDescription(content: string | undefined) {
  return pickLangDoc(stripExampleBlock(content ?? ''));
}
