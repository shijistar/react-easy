import { type ComponentType, type FC, type RefAttributes, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { type ButtonProps, Form, Input, message, Space, type SwitchProps } from 'antd';
import type { LinkProps } from 'antd/es/typography/Link';
import { fn } from 'storybook/test';
import type { FormCompPropsConstraint, ModalActionProps } from '../../../src/components/ModalAction';
import { withModalAction } from '../../../src/components/ModalAction';
import { storyT, useStoryT } from '../../locales';

type ModalActionStoryArgs = ModalActionProps<
  UserForm,
  FormCompPropsConstraint<UserForm>,
  ButtonProps,
  'onClick',
  object
> & {
  triggerType: 'Button' | 'Switch' | 'Link';
};

const UserFormComp: FC<UserFormProps> = ({ data, form, onSave }) => {
  const t = useStoryT();

  onSave((formData) => {
    message.success(t('storybook.stories.ModalAction.saved', { name: formData.name }));
    return formData;
  });

  return (
    <Form form={form} layout="vertical" initialValues={data} autoComplete="off">
      <Form.Item
        label={t('storybook.stories.ModalAction.form.nameLabel')}
        name="name"
        rules={[{ required: true, message: t('storybook.stories.ModalAction.form.nameRequired') }]}
      >
        <Input placeholder={t('storybook.stories.ModalAction.form.namePlaceholder')} />
      </Form.Item>
      <Form.Item
        label={t('storybook.stories.ModalAction.form.emailLabel')}
        name="email"
        rules={[{ required: true, type: 'email', message: t('storybook.stories.ModalAction.form.emailInvalid') }]}
      >
        <Input placeholder={t('storybook.stories.ModalAction.form.emailPlaceholder')} />
      </Form.Item>
    </Form>
  );
};

const UserModalAction = withModalAction<UserForm, UserFormProps, ButtonProps, 'onClick', object>(
  UserFormComp as ComponentType<UserFormProps & RefAttributes<object>>
);

const meta: Meta<ModalActionStoryArgs> = {
  title: 'Components/ModalAction',
  parameters: {
    docs: {
      description: {
        component: `- **EN:** A dynamic form modal component that supports multiple trigger variants. It is ideal for reusing the same form component in create and edit flows.
- **CN:** 一个动态表单的弹窗组件，并支持多种触发器形态。非常适合在创建和编辑流程中复用同一个表单组件。`,
      },
    },
  },
  args: {
    title: storyT('storybook.stories.ModalAction.args.title'),
    triggerType: 'Button',
    triggerProps: {
      type: 'default',
      shape: 'default',
      size: 'middle',
      ghost: false,
      loading: false,
      danger: false,
      block: false,
    },
    width: 520,
    closable: true,
    mask: true,
    maskClosable: false,
    destroyOnClose: true,
    keyboard: false,
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
type Story = StoryObj<ModalActionStoryArgs>;

export const Playground: Story = {
  parameters: {
    docs: {
      description: {
        story: `- **EN:** Demonstrates create and edit flows backed by the same form component and different trigger variants.
- **CN:** 演示同一个表单组件在创建、编辑流程以及不同触发器形态下的复用方式。`,
      },
    },
  },
  render: function Render(args: ModalActionStoryArgs) {
    const t = useStoryT();
    const { triggerType, ...props } = args;
    const [user, setUser] = useState<UserForm>();
    const [editUser] = useState<UserForm>({
      name: t('storybook.stories.ModalAction.defaults.name'),
      email: t('storybook.stories.ModalAction.defaults.email'),
    });

    return (
      <div>
        <Space direction="vertical">
          <Space>
            {triggerType === 'Switch' && (
              <UserModalAction.Switch
                {...(props as ModalActionProps<UserForm, UserFormProps, SwitchProps, 'onChange', object>)}
                onOk={setUser}
              >
                {t('storybook.stories.ModalAction.actions.create')}
              </UserModalAction.Switch>
            )}
            {triggerType === 'Link' && (
              <UserModalAction.Link
                {...(props as ModalActionProps<UserForm, UserFormProps, LinkProps, 'onClick', object>)}
                onOk={setUser}
              >
                {t('storybook.stories.ModalAction.actions.create')}
              </UserModalAction.Link>
            )}
            {triggerType === 'Button' && (
              <UserModalAction.Button
                {...(props as ModalActionProps<UserForm, UserFormProps, ButtonProps, 'onClick', object>)}
                onOk={setUser}
              >
                {t('storybook.stories.ModalAction.actions.create')}
              </UserModalAction.Button>
            )}
            {triggerType === 'Switch' && (
              <UserModalAction.Switch
                {...(props as ModalActionProps<UserForm, UserFormProps, SwitchProps, 'onChange', object>)}
                formProps={{
                  data: user ?? editUser,
                  ...props.formProps,
                }}
                onOk={setUser}
              >
                {t('storybook.stories.ModalAction.actions.edit')}
              </UserModalAction.Switch>
            )}
            {triggerType === 'Link' && (
              <UserModalAction.Link
                {...(props as ModalActionProps<UserForm, UserFormProps, LinkProps, 'onClick', object>)}
                formProps={{
                  data: user ?? editUser,
                  ...props.formProps,
                }}
                onOk={setUser}
              >
                {t('storybook.stories.ModalAction.actions.edit')}
              </UserModalAction.Link>
            )}
            {triggerType === 'Button' && (
              <UserModalAction.Button
                {...(props as ModalActionProps<UserForm, UserFormProps, ButtonProps, 'onClick', object>)}
                formProps={{
                  data: user ?? editUser,
                  ...props.formProps,
                }}
                onOk={setUser}
              >
                {t('storybook.stories.ModalAction.actions.edit')}
              </UserModalAction.Button>
            )}
          </Space>
          <div>{user && t('storybook.stories.ModalAction.userInfo', { name: user.name, email: user.email })}</div>
        </Space>
      </div>
    );
  },
};

interface UserForm {
  name: string;
  email: string;
}

interface UserFormProps extends FormCompPropsConstraint<UserForm> {
  data?: UserForm;
}
