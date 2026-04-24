import { type CSSProperties, useMemo } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ThemeVars } from 'storybook/theming';
import VirtualTextViewer from '../../../src/components/VirtualTextViewer';
import { storyT, useStoryT } from '../../locales';
import { getGlobalValueFromUrl } from '../../utils/global';

const demoText = buildLargeText(120, 60);
const background = getGlobalValueFromUrl('backgrounds.value');
const isPreferDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const theme = (background as ThemeVars['base']) ?? (isPreferDark ? 'dark' : 'light');

const palette =
  theme === 'dark'
    ? {
        shellBackground: 'linear-gradient(180deg, #0f1a26 0%, #162638 100%)',
        shellBorder: '#29415b',
        shellShadow: '0 12px 32px rgba(2, 10, 20, 0.4)',
        headerBackground: 'rgba(18, 32, 47, 0.94)',
        headerBorder: '#2f4964',
        titleColor: '#eef6ff',
        subtitleColor: '#a7bed6',
        metricColor: '#9fbcda',
        viewerBackground: '#132131',
        viewerColor: '#dce8f5',
      }
    : {
        shellBackground: 'linear-gradient(180deg, #f3f9ff 0%, #e4eef8 100%)',
        shellBorder: '#c3d3e6',
        shellShadow: '0 12px 32px rgba(37, 72, 112, 0.12)',
        headerBackground: 'rgba(248, 252, 255, 0.94)',
        headerBorder: '#d7e3f0',
        titleColor: '#203247',
        subtitleColor: '#5a7088',
        metricColor: '#35516d',
        viewerBackground: '#f8fbff',
        viewerColor: '#213040',
      };

const meta: Meta<typeof VirtualTextViewer> = {
  title: 'Components/VirtualTextViewer',
  component: VirtualTextViewer,
  args: {
    value: demoText,
    height: 420,
    lineHeight: 22,
    overscan: 10,
  },
  argTypes: {
    value: {
      control: 'text',
    },
    height: {
      control: 'number',
    },
    lineHeight: {
      control: 'number',
    },
    overscan: {
      control: 'number',
    },
  },
  parameters: {
    docs: {
      description: {
        component: storyT('storybook.stories.VirtualTextViewer.docs.component'),
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof VirtualTextViewer>;

const shellStyle: CSSProperties = {
  background: palette.shellBackground,
  border: `1px solid ${palette.shellBorder}`,
  borderRadius: 14,
  boxShadow: palette.shellShadow,
  overflow: 'hidden',
};

const headerStyle: CSSProperties = {
  alignItems: 'center',
  background: palette.headerBackground,
  borderBottom: `1px solid ${palette.headerBorder}`,
  display: 'flex',
  gap: 16,
  justifyContent: 'space-between',
  padding: '12px 16px',
};

const metricStyle: CSSProperties = {
  color: palette.metricColor,
  font: '600 12px/1.4 SFMono-Regular, Consolas, monospace',
};

export const Playground: Story = {
  render: function Render(args) {
    const t = useStoryT();
    const metrics = useMemo(() => {
      const content = args.value ?? '';
      return {
        charCount: content.length.toLocaleString(),
        lineCount: content.length === 0 ? '0' : content.split('\n').length.toLocaleString(),
      };
    }, [args.value]);

    return (
      <div style={shellStyle}>
        <div style={headerStyle}>
          <div>
            <div style={{ color: palette.titleColor, font: '700 15px/1.2 Georgia, serif' }}>
              {t('storybook.stories.VirtualTextViewer.header.title')}
            </div>
            <div style={{ color: palette.subtitleColor, fontSize: 12, marginTop: 4 }}>
              {t('storybook.stories.VirtualTextViewer.header.subtitle')}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={metricStyle}>
              {t('storybook.stories.VirtualTextViewer.metrics.chars', { value: metrics.charCount })}
            </div>
            <div style={metricStyle}>
              {t('storybook.stories.VirtualTextViewer.metrics.sourceLines', { value: metrics.lineCount })}
            </div>
          </div>
        </div>
        <VirtualTextViewer
          {...args}
          style={{
            background: palette.viewerBackground,
            color: palette.viewerColor,
            padding: '0 12px',
            margin: '12px 0',
            ...args.style,
          }}
        />
      </div>
    );
  },
};

function buildLargeText(sectionCount: number, rowsPerSection: number): string {
  const lines: string[] = [];

  for (let section = 0; section < sectionCount; section++) {
    lines.push(storyT('storybook.stories.VirtualTextViewer.demo.section', { index: section + 1 }));
    lines.push('');

    for (let row = 0; row < rowsPerSection; row++) {
      lines.push(
        [
          `[${section + 1}-${row + 1}]`,
          storyT('storybook.stories.VirtualTextViewer.demo.viewerLine'),
          storyT('storybook.stories.VirtualTextViewer.demo.wrappingLine'),
          `https://example.com/reports/${section + 1}/${row + 1}?lang=zh-CN&mode=full&virtualization=on`,
        ].join(' ')
      );
    }

    lines.push('');
  }

  return lines.join('\n');
}
