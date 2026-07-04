import type { ReactNode } from 'react';
import type { AliasToken } from 'antd/es/theme/internal';
import { genStyleHooks } from 'antd/es/theme/internal';
import type { CSSInterpolation } from '@ant-design/cssinjs';
import type { FullToken, TokenMap } from '@ant-design/cssinjs-utils';
import type { StyleInfo } from '@ant-design/cssinjs-utils/es/util/genStyleUtils';

const genStyleHooksCompitible = (
  prefixCls: string,
  styleFn?: (token: FullToken<TokenMap, AliasToken, string>, info: StyleInfo) => CSSInterpolation,
): ((
  prefixCls: string,
  rootCls?: string,
) => {
  hashId: string;
  cssVarCls: string;
  wrapCSSVar: (node: ReactNode) => ReactNode;
}) => {
  const useStyle = genStyleHooks(prefixCls as never, styleFn as never);
  return (prefixCls, rootCls) => {
    // @ts-expect-error: because need be compitible with v5 and v6
    let [wrapCSSVar, hashId, cssVarCls] = useStyle(prefixCls, rootCls) as unknown;
    if (typeof wrapCSSVar === 'string') {
      cssVarCls = hashId;
      hashId = wrapCSSVar;
      wrapCSSVar = (node: ReactNode) => node;
    }
    return { wrapCSSVar, hashId, cssVarCls } as never;
  };
};

export default genStyleHooksCompitible;
