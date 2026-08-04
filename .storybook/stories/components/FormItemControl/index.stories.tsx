import type { Meta, StoryObj } from '@storybook/react-vite';
import { Form, Slider, Typography } from 'antd';
import FormItemControl from '../../../../src/components/FormItemControl';
import storyI18n, { useStoryT } from '../../../locales';
import apiDocEN from './api-doc.en-US.md?raw';
import apiDocCN from './api-doc.zh-CN.md?raw';
import introduceEN from './introduce.en-US.md?raw';
import introduceCN from './introduce.zh-CN.md?raw';

const meta: Meta<typeof FormItemControl> = {
  title: 'Components/FormItemControl',
  component: FormItemControl,
  parameters: {
    docs: {
      description: {
        component: storyI18n.language === 'zh-CN' ? introduceCN + apiDocCN : introduceEN + apiDocEN,
      },
    },
  },
  argTypes: {},
};

export default meta;
type Story = StoryObj<typeof FormItemControl>;

export const Playground: Story = {
  parameters: {
    docs: {
      description: {
        story: `- **EN:** Uses a Slider as a controlled field and mirrors the current form value below it.
- **CN:** 使用 Slider 作为受控字段，并在下方同步展示当前表单值。`,
      },
    },
  },
  render: function Render() {
    const t = useStoryT();
    return (
      <Form initialValues={{ score: 50 }} layout="vertical" style={{ maxWidth: 480 }}>
        <Form.Item label={t('storybook.stories.FormItemControl.scoreLabel')} name="score">
          <FormItemControl>
            {({ value, onChange }) => (
              <div>
                <Slider min={0} max={100} value={value} onChange={onChange} />
                <Typography.Text type="secondary">
                  {t('storybook.stories.FormItemControl.currentValue', { value })}
                </Typography.Text>
              </div>
            )}
          </FormItemControl>
        </Form.Item>
      </Form>
    );
  },
};
