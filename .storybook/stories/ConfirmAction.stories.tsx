import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ButtonProps, SwitchProps } from 'antd';
import { App as AntdApp } from 'antd';
import type { LinkProps } from 'antd/es/typography/Link';
import { fn } from 'storybook/test';
import type { ConfirmActionProps } from '../../src/components/ConfirmAction';
import ConfirmAction from '../../src/components/ConfirmAction';
import { storyT } from '../locales';

type TriggerType = 'Button' | 'Switch' | 'Link';

type ConfirmActionStoryArgs = ConfirmActionProps<ButtonProps, 'onClick'> & {
  triggerType: TriggerType;
};

const meta: Meta<ConfirmActionStoryArgs> = {
  title: 'Components/ConfirmAction',
  args: {
    triggerType: 'Button',
    type: 'confirm',
    triggerProps: {
      type: 'primary',
      shape: 'default',
      size: 'middle',
      ghost: false,
      loading: false,
      danger: false,
      block: false,
      children: storyT('storybook.stories.ConfirmAction.args.triggerChildren'),
    },
    title: storyT('storybook.stories.ConfirmAction.args.title'),
    content: storyT('storybook.stories.ConfirmAction.args.content'),
    okText: storyT('storybook.stories.ConfirmAction.args.okText'),
    cancelText: storyT('storybook.stories.ConfirmAction.args.cancelText'),
    width: 416,
    closable: true,
    mask: true,
    maskClosable: false,
    danger: false,
    onOk: fn(),
    onCancel: fn(),
    afterOpenChange: fn(),
    afterClose: fn(),
    afterOk: fn(),
  },
  argTypes: {
    triggerType: {
      control: 'radio',
      options: ['Button', 'Switch', 'Link'],
      description: `- **EN:** Demo-only option to switch trigger component type, \`triggerProps\` will change according to the type
- **CN:** 示例专用：切换触发器组件类型，\`triggerProps\`会根据类型而变化类型定义。`,
      table: { defaultValue: { summary: '"Button"' } },
    },
    type: {
      control: 'select',
      options: ['info', 'success', 'error', 'warn', 'warning', 'confirm'],
      description: `- **EN:** Type of the confirm action.
- **CN:** 确认操作的类型。`,
      table: { defaultValue: { summary: '"confirm"' } },
    },
    triggerProps: {
      description: `- **EN:** Props of the trigger component, will change according to the trigger type.
- **CN:** 触发器组件的Props属性，随触发器类型变化进行调整类型定义。`,
    },
  },
};

export default meta;
type Story = StoryObj<ConfirmActionStoryArgs>;

export const Playground: Story = {
  render: function Render(args: ConfirmActionStoryArgs) {
    const { triggerType, ...props } = args;

    if (triggerType === 'Switch') {
      return (
        <AntdApp>
          <ConfirmAction.Switch {...(props as ConfirmActionProps<SwitchProps, 'onChange'>)} />
        </AntdApp>
      );
    }

    if (triggerType === 'Link') {
      return (
        <AntdApp>
          <ConfirmAction.Link {...(props as ConfirmActionProps<LinkProps, 'onClick'>)} />
        </AntdApp>
      );
    }

    return (
      <AntdApp>
        <ConfirmAction.Button {...(props as ConfirmActionProps<ButtonProps, 'onClick'>)} />
      </AntdApp>
    );
  },
};
