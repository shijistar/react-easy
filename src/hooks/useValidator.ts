import { useMemo } from 'react';
import type { BuilderOptions } from './useValidatorBuilder';
import useValidatorBuilder from './useValidatorBuilder';

/**
 * - **EN:** Dynamically generate a validation rule, compatible with ant-design rules
 * - **CN:** 动态生成一个校验规则，与 ant-design 的规则兼容
 */
const useValidator = (props: BuilderOptions) => {
  const builder = useValidatorBuilder();
  return useMemo(() => builder(props), [builder, props]);
};

export default useValidator;
