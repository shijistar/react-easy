import type { Meta, StoryObj } from '@storybook/react-vite';
import { App as AntdApp, message } from 'antd';
import DeleteConfirmAction from '../../src/components/DeleteConfirmAction';

type TriggerType = 'button' | 'switch' | 'link';

interface DeleteConfirmActionStoryArgs {
  triggerType: TriggerType;
  triggerText: string;
  title: string;
  content: string;
  okText: string;
  cancelText: string;
}

const meta: Meta<DeleteConfirmActionStoryArgs> = {
  title: 'Components/DeleteConfirmAction',
  args: {
    triggerType: 'button',
    triggerText: '删除',
    title: '确认删除该记录？',
    content: '删除后不可恢复，请谨慎操作。',
    okText: '确认删除',
    cancelText: '取消',
  },
  argTypes: {
    triggerType: {
      control: 'radio',
      options: ['button', 'switch', 'link'],
      description: `- **EN:** Demo-only option to switch trigger component type.
- **CN:** 示例专用：切换触发器组件类型。`,
      table: { defaultValue: { summary: 'button（demo）' } },
    },
    triggerText: {
      control: 'text',
      description: `- **EN:** Custom trigger content.
- **CN:** 自定义触发器内容。`,
      table: { defaultValue: { summary: '删除（demo）' } },
    },
    title: {
      control: 'text',
      description: `- **EN:** Confirm box title.
- **CN:** 确认框标题。`,
      table: { defaultValue: { summary: '确认删除该记录？（demo）' } },
    },
    content: {
      control: 'text',
      description: `- **EN:** Confirm box content text.
- **CN:** 确认框内容文本。`,
      table: { defaultValue: { summary: '删除后不可恢复，请谨慎操作。（demo）' } },
    },
    okText: {
      control: 'text',
      description: `- **EN:** Confirm button text.
- **CN:** 确认按钮文本。`,
      table: { defaultValue: { summary: '确认删除（demo）' } },
    },
    cancelText: {
      control: 'text',
      description: `- **EN:** Cancel button text.
- **CN:** 取消按钮文本。`,
      table: { defaultValue: { summary: '取消（demo）' } },
    },
  },
};

export default meta;
type Story = StoryObj<DeleteConfirmActionStoryArgs>;

export const Playground: Story = {
  render: (args: DeleteConfirmActionStoryArgs) => {
    const commonProps = {
      title: args.title,
      content: args.content,
      okText: args.okText,
      cancelText: args.cancelText,
      onOk: async () => {
        message.success('删除成功');
      },
    };

    if (args.triggerType === 'switch') {
      return (
        <AntdApp>
          <DeleteConfirmAction.Switch {...commonProps} />
        </AntdApp>
      );
    }

    if (args.triggerType === 'link') {
      return (
        <AntdApp>
          <DeleteConfirmAction.Link {...commonProps}>{args.triggerText}</DeleteConfirmAction.Link>
        </AntdApp>
      );
    }

    return (
      <AntdApp>
        <DeleteConfirmAction.Button {...commonProps} danger>
          {args.triggerText}
        </DeleteConfirmAction.Button>
      </AntdApp>
    );
  },
};
