import type { PropsWithChildren } from 'react';
import { useMemo } from 'react';
import type { DocsContainerProps } from '@storybook/addon-docs/blocks';
import { Controls, DocsContainer, Markdown, Primary, Subtitle, Title, useOf } from '@storybook/addon-docs/blocks';
import type { ResolvedModuleExportFromType } from 'storybook/internal/types';
import { themes } from 'storybook/theming';
import { processDescription } from './utils/description';
import { getGlobalValueFromUrl } from './utils/global';

/**
 * All `@storybook/addon-docs/blocks` and `storybook/theming` imports live in this module so that
 * they can be code-split away from the preview entry chunk. Only docs view mode pays for them.
 */

export function ThemedDocsContainer({ isDark, ...props }: PropsWithChildren<DocsContainerProps> & { isDark: boolean }) {
  return <DocsContainer {...props} theme={isDark ? themes.dark : themes.light} />;
}

export function DocsPage() {
  const langFromUrl = getGlobalValueFromUrl('lang');
  return (
    <>
      <Title />
      <Subtitle />
      <CustomComponentDescription />
      <h2>{langFromUrl === 'zh-CN' ? '演示' : 'Demo'}</h2>
      <Primary />
      <Controls />
    </>
  );
}

function CustomComponentDescription() {
  const resolvedOfMeta = useOf<'meta'>('meta');
  let resolvedOfComponent: ResolvedModuleExportFromType<'component'> | undefined;
  try {
    // eslint-disable-next-line @tiny-codes/react-hooks/rules-of-hooks
    resolvedOfComponent = useOf<'component'>('component');
  } catch {
    // Ignore error
  }
  const descriptionOfMeta = getDescriptionFromResolvedOf(resolvedOfMeta);
  const descriptionOfComponent = getDescriptionFromResolvedOf(resolvedOfComponent);
  const next = useMemo(() => {
    const description = descriptionOfMeta || descriptionOfComponent || '';
    return processDescription(description);
  }, [descriptionOfMeta, descriptionOfComponent]);

  if (!next) return null;
  return <Markdown>{next}</Markdown>;
}

function getDescriptionFromResolvedOf(resolvedOf: ReturnType<typeof useOf> | undefined): string | null {
  if (!resolvedOf) return null;
  switch (resolvedOf.type) {
    case 'story': {
      return resolvedOf.story.parameters.docs?.description?.story || null;
    }
    case 'meta': {
      const { parameters, component } = resolvedOf.preparedMeta;
      const metaDescription = parameters.docs?.description?.component;
      if (metaDescription) {
        return metaDescription;
      }
      return (
        parameters.docs?.extractComponentDescription?.(component, {
          component,
          parameters,
        }) || null
      );
    }
    case 'component': {
      const {
        component,
        projectAnnotations: { parameters },
      } = resolvedOf;
      return (
        parameters?.docs?.extractComponentDescription?.(component, {
          component,
          parameters,
        }) || null
      );
    }
    default: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      throw new Error(`Unrecognized module type resolved from 'useOf', got: ${(resolvedOf as any).type}`);
    }
  }
}
