import type { Meta, StoryObj } from '@storybook/react-vite';
import BreakLines, { type BreakLinesProps } from '../../src/components/BreakLines';
import { storyT } from '../locales';

const meta: Meta<typeof BreakLines> = {
  title: 'Components/BreakLines',
  component: BreakLines,
  args: {
    value: storyT('storybook.stories.BreakLines.args.value'),
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
