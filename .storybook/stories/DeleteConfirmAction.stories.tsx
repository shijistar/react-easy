import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ButtonProps, SwitchProps } from 'antd';
import { App as AntdApp } from 'antd';
import type { LinkProps } from 'antd/es/typography/Link';
import type { ConfirmActionProps } from '../../src/components/ConfirmAction';
import DeleteConfirmAction from '../../src/components/DeleteConfirmAction';

type TriggerType = 'Button' | 'Switch' | 'Link';

type DeleteConfirmActionStoryArgs = ConfirmActionProps<object, never> & {
  triggerType: TriggerType;
};

const meta: Meta<DeleteConfirmActionStoryArgs> = {
  title: 'Components/DeleteConfirmAction',
  args: {
    triggerType: 'Button',
    triggerProps: {
      children: '删除',
    },
    title: '确认删除该记录？',
    content: '删除后不可恢复，请谨慎操作。',
    okText: '确认删除',
    cancelText: '取消',
  },
  argTypes: {
    triggerType: {
      control: 'radio',
      options: ['Button', 'Switch', 'Link'],
      description: `- **EN:** Demo-only option to switch trigger component type.
- **CN:** 示例专用：切换触发器组件类型。`,
      table: { defaultValue: { summary: '"Button"' } },
    },
  },
};

export default meta;
type Story = StoryObj<DeleteConfirmActionStoryArgs>;

export const Playground: Story = {
  render: (args: DeleteConfirmActionStoryArgs) => {
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
