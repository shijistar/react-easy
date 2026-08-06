import { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Alert, Card, Input, Select, Space, Tag, Typography } from 'antd';
import useValidators, { type ValidatorRuleMap } from '../../../../src/hooks/useValidators';
import storyI18n, { storyT, useStoryT } from '../../../locales';
import apiDocEN from './api-doc.en-US.md?raw';
import apiDocCN from './api-doc.zh-CN.md?raw';
import introduceEN from './introduce.en-US.md?raw';
import introduceCN from './introduce.zh-CN.md?raw';

interface UseValidatorsStoryArgs {
  rule: keyof ValidatorRuleMap;
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
      ] satisfies (keyof ValidatorRuleMap)[],
      description: storyT('storybook.stories.useValidators.argTypes.rule.description'),
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

function UseValidatorsStoryDemo({ rule }: UseValidatorsStoryArgs) {
  const t = useStoryT();
  const validators = useValidators();

  const [ruleName, setRuleName] = useState(rule);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const selectedRule = (validators as any)[ruleName] ?? validators.email;

  const [value, setValue] = useState('user@example.com');
  const passed = selectedRule.pattern.test(value);
  const patternText = selectedRule.pattern.toString();

  useEffect(() => {
    setRuleName(rule);
  }, [rule]);

  useEffect(() => {
    switch (ruleName) {
      case 'email':
        setValue('user@example.com');
        break;
      case 'cnMobile':
        setValue('13800138000');
        break;
      case 'number':
        setValue('123');
        break;
      case 'floatNumber':
        setValue('123.45');
        break;
      case 'ip':
        setValue('192.168.0.1');
        break;
      case 'password':
        setValue('ju7g_5ds@123');
        break;
      case 'code':
      case 'codeMax20':
      case 'codeMax64':
      case 'codeMax128':
      case 'codeWithMax':
        setValue('SCB_500_ORG_24PK');
        break;
      case 'name':
      case 'nameMax20':
      case 'nameMax64':
      case 'nameMax128':
      case 'nameWithMax':
      case 'strongName':
      case 'strongNameMax64':
      case 'strongNameMax128':
      case 'strongNameWithMax':
        setValue('Johnathan Alexander');
        break;
    }
  }, [ruleName]);

  return (
    <Card variant="outlined" style={{ maxWidth: 920 }} title={t('storybook.stories.useValidators.cardTitle')}>
      <Space orientation="vertical" size="large" style={{ width: '100%' }}>
        <Typography.Paragraph style={{ marginBottom: 0 }}>
          {t('storybook.stories.useValidators.description')}
        </Typography.Paragraph>
        <Alert type="info" title={t('storybook.stories.useValidators.tip')} showIcon />

        <Space wrap>
          <Select
            style={{ minWidth: 200 }}
            value={ruleName}
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
              setRuleName(v);
            }}
          />
          <Input
            style={{ width: 240 }}
            placeholder={t('storybook.stories.useValidators.valuePlaceholder')}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
            }}
          />
          <Tag color={passed ? 'green' : 'red'}>
            {passed ? t('storybook.stories.useValidators.pass') : t('storybook.stories.useValidators.fail')}
          </Tag>
        </Space>

        <Typography.Text strong>{t('storybook.stories.useValidators.patternLabel')}</Typography.Text>
        <Typography.Text code copyable>
          {patternText}
        </Typography.Text>
        <Typography.Text type="secondary">{selectedRule.message}</Typography.Text>
      </Space>
    </Card>
  );
}
