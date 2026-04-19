import type { Meta, StoryObj } from '@storybook/react-vite';
import EllipsisLinkComponent from '../../../src/components/EllipsisTypography/EllipsisLink';
import EllipsisParagraphComponent from '../../../src/components/EllipsisTypography/EllipsisParagraph';
import EllipsisTextComponent from '../../../src/components/EllipsisTypography/EllipsisText';
import EllipsisTitleComponent from '../../../src/components/EllipsisTypography/EllipsisTitle';
import { storyT } from '../../locales';

const longText = storyT('storybook.stories.EllipsisTypography.longText');

const meta: Meta = {
  title: 'Components/EllipsisTypography',
  parameters: {
    docs: {
      description: {
        component: `- **EN:** A set of typography wrapper components with ellipsis capabilities, covering text, paragraph, title, and link variants.
When the text overflows, the ellipsis effect is displayed; if the text does not overflow, the tooltip is not shown.
- **CN:** 一组带省略能力的排版封装组件，覆盖文本、段落、标题和链接几种形态。在文本溢出时显示省略效果，如果文本没有溢出，则不显示tooltip。`,
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ margin: '0 auto', border: '1px dashed #d54305', padding: 12 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type EllipsisTextStory = StoryObj<typeof EllipsisTextComponent>;
type EllipsisParagraphStory = StoryObj<typeof EllipsisParagraphComponent>;
type EllipsisTitleStory = StoryObj<typeof EllipsisTitleComponent>;
type EllipsisLinkStory = StoryObj<typeof EllipsisLinkComponent>;

export const EllipsisText: EllipsisTextStory = {
  parameters: {
    docs: {
      description: {
        story: `- **EN:** Single-line text ellipsis example.
- **CN:** 单行文本省略示例。`,
      },
    },
  },
  args: {
    text: longText,
    ellipsis: true,
  },
  argTypes: {
    text: {
      control: 'text',
      description: `- **EN:** Text content. If omitted, \`children\` can be used as fallback.
- **CN:** 文本内容；未传时可由 \`children\` 兜底。`,
      table: { defaultValue: { summary: '-' } },
    },
  },
  render: (args) => <EllipsisTextComponent {...args} />,
};

export const EllipsisParagraph: EllipsisParagraphStory = {
  parameters: {
    docs: {
      description: {
        story: `- **EN:** Multi-line paragraph ellipsis with tooltip support.
- **CN:** 支持 tooltip 的多行段落省略示例。`,
      },
    },
  },
  args: {
    text: longText,
    ellipsis: { rows: 2, tooltip: true },
  },
  argTypes: {
    text: {
      control: 'text',
      description: `- **EN:** Text content. If omitted, \`children\` can be used as fallback.
- **CN:** 文本内容；未传时可由 \`children\` 兜底。`,
      table: { defaultValue: { summary: '-' } },
    },
    ellipsis: {
      control: 'object',
      description: `- **EN:** Ellipsis configuration with optional rows and tooltip settings.
- **CN:** 省略配置，支持行数和 tooltip 设置。`,
      table: { defaultValue: { summary: '-' } },
    },
  },
  render: (args) => <EllipsisParagraphComponent {...args} />,
};

export const EllipsisTitle: EllipsisTitleStory = {
  parameters: {
    docs: {
      description: {
        story: `- **EN:** Heading ellipsis example with configurable title level.
- **CN:** 支持标题层级配置的标题省略示例。`,
      },
    },
  },
  args: {
    text: longText,
    level: 4,
    ellipsis: { tooltip: { title: true } },
    style: { margin: 0 },
  },
  argTypes: {
    text: {
      control: 'text',
      description: `- **EN:** Text content. If omitted, \`children\` can be used as fallback.
- **CN:** 文本内容；未传时可由 \`children\` 兜底。`,
      table: { defaultValue: { summary: '-' } },
    },
    level: {
      control: 'select',
      options: [1, 2, 3, 4, 5],
      description: `- **EN:** Title level.
    - **CN:** 标题层级。`,
      table: { defaultValue: { summary: '1' } },
    },
    ellipsis: {
      control: 'object',
      description: `- **EN:** Ellipsis configuration. Supports automatic tooltip title behavior.
    - **CN:** 省略配置，支持自动 tooltip title 行为。`,
      table: { defaultValue: { summary: '-' } },
    },
  },
  render: (args) => <EllipsisTitleComponent {...args} />,
};

export const EllipsisLink: EllipsisLinkStory = {
  parameters: {
    docs: {
      description: {
        story: `- **EN:** Link ellipsis example for long URLs or labels.
- **CN:** 适用于长链接文本或长链接标签的省略示例。`,
      },
    },
  },
  args: {
    text: longText,
    href: 'https://github.com/shijistar/react-easy',
    ellipsis: true,
  },
  argTypes: {
    text: {
      control: 'text',
      description: `- **EN:** Text content. If omitted, \`children\` can be used as fallback.
- **CN:** 文本内容；未传时可由 \`children\` 兜底。`,
      table: { defaultValue: { summary: '-' } },
    },
    ellipsis: {
      control: 'object',
      description: `- **EN:** Ellipsis configuration. Set \`true\` for automatic ellipsis and tooltip behavior.
- **CN:** 省略配置。设为 \`true\` 可启用自动省略与 tooltip 行为。`,
      table: { defaultValue: { summary: '-' } },
    },
    href: {
      control: 'text',
      description: `- **EN:** Link target URL.
- **CN:** 链接跳转地址。`,
      table: { defaultValue: { summary: '-' } },
    },
  },
  render: (args) => <EllipsisLinkComponent {...args} />,
};
