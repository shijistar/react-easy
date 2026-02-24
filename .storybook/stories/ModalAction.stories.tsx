import type { ComponentType, RefAttributes } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Form, Input, message } from 'antd';
import type { FormCompPropsConstraint } from '../../src/components/ModalAction';
import { withModalAction } from '../../src/components/ModalAction';

type UserForm = {
  name: string;
  email: string;
};

type UserFormProps = FormCompPropsConstraint<UserForm>;

type ModalActionStoryArgs = {
  title: string;
  triggerType: 'button' | 'switch' | 'link';
  triggerText: string;
  width: number;
  destroyOnClose: boolean;
  maskClosable: boolean;
};

const UserFormComp: ComponentType<UserFormProps> = ({ form, onSave }) => {
  onSave((formData) => {
    message.success(`已保存：${formData.name}`);
    return formData;
  });

  return (
    <Form form={form} layout="vertical" initialValues={{ name: '', email: '' }}>
      <Form.Item label="姓名" name="name" rules={[{ required: true, message: '请输入姓名' }]}>
        <Input placeholder="请输入姓名" />
      </Form.Item>
      <Form.Item label="邮箱" name="email" rules={[{ required: true, type: 'email', message: '请输入合法邮箱地址' }]}>
        <Input placeholder="请输入邮箱" />
      </Form.Item>
    </Form>
  );
};

const UserModalAction = withModalAction<UserForm, UserFormProps, object, never, object>(
  UserFormComp as ComponentType<UserFormProps & RefAttributes<object>>
);

const meta: Meta<ModalActionStoryArgs> = {
  title: 'Components/ModalAction',
  args: {
    title: '编辑用户信息',
    triggerType: 'button',
    triggerText: '打开弹窗',
    width: 520,
    destroyOnClose: true,
    maskClosable: false,
  },
  argTypes: {
    title: {
      control: 'text',
      description: `- **EN:** Modal title.
- **CN:** 弹窗标题。`,
    },
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
    width: {
      control: { type: 'number', min: 320, max: 900, step: 10 },
      description: `- **EN:** Width of the modal dialog.
- **CN:** 弹窗宽度。`,
    },
    destroyOnClose: {
      control: 'boolean',
      description: `- **EN:** Whether to destroy child components on close.
- **CN:** 关闭时是否销毁子组件。`,
    },
    maskClosable: {
      control: 'boolean',
      description: `- **EN:** Whether clicking the mask closes the modal.
- **CN:** 点击遮罩是否可关闭弹窗。`,
    },
  },
};

export default meta;
type Story = StoryObj<ModalActionStoryArgs>;

export const Playground: Story = {
  render: (args: ModalActionStoryArgs) => {
    const commonProps = {
      title: args.title,
      width: args.width,
      destroyOnClose: args.destroyOnClose,
      maskClosable: args.maskClosable,
      onOk: async () => Promise.resolve(),
    };

    if (args.triggerType === 'switch') {
      return <UserModalAction.Switch {...commonProps} />;
    }

    if (args.triggerType === 'link') {
      return <UserModalAction.Link {...commonProps}>{args.triggerText}</UserModalAction.Link>;
    }

    return <UserModalAction.Button {...commonProps}>{args.triggerText}</UserModalAction.Button>;
  },
};
