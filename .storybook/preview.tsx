import type { ComponentType, PropsWithChildren } from 'react';
import { useMemo, useState } from 'react';
import type { Control, DocsContainerProps } from '@storybook/addon-docs/blocks';
import {
  Controls,
  DocsContainer,
  Markdown,
  Primary,
  Stories,
  Subtitle,
  Title,
  useOf,
} from '@storybook/addon-docs/blocks';
import type { Preview, ReactRenderer } from '@storybook/react-vite';
import { App as AntdApp, ConfigProvider as AntdConfigProvider, theme as antThemes } from 'antd';
import enUS from 'antd/es/locale/en_US';
import zhCN from 'antd/es/locale/zh_CN';
import { FORCE_RE_RENDER } from 'storybook/internal/core-events';
import type { StoryContext, StoryContextForEnhancers } from 'storybook/internal/csf';
import type { ResolvedModuleExportFromType } from 'storybook/internal/types';
import { addons, useStoryContext } from 'storybook/preview-api';
import { themes } from 'storybook/theming';
import ConfigProvider from '../src/components/ConfigProvider';
import { useRefValue } from '../src/hooks';
import type { Langs } from '../src/locales';
import storyI18n, { storyT } from './locales';
import { getGlobalValueFromUrl } from './utils/global';
import { inferControlFromDocgenType, standardizeJsDocDefaultValue } from './utils/jsdoc';

// import './preview.css';

const themeFromUrl = getGlobalValueFromUrl('backgrounds.value');
const langFromUrl = getGlobalValueFromUrl('lang');
const isPreferDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

const preview: Preview = {
  initialGlobals: {
    lang: 'en-US',
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
          { value: 'zh-CN', right: '🇨🇳', title: '中文' },
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
        order: ['Introduce', 'Install', 'Get Started', 'Changelog', 'Components'],
        locales: '',
      },
    },
    docs: {
      container: (props: PropsWithChildren<DocsContainerProps>) => {
        const globalValue = (props.context as unknown as StoryContext<ReactRenderer>)?.globals?.backgrounds?.value;
        const theme = globalValue ?? themeFromUrl;
        const isDark = theme ? theme === 'dark' : isPreferDark;
        return <DocsContainer {...props} theme={isDark ? themes.dark : themes.light} />;
      },
      extractComponentDescription: (
        component: ComponentType & {
          __docgenInfo?: { description?: string };
        }
      ) => {
        const raw = component?.__docgenInfo?.description ?? '';
        let result = stripExampleBlock(raw);
        result = removeOtherLang(result);
        return result;
      },
      page: () => (
        <>
          <Title />
          <Subtitle />
          <CustomComponentDescription />
          <Primary />
          <Controls />
          <Stories />
        </>
      ),
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story, context) => {
      const themeFromGlobal = context.globals?.backgrounds?.value;
      const theme: string | undefined = themeFromGlobal ?? themeFromUrl;
      const lang: Langs | undefined = context.globals.lang ?? langFromUrl ?? 'en-US';
      const antdLocale = lang === 'zh-CN' ? zhCN : enUS;
      const { viewMode } = useStoryContext();
      const viewModeRef = useRefValue(viewMode);
      const [prevTheme, setPrevTheme] = useState(themeFromGlobal);
      const isDark = theme === 'dark' || (!theme && isPreferDark);
      // Reload the page if the theme changes.
      useMemo(() => {
        if (themeFromGlobal !== prevTheme) {
          setPrevTheme(themeFromGlobal);
          (window.top ?? window.parent ?? window).location.reload();
        }
      }, [themeFromGlobal, prevTheme]);

      // Reload the page if the language changes.
      useMemo(() => {
        if (storyI18n.language !== lang) {
          storyI18n.changeLanguage(lang).then(() => {
            if (viewModeRef.current === 'docs') {
              addons.getChannel().emit(FORCE_RE_RENDER);
            } else if (viewModeRef.current === 'story') {
              (window.top ?? window.parent ?? window).location.reload();
            }
          });
        }
      }, [lang]);

      return (
        <AntdConfigProvider
          locale={antdLocale}
          theme={{ algorithm: isDark ? antThemes.darkAlgorithm : antThemes.defaultAlgorithm }}
        >
          <AntdApp>
            <ConfigProvider lang={lang}>
              <Story />
            </ConfigProvider>
          </AntdApp>
        </AntdConfigProvider>
      );
    },
  ],
  argTypesEnhancers: [jsdocArgTypesEnhancer],
};

function removeOtherLang(input = '') {
  const langFromUrl = getGlobalValueFromUrl('lang');
  const currentLang = langFromUrl === 'zh-CN' ? 'zh-CN' : 'en-US';
  return keepCurrentLangContent(input, currentLang);
}

function keepCurrentLangContent(input = '', lang: Langs = 'en-US') {
  const targetLang = lang === 'zh-CN' ? 'CN' : 'EN';

  // Compatible with JSDoc original text (with *) and plain text extracted by docgen
  const lines = input.split(/\r?\n/).map((line) => line.replace(/^\s*\*\s?/, ''));

  const result: string[] = [];
  let blockLang: 'EN' | 'CN' | null = null;
  let blockLines: string[] = [];

  // Language block: - **EN:** xxx or - **CN:** xxx
  const langHeaderReg = /^-\s*\*\*(EN|CN):\*\*\s*(.*)$/;
  // JSDoc 标签：@param @returns ...
  const jsdocTagReg = /^@\w+/;

  const flushBlock = () => {
    if (blockLang === targetLang) {
      result.push(...blockLines);
    }
    blockLang = null;
    blockLines = [];
  };

  for (const line of lines) {
    const headerMatch = line.match(langHeaderReg);

    if (headerMatch) {
      if (blockLang) {
        flushBlock();
      }
      const [, langFlag, firstContent = ''] = headerMatch;
      blockLang = langFlag as 'EN' | 'CN';
      blockLines = firstContent ? [firstContent] : [];
      continue;
    }

    if (blockLang) {
      // Encounter @param/@returns indicating the end of the language block, tag content should be retained
      if (jsdocTagReg.test(line)) {
        flushBlock();
        result.push(line);
      } else {
        blockLines.push(line);
      }
      continue;
    }

    // Non-internationalized content remains unchanged.
    result.push(line);
  }

  if (blockLang) {
    flushBlock();
  }

  // 压缩多余空行
  return result
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function stripExampleBlock(input = '') {
  return (
    input
      // Remove @example to the next @tag (or the end).
      .replace(/\n?@example[\s\S]*?(?=\n@\w+|$)/g, '')
      .trim()
  );
}

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
      description: argType?.description ?? docProp?.description ?? '',
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

function processDescription(content: string | undefined) {
  const raw = content ?? '';
  let result = stripExampleBlock(raw);
  result = removeOtherLang(result);
  return result;
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

export default preview;
