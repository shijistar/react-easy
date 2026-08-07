import type { AliasToken, GenerateStyle } from 'antd/es/theme/internal';
import type { CSSObject } from '@ant-design/cssinjs';
import type { FullToken } from '@ant-design/cssinjs-utils';
import { genStyleHooksCompitible } from '../../../utils/internal';

type ConfigProviderToken = FullToken<{ ''?: object }, AliasToken, ''>;

const genStyle: GenerateStyle<ConfigProviderToken> = (token): CSSObject => {
  const { componentCls, antCls, iconCls } = token;
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
                  // Raise the container by 1px more, otherwise a vertical scrollbar will always be displayed.
                  paddingBottom: 1,
                  // Automatically show vertical scroll bar
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
                      // When nesting tables, restore all full height styles to prevent the child table from being affected
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
              [`& ${token.antCls}-pagination-prev ${token.antCls}-pagination-item-link, & ${token.antCls}-pagination-next ${token.antCls}-pagination-item-link`]:
                {
                  lineHeight: 1,
                },
            },
          },
        },
      },
      '.easy-full-height-table-v6': {
        height: '100%',
        [`& > ${token.antCls}-spin`]: {
          height: '100%',
          [`& > ${token.antCls}-spin-container`]: {
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            [`& > ${token.antCls}-table`]: {
              flex: 1,
              minHeight: 0,
              [`& > ${token.antCls}-table-container`]: {
                height: '100%',
                [`& > ${token.antCls}-table-content`]: {
                  height: '100%',
                  // Raise the container by 1px more, otherwise a vertical scrollbar will always be displayed.
                  // paddingBottom: 1,
                  // Automatically show vertical scroll bar
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
                      // When nesting tables, restore all full height styles to prevent the child table from being affected
                      '.easy-full-height-table-v6': {
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
              // [`& ${token.antCls}-pagination-prev ${token.antCls}-pagination-item-link, & ${token.antCls}-pagination-next ${token.antCls}-pagination-item-link`]:
              //   {
              //     lineHeight: 1,
              //   },
            },
          },
        },
      },
    },

    [`${antCls}-react-easy.easy-confirm-root-color-info`]: {
      [`${antCls}-modal-confirm-body > ${iconCls}`]: {
        color: token.colorInfo,
      },
    },
    [`${antCls}-react-easy.easy-confirm-root-color-primary`]: {
      [`${antCls}-modal-confirm-body > ${iconCls}`]: {
        color: token.colorPrimary,
      },
    },
    [`${antCls}-react-easy.easy-confirm-root-color-success`]: {
      [`${antCls}-modal-confirm-body > ${iconCls}`]: {
        color: token.colorSuccess,
      },
    },
    [`${antCls}-react-easy.easy-confirm-root-color-error`]: {
      [`${antCls}-modal-confirm-body > ${iconCls}`]: {
        color: token.colorError,
      },
    },
    [`${antCls}-react-easy.easy-confirm-root-color-danger`]: {
      [`${antCls}-modal-confirm-body > ${iconCls}`]: {
        color: token.colorError,
      },
    },
    [`${antCls}-react-easy.easy-confirm-root-color-warn`]: {
      [`${antCls}-modal-confirm-body > ${iconCls}`]: {
        color: token.colorWarning,
      },
    },
    [`${antCls}-react-easy.easy-confirm-root-color-warning`]: {
      [`${antCls}-modal-confirm-body > ${iconCls}`]: {
        color: token.colorWarning,
      },
    },
    [`${antCls}-react-easy.easy-confirm-root-color-secondary`]: {
      [`${antCls}-modal-confirm-body > ${iconCls}`]: {
        color: token.colorTextSecondary,
      },
    },
  };
};

export default genStyleHooksCompitible('ConfigProvider' as never, genStyle);
