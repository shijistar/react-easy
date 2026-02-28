import type { Meta, StoryObj } from '@storybook/react-vite';
import OverflowTags from '../../src/components/OverflowTags';
import { storyT } from '../locales';

interface TagItem {
  id: number;
  label: string;
  color?: string;
}

const tags: TagItem[] = [
  { id: 1, label: storyT('storybook.stories.OverflowTags.tags.react'), color: 'blue' },
  { id: 2, label: storyT('storybook.stories.OverflowTags.tags.typescript'), color: 'blue' },
  { id: 3, label: storyT('storybook.stories.OverflowTags.tags.antDesign'), color: 'purple' },
  { id: 4, label: storyT('storybook.stories.OverflowTags.tags.storybook'), color: 'magenta' },
  { id: 5, label: storyT('storybook.stories.OverflowTags.tags.hooks'), color: 'green' },
  { id: 6, label: storyT('storybook.stories.OverflowTags.tags.hoc'), color: 'cyan' },
  { id: 7, label: storyT('storybook.stories.OverflowTags.tags.utilities'), color: 'orange' },
];

const meta: Meta<typeof OverflowTags<TagItem>> = {
  title: 'Components/OverflowTags',
  component: OverflowTags<TagItem>,
  args: {
    tags,
    maxCount: 'responsive',
    randomColors: false,
  },
  argTypes: {
    maxCount: {
      control: 'select',
      options: [2, 3, 4, 5, 'responsive', 'invalidate'],
      description: `- **EN:** Maximum number of tags to display before overflow.
- **CN:** 超出前最多显示的标签数量。`,
      table: { defaultValue: { summary: storyT('storybook.stories.OverflowTags.maxCountSummary') } },
    },
  },
  render: (args) => (
    <div style={{ width: 360, border: '1px dashed #d54305', padding: 12 }}>
      <OverflowTags<TagItem> {...args} />
    </div>
  ),
};

export default meta;
type Story = StoryObj<typeof OverflowTags<TagItem>>;

export const Playground: Story = {};
