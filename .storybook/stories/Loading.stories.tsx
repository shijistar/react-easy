import type { ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import Loading from '../../src/components/Loading';
import { storyT, useStoryT } from '../locales';

const meta: Meta<typeof Loading> = {
  title: 'Components/Loading',
  component: Loading,
  args: {
    mode: 'absolute',
    spinning: true,
    tip: storyT('storybook.stories.Loading.args.tip'),
    size: 'default',
  },
  argTypes: {},
};

export default meta;
type Story = StoryObj<typeof Loading>;

export const Standalone: Story = {
  args: {
    spinning: true,
  },
  render: function Render(args: ComponentProps<typeof Loading>) {
    const t = useStoryT();
    return (
      <div style={{ position: 'relative', padding: 24, border: '1px dashed #d54305', borderRadius: 8 }}>
        <Loading {...args} />
        {t('storybook.stories.Loading.content')}
      </div>
    );
  },
};
