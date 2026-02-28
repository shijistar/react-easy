import type { Meta, StoryObj } from '@storybook/react-vite';
import FloatDrawer from '../../src/components/FloatDrawer';
import { storyT, useStoryT } from '../locales';

const meta: Meta<typeof FloatDrawer> = {
  title: 'Components/FloatDrawer',
  component: FloatDrawer,
  args: {
    open: true,
    position: 'right',
    defaultSize: 260,
    minSize: 160,
    maxSize: 420,
    showToggle: true,
    resizable: true,
    destroyOnClose: false,
    cardProps: {
      title: storyT('storybook.stories.FloatDrawer.args.cardTitle'),
    },
  },
  argTypes: {},
  render: function Render(args) {
    const t = useStoryT();
    return (
      <div style={{ width: 640, height: 640, border: '1px dashed #d54305', position: 'relative', overflow: 'hidden' }}>
        <FloatDrawer {...args}>
          <div style={{ padding: 8 }}>{t('storybook.stories.FloatDrawer.content')}</div>
        </FloatDrawer>
      </div>
    );
  },
};

export default meta;
type Story = StoryObj<typeof FloatDrawer>;

export const Playground: Story = {};
