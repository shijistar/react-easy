import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import EditableText, { type EditableTextProps } from '../../../src/components/EditableText';
import { storyT } from '../../locales';

const meta: Meta<EditableTextProps> = {
  title: 'Components/EditableText',
  component: EditableText,
  parameters: {
    docs: {
      description: {
        component: `- **EN:** Editable text component, providing a read-only display and an edit mode, supporting
inline text editing, with edit state, validation-related switches, and edit lifecycle callbacks.
- **CN:** 可编辑文本组件，提供只读显示和编辑模式，支持行内文本编辑，提供编辑态、校验相关开关和编辑生命周期回调。`,
      },
    },
  },
  args: {
    value: storyT('storybook.stories.EditableText.args.value'),
    editable: true,
    editing: false,
    required: false,
    textComp: 'Text',
    onChange: fn(),
    onOk: fn(),
    onCancel: fn(),
    onEditingChange: fn(),
  },
  argTypes: {
    value: {
      control: 'text',
      description: `- **EN:** Current text value displayed and edited by the component.
- **CN:** 组件当前展示和编辑的文本值。`,
      table: { defaultValue: { summary: '-' } },
    },
    editable: {
      control: 'boolean',
      description: `- **EN:** Controls whether the edit affordance is available.
- **CN:** 控制是否允许进入编辑状态。`,
      table: { defaultValue: { summary: 'true' } },
    },
    editing: {
      control: 'boolean',
      description: `- **EN:** Forces the component into editing mode when controlled externally.
- **CN:** 外部受控地将组件切换到编辑状态。`,
      table: { defaultValue: { summary: 'false' } },
    },
    required: {
      control: 'boolean',
      description: `- **EN:** Marks the editor as required when confirming changes.
- **CN:** 在确认修改时将输入视为必填。`,
      table: { defaultValue: { summary: 'false' } },
    },
    textComp: {
      control: 'text',
      description: `- **EN:** Typography component type used to render the read-only text state.
- **CN:** 只读文本态所使用的排版组件类型。`,
      table: { defaultValue: { summary: "'Text'" } },
    },
  },
};

export default meta;
type Story = StoryObj<EditableTextProps>;

export const Playground: Story = {
  parameters: {
    docs: {
      description: {
        story: `- **EN:** Try toggling editable and editing state to inspect the inline editing experience.
- **CN:** 可切换 editable 和 editing 状态，观察行内编辑体验。`,
      },
    },
  },
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
