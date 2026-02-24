import type { Meta, StoryObj } from '@storybook/react';
import EllipsisLink from '../../src/components/EllipsisTypography/EllipsisLink';
import EllipsisParagraph from '../../src/components/EllipsisTypography/EllipsisParagraph';
import EllipsisText from '../../src/components/EllipsisTypography/EllipsisText';
import EllipsisTitle from '../../src/components/EllipsisTypography/EllipsisTitle';

const longText =
  '这是一段很长很长的文本，用于演示自动省略与 tooltip 行为。拖动容器宽度或修改 rows、ellipsis 相关配置可以观察不同组合下的效果。';

const meta: Meta = {
  title: 'Components/EllipsisTypography',
};

export default meta;

type TextStory = StoryObj<typeof EllipsisText>;
type ParagraphStory = StoryObj<typeof EllipsisParagraph>;
type TitleStory = StoryObj<typeof EllipsisTitle>;
type LinkStory = StoryObj<typeof EllipsisLink>;

export const Text: TextStory = {
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
      table: { defaultValue: { summary: 'longText（demo）' } },
    },
    ellipsis: {
      control: 'object',
      description: `- **EN:** Ellipsis configuration. Set \`true\` or \`ellipsis.tooltip\` to enable automatic tooltip behavior.
- **CN:** 省略配置。设置为 \`true\` 或配置 \`ellipsis.tooltip\` 可启用自动 tooltip 行为。`,
      table: { defaultValue: { summary: 'true（demo） / true（组件默认）' } },
    },
  },
  render: (args) => <EllipsisText {...args} />,
};

export const Paragraph: ParagraphStory = {
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
      table: { defaultValue: { summary: 'longText（demo）' } },
    },
    ellipsis: {
      control: 'object',
      description: `- **EN:** Ellipsis configuration with optional rows and tooltip settings.
- **CN:** 省略配置，支持行数和 tooltip 设置。`,
      table: { defaultValue: { summary: '{ rows: 2, tooltip: true }（demo）' } },
    },
  },
  render: (args) => <EllipsisParagraph {...args} />,
};

export const Title: TitleStory = {
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
      table: { defaultValue: { summary: 'longText（demo）' } },
    },
    level: {
      control: 'select',
      options: [1, 2, 3, 4, 5],
      description: `- **EN:** Title level.
    - **CN:** 标题层级。`,
      table: { defaultValue: { summary: '4（demo）' } },
    },
    ellipsis: {
      control: 'object',
      description: `- **EN:** Ellipsis configuration. Supports automatic tooltip title behavior.
    - **CN:** 省略配置，支持自动 tooltip title 行为。`,
      table: { defaultValue: { summary: '{ tooltip: { title: true } }（demo）' } },
    },
  },
  render: (args) => <EllipsisTitle {...args} />,
};

export const Link: LinkStory = {
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
      table: { defaultValue: { summary: 'longText（demo）' } },
    },
    ellipsis: {
      control: 'object',
      description: `- **EN:** Ellipsis configuration. Set \`true\` for automatic ellipsis and tooltip behavior.
- **CN:** 省略配置。设为 \`true\` 可启用自动省略与 tooltip 行为。`,
      table: { defaultValue: { summary: 'true（demo） / true（组件默认）' } },
    },
    href: {
      control: 'text',
      description: `- **EN:** Link target URL.
- **CN:** 链接跳转地址。`,
      table: { defaultValue: { summary: 'https://github.com/shijistar/react-easy（demo）' } },
    },
  },
  render: (args) => <EllipsisLink {...args} />,
};
