import { genStyleHooks } from 'antd/es/theme/internal';
import type { AliasToken, GenerateStyle } from 'antd/es/theme/internal';
import type { CSSObject } from '@ant-design/cssinjs';
import type { FullToken } from '@ant-design/cssinjs-utils';

type REFloatDrawerToken = FullToken<{ ''?: object }, AliasToken, ''>;

const genStyle: GenerateStyle<REFloatDrawerToken> = (token): CSSObject => {
  const { componentCls } = token;
  return {
    [componentCls]: {
      position: 'absolute',
      display: 'flex',
      overflow: 'visible',
      zIndex: token.zIndexPopupBase,
      ['&-left']: {
        left: 0,
        top: 0,
        bottom: 0,
      },
      ['&-right']: {
        right: 0,
        top: 0,
        bottom: 0,
      },
      ['&-top']: {
        left: 0,
        right: 0,
        top: 0,
      },
      ['&-bottom']: {
        left: 0,
        right: 0,
        bottom: 0,
      },

      [`&${componentCls}-open`]: {
        // visibility: 'visible',
      },
      [`&${componentCls}-closed`]: {
        pointerEvents: 'none',
      },
      [`${componentCls}-drawer`]: {
        transition: 'transform 0.3s ease-in-out',
        overflow: 'visible',
      },
      [`&${componentCls}-left ${componentCls}-drawer,
        &${componentCls}-right ${componentCls}-drawer`]: {
        height: '100%',
      },
      [`&${componentCls}-top ${componentCls}-drawer,
        &${componentCls}-bottom ${componentCls}-drawer`]: {
        width: '100%',
      },
      [`&${componentCls}-open${componentCls}-left ${componentCls}-drawer,
        &${componentCls}-open${componentCls}-right ${componentCls}-drawer,
        &${componentCls}-open${componentCls}-top ${componentCls}-drawer,
        &${componentCls}-open${componentCls}-bottom ${componentCls}-drawer`]: {
        transform: 'translate(0, 0)',
      },
      [`&${componentCls}-open${componentCls}-left ${componentCls}-drawer`]: {
        boxShadow: `2px 0 10px ${token.colorFill}`,
      },
      [`&${componentCls}-open${componentCls}-right ${componentCls}-drawer`]: {
        boxShadow: `-2px 0 10px ${token.colorFill}`,
      },
      [`&${componentCls}-open${componentCls}-top ${componentCls}-drawer`]: {
        boxShadow: `0 2px 10px ${token.colorFill}`,
      },
      [`&${componentCls}-open${componentCls}-bottom ${componentCls}-drawer`]: {
        boxShadow: `0 -2px 10px ${token.colorFill}`,
      },
      [`&${componentCls}-closed${componentCls}-left ${componentCls}-drawer`]: {
        transform: 'translateX(-100%)',
      },
      [`&${componentCls}-closed${componentCls}-right ${componentCls}-drawer`]: {
        transform: 'translateX(100%)',
      },
      [`&${componentCls}-closed${componentCls}-top ${componentCls}-drawer`]: {
        transform: 'translateY(-100%)',
      },
      [`&${componentCls}-closed${componentCls}-bottom ${componentCls}-drawer`]: {
        transform: 'translateY(100%)',
      },
      [`${componentCls}-expand-handle`]: {
        position: 'absolute',
        zIndex: 2,
        cursor: 'pointer',
        color: token.colorTextTertiary,
        backgroundColor: isLightColor(token.colorBgBase) ? '#fafafa' : '#141414',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'all',
        '&:hover': {
          color: token.colorText,
          backgroundColor: isLightColor(token.colorBgBase) ? '#f0f0f0' : '#1a1a1a',
        },
      },
      [`&${componentCls}-left ${componentCls}-expand-handle,
        &${componentCls}-right ${componentCls}-expand-handle`]: {
        top: '50%',
        width: 24,
        height: 60,
      },
      [`&${componentCls}-top ${componentCls}-expand-handle,
        &${componentCls}-bottom ${componentCls}-expand-handle`]: {
        left: '50%',
        width: 60,
        height: 24,
      },
      [`&${componentCls}-left ${componentCls}-expand-handle`]: {
        right: 0,
        transform: 'translate(100%, -50%)',
        borderRadius: '0 8px 8px 0',
        boxShadow: `2px 0 5px ${token.colorFill}`,
      },
      [`&${componentCls}-right ${componentCls}-expand-handle`]: {
        left: 0,
        transform: 'translate(-100%, -50%)',
        borderRadius: '8px 0 0 8px',
        boxShadow: `-2px 0 5px ${token.colorFill}`,
      },
      [`&${componentCls}-top ${componentCls}-expand-handle`]: {
        bottom: 0,
        transform: 'translate(-50%, 100%)',
        borderRadius: '0 0 8px 8px',
        boxShadow: `0 2px 5px ${token.colorFill}`,
      },
      [`&${componentCls}-bottom ${componentCls}-expand-handle`]: {
        top: 0,
        transform: 'translate(-50%, -100%)',
        borderRadius: '8px 8px 0 0',
        boxShadow: `0 -2px 5px ${token.colorFill}`,
      },
      [`${componentCls}-handle-icon`]: {
        userSelect: 'none',
        lineHeight: 0,
      },
      [`${componentCls}-resize-handle`]: {
        position: 'absolute',
        border: `1px solid transparent`,
        zIndex: 1,
        backgroundColor: token.colorBgTextHover,
        '&:hover': {
          backgroundColor: token.colorBgTextActive,
        },
        '&&-dragging': {
          backgroundColor: token.colorBgTextActive,
        },
      },
      [`&${componentCls}-left ${componentCls}-resize-handle`]: {
        right: 0,
        width: 1,
        height: '100%',
        cursor: 'col-resize',
      },
      [`&${componentCls}-right ${componentCls}-resize-handle`]: {
        left: 0,
        width: 1,
        height: '100%',
        cursor: 'col-resize',
      },
      [`&${componentCls}-top ${componentCls}-resize-handle`]: {
        bottom: 0,
        height: 1,
        width: '100%',
        cursor: 'row-resize',
      },
      [`&${componentCls}-bottom ${componentCls}-resize-handle`]: {
        top: 0,
        height: 1,
        width: '100%',
        cursor: 'row-resize',
      },
      [`${componentCls}-content`]: {
        height: '100%',
        [`${componentCls}-card`]: {
          display: 'flex',
          flexDirection: 'column',
          height: '100%',

          [`${token.antCls}-card-body`]: {
            flex: 1,
            minHeight: 0,
            overflow: 'auto',
          },
        },
      },
    },
  };
};

function isLightColor(color: string): boolean {
  let r = 0,
    g = 0,
    b = 0;

  if (color.startsWith('#')) {
    let hex = color.substring(1);
    if (hex.length === 3) {
      hex = hex
        .split('')
        .map((c) => c + c)
        .join('');
    }
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  } else if (color.startsWith('rgb')) {
    const values = color.match(/\d+/g)?.map(Number) || [];
    [r, g, b] = values;
  }
  r = r / 255;
  g = g / 255;
  b = b / 255;

  r = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  g = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  b = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

  return luminance > 0.5;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default genStyleHooks('re-float-drawer' as any, genStyle);
