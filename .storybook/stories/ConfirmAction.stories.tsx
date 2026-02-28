import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ButtonProps, SwitchProps } from 'antd';
import { App as AntdApp } from 'antd';
import type { LinkProps } from 'antd/es/typography/Link';
import type { ConfirmActionProps } from '../../src/components/ConfirmAction';
import ConfirmAction from '../../src/components/ConfirmAction';
import { storyT } from '../locales';

type TriggerType = 'Button' | 'Switch' | 'Link';

type ConfirmActionStoryArgs = ConfirmActionProps<object, never> & {
  triggerType: TriggerType;
};

const meta: Meta<ConfirmActionStoryArgs> = {
  title: 'Components/ConfirmAction',
  args: {
    triggerType: 'Button',
    triggerProps: {
      children: storyT('storybook.stories.ConfirmAction.args.triggerChildren'),
    },
    title: storyT('storybook.stories.ConfirmAction.args.title'),
    content: storyT('storybook.stories.ConfirmAction.args.content'),
    danger: false,
    okText: storyT('storybook.stories.ConfirmAction.args.okText'),
    cancelText: storyT('storybook.stories.ConfirmAction.args.cancelText'),
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
