import { genStyleHooks } from 'antd/es/theme/internal';
import type { AliasToken, GenerateStyle } from 'antd/es/theme/internal';
import type { CSSObject } from '@ant-design/cssinjs';
import type { FullToken } from '@ant-design/cssinjs-utils';

type PulseToken = FullToken<
  {
    AnimationPulse?: {
      barMinSize?: string | number;
      barMaxSize?: string | number;
    };
  },
  AliasToken,
  'AnimationPulse'
>;

const genStyle: GenerateStyle<PulseToken> = (token): CSSObject => {
  const { componentCls } = token;
  const componentClsNoPrefix = componentCls.replace(/^\./, '');
  return {
    [componentCls]: {
      display: 'grid',
      alignItems: 'end',
      width: '100%',
      height: '100%',
      inset: 0,
      gap: 4,

      [`${componentCls}-bar`]: {
        width: '100%',
        background: token.colorFillSecondary,
        borderRadius: 4,
        opacity: 0.85,
        animation: `${componentClsNoPrefix} 1.6s ease-in-out infinite`,
        transformOrigin: 'bottom',
      },

      [`@keyframes ${componentClsNoPrefix}`]: {
        '0%': { height: token.AnimationPulse?.barMinSize ?? '10%' },
        '50%': { height: token.AnimationPulse?.barMaxSize ?? '90%' },
        '100%': { height: token.AnimationPulse?.barMinSize ?? '10%' },
      },
    },
  };
};

export default genStyleHooks('AnimationPulse' as never, genStyle);
