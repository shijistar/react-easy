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
