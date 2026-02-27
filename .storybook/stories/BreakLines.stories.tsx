import type { Meta, StoryObj } from '@storybook/react-vite';
import BreakLines, { type BreakLinesProps } from '../../src/components/BreakLines';

const meta: Meta<typeof BreakLines> = {
  title: 'Components/BreakLines',
  component: BreakLines,
  args: {
    value: '第一行\n第二行\n第三行',
    enabled: true,
    EOL: '\n',
    tagName: 'div',
    className: '',
  } satisfies Partial<BreakLinesProps>,
  argTypes: {},
};
type BreakLinesStoryArgs = BreakLinesProps;

export default meta;
type Story = StoryObj<BreakLinesStoryArgs>;

export const Playground: Story = {};
