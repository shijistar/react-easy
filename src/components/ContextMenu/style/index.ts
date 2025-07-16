import { genStyleHooks } from 'antd/es/theme/internal';
import type { AliasToken, GenerateStyle } from 'antd/es/theme/internal';
import type { CSSObject } from '@ant-design/cssinjs';
import type { FullToken } from '@ant-design/cssinjs-utils';

type OverflowTagsToken = FullToken<{ ''?: object }, AliasToken, ''>;

const genStyle: GenerateStyle<OverflowTagsToken> = (token): CSSObject => {
  const { componentCls } = token;
  return {
    [componentCls]: {
      '&-trigger': {
        width: 'fit-content',
      },
      '&-menu': {
        padding: 0,
        '&-has-items': {
          padding: 'var(--contexify-menu-padding)',
        },
        [`${componentCls}-shortcut-key`]: {
          kbd: {
            fontFamily: '-apple-system,BlinkMacSystemFont,PingFang SC,Hiragino Sans GB,sans-serif',
          },
        },
      },
    },
  };
};

export default genStyleHooks('ContextMenu' as never, genStyle);
