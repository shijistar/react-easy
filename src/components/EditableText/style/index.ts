import { genStyleHooks } from 'antd/es/theme/internal';
import type { AliasToken, GenerateStyle } from 'antd/es/theme/internal';
import type { CSSObject } from '@ant-design/cssinjs';
import type { FullToken } from '@ant-design/cssinjs-utils';

type EditableTextToken = FullToken<{ ''?: object }, AliasToken, ''>;

const genStyle: GenerateStyle<EditableTextToken> = (token): CSSObject => {
  const { componentCls, antCls, iconCls } = token;
  return {
    [componentCls]: {
      width: '100%',
      lineHeight: 1,

      [`${componentCls}-view-mode`]: {
        display: 'inline-flex',
        width: 'auto',
        maxWidth: '100%',
        columnGap: 8,
        '&-block': {
          display: 'flex',
        },

        [`${componentCls}-text-content`]: {
          flex: 'auto',
          minWidth: 0,
        },

        [`${componentCls}-edit-icon`]: {
          display: 'inline-flex',
          alignItems: 'center',
          flex: 'none',
          color: token.colorTextSecondary,
          fontSize: token.fontSize,
          // lineHeight: token.lineHeight,
          // height: token.fontSize * token.lineHeight, // The height of the button should match the line height of the text, so that when the button is at the bottom, it aligns with the text baseline
          cursor: 'pointer',
          '&:hover': {
            color: token.colorPrimary,
          },
        },
        // '&.${componentCls}-has-children': {
        //   '.edit-icon': {
        //     lineHeight: 0,
        //     height: 'auto', // When custom children are used, the height of the edit button should adapt automatically, rather than being set according to the Typography line height
        //   },
        // },
      },

      [`${componentCls}-edit-mode`]: {
        width: '100%',

        [`${componentCls}-form`]: {
          display: 'flex',
          [`${antCls}-form`]: {
            display: 'flex',
            flexWrap: 'nowrap',
            width: '100%',

            [`${antCls}-form-item`]: {
              [`&${antCls}-form-item-block`]: {
                flex: 1,
              },
              [`input${antCls}-input`]: {
                minWidth: 100,
                transition: 'all 0.2s, width 0s',
              },
              [`textarea${antCls}-input`]: {
                minWidth: 100,
                transition: 'all 0.2s, width 0s',
              },
            },
            [`${componentCls}-form-btns`]: {
              flex: 'none',
              lineHeight: 0,

              [`${componentCls}-form-btn`]: {
                width: 20,
                height: 20,
                padding: 0,
                fontSize: 20,
                lineHeight: 1,

                [iconCls]: {
                  fontSize: 20,
                },

                [`&${componentCls}-form-btn-save:not(:disabled)`]: {
                  color: token.colorSuccess,

                  '&:hover': {
                    color: token.colorSuccessActive,
                  },
                },

                [`&${componentCls}-form-btn-close:not(:disabled)`]: {
                  color: token.colorError,

                  '&:hover': {
                    color: token.colorErrorActive,
                  },
                },
              },
            },
          },
        },
      },
    },
  };
};

export default genStyleHooks('EasyEditableText' as never, genStyle);
