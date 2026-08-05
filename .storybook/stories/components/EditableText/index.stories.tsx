import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import EditableText, { type EditableTextProps } from '../../../../src/components/EditableText';
import storyI18n, { storyT } from '../../../locales';
import apiDocEN from './api-doc.en-US.md?raw';
import apiDocCN from './api-doc.zh-CN.md?raw';
import introduceEN from './introduce.en-US.md?raw';
import introduceCN from './introduce.zh-CN.md?raw';

const meta: Meta<EditableTextProps> = {
  title: 'Components/EditableText',
  component: EditableText,
  parameters: {
    docs: {
      description: {
        component: storyI18n.language === 'zh-CN' ? `${introduceCN}\n${apiDocCN}` : `${introduceEN}\n${apiDocEN}`,
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
      description: storyT('storybook.stories.EditableText.argTypes.value.description'),
      table: { defaultValue: { summary: '-' } },
    },
    editable: {
      control: 'boolean',
      description: storyT('storybook.stories.EditableText.argTypes.editable.description'),
      table: { defaultValue: { summary: 'true' } },
    },
    editing: {
      control: 'boolean',
      description: storyT('storybook.stories.EditableText.argTypes.editing.description'),
      table: { defaultValue: { summary: 'false' } },
    },
    required: {
      control: 'boolean',
      description: storyT('storybook.stories.EditableText.argTypes.required.description'),
      table: { defaultValue: { summary: 'false' } },
    },
    textComp: {
      control: 'text',
      description: storyT('storybook.stories.EditableText.argTypes.textComp.description'),
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
        story: storyT('storybook.stories.EditableText.stories.Playground.description'),
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
