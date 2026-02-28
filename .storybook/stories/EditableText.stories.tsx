import type { Meta, StoryObj } from '@storybook/react-vite';
import EditableText, { type EditableTextProps } from '../../src/components/EditableText';
import { storyT } from '../locales';

const meta: Meta<EditableTextProps> = {
  title: 'Components/EditableText',
  component: EditableText,
  args: {
    value: storyT('storybook.stories.EditableText.args.value'),
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
  render: function Render(args: EditableTextProps) {
    return (
      <div style={{ maxWidth: 520 }}>
        <EditableText
          {...args}
          onOk={async () => {
            await Promise.resolve();
          }}
        />
      </div>
    );
  },
};
