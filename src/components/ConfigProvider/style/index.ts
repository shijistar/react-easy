import { genStyleHooks } from 'antd/es/theme/internal';
import type { AliasToken, GenerateStyle } from 'antd/es/theme/internal';
import type { CSSObject } from '@ant-design/cssinjs';
import type { FullToken } from '@ant-design/cssinjs-utils';

type OverflowTagsToken = FullToken<{ ''?: object }, AliasToken, ''>;

const genStyle: GenerateStyle<OverflowTagsToken> = (token): CSSObject => {
  const { componentCls } = token;
  return {
    [componentCls]: {
      width: '100%',
      height: '100%',
      flex: 'auto',
      minWidth: 0,
      minHeight: 0,

      '.easy-full-height-table': {
        height: '100%',

        [`& > ${token.antCls}-spin-nested-loading`]: {
          height: '100%',

          [`& > div > ${token.antCls}-spin`]: {
            maxHeight: '100%',
          },

          [`& > ${token.antCls}-spin-container`]: {
            display: 'flex',
            flexDirection: 'column',
            height: '100%',

            [`& > ${token.antCls}-table`]: {
              display: 'flex',
              flex: 'auto',
              flexDirection: 'column',
              width: '100%',
              minHeight: 0,

              [`& > ${token.antCls}-table-container`]: {
                flex: 'auto',
                minHeight: 0,

                [`& > ${token.antCls}-table-content`]: {
                  maxHeight: '100%',
                  // 把容器再多撑高1px，否则会始终显示纵向滚动条
                  paddingBottom: 1,
                  // 自动显示纵向滚动条
                  // stylelint-disable-next-line declaration-no-important
                  overflow: 'auto !important',

                  '& > table': {
                    height: '100%',

                    [`${token.antCls}-table-thead`]: {
                      position: 'sticky',
                      top: 0,
                      zIndex: 10,
                    },

                    td: {
                      // 当嵌套表格时，还原所有full-height样式，防止子表格受影响
                      '.easy-full-height-table': {
                        height: 'auto',
                      },
                    },
                  },
                },
              },
            },
            [`& > ${token.antCls}-table${token.antCls}-table-empty`]: {
              [`& > ${token.antCls}-table-container`]: {
                [`& > ${token.antCls}-table-content`]: {
                  height: '100%',
                },
              },
            },

            [`& > ${token.antCls}-table-pagination`]: {
              flex: 'none',
              marginBottom: 0,
            },
          },
        },
      },
    },
  };
};

export default genStyleHooks('EasyConfigProvider' as never, genStyle);
