import type { AliasToken, GenerateStyle } from 'antd/es/theme/internal';
import type { CSSObject } from '@ant-design/cssinjs';
import type { FullToken } from '@ant-design/cssinjs-utils';
import genStyleHooksCompitible from '../../../utils/genStyleHooksCompitible';

type OverflowTagsToken = FullToken<{ ''?: object }, AliasToken, ''>;

const genStyle: GenerateStyle<OverflowTagsToken> = (token): CSSObject => {
  const { componentCls } = token;
  return {
    [componentCls]: {
      display: 'flex',
      flexWrap: 'nowrap',
      alignItems: 'center',
      gap: 8,
      width: '100%',
      maxWidth: '100%',
      position: 'relative',
    },
  };
};

export default genStyleHooksCompitible('OverflowTags' as never, genStyle);
