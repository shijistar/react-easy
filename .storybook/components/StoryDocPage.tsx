import { useMemo } from 'react';
import { Controls, Markdown, Primary, Subtitle, Title, useOf } from '@storybook/addon-docs/blocks';
import LinkTo from '@storybook/addon-links/react';
import type { ResolvedModuleExportFromType } from 'storybook/internal/types';
import { Flex } from 'antd';
import { useStoryT } from '../locales';
import storyList from '../stories-list.json';
import { processDescription } from '../utils/description';

function StoryDocPage() {
  const t = useStoryT();
  const currentStory = useMemo(() => {
    const path = new URLSearchParams(top?.location.search).get('path');
    const matches = path?.match(/\/docs\/(components|hooks|utils)-(\w+?)--api/);
    if (matches && matches.length > 2) {
      return `./stories/${matches[1]}/${matches[2]}/index.stories.tsx`.toLowerCase();
    }
    return null;
  }, []);
  const stories = useMemo(
    () =>
      storyList.map((path) => {
        const parts = path.split('/');
        return {
          path: path.toLowerCase(),
          name: parts[3],
          url: `${parts[2]}/${parts[3]}`,
        };
      }),
    [],
  );
  const index = useMemo(() => stories.findIndex((story) => story.path === currentStory), [stories, currentStory]);

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
          <LinkTo kind={stories[index - 1].url} story="api">
            <span style={{ fontSize: 18, fontWeight: 600 }}>← {stories[index - 1].name}</span>
          </LinkTo>
        ) : (
          <LinkTo kind="get-started" story="api">
            <span style={{ fontSize: 18, fontWeight: 600 }}>← {t('storybook.stories.nav.getStarted')}</span>
          </LinkTo>
        )}
        {index < stories.length - 1 ? (
          <LinkTo kind={stories[index + 1].url} story="api">
            <span style={{ fontSize: 18, fontWeight: 600 }}>{stories[index + 1].name} →</span>
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

export default StoryDocPage;
