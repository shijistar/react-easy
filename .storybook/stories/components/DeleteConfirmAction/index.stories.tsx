import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import type { ButtonProps, SwitchProps } from 'antd';
import { App as AntdApp } from 'antd';
import type { LinkProps } from 'antd/es/typography/Link';
import type { ConfirmActionProps } from '../../../../src/components/ConfirmAction';
import DeleteConfirmAction from '../../../../src/components/DeleteConfirmAction';
import storyI18n, { storyT } from '../../../locales';
import apiDocEN from './api-doc.en-US.md?raw';
import apiDocCN from './api-doc.zh-CN.md?raw';
import introduceEN from './introduce.en-US.md?raw';
import introduceCN from './introduce.zh-CN.md?raw';

type TriggerType = 'Button' | 'Switch' | 'Link';

type DeleteConfirmActionStoryArgs = ConfirmActionProps<object, never> & {
  triggerType: TriggerType;
};

const meta: Meta<DeleteConfirmActionStoryArgs> = {
  title: 'Components/DeleteConfirmAction',
  parameters: {
    docs: {
      description: {
        component: storyI18n.language === 'zh-CN' ? introduceCN + apiDocCN : introduceEN + apiDocEN,
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
    iconColor: undefined,
    titleColor: undefined,
    contentColor: undefined,
    danger: false,
    width: 416,
    closable: true,
    mask: true,
    maskClosable: false,
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
      description: storyT('storybook.stories.DeleteConfirmAction.argTypes.triggerType.description'),
      table: { defaultValue: { summary: '"Button"' } },
    },
    autoFocusButton: {
      control: 'select',
      options: ['ok', 'cancel'],
      description: storyT('storybook.stories.DeleteConfirmAction.argTypes.autoFocusButton.description'),
      table: { defaultValue: { summary: 'undefined' } },
    },
    iconColor: {
      options: ['info', 'success', 'error', 'warn', 'warning', 'secondary'],
      description: storyT('storybook.stories.DeleteConfirmAction.argTypes.iconColor.description'),
      table: { defaultValue: { summary: 'undefined' } },
    },
    titleColor: {
      options: ['info', 'success', 'error', 'warn', 'warning', 'secondary'],
      description: storyT('storybook.stories.DeleteConfirmAction.argTypes.titleColor.description'),
      table: { defaultValue: { summary: 'undefined' } },
    },
    contentColor: {
      options: ['info', 'success', 'error', 'warn', 'warning', 'secondary'],
      description: storyT('storybook.stories.DeleteConfirmAction.argTypes.contentColor.description'),
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
