import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ButtonProps, SwitchProps } from 'antd';
import { App as AntdApp } from 'antd';
import type { LinkProps } from 'antd/es/typography/Link';
import { fn } from 'storybook/test';
import type { ConfirmActionProps } from '../../src/components/ConfirmAction';
import DeleteConfirmAction from '../../src/components/DeleteConfirmAction';
import { storyT } from '../locales';

type TriggerType = 'Button' | 'Switch' | 'Link';

type DeleteConfirmActionStoryArgs = ConfirmActionProps<object, never> & {
  triggerType: TriggerType;
};

const meta: Meta<DeleteConfirmActionStoryArgs> = {
  title: 'Components/DeleteConfirmAction',
  parameters: {
    docs: {
      description: {
        component: `- **EN:** Wraps a trigger component and opens a delete confirmation modal before executing the action. Can switch between Button, Switch, and Link trigger types.
- **CN:** 对触发器组件进行封装，在真正执行操作前弹出删除确认框，可切换 Button、Switch、Link 三种触发方式。`,
      },
    },
  },
  args: {
    triggerType: 'Button',
    triggerProps: {
      type: 'primary',
      shape: 'default',
      size: 'middle',
      ghost: false,
      loading: false,
      danger: false,
      block: false,
      children: storyT('storybook.stories.DeleteConfirmAction.args.triggerChildren'),
    },
    title: storyT('storybook.stories.DeleteConfirmAction.args.title'),
    content: storyT('storybook.stories.DeleteConfirmAction.args.content'),
    okText: storyT('storybook.stories.DeleteConfirmAction.args.okText'),
    cancelText: storyT('storybook.stories.DeleteConfirmAction.args.cancelText'),
    width: 416,
    closable: true,
    mask: true,
    maskClosable: false,
    danger: false,
    keyboard: false,
    autoFocusButton: undefined,
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
      description: `- **EN:** Demo-only option to switch trigger component type.
- **CN:** 示例专用：切换触发器组件类型。`,
      table: { defaultValue: { summary: '"Button"' } },
    },
    autoFocusButton: {
      control: 'select',
      options: ['ok', 'cancel'],
      description: `- **EN:** The button to auto focus when the confirm action is opened.
- **CN:** 确认操作打开时自动获取焦点的按钮。`,
      table: { defaultValue: { summary: 'undefined' } },
    },
  },
  subcomponents: {
    Button: DeleteConfirmAction.Button,
    Switch: DeleteConfirmAction.Switch,
    Link: DeleteConfirmAction.Link,
  },
};

export default meta;
type Story = StoryObj<DeleteConfirmActionStoryArgs>;

export const Playground: Story = {
  render: function Render(args: DeleteConfirmActionStoryArgs) {
    const { triggerType, ...props } = args;

    if (triggerType === 'Switch') {
      return (
        <AntdApp>
          <DeleteConfirmAction.Switch {...(props as ConfirmActionProps<SwitchProps, 'onChange'>)} />
        </AntdApp>
      );
    }

    if (triggerType === 'Link') {
      return (
        <AntdApp>
          <DeleteConfirmAction.Link {...(props as ConfirmActionProps<LinkProps, 'onClick'>)} />
        </AntdApp>
      );
    }

    return (
      <AntdApp>
        <DeleteConfirmAction.Button {...(props as ConfirmActionProps<ButtonProps, 'onClick'>)} />
      </AntdApp>
    );
  },
};
