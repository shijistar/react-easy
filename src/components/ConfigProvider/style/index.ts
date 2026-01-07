import { genStyleHooks } from 'antd/es/theme/internal';
import type { AliasToken, GenerateStyle } from 'antd/es/theme/internal';
import type { CSSObject } from '@ant-design/cssinjs';
import type { FullToken } from '@ant-design/cssinjs-utils';

type OverflowTagsToken = FullToken<{ ''?: object }, AliasToken, ''>;

// .full-height-table(@fullHeight:true, @depth: 1) when(@depth <= 2) {
//   /* stylelint-disable-next-line function-no-unknown */
//   height: if((@fullHeight = true), 100%, auto);

//   .@{ant-prefix}-spin-nested-loading {
//     /* stylelint-disable-next-line function-no-unknown */
//     height: if((@fullHeight = true), 100%, auto);

//     .@{ant-prefix}-spin-container {
//       /* stylelint-disable-next-line function-no-unknown */
//       display: if((@fullHeight = true), flex, block);
//       flex-direction: column;
//       /* stylelint-disable-next-line function-no-unknown */
//       height: if((@fullHeight = true), 100%, auto);

//       .@{ant-prefix}-table:not(.@{ant-prefix}-table-empty) {
//         display: flex;
//         flex: auto;
//         flex-direction: column;
//         width: 100%;
//         min-height: 0;

//         .@{ant-prefix}-table-container {
//           flex: auto;
//           min-height: 0;

//           .@{ant-prefix}-table-content {
//             /* stylelint-disable-next-line function-no-unknown */
//             max-height: if((@fullHeight = true), 100%, auto);
//             // 把容器再多撑高1px，否则会始终显示纵向滚动条
//             padding-bottom: 1px;
//             // 自动显示纵向滚动条
//             // stylelint-disable-next-line declaration-no-important
//             overflow: auto !important;

//             & > table {
//               /* stylelint-disable-next-line function-no-unknown */
//               height: if((@fullHeight = true), 100%, auto);

//               .@{ant-prefix}-table-thead {
//                 position: sticky;
//                 top: 0;
//                 z-index: 10;
//               }

//               td {
//                 // 当嵌套表格时，还原所有full-height样式，防止子表格受影响
//                 .full-height-table(false, @depth + 1);
//               }
//             }
//           }
//         }
//       }

//       & > .@{ant-prefix}-table-pagination {
//         flex: none;
//         margin-bottom: 0;
//       }
//     }
//   }
// }

// .full-height-table-container {
//   .@{ant-prefix}-table-wrapper {
//     .full-height-table();
//   }
// }
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

        [`${token.antCls}-spin-nested-loading`]: {
          height: '100%',

          [`${token.antCls}-spin-container`]: {
            display: 'flex',
            flexDirection: 'column',
            height: '100%',

            [`${token.antCls}-table:not(${token.antCls}-table-empty)`]: {
              display: 'flex',
              flex: 'auto',
              flexDirection: 'column',
              width: '100%',
              minHeight: 0,

              [`${token.antCls}-table-container`]: {
                flex: 'auto',
                minHeight: 0,

                [`${token.antCls}-table-content`]: {
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
