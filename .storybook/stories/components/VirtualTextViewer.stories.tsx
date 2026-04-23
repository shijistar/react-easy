import { type CSSProperties, useMemo } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import VirtualTextViewer from '../../../src/components/VirtualTextViewer';

function buildLargeText(sectionCount: number, rowsPerSection: number): string {
  const lines: string[] = [];

  for (let section = 0; section < sectionCount; section++) {
    lines.push(`SECTION ${section + 1}`);
    lines.push('');

    for (let row = 0; row < rowsPerSection; row++) {
      lines.push(
        [
          `[${section + 1}-${row + 1}]`,
          'This is a virtualized plain-text viewer powered by Pretext.',
          'It keeps wrapping stable for mixed content like 北京, مرحبا, emoji 👩‍🚀, and long URLs.',
          `https://example.com/reports/${section + 1}/${row + 1}?lang=zh-CN&mode=full&virtualization=on`,
        ].join(' ')
      );
    }

    lines.push('');
  }

  return lines.join('\n');
}

const demoText = buildLargeText(120, 60);

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
        component: `- **EN:** A simplified large-text virtualization component built on top of Pretext. It predicts wrapped line geometry without DOM text measurement and only materializes the visible line window.
- **CN:** 一个基于 Pretext 的简化版大文本虚拟查看组件。它不依赖 DOM 文本测量来预测换行几何，并且只物化可见行窗口。`,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof VirtualTextViewer>;

const shellStyle: CSSProperties = {
  background: 'linear-gradient(180deg, #fbf7f0 0%, #f2eadf 100%)',
  border: '1px solid #d6c5b0',
  borderRadius: 14,
  boxShadow: '0 12px 32px rgba(86, 60, 35, 0.08)',
  overflow: 'hidden',
};

const headerStyle: CSSProperties = {
  alignItems: 'center',
  background: 'rgba(255, 250, 243, 0.9)',
  borderBottom: '1px solid #e3d6c5',
  display: 'flex',
  gap: 16,
  justifyContent: 'space-between',
  padding: '12px 16px',
};

const metricStyle: CSSProperties = {
  color: '#5c4a37',
  font: '600 12px/1.4 SFMono-Regular, Consolas, monospace',
};

export const Playground: Story = {
  render: function Render(args) {
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
            <div style={{ color: '#4a3828', font: '700 15px/1.2 Georgia, serif' }}>Pretext Virtual Text Viewer</div>
            <div style={{ color: '#7a6651', fontSize: 12, marginTop: 4 }}>
              Scroll through a very large plain string while only rendering the visible lines.
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={metricStyle}>chars: {metrics.charCount}</div>
            <div style={metricStyle}>source lines: {metrics.lineCount}</div>
          </div>
        </div>
        <VirtualTextViewer
          {...args}
          style={{
            background: '#fffaf3',
            color: '#2f2418',
            ...args.style,
          }}
        />
      </div>
    );
  },
};
