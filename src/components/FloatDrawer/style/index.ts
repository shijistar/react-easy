import type { AliasToken, GenerateStyle } from 'antd/es/theme/interface';
import { genStyleHooks } from 'antd/es/theme/util/genStyleUtils';
import type { CSSObject } from '@ant-design/cssinjs';
import type { FullToken } from '@ant-design/cssinjs-utils';
import { FastColor } from '@ant-design/fast-color';
import { getColorLuminance } from '../../../utils';

type REFloatDrawerToken = FullToken<{ ''?: object }, AliasToken, ''>;

const genStyle: GenerateStyle<REFloatDrawerToken> = (token): CSSObject => {
  const { componentCls } = token;
  return {
    [componentCls]: {
      position: 'absolute',
      display: 'flex',
      overflow: 'visible',
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
        // On the left side: the shadow casts to the right
        boxShadow: `2px 0 12px ${new FastColor(token.colorTextBase).setA(0.1).toRgbString()}, 1.5px 0 6px ${new FastColor(token.colorTextBase).setA(0.02).toRgbString()}`,
      },
      [`&${componentCls}-open${componentCls}-right ${componentCls}-drawer`]: {
        // On the right side: the shadow casts to the left
        boxShadow: `-2px 0 12px ${new FastColor(token.colorTextBase).setA(0.1).toRgbString()}, -1.5px 0 6px ${new FastColor(token.colorTextBase).setA(0.02).toRgbString()}`,
      },
      [`&${componentCls}-open${componentCls}-top ${componentCls}-drawer`]: {
        // On the top side: the shadow casts downward
        boxShadow: `0 2px 12px ${new FastColor(token.colorTextBase).setA(0.1).toRgbString()}, 0 1.5px 6px ${new FastColor(token.colorTextBase).setA(0.02).toRgbString()}`,
      },
      [`&${componentCls}-open${componentCls}-bottom ${componentCls}-drawer`]: {
        // On the bottom side: the shadow casts upward
        boxShadow: `0 -2px 12px ${new FastColor(token.colorTextBase).setA(0.1).toRgbString()}, 0 -1.5px 6px ${new FastColor(token.colorTextBase).setA(0.02).toRgbString()}`,
      },
      [`&${componentCls}-closed${componentCls}-left ${componentCls}-drawer`]: {
        transform: 'translateX(calc(-100% - var(--edge-offset, 0px)))',
      },
      [`&${componentCls}-closed${componentCls}-right ${componentCls}-drawer`]: {
        transform: 'translateX(calc(100% + var(--edge-offset, 0px)))',
      },
      [`&${componentCls}-closed${componentCls}-top ${componentCls}-drawer`]: {
        transform: 'translateY(calc(-100% - var(--edge-offset, 0px)))',
      },
      [`&${componentCls}-closed${componentCls}-bottom ${componentCls}-drawer`]: {
        transform: 'translateY(calc(100% + var(--edge-offset, 0px)))',
      },
      [`${componentCls}-toggle`]: {
        position: 'absolute',
        zIndex: 2,
        cursor: 'pointer',
        color: token.colorTextTertiary,
        backgroundColor: getColorLuminance(token.colorBgBase) > 0.5 ? '#fafafa' : '#141414',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'all',
        '&:hover': {
          color: token.colorText,
          backgroundColor: getColorLuminance(token.colorBgBase) > 0.5 ? '#f0f0f0' : '#1a1a1a',
        },
      },
      [`&${componentCls}-left ${componentCls}-toggle,
        &${componentCls}-right ${componentCls}-toggle`]: {
        top: '50%',
        width: 24,
        height: 60,
      },
      [`&${componentCls}-top ${componentCls}-toggle,
        &${componentCls}-bottom ${componentCls}-toggle`]: {
        left: '50%',
        width: 60,
        height: 24,
      },
      [`&${componentCls}-left ${componentCls}-toggle`]: {
        right: 0,
        transform: 'translate(100%, -50%)',
        borderRadius: '0 8px 8px 0',
        // On the left side: the shadow casts to the right and upward/downward in half size
        boxShadow: `0px 2px 4px ${new FastColor(token.colorTextBase).setA(0.08).toRgbString()}, 
        0px -2px 4px ${new FastColor(token.colorTextBase).setA(0.08).toRgbString()}, 
        4px 0px 8px ${new FastColor(token.colorTextBase).setA(0.1).toRgbString()}`,
        '&:hover': {
          boxShadow: `0px 2px 4px ${new FastColor(token.colorTextBase).setA(0.1).toRgbString()}, 
          0px -2px 4px ${new FastColor(token.colorTextBase).setA(0.1).toRgbString()}, 
          4px 0px 8px ${new FastColor(token.colorTextBase).setA(0.12).toRgbString()}`,
        },
      },
      [`&${componentCls}-right ${componentCls}-toggle`]: {
        left: 0,
        transform: 'translate(-100%, -50%)',
        borderRadius: '8px 0 0 8px',
        // On the right side: the shadow casts to the left and upward/downward in half size
        boxShadow: `0px 2px 4px ${new FastColor(token.colorTextBase).setA(0.08).toRgbString()}, 
        0px -2px 4px ${new FastColor(token.colorTextBase).setA(0.08).toRgbString()}, 
        -4px 0px 8px ${new FastColor(token.colorTextBase).setA(0.1).toRgbString()}`,
        '&:hover': {
          boxShadow: `0px 2px 4px ${new FastColor(token.colorTextBase).setA(0.1).toRgbString()}, 
          0px -2px 4px ${new FastColor(token.colorTextBase).setA(0.1).toRgbString()}, 
          -4px 0px 8px ${new FastColor(token.colorTextBase).setA(0.12).toRgbString()}`,
        },
      },
      [`&${componentCls}-top ${componentCls}-toggle`]: {
        bottom: 0,
        transform: 'translate(-50%, 100%)',
        borderRadius: '0 0 8px 8px',
        // On the top side: the shadow casts downward and left/right in half size
        boxShadow: `2px 0px 4px ${new FastColor(token.colorTextBase).setA(0.08).toRgbString()}, 
                   -2px 0px 4px ${new FastColor(token.colorTextBase).setA(0.08).toRgbString()}, 
                   0px 4px 8px ${new FastColor(token.colorTextBase).setA(0.1).toRgbString()}`,
        '&:hover': {
          boxShadow: `2px 0px 4px ${new FastColor(token.colorTextBase).setA(0.1).toRgbString()}, 
                   -2px 0px 4px ${new FastColor(token.colorTextBase).setA(0.1).toRgbString()}, 
                   0px 4px 8px ${new FastColor(token.colorTextBase).setA(0.12).toRgbString()}`,
        },
      },
      [`&${componentCls}-bottom ${componentCls}-toggle`]: {
        top: 0,
        transform: 'translate(-50%, -100%)',
        borderRadius: '8px 8px 0 0',
        // On the bottom side: the shadow casts upward and left/right in half size
        boxShadow: `2px 0px 4px ${new FastColor(token.colorTextBase).setA(0.08).toRgbString()}, 
                   -2px 0px 4px ${new FastColor(token.colorTextBase).setA(0.08).toRgbString()}, 
                   0px -4px 8px ${new FastColor(token.colorTextBase).setA(0.1).toRgbString()}`,
        '&:hover': {
          boxShadow: `2px 0px 4px ${new FastColor(token.colorTextBase).setA(0.1).toRgbString()}, 
                   -2px 0px 4px ${new FastColor(token.colorTextBase).setA(0.1).toRgbString()}, 
                   0px -4px 8px ${new FastColor(token.colorTextBase).setA(0.12).toRgbString()}`,
        },
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

export default genStyleHooks('EasyFloatDrawer' as never, genStyle);
