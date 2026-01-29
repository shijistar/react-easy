import { useMemo } from 'react';
import escape from 'escape-string-regexp';
import useT from './useT';

const nameSeparator = 'validation.rule.buildRule.token.separator';

/**
 * - **EN:** Get a validation rule builder to build validation rules
 * - **CN:** 获取一个校验规则生成器，用来构建校验规则
 */
const useValidatorBuilder = () => {
  const t = useT();
  return useMemo(() => (props: BuilderOptions) => buildRule({ ...props, t }), [t]);
};

/**
 * - **EN:** Build regular expression rules dynamically, compatible with ant-design rules
 * - **CN:** 动态构建正则表达式规则，与 ant-design 的规则兼容
 */
function buildRule(
  options: BuilderOptions & {
    /**
     * - **EN:** Internationalization function
     * - **CN:** 国际化函数
     */
    t: ReturnType<typeof useT>;
  }
): ValidatorRule {
  const { allowed, startsWith, flags, t } = options;
  if (!Object.values(allowed).some((v) => v === true)) {
    throw new Error(t('validation.rule.buildRule.includeMandatory'));
  }

  const symbols: string[] = [];
  const messages: string[] = [];
  symbols.push(`^`);

  //  Process startsWith rules
  if (startsWith) {
    const meta = buildRuleMeta({
      flags: startsWith,
      t,
    });
    symbols.push(`[${meta.symbols.join('')}]`);
    messages.push(
      t('validation.rule.buildRule.startsWithFormat', {
        prefix: meta.messages.join(t(nameSeparator)),
      })
    );
  }

  // Process allowed rules
  {
    const meta = buildRuleMeta({ flags: allowed, t });

    const min = allowed.min ?? 0;
    const max = allowed.max ?? 0; // 0 means unlimited

    // If there is startWith in the regular expression, the limited data amount needs to be reduced by 1
    const cMin = min && startsWith ? min - 1 : min;
    const cMax = max && startsWith ? max - 1 : max;

    symbols.push(`[${meta.symbols.join('')}]{${cMin},${cMax || ''}}`);
    if (meta.messages.length === 0) {
      messages.unshift(``);
    } else if (meta.messages.length === 1) {
      messages.unshift(`${meta.messages.join(t(nameSeparator))}`);
    } else {
      messages.unshift(`${meta.messages.join(t(nameSeparator))}`);
    }
    if (min && max) {
      messages.push(
        t('validation.rule.buildRule.rangeLength', {
          min,
          max,
        })
      );
    } else {
      if (min > 1) {
        messages.push(t('validation.rule.buildRule.minLength', { min }));
      }
      if (max) {
        messages.push(t('validation.rule.buildRule.maxLength', { max }));
      }
    }
  }
  symbols.push(`$`);

  let message = messages.join('');
  if (message.startsWith(t(nameSeparator))) {
    message = message.slice(1);
  }
  return {
    pattern: new RegExp(symbols.join(''), flags),
    message: t('validation.rule.buildRule.messageFormat', { content: message }),
    allowedOptions: allowed,
    startsWithOptions: startsWith,
    flags,
  };
}

function buildRuleMeta(options: { flags: RuleRegExpFlags; t: ReturnType<typeof useT> }): RuleMeta {
  const { flags, t } = options;
  const symbols: string[] = [];
  const messages: string[] = [];
  if (flags.chineseCharacter) {
    // Chinese characters
    symbols.push(`\u4e00-\u9fa5`);
    messages.push(t('validation.rule.buildRule.token.chinese'));
  }
  if (flags.chinesePunctuation) {
    // Chinese punctuation
    symbols.push(`\u3000-\u301e`);
    symbols.push(`\u3021-\u303f`);
    symbols.push(`\uff00-\uffef`);
    messages.push(t('validation.rule.buildRule.token.chinesePunctuation'));
  }
  if (flags.letter) {
    symbols.push(`a-zA-Z`);
    messages.push(t('validation.rule.buildRule.token.letter'));
  } else if (flags.lowerLetter) {
    symbols.push(`a-z`);
    messages.push(t('validation.rule.buildRule.token.lowerLetter'));
  } else if (flags.upperLetter) {
    symbols.push(`A-Z`);
    messages.push(t('validation.rule.buildRule.token.upperLetter'));
  }
  if (flags.number) {
    symbols.push(`0-9`);
    messages.push(t('validation.rule.buildRule.token.number'));
  }
  const excludeSpecials: string[] = [];
  if (flags.hyphen) {
    symbols.push(`\\-`);
    messages.push(`-`);
    excludeSpecials.push('-');
  }
  if (flags.underscore) {
    symbols.push(`_`);
    messages.push(`_`);
    excludeSpecials.push('_');
  }
  if (flags.special) {
    const specials = flags.special.filter((v) => !excludeSpecials.includes(v));
    symbols.push(escape(specials.join('')));
    messages.push(
      t('validation.rule.buildRule.token.specialChars', {
        value: specials.join(t('validation.rule.buildRule.token.delimiter')),
      })
    );
  }
  return {
    symbols,
    messages,
  };
}

export interface BuilderOptions {
  /**
   * - **EN:** The rule of allowed characters
   * - **CN:** 允许字符的规则
   */
  allowed: RuleRegExpFlags;
  /**
   * - **EN:** The rule of the starting character
   * - **CN:** 开头字符的规则
   */
  startsWith?: Omit<RuleRegExpFlags, 'min' | 'max'>;
  /**
   * - **EN:** Regular expression flags
   * - **CN:** 正则表达式的标志
   */
  flags?: string;
}

export interface RuleRegExpFlags {
  /**
   * - **EN:** Include lowercase and uppercase Latin characters. If set to true, `lowerLetter` and
   *   `upperLetter` option are not effective
   * - **CN:**: 包含大小写拉丁字符。如果设置为true，则`lowerLetter`和`upperLetter`属性不生效
   */

  letter?: boolean;
  /**
   * - **EN:** Include lowercase English letters
   * - **CN:**: 包含小写英文字符
   */
  lowerLetter?: boolean;
  /**
   * - **EN:** Include uppercase English letters
   * - **CN:**: 包含大写英文字符
   */
  upperLetter?: boolean;
  /**
   * - **EN:** Include Chinese characters
   * - **CN:** 包含中文字符
   */
  chineseCharacter?: boolean;
  /**
   * - **EN:** Include Chinese (full-width) punctuation
   * - **CN:** 包含中文（全角）标点符号
   */
  chinesePunctuation?: boolean;
  /**
   * - **EN:** Include numbers
   * - **CN:** 包含数字
   */
  number?: boolean;
  /**
   * - **EN:** Include hyphens (-)
   * - **CN:** 包含连字符(-)
   */
  hyphen?: boolean;
  /**
   * - **EN:** Include underscores (_)
   * - **CN:** 包含下划线(_)
   */
  underscore?: boolean;
  /**
   * - **EN:** Include specified special characters
   * - **CN:** 包含指定的特殊字符
   */
  special?: string[];
  /**
   * - **EN:** Minimum number of characters
   * - **CN:** 最小字符数量
   *
   * @default 1
   */
  min?: number;
  /**
   * - **EN:** Maximum number of characters
   * - **CN:** 最大字符数量
   */
  max?: number;
}

export type StartsWithRegExpFlags = RuleRegExpFlags;

export interface ValidatorRule extends Validator {
  /**
   * - **EN:** The options of allowed characters
   * - **CN:** 允许字符的规则设置
   */
  allowedOptions: RuleRegExpFlags;
  /**
   * - **EN:** The options of the starting character
   * - **CN:** 开头字符的规则设置
   */
  startsWithOptions?: StartsWithRegExpFlags;
  /**
   * - **EN:** Regular expression flags
   * - **CN:** 正则表达式的标志
   */
  flags?: string;
}

interface RuleMeta {
  symbols: string[];
  messages: string[];
}

export interface Validator {
  /**
   * - **EN:** Regular expression for verification
   * - **CN:** 校验正则表达式
   */
  pattern: RegExp;
  /**
   * - **EN:** Prompt message when verification fails
   * - **CN:** 校验失败时的提示信息
   */
  message: string;
}

export default useValidatorBuilder;
