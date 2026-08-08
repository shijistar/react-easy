import type { PropsWithChildren } from 'react';
import { useMemo } from 'react';
import type { DocsContainerProps } from '@storybook/addon-docs/blocks';
import { Controls, DocsContainer, Markdown, Primary, Subtitle, Title, useOf } from '@storybook/addon-docs/blocks';
import LinkTo from '@storybook/addon-links/react';
import type { ResolvedModuleExportFromType } from 'storybook/internal/types';
import { themes } from 'storybook/theming';
import { Flex } from 'antd';
import { useStoryT } from './locales';
import { processDescription } from './utils/description';

/**
 * All `@storybook/addon-docs/blocks` and `storybook/theming` imports live in this module so that
 * they can be code-split away from the preview entry chunk. Only docs view mode pays for them.
 */

export function ThemedDocsContainer({ isDark, ...props }: PropsWithChildren<DocsContainerProps> & { isDark: boolean }) {
  return <DocsContainer {...props} theme={isDark ? themes.dark : themes.light} />;
}

export function DocsPage() {
  const t = useStoryT();
  const currentStory = useMemo(() => {
    const path = new URLSearchParams(top?.location.search).get('path');
    const matches = path?.match(/\/docs\/(components|hooks|utils)-(\w+?)--api/);
    if (matches && matches.length > 2) {
      return `./stories/${matches[1]}/${matches[2]}/index.stories.tsx`;
    }
    return null;
  }, []);
  const componentPaths = Object.keys(import.meta.glob(`./stories/components/*/index.stories.tsx`));
  const hookPaths = Object.keys(import.meta.glob(`./stories/hooks/*/index.stories.tsx`));
  const utilPaths = Object.keys(import.meta.glob(`./stories/utils/*/index.stories.tsx`));
  const allStories = [...componentPaths, ...hookPaths, ...utilPaths].map((path) => {
    const parts = path.split('/');
    return {
      path: path.toLowerCase(),
      name: parts[3],
      url: `${parts[2]}/${parts[3]}`,
    };
  });
  const index = allStories.findIndex((story) => story.path === currentStory);
  if (index === -1) {
    throw new Error(`Current story not found: ${currentStory}`);
  }

  return (
    <>
      <Title />
      <Subtitle />
      <CustomComponentDescription />
      <h2>{t('storybook.stories.demo')}</h2>
      <Primary />
      <Controls />
      <Flex justify="space-between">
        <p>{t('storybook.stories.nav.previous')}</p>
        <p>{t('storybook.stories.nav.next')}</p>
      </Flex>
      <Flex justify="space-between">
        {index > 0 ? (
          // <a href={allStories[index - 1].url} style={{ fontSize: 18, fontWeight: 600 }}>
          //   ← {allStories[index - 1].name}
          // </a>
          // @ts-expect-error: because style props exists but not exposed
          <LinkTo kind={allStories[index - 1].url} story="api" style={{ fontSize: 18, fontWeight: 600 }}>
            ← {allStories[index - 1].name}
          </LinkTo>
        ) : (
          // @ts-expect-error: because style props exists but not exposed
          <LinkTo kind="get-started" story="api" style={{ fontSize: 18, fontWeight: 600 }}>
            ← {t('storybook.stories.nav.getStarted')}
          </LinkTo>
        )}
        {index < allStories.length - 1 ? (
          // @ts-expect-error: because style props exists but not exposed
          <LinkTo kind={allStories[index + 1].url} story="api" style={{ fontSize: 18, fontWeight: 600 }}>
            {allStories[index + 1].name} →
          </LinkTo>
        ) : (
          <p style={{ margin: 0 }}>{t('storybook.stories.nav.nothing')}</p>
        )}
      </Flex>
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
