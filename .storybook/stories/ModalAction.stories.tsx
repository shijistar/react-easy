import { type ComponentType, type FC, type RefAttributes, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { type ButtonProps, Form, Input, message, Space, type SwitchProps } from 'antd';
import type { LinkProps } from 'antd/es/typography/Link';
import type { FormCompPropsConstraint, ModalActionProps } from '../../src/components/ModalAction';
import { withModalAction } from '../../src/components/ModalAction';

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
  onSave((formData) => {
    message.success(`已保存：${formData.name}`);
    return formData;
  });

  return (
    <Form form={form} layout="vertical" initialValues={data} autoComplete="off">
      <Form.Item label="姓名" name="name" rules={[{ required: true, message: '请输入姓名' }]}>
        <Input placeholder="请输入姓名" />
      </Form.Item>
      <Form.Item label="邮箱" name="email" rules={[{ required: true, type: 'email', message: '请输入合法邮箱地址' }]}>
        <Input placeholder="请输入邮箱" />
      </Form.Item>
    </Form>
  );
};

const UserModalAction = withModalAction<UserForm, UserFormProps, ButtonProps, 'onClick', object>(
  UserFormComp as ComponentType<UserFormProps & RefAttributes<object>>
);

const meta: Meta<ModalActionStoryArgs> = {
  title: 'Components/ModalAction',
  component: UserModalAction,
  args: {
    title: '用户信息',
    triggerType: 'Button',
    width: 520,
    destroyOnClose: true,
    maskClosable: false,
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
  render: function Render(args: ModalActionStoryArgs) {
    const { triggerType, ...props } = args;
    const [user, setUser] = useState<UserForm>();
    const [editUser] = useState<UserForm>({
      name: 'Alice',
      email: 'alice@example.com',
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
                创建
              </UserModalAction.Switch>
            )}
            {triggerType === 'Link' && (
              <UserModalAction.Link
                {...(props as ModalActionProps<UserForm, UserFormProps, LinkProps, 'onClick', object>)}
                onOk={setUser}
              >
                创建
              </UserModalAction.Link>
            )}
            {triggerType === 'Button' && (
              <UserModalAction.Button
                {...(props as ModalActionProps<UserForm, UserFormProps, ButtonProps, 'onClick', object>)}
                onOk={setUser}
              >
                创建
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
                编辑
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
                编辑
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
                编辑
              </UserModalAction.Button>
            )}
          </Space>
          <div>{user && `用户信息：${user.name} (${user.email})`}</div>
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
