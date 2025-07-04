import { useMemo } from 'react';
import useRefFunction from './useRefFunction';
import useT from './useT';
import useValidatorBuilder, { type Validator, type ValidatorRule } from './useValidatorBuilder';

/**
 * - **EN:** Get built-in validation rules, used to verify common data formats, compatible with
 *   ant-design rules
 * - **CN:** 获取内置的校验规则，用于校验常见的数据格式，与 ant-design 的规则兼容
 */
const useValidators = (): ValidatorRuleMap => {
  const t = useT();
  const build = useValidatorBuilder();

  const codeWithMax = useRefFunction((max?: number) =>
    build({
      allowed: { letter: true, number: true, underscore: true, max },
      startsWith: { letter: true },
    })
  );
  const nameWithMax = useRefFunction((max?: number) =>
    build({
      allowed: { letter: true, number: true, hyphen: true, underscore: true, chineseCharacter: true, max },
      startsWith: { chineseCharacter: true, letter: true },
    })
  );
  const strongNameWithMax = useRefFunction((max?: number) =>
    build({
      allowed: { letter: true, number: true, hyphen: true, underscore: true, chineseCharacter: true, max },
      startsWith: { chineseCharacter: true, letter: true },
    })
  );

  return useMemo<ValidatorRuleMap>(
    () => ({
      number: {
        pattern: /^\d+$/,
        message: t('validation.rule.number.message'),
      },
      floatNumber: {
        pattern: /^-?\d+(\.\d+)?$/,
        message: t('validation.rule.floatNumber.message'),
      },
      email: {
        pattern: /^[A-Za-z0-9_\u4e00-\u9fa5-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/,
        message: t('validation.rule.email.message'),
      },
      ip: {
        pattern: /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
        message: t('validation.rule.ip.message'),
      },
      cnMobile: {
        pattern: /^(?:\+86\s*)?1[23456789]\d{9}$/,
        message: t('validation.rule.mobile.message'),
      },
      password: {
        pattern:
          /^(?![\d]+$)(?![a-z]+$)(?![A-Z]+$)(?![!@#$%^&*~()-+`_=|\\{};:'"/,.<>?]+$)[\da-zA-z!@#$%^&*~()-+`_=|\\{};:'"/,.<>?]{8,16}$/,
        message: 'validation.rule.password.message',
      },

      code: codeWithMax(undefined),
      codeMax20: codeWithMax(20),
      codeMax64: codeWithMax(64),
      codeMax128: codeWithMax(128),
      codeWithMax,

      name: nameWithMax(undefined),
      nameMax20: nameWithMax(20),
      nameMax64: nameWithMax(64),
      nameMax128: nameWithMax(128),
      nameWithMax,

      strongName: strongNameWithMax(undefined),
      strongNameMax64: strongNameWithMax(64),
      strongNameMax128: strongNameWithMax(128),
      strongNameWithMax,
    }),
    [codeWithMax, nameWithMax, strongNameWithMax, t]
  );
};

export interface ValidatorRuleMap {
  /**
   * - **EN:** Number
   * - **CN:** 数字
   */
  number: Validator;
  /**
   * - **EN:** Floating point number
   * - **CN:** 浮点数
   */
  floatNumber: Validator;
  /**
   * - **EN:** Email address regular expression (supports Chinese names)
   * - **CN:** 邮箱正则表达式（支持中文名称）
   */
  email: Validator;
  /**
   * - **EN:** IP address regular expression
   * - **CN:** ip地址正则表达式
   */
  ip: Validator;
  /**
   * - **EN:** Chine mobile phone number regular expression. If this rule does not meet the
   *   requirements, please use the `useValidator` method to customize the rule.
   * - **CN:** 中国手机号正则表达式。如果这个规则不满足需求，请使用 `useValidator` 方法自定义规则。
   */
  cnMobile: Validator;
  /**
   * - **EN:** Default password verification rule: 8-16 digit password, at least two of numbers,
   *   letters, and symbols. If this rule does not meet the requirements, please use the
   *   `useValidator` method to customize the rule.
   * - **CN:** 默认密码验证规则：8-16位密码，数字、字母、符号至少包含两种。如果这个规则不满足需求，请使用 `useValidator` 方法自定义规则。
   */
  password: Validator;

  /**
   * - **EN:** Used to verify the code rule: letters, numbers, _, starting with a letter, no limit on
   *   the number of characters
   * - **CN:** 用于校验编码的规则：字母、数字、_，以字母开头，不限制字符数量
   */
  code: ValidatorRule;
  /**
   * - **EN:** Used to verify the code rule: letters, numbers, _, starting with a letter, up to 20
   *   characters
   * - **CN:** 用于校验编码的规则：字母、数字、_，以字母开头，最多20个字符
   */
  codeMax20: ValidatorRule;
  /**
   * - **EN:** Used to verify the code rule: letters, numbers, _, starting with a letter, up to 64
   *   characters
   * - **CN:** 用于校验编码的规则：字母、数字、_，以字母开头，最多64个字符
   */
  codeMax64: ValidatorRule;
  /**
   * - **EN:** Used to verify the code rule: letters, numbers, _, starting with a letter, up to 128
   *   characters
   * - **CN:** 用于校验编码的规则：字母、数字、_，以字母开头，最多128个字符
   */
  codeMax128: ValidatorRule;
  /**
   * - **EN:** Used to verify the code rule: letters, numbers, _, starting with a letter, up to {max}
   *   characters
   * - **CN:** 用于校验名称的规则，可以自定义最大字符数：字母、汉字、数字、-、_，以汉字、字母开头，{max}字符以内
   */
  codeWithMax: (max?: number) => ValidatorRule;

  /**
   * - **EN:** Used to verify the name rule: letters, Chinese characters, numbers, -, _, up to 20
   *   characters
   * - **CN:** 用于校验名称的规则：字母、汉字、数字、-、_，最多20个字符，
   */
  name: ValidatorRule;
  /**
   * - **EN:** Used to verify the name rule: letters, Chinese characters, numbers, -, _, up to 64
   * - **CN:** 用于校验名称的规则：字母、汉字、数字、-、_，不限制字符数量
   */
  nameMax20: ValidatorRule;
  /**
   * - **EN:** Used to verify the name rule: letters, Chinese characters, numbers, -, _, up to 64
   *   characters
   * - **CN:** 用于校验名称的规则：字母、汉字、数字、-、_，最多64个字符
   */
  nameMax64: ValidatorRule;
  /**
   * - **EN:** Used to verify the name rule: letters, Chinese characters, numbers, -, _, up to 128
   *   characters
   * - **CN:** 用于校验名称的规则：字母、汉字、数字、-、_，最多128个字符
   */
  nameMax128: ValidatorRule;
  /**
   * - **EN:** Used to verify the name rule: letters, Chinese characters, numbers, -, _, up to {max}
   *   characters
   * - **CN:** 用于校验名称的规则，可以自定义最大字符数：字母、汉字、数字、-、_，以汉字、字母开头，{max}字符以内
   */
  nameWithMax: (max?: number) => ValidatorRule;

  /**
   * - **EN:** Used to verify the name rule, but it needs to start with Chinese characters or letters:
   *   letters, Chinese characters, numbers, -, _, starting with Chinese characters or letters
   * - **CN:** 用于校验名称的规则，但需要以汉字或字母开头：字母、汉字、数字、-、_，以汉字、字母开头
   */
  strongName: ValidatorRule;
  /**
   * - **EN:** Used to verify the name rule, but it needs to start with Chinese characters or letters:
   *   letters, Chinese characters, numbers, -, _, starting with Chinese characters or letters, up
   *   to 64 characters
   * - **CN:** 用于校验名称的规则，但需要以汉字或字母开头：字母、汉字、数字、-、_，以汉字、字母开头，最多64个字符
   */
  strongNameMax64: ValidatorRule;
  /**
   * - **EN:** Used to verify the name rule, but it needs to start with Chinese characters or letters:
   *   letters, Chinese characters, numbers, -, _, starting with Chinese characters or letters, up
   *   to 128 characters
   * - **CN:** 用于校验名称的规则，但需要以汉字或字母开头：字母、汉字、数字、-、_，以汉字、字母开头，最多128个字符
   */
  strongNameMax128: ValidatorRule;
  /**
   * - **EN:** Used to verify the name rule, but it needs to start with Chinese characters or letters:
   *   letters, Chinese characters, numbers, -, _, starting with Chinese characters or letters, up
   *   to {max} characters
   * - **CN:** 用于校验名称的规则，但需要以汉字或字母开头：字母、汉字、数字、-、_，以汉字、字母开头，{max}字符以内
   */
  strongNameWithMax: (max?: number) => ValidatorRule;
}

export default useValidators;
