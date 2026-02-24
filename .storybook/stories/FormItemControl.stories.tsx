import type { Meta, StoryObj } from '@storybook/react';
import { Form, Slider, Typography } from 'antd';
import FormItemControl from '../../src/components/FormItemControl';

const meta: Meta<typeof FormItemControl> = {
  title: 'Components/FormItemControl',
  component: FormItemControl,
  argTypes: {
    children: {
      control: false,
      description: `- **EN:** Render function receiving \`value\` and \`onChange\`, used as a valid Form.Item control.
- **CN:** 渲染函数，接收 \`value\` 与 \`onChange\`，用于包装为有效的 Form.Item 控件。`,
      table: { defaultValue: { summary: '({ value, onChange }) => ReactNode（必传）' } },
    },
  },
};

export default meta;
type Story = StoryObj<typeof FormItemControl>;

export const Playground: Story = {
  render: () => (
    <Form initialValues={{ score: 50 }} layout="vertical" style={{ maxWidth: 480 }}>
      <Form.Item label="评分" name="score">
        <FormItemControl>
          {({ value, onChange }) => (
            <div>
              <Slider min={0} max={100} value={value} onChange={onChange} />
              <Typography.Text type="secondary">当前值：{value}</Typography.Text>
            </div>
          )}
        </FormItemControl>
      </Form.Item>
    </Form>
  ),
};
