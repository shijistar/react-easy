import type { PropsWithChildren } from 'react';
import type { DocsContainerProps } from '@storybook/addon-docs/blocks';
import { DocsContainer } from '@storybook/addon-docs/blocks';
import { themes } from 'storybook/theming';

function ThemedDocsContainer({ isDark, ...props }: PropsWithChildren<DocsContainerProps> & { isDark: boolean }) {
  return <DocsContainer {...props} theme={isDark ? themes.dark : themes.light} />;
}

export default ThemedDocsContainer;
