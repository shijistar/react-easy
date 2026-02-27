import type { Meta, StoryObj } from '@storybook/react-vite';
import PulseAnimation from '../../src/components/Animation/Pulse';

const meta: Meta<typeof PulseAnimation> = {
  title: 'Components/PulseAnimation',
  component: PulseAnimation,
  args: {
    bars: 8,
    barGap: 4,
    duration: 1.6,
    delayRate: 0.09,
    barColor: '#1677ff',
  },
  argTypes: {},
  render: (args) => <PulseAnimation {...args} style={{ width: 240, height: 64, ...args.style }} />,
};

export default meta;
type Story = StoryObj<typeof PulseAnimation>;

export const Playground: Story = {};
