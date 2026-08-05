import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import type { ButtonProps, SwitchProps } from 'antd';
import { App as AntdApp } from 'antd';
import type { LinkProps } from 'antd/es/typography/Link';
import type { ConfirmActionProps } from '../../../../src/components/ConfirmAction';
import ConfirmAction from '../../../../src/components/ConfirmAction';
import storyI18n, { storyT } from '../../../locales';
import apiDocEN from './api-doc.en-US.md?raw';
import apiDocCN from './api-doc.zh-CN.md?raw';
import introduceEN from './introduce.en-US.md?raw';
import introduceCN from './introduce.zh-CN.md?raw';

type TriggerType = 'Button' | 'Switch' | 'Link';

type ConfirmActionStoryArgs = ConfirmActionProps<ButtonProps, 'onClick'> & {
  triggerType: TriggerType;
};

const meta: Meta<ConfirmActionStoryArgs> = {
  title: 'Components/ConfirmAction',
  parameters: {
    docs: {
      description: {
        component: storyI18n.language === 'zh-CN' ? `${introduceCN}\n${apiDocCN}` : `${introduceEN}\n${apiDocEN}`,
      },
    },
  },
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
      description: storyT('storybook.stories.ConfirmAction.argTypes.triggerType.description'),
      table: { defaultValue: { summary: '"Button"' } },
    },
    type: {
      control: 'select',
      options: ['info', 'success', 'error', 'warn', 'warning', 'confirm'],
      description: storyT('storybook.stories.ConfirmAction.argTypes.type.description'),
      table: { defaultValue: { summary: '"confirm"' } },
    },
    triggerProps: {
      description: storyT('storybook.stories.ConfirmAction.argTypes.triggerProps.description'),
    },
    autoFocusButton: {
      control: 'select',
      options: ['ok', 'cancel'],
      description: storyT('storybook.stories.ConfirmAction.argTypes.autoFocusButton.description'),
      table: { defaultValue: { summary: 'undefined' } },
    },
    iconColor: {
      options: ['info', 'success', 'error', 'warn', 'warning', 'secondary'],
      description: storyT('storybook.stories.ConfirmAction.argTypes.iconColor.description'),
      table: { defaultValue: { summary: 'undefined' } },
    },
    titleColor: {
      options: ['info', 'success', 'error', 'warn', 'warning', 'secondary'],
      description: storyT('storybook.stories.ConfirmAction.argTypes.titleColor.description'),
      table: { defaultValue: { summary: 'undefined' } },
    },
    contentColor: {
      options: ['info', 'success', 'error', 'warn', 'warning', 'secondary'],
      description: storyT('storybook.stories.ConfirmAction.argTypes.contentColor.description'),
      table: { defaultValue: { summary: 'undefined' } },
    },
  },
  subcomponents: {
    Button: ConfirmAction.Button,
    Switch: ConfirmAction.Switch,
    Link: ConfirmAction.Link,
  },
};

export default meta;
type Story = StoryObj<ConfirmActionStoryArgs>;

export const Playground: Story = {
  parameters: {
    docs: {
      description: {
        story: storyT('storybook.stories.ConfirmAction.stories.Playground.description'),
      },
    },
  },
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
