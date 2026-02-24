import type { Meta, StoryObj } from '@storybook/react';
import BreakLines from '../../src/components/BreakLines';

const meta: Meta<typeof BreakLines> = {
  title: 'Components/BreakLines',
  component: BreakLines,
  args: {
    value: '第一行\n第二行\n第三行',
    enabled: true,
    EOL: '\n',
    tagName: 'div',
    className: '',
  },
  argTypes: {
    value: {
      control: 'text',
      description: `- **EN:** Text content
- **CN:** 文本内容`,
      table: {
        defaultValue: { summary: '第一行\\n第二行\\n第三行（demo）' },
      },
    },
    enabled: {
      control: 'boolean',
      description: `- **EN:** Whether the line break conversion is enabled.
- **CN:** 是否启用换行转换。`,
      table: {
        defaultValue: { summary: 'true' },
      },
    },
    EOL: {
      control: 'text',
      description: `- **EN:** The end-of-line character to use for splitting lines.
- **CN:** 用于分割行的行结束字符。`,
      table: {
        defaultValue: { summary: '\\n' },
      },
    },
    tagName: {
      control: 'select',
      options: [false, 'span', 'div', 'i', 'pre'],
      description: `- **EN:** The HTML tag to use for rendering the content.
- **CN:** 用于渲染内容的 HTML 标签。`,
      table: {
        defaultValue: { summary: 'false（组件默认） / div（demo）' },
      },
    },
    className: {
      control: 'text',
      description: `- **EN:** The CSS class name of the dom node, if \`tagName\` is set to false, this property is invalid.
- **CN:** dom 节点的 css 类名，如果 \`tagName\` 设置为 false，则此属性无效。`,
      table: {
        defaultValue: { summary: '""（demo）' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BreakLines>;

export const Playground: Story = {};
