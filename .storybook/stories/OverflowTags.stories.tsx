import type { Meta, StoryObj } from '@storybook/react';
import OverflowTags from '../../src/components/OverflowTags';

type TagItem = { id: number; label: string; color?: string };

const tags: TagItem[] = [
  { id: 1, label: 'React', color: 'blue' },
  { id: 2, label: 'TypeScript', color: 'blue' },
  { id: 3, label: 'Ant Design', color: 'purple' },
  { id: 4, label: 'Storybook', color: 'magenta' },
  { id: 5, label: 'Hooks', color: 'green' },
  { id: 6, label: 'HOC', color: 'cyan' },
  { id: 7, label: 'Utilities', color: 'orange' },
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
      control: 'radio',
      options: ['responsive', 2, 3, 4, 5],
      description: `- **EN:** Maximum number of tags to display before overflow.
- **CN:** 超出前最多显示的标签数量。`,
      table: { defaultValue: { summary: 'responsive' } },
    },
    randomColors: {
      control: 'boolean',
      description: `- **EN:** Whether to use random colors for tags.
- **CN:** 是否为标签使用随机颜色。`,
      table: { defaultValue: { summary: 'false' } },
    },
    tags: {
      control: 'object',
      description: `- **EN:** Data collection of tags.
- **CN:** 标签集合数据。`,
      table: { defaultValue: { summary: '内置 7 条标签数据（demo）' } },
    },
    ellipsisDropdownProps: {
      control: 'object',
      description: `- **EN:** Custom dropdown props when tags are overflowed.
- **CN:** 标签溢出时下拉菜单自定义属性。`,
      table: { defaultValue: { summary: 'undefined' } },
    },
    tagProps: {
      control: 'object',
      description: `- **EN:** Custom props for normal tag items.
- **CN:** 普通标签项自定义属性。`,
      table: { defaultValue: { summary: 'undefined' } },
    },
    ellipsisTagProps: {
      control: 'object',
      description: `- **EN:** Custom props for the ellipsis tag.
- **CN:** 省略标签自定义属性。`,
      table: { defaultValue: { summary: 'undefined' } },
    },
  },
  render: (args) => (
    <div style={{ width: 360, border: '1px dashed #d9d9d9', padding: 12 }}>
      <OverflowTags<TagItem> {...args} />
    </div>
  ),
};

export default meta;
type Story = StoryObj<typeof OverflowTags<TagItem>>;

export const Playground: Story = {};
