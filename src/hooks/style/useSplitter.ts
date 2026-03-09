import { genStyleHooks } from 'antd/es/theme/internal';
import type { AliasToken, GenerateStyle } from 'antd/es/theme/internal';
import type { CSSObject } from '@ant-design/cssinjs';
import type { FullToken } from '@ant-design/cssinjs-utils';

type UseSplitterToken = FullToken<
  {
    EasySplitter?: {
      splitterDefaultWidth?: number;
    };
  },
  AliasToken,
  'EasySplitter'
>;

const genStyle: GenerateStyle<UseSplitterToken> = (token): CSSObject => {
  const { componentCls, EasySplitter: { splitterDefaultWidth = 1 } = {} } = token;
  return {
    [componentCls]: {
      flex: 'none',
      userSelect: 'none',
      [`&${componentCls}-vertical`]: {
        cursor: 'col-resize',
        padding: '0 4px',
        height: '100%',
        [`${componentCls}-handle`]: {
          width: `var(--splitter-width, ${splitterDefaultWidth}px)`,
          height: '100%',
        },
      },
      [`&${componentCls}-horizontal`]: {
        cursor: 'row-resize',
        padding: '4px 0',
        width: '100%',
        [`${componentCls}-handle`]: {
          width: '100%',
          height: `var(--splitter-width, ${splitterDefaultWidth}px)`,
        },
      },
      '&:hover': {
        [`${componentCls}-handle`]: {
          background: token.colorPrimaryActive,
        },
      },
      [`&${componentCls}-dragging`]: {
        [`${componentCls}-handle`]: {
          background: token.colorPrimaryHover,
        },
      },
      [`&${componentCls}-hover`]: {
        [`${componentCls}-handle`]: {
          background: token.colorPrimaryActive,
        },
      },
      [`${componentCls}-handle`]: {
        background: token.colorBorder,
      },
    },
  };
};

export default genStyleHooks('EasySplitter' as never, genStyle);
