import { genStyleHooks } from 'antd/es/theme/internal';
import type { AliasToken, GenerateStyle } from 'antd/es/theme/internal';
import type { CSSObject } from '@ant-design/cssinjs';
import type { FullToken } from '@ant-design/cssinjs-utils';

type OverflowTagsToken = FullToken<{ ''?: object }, AliasToken, ''>;

const genStyle: GenerateStyle<OverflowTagsToken> = (token): CSSObject => {
  const { componentCls } = token;
  return {
    [componentCls]: {
      display: 'flex',
      flexWrap: 'wrap',
      width: '100%',
      maxWidth: '100%',
      position: 'relative',
    },
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default genStyleHooks('re-overflow-tags' as any, genStyle);
