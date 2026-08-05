import type { Meta, StoryObj } from '@storybook/react-vite';
import { Alert, Card, Input, Select, Space, Tag, Typography } from 'antd';
import useValidators from '../../../../src/hooks/useValidators';
import storyI18n, { storyT, useStoryT } from '../../../locales';
import apiDocEN from './api-doc.en-US.md?raw';
import apiDocCN from './api-doc.zh-CN.md?raw';
import introduceEN from './introduce.en-US.md?raw';
import introduceCN from './introduce.zh-CN.md?raw';

interface UseValidatorsStoryArgs {
  rule: string;
  value: string;
}

const meta: Meta<UseValidatorsStoryArgs> = {
  title: 'Hooks/useValidators',
  parameters: {
    docs: {
      description: {
        component: storyI18n.language === 'zh-CN' ? `${introduceCN}\n${apiDocCN}` : `${introduceEN}\n${apiDocEN}`,
      },
    },
  },
  args: {
    rule: 'email',
    value: 'user@example.com',
  },
  argTypes: {
    rule: {
      control: 'select',
      options: [
        'number',
        'floatNumber',
        'email',
        'ip',
        'cnMobile',
        'password',
        'code',
        'codeMax20',
        'codeMax64',
        'codeMax128',
        'name',
        'nameMax20',
        'nameMax64',
        'nameMax128',
        'strongName',
        'strongNameMax64',
        'strongNameMax128',
      ],
      description: storyT('storybook.stories.useValidators.argTypes.rule.description'),
    },
    value: {
      control: 'text',
      description: storyT('storybook.stories.useValidators.argTypes.value.description'),
    },
  },
};

export default meta;
type Story = StoryObj<UseValidatorsStoryArgs>;

export const Playground: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '- **EN:** Pick a built-in validation rule and type a test value. The demo shows the underlying regex pattern and whether the value passes.\\n- **CN:** 选择一个内置校验规则并输入测试值。示例展示底层的正则表达式以及值是否通过校验。',
      },
    },
  },
  render: function Render(args: UseValidatorsStoryArgs) {
    return <UseValidatorsStoryDemo {...args} />;
  },
};

function UseValidatorsStoryDemo({ rule, value }: UseValidatorsStoryArgs) {
  const t = useStoryT();
  const validators = useValidators();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const selected = (validators as any)[rule] ?? validators.email;

  const passed = selected.pattern.test(value);
  const patternText = selected.pattern.toString();

  return (
    <Card variant="outlined" style={{ maxWidth: 920 }} title={t('storybook.stories.useValidators.cardTitle')}>
      <Space orientation="vertical" size="large" style={{ width: '100%' }}>
        <Typography.Paragraph style={{ marginBottom: 0 }}>
          {t('storybook.stories.useValidators.description')}
        </Typography.Paragraph>

        <Space wrap>
          <Select
            style={{ minWidth: 200 }}
            value={rule}
            options={[
              'number',
              'floatNumber',
              'email',
              'ip',
              'cnMobile',
              'password',
              'code',
              'codeMax20',
              'codeMax64',
              'codeMax128',
              'name',
              'nameMax20',
              'nameMax64',
              'nameMax128',
              'strongName',
              'strongNameMax64',
              'strongNameMax128',
            ].map((key) => ({ value: key, label: key }))}
            onChange={(v) => {
              // controlled by args
              void v;
            }}
          />
          <Input
            style={{ maxWidth: 300 }}
            placeholder={t('storybook.stories.useValidators.valuePlaceholder')}
            value={value}
            onChange={(e) => {
              void e;
            }}
          />
        </Space>

        <Space wrap>
          <Typography.Text strong>{t('storybook.stories.useValidators.resultLabel')}</Typography.Text>
          <Tag color={passed ? 'green' : 'red'}>
            {passed ? t('storybook.stories.useValidators.pass') : t('storybook.stories.useValidators.fail')}
          </Tag>
        </Space>

        <Typography.Text strong>{t('storybook.stories.useValidators.patternLabel')}</Typography.Text>
        <Typography.Text code copyable>
          {patternText}
        </Typography.Text>
        <Typography.Text type="secondary">{selected.message}</Typography.Text>

        <Alert type="info" title={t('storybook.stories.useValidators.tip')} showIcon />
      </Space>
    </Card>
  );
}
