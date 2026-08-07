import type { Langs } from '../../src/locales';
import { getGlobalValueFromUrl } from './global';

export const pickLangDoc = (input = '') => {
  const langFromUrl = getGlobalValueFromUrl('lang');
  const currentLang = langFromUrl === 'zh-CN' ? 'zh-CN' : 'en-US';
  return keepCurrentLangContent(input, currentLang);
};

function keepCurrentLangContent(input = '', lang: Langs = 'en-US') {
  const targetLang = lang === 'zh-CN' ? 'CN' : 'EN';

  // Compatible with JSDoc original text (with *) and plain text extracted by docgen
  const lines = input.split(/\r?\n/).map((line) => line.replace(/^\s*\*\s?/, ''));

  const result: string[] = [];
  let blockLang: 'EN' | 'CN' | null = null;
  let blockLines: string[] = [];

  // Language block: - **EN:** xxx or - **CN:** xxx
  const langHeaderReg = /^-\s*\*\*(EN|CN):\*\*\s*(.*)$/;
  // JSDoc 标签：@param @returns ...
  const jsdocTagReg = /^@\w+/;

  const flushBlock = () => {
    if (blockLang === targetLang) {
      result.push(...blockLines);
    }
    blockLang = null;
    blockLines = [];
  };

  for (const line of lines) {
    const headerMatch = line.match(langHeaderReg);

    if (headerMatch) {
      if (blockLang) {
        flushBlock();
      }
      const [, langFlag, firstContent = ''] = headerMatch;
      blockLang = langFlag as 'EN' | 'CN';
      blockLines = firstContent ? [firstContent] : [];
      continue;
    }

    if (blockLang) {
      // Encounter @param/@returns indicating the end of the language block, tag content should be retained
      if (jsdocTagReg.test(line)) {
        flushBlock();
        result.push(line);
      } else {
        blockLines.push(line);
      }
      continue;
    }

    // Non-internationalized content remains unchanged.
    result.push(line);
  }

  if (blockLang) {
    flushBlock();
  }

  // 压缩多余空行
  return result
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
