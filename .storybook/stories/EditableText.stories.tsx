import type { Meta, StoryObj } from '@storybook/react-vite';
import EditableText from '../../src/components/EditableText';

interface EditableTextStoryArgs {
  value: string;
  editable: boolean;
  editing: boolean;
  required: boolean;
  textComp: 'Text' | 'Paragraph' | 'Title' | 'Link';
  blockView: boolean;
  blockEdit: boolean;
  maxLength: number;
}

const meta: Meta<EditableTextStoryArgs> = {
  title: 'Components/EditableText',
  args: {
    value: '点击右侧编辑图标可修改文本',
    editable: true,
    editing: false,
    required: false,
    textComp: 'Text',
    blockView: false,
    blockEdit: false,
    maxLength: 100,
  },
  argTypes: {
    value: {
      control: 'text',
      description: `- **EN:** Current value of editable text.
- **CN:** 可编辑文本的当前值。`,
      table: { defaultValue: { summary: '点击右侧编辑图标可修改文本（demo）' } },
    },
    editable: {
      control: 'boolean',
      description: `- **EN:** Whether to allow editing.
- **CN:** 是否允许编辑。`,
      table: { defaultValue: { summary: 'true' } },
    },
    editing: {
      control: 'boolean',
      description: `- **EN:** Whether to open edit mode.
- **CN:** 是否打开编辑模式。`,
      table: { defaultValue: { summary: 'false' } },
    },
    required: {
      control: 'boolean',
      description: `- **EN:** Whether input value is required.
- **CN:** 输入值是否必填。`,
      table: { defaultValue: { summary: 'false（demo）' } },
    },
    textComp: {
      control: 'radio',
      options: ['Text', 'Paragraph', 'Title', 'Link'],
      description: `- **EN:** Custom component type for rendering the text.
- **CN:** 自定义渲染文本组件类型。`,
      table: { defaultValue: { summary: 'Text' } },
    },
    blockView: {
      control: 'boolean',
      description: `- **EN:** Whether to display as block in view mode.
- **CN:** 只读模式是否块级显示。`,
      table: { defaultValue: { summary: 'false' } },
    },
    blockEdit: {
      control: 'boolean',
      description: `- **EN:** Whether to display as block in edit mode.
- **CN:** 编辑模式是否块级显示。`,
      table: { defaultValue: { summary: 'false' } },
    },
    maxLength: {
      control: { type: 'number', min: 10, max: 300, step: 1 },
      description: `- **EN:** Maximum input length in this demo.
- **CN:** 当前示例中的输入最大长度。`,
      table: { defaultValue: { summary: '100（demo）' } },
    },
  },
};

export default meta;
type Story = StoryObj<EditableTextStoryArgs>;

export const Playground: Story = {
  render: (args: EditableTextStoryArgs) => (
    <div style={{ maxWidth: 520 }}>
      <EditableText
        value={args.value}
        editable={args.editable}
        editing={args.editing}
        required={args.required}
        textComp={args.textComp}
        block={{ view: args.blockView, editing: args.blockEdit }}
        inputProps={{ maxLength: args.maxLength, showCount: true }}
        onOk={async () => {
          await Promise.resolve();
        }}
      />
    </div>
  ),
};
