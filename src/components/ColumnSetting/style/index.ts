import { genStyleHooks } from 'antd/es/theme/internal';
import type { AliasToken, GenerateStyle } from 'antd/es/theme/internal';
import type { CSSObject } from '@ant-design/cssinjs';
import type { FullToken } from '@ant-design/cssinjs-utils';

type ColumnSettingToken = FullToken<{ ''?: object }, AliasToken, ''>;

const genStyle: GenerateStyle<ColumnSettingToken> = (token): CSSObject => {
  const { componentCls } = token;
  return {
    [`${componentCls}-dropdown`]: {
      [`${componentCls}-popup`]: {
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        padding: '12px 16px',
        borderRadius: token.borderRadiusLG,
        boxShadow: token.boxShadow,
        width: 260,
        maxHeight: 500,
        background: token.colorBgContainer,

        [`${componentCls}-popup-title`]: {
          marginBottom: 4,
          fontWeight: '600',
        },

        [`${componentCls}-column-list`]: {
          width: '100%',
          overflow: 'auto',
          flex: 'auto',
          minInlineSize: 0,
          padding: '0 8px',

          [`${componentCls}-column-item`]: {
            [`${componentCls}-column-item-title`]: {
              wordBreak: 'break-all',
            },
          },
        },

        [`& ${componentCls}-divider`]: {
          margin: 0,
        },

        [`${componentCls}-footer`]: {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 12,
        },
      },
    },
    [`${componentCls}-trigger`]: {},
  };
};

export default genStyleHooks('ColumnSetting' as never, genStyle);
