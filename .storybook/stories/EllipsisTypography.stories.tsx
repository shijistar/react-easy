import type { Meta, StoryObj } from '@storybook/react-vite';
import EllipsisLinkComponent from '../../src/components/EllipsisTypography/EllipsisLink';
import EllipsisParagraphComponent from '../../src/components/EllipsisTypography/EllipsisParagraph';
import EllipsisTextComponent from '../../src/components/EllipsisTypography/EllipsisText';
import EllipsisTitleComponent from '../../src/components/EllipsisTypography/EllipsisTitle';
import { storyT } from '../locales';

const longText = storyT('storybook.stories.EllipsisTypography.longText');

const meta: Meta = {
  title: 'Components/EllipsisTypography',
};

export default meta;

type EllipsisTextStory = StoryObj<typeof EllipsisTextComponent>;
type EllipsisParagraphStory = StoryObj<typeof EllipsisParagraphComponent>;
type EllipsisTitleStory = StoryObj<typeof EllipsisTitleComponent>;
type EllipsisLinkStory = StoryObj<typeof EllipsisLinkComponent>;

export const EllipsisText: EllipsisTextStory = {
  args: {
    text: longText,
    ellipsis: true,
    style: { maxWidth: 260, display: 'inline-block' },
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
  args: {
    text: longText,
    ellipsis: { rows: 2, tooltip: true },
    style: { maxWidth: 320 },
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
  args: {
    text: longText,
    level: 4,
    ellipsis: { tooltip: { title: true } },
    style: { maxWidth: 320, margin: 0 },
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
  args: {
    text: longText,
    href: 'https://github.com/shijistar/react-easy',
    ellipsis: true,
    style: { maxWidth: 260, display: 'inline-block' },
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
