import type { Meta, StoryObj } from '@storybook/react';
import { App as AntdApp, message } from 'antd';
import ConfirmAction from '../../src/components/ConfirmAction';

type TriggerType = 'button' | 'switch' | 'link';

type ConfirmActionStoryArgs = {
  triggerType: TriggerType;
  triggerText: string;
  title: string;
  content: string;
  danger: boolean;
  okText: string;
  cancelText: string;
};

const meta: Meta<ConfirmActionStoryArgs> = {
  title: 'Components/ConfirmAction',
  args: {
    triggerType: 'button',
    triggerText: '执行操作',
    title: '确认执行该操作？',
    content: '这是一个可交互的 ConfirmAction demo。',
    danger: false,
    okText: '确认',
    cancelText: '取消',
  },
  argTypes: {
    triggerType: {
      control: 'radio',
      options: ['button', 'switch', 'link'],
      description: `- **EN:** Demo-only option to switch trigger component type.
- **CN:** 示例专用：切换触发器组件类型。`,
    },
    triggerText: {
      control: 'text',
      description: `- **EN:** Custom trigger content.
- **CN:** 自定义触发器内容。`,
    },
    title: {
      control: 'text',
      description: `- **EN:** Confirm box title.
- **CN:** 确认框标题。`,
    },
    content: {
      control: 'text',
      description: `- **EN:** Confirm box content text.
- **CN:** 确认框内容文本。`,
    },
    danger: {
      control: 'boolean',
      description: `- **EN:** Whether to display in red danger mode.
- **CN:** 是否显示为红色危险模式。`,
    },
    okText: {
      control: 'text',
      description: `- **EN:** Confirm button text.
- **CN:** 确认按钮文本。`,
    },
    cancelText: {
      control: 'text',
      description: `- **EN:** Cancel button text.
- **CN:** 取消按钮文本。`,
    },
  },
};

export default meta;
type Story = StoryObj<ConfirmActionStoryArgs>;

export const Playground: Story = {
  render: (args: ConfirmActionStoryArgs) => {
    const commonProps = {
      title: args.title,
      content: args.content,
      danger: args.danger,
      okText: args.okText,
      cancelText: args.cancelText,
      onOk: async () => {
        message.success('操作成功');
      },
    };

    if (args.triggerType === 'switch') {
      return (
        <AntdApp>
          <ConfirmAction.Switch {...commonProps} />
        </AntdApp>
      );
    }

    if (args.triggerType === 'link') {
      return (
        <AntdApp>
          <ConfirmAction.Link {...commonProps}>{args.triggerText}</ConfirmAction.Link>
        </AntdApp>
      );
    }

    return (
      <AntdApp>
        <ConfirmAction.Button {...commonProps}>{args.triggerText}</ConfirmAction.Button>
      </AntdApp>
    );
  },
};
