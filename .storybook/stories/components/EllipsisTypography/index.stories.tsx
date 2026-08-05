import type { Meta, StoryObj } from '@storybook/react-vite';
import EllipsisLinkComponent from '../../../../src/components/EllipsisTypography/EllipsisLink';
import EllipsisParagraphComponent from '../../../../src/components/EllipsisTypography/EllipsisParagraph';
import EllipsisTextComponent from '../../../../src/components/EllipsisTypography/EllipsisText';
import EllipsisTitleComponent from '../../../../src/components/EllipsisTypography/EllipsisTitle';
import storyI18n, { storyT } from '../../../locales';
import apiDocEN from './api-doc.en-US.md?raw';
import apiDocCN from './api-doc.zh-CN.md?raw';
import introduceEN from './introduce.en-US.md?raw';
import introduceCN from './introduce.zh-CN.md?raw';

const longText = storyT('storybook.stories.EllipsisTypography.longText');

const meta: Meta = {
  title: 'Components/EllipsisTypography',
  parameters: {
    docs: {
      description: {
        component: storyI18n.language === 'zh-CN' ? `${introduceCN}\n${apiDocCN}` : `${introduceEN}\n${apiDocEN}`,
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
        story: storyT('storybook.stories.EllipsisTypography.stories.EllipsisText.description'),
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
      description: storyT('storybook.stories.EllipsisTypography.argTypes.text.description'),
      table: { defaultValue: { summary: '-' } },
    },
  },
  render: (args) => <EllipsisTextComponent {...args} />,
};

export const EllipsisParagraph: EllipsisParagraphStory = {
  parameters: {
    docs: {
      description: {
        story: storyT('storybook.stories.EllipsisTypography.stories.EllipsisParagraph.description'),
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
      description: storyT('storybook.stories.EllipsisTypography.argTypes.text.description'),
      table: { defaultValue: { summary: '-' } },
    },
    ellipsis: {
      control: 'object',
      description: storyT(
        'storybook.stories.EllipsisTypography.stories.EllipsisParagraph.argTypes.ellipsis.description',
      ),
      table: { defaultValue: { summary: '-' } },
    },
  },
  render: (args) => <EllipsisParagraphComponent {...args} />,
};

export const EllipsisTitle: EllipsisTitleStory = {
  parameters: {
    docs: {
      description: {
        story: storyT('storybook.stories.EllipsisTypography.stories.EllipsisTitle.description'),
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
      description: storyT('storybook.stories.EllipsisTypography.argTypes.text.description'),
      table: { defaultValue: { summary: '-' } },
    },
    level: {
      control: 'select',
      options: [1, 2, 3, 4, 5],
      description: storyT('storybook.stories.EllipsisTypography.stories.EllipsisTitle.argTypes.level.description'),
      table: { defaultValue: { summary: '1' } },
    },
    ellipsis: {
      control: 'object',
      description: storyT('storybook.stories.EllipsisTypography.stories.EllipsisTitle.argTypes.ellipsis.description'),
      table: { defaultValue: { summary: '-' } },
    },
  },
  render: (args) => <EllipsisTitleComponent {...args} />,
};

export const EllipsisLink: EllipsisLinkStory = {
  parameters: {
    docs: {
      description: {
        story: storyT('storybook.stories.EllipsisTypography.stories.EllipsisLink.description'),
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
      description: storyT('storybook.stories.EllipsisTypography.argTypes.text.description'),
      table: { defaultValue: { summary: '-' } },
    },
    ellipsis: {
      control: 'object',
      description: storyT('storybook.stories.EllipsisTypography.stories.EllipsisLink.argTypes.ellipsis.description'),
      table: { defaultValue: { summary: '-' } },
    },
    href: {
      control: 'text',
      description: storyT('storybook.stories.EllipsisTypography.stories.EllipsisLink.argTypes.href.description'),
      table: { defaultValue: { summary: '-' } },
    },
  },
  render: (args) => <EllipsisLinkComponent {...args} />,
};
