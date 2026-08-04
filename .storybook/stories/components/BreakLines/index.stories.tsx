import type { Meta, StoryObj } from '@storybook/react-vite';
import BreakLines, { type BreakLinesProps } from '../../../../src/components/BreakLines';
import storyI18n, { storyT } from '../../../locales';
import apiDocEN from './api-doc.en-US.md?raw';
import apiDocCN from './api-doc.zh-CN.md?raw';
import introduceEN from './introduce.en-US.md?raw';
import introduceCN from './introduce.zh-CN.md?raw';

const meta: Meta<typeof BreakLines> = {
  title: 'Components/BreakLines',
  component: BreakLines,
  parameters: {
    docs: {
      description: {
        component: storyI18n.language === 'zh-CN' ? introduceCN + apiDocCN : introduceEN + apiDocEN,
      },
    },
  },
  args: {
    value: storyT('storybook.stories.BreakLines.args.value'),
    enabled: true,
    EOL: '\n',
    tagName: 'div',
    className: '',
  },
  argTypes: {},
};
type BreakLinesStoryArgs = BreakLinesProps;

export default meta;
type Story = StoryObj<BreakLinesStoryArgs>;

export const Playground: Story = {};
