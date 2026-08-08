import type { ComponentType, PropsWithChildren } from 'react';
import { lazy, Suspense } from 'react';
import type { Control, DocsContainerProps } from '@storybook/addon-docs/blocks';
import type { Preview, ReactRenderer } from '@storybook/react-vite';
import type { StoryContext, StoryContextForEnhancers } from 'storybook/internal/csf';
import usePreviewDecorator from './components/usePreviewDecorator';
import { storyT } from './locales';
import { stripExampleBlock } from './utils/description';
import { pickLangDoc } from './utils/doc';
import { getGlobalValueFromUrl } from './utils/global';
import { inferControlFromDocgenType, standardizeJsDocDefaultValue } from './utils/jsdoc';
import './preview.css';

// Loading them lazily keeps them out of the story-view critical path.
const ThemedDocsContainer = lazy(() => import('./components/ThemedDocsContainer'));
const StoryDocPage = lazy(() => import('./components/StoryDocPage'));

const themeFromUrl = getGlobalValueFromUrl('backgrounds.value');
const isPreferDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

const preview: Preview = {
  initialGlobals: {
    lang: '',
    backgrounds: {
      value: themeFromUrl ?? (isPreferDark ? 'dark' : 'light'),
      grid: false,
    },
  },
  globalTypes: {
    lang: {
      description: 'Internationalization locale',
      toolbar: {
        icon: 'globe',
        items: [
          { value: 'en-US', right: '🇺🇸', title: 'English' },
          { value: 'zh-CN', right: '🇨🇳', title: '简体中文' },
        ],
      },
    },
  },
  parameters: {
    controls: {
      expanded: true,
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      options: {
        light: { value: '#ffffff', name: storyT('storybook.stories.Backgrounds.light') },
        dark: { value: '#2c2c2c', name: storyT('storybook.stories.Backgrounds.dark') },
      },
    },
    viewport: { value: 'desktop', isRotated: false },
    options: {
      storySort: {
        method: 'alphabetical',
        order: ['Introduce', 'Install', 'Get Started', 'Changelog', 'Components', 'Hooks', 'Utils'],
        locales: '',
      },
    },
    docs: {
      container: (props: PropsWithChildren<DocsContainerProps>) => {
        const globalValue = (props.context as unknown as StoryContext<ReactRenderer>)?.globals?.backgrounds?.value;
        const theme = globalValue ?? themeFromUrl;
        const isDark = theme ? theme === 'dark' : isPreferDark;
        return (
          <Suspense fallback={null}>
            <ThemedDocsContainer {...props} isDark={isDark} />
          </Suspense>
        );
      },
      extractComponentDescription: (
        component: ComponentType & {
          __docgenInfo?: { description?: string };
        },
      ) => {
        const raw = component?.__docgenInfo?.description ?? '';
        let result = stripExampleBlock(raw);
        result = pickLangDoc(result);
        return result;
      },
      page: () => (
        <Suspense fallback={null}>
          <StoryDocPage />
        </Suspense>
      ),
    },
  },
  tags: ['autodocs'],
  decorators: [usePreviewDecorator],
  argTypesEnhancers: [jsdocArgTypesEnhancer],
};

/** Enhances the argTypes of a story based on JSDoc comments. */
function jsdocArgTypesEnhancer(context: StoryContextForEnhancers) {
  const component = context.component;
  const docProps = component?.__docgenInfo?.props;
  if (!docProps) return context.argTypes;

  const newArgTypes = { ...(context.argTypes || {}) };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Object.entries(docProps).forEach(([name, docProp]: [string, any]) => {
    const inferred = inferControlFromDocgenType(docProp?.type);
    const argType = newArgTypes[name];

    newArgTypes[name] = {
      ...argType,
      control: { type: argType?.control ?? inferred.control } as Control,
      options: argType?.options ?? inferred.options,
      // The handwritten description will not be overwritten.
      description: pickLangDoc(argType?.description ?? docProp?.description ?? ''),
      table: {
        ...(argType?.table || {}),
        defaultValue: {
          ...docProp?.defaultValue,
          summary:
            docProp?.defaultValue?.summary ?? standardizeJsDocDefaultValue(String(docProp.defaultValue?.value ?? '-')),
        },
      },
    };
  });
  return newArgTypes;
}

export default preview;
