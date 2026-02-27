import type { Meta, StoryObj } from '@storybook/react-vite';
import EditableText, { type EditableTextProps } from '../../src/components/EditableText';

const meta: Meta<EditableTextProps> = {
  title: 'Components/EditableText',
  component: EditableText,
  args: {
    value: '点击右侧编辑图标可修改文本',
    editable: true,
    editing: false,
    required: false,
    textComp: 'Text',
  },
  argTypes: {},
};

export default meta;
type Story = StoryObj<EditableTextProps>;

export const Playground: Story = {
  render: (args: EditableTextProps) => (
    <div style={{ maxWidth: 520 }}>
      <EditableText
        {...args}
        onOk={async () => {
          await Promise.resolve();
        }}
      />
    </div>
  ),
};
