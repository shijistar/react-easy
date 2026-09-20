import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Alert, Card, Input, Select, Space, Tag, Typography } from 'antd';
import usePropState from '../../../../src/hooks/usePropState';
import type { ValidatorRuleMap } from '../../../../src/hooks/useValidators';
import useValidators from '../../../../src/hooks/useValidators';
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

const SAMPLE_VALUES: Record<keyof ValidatorRuleMap, string> = {
  number: '123',
  floatNumber: '123.45',
  email: 'user@example.com',
  ip: '192.168.0.1',
  cnMobile: '13800138000',
  password: 'ju7g_5ds@123',
  code: 'SCB_500_ORG_24PK',
  codeMax20: 'SCB_500_ORG_24PK',
  codeMax64: 'SCB_500_ORG_24PK',
  codeMax128: 'SCB_500_ORG_24PK',
  codeWithMax: 'SCB_500_ORG_24PK',
  name: 'Johnathan Alexander',
  nameMax20: 'Johnathan Alexander',
  nameMax64: 'Johnathan Alexander',
  nameMax128: 'Johnathan Alexander',
  nameWithMax: 'Johnathan Alexander',
  strongName: 'Johnathan Alexander',
  strongNameMax64: 'Johnathan Alexander',
  strongNameMax128: 'Johnathan Alexander',
  strongNameWithMax: 'Johnathan Alexander',
};

function UseValidatorsStoryDemo({ rule }: UseValidatorsStoryArgs) {
  const t = useStoryT();
  const validators = useValidators();

  // `ruleName` mirrors the Storybook `rule` arg, but the Select can also change it locally, so the
  // prop keeps driving it whenever the arg control changes.
  const [ruleName, setRuleName] = usePropState<keyof ValidatorRuleMap>(rule);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const selectedRule = (validators as any)[ruleName] ?? validators.email;

  const [value, setValue] = useState(SAMPLE_VALUES[ruleName]);
  // Reset the sample value in the same render that observes a new rule, instead of in an effect.
  const [prevRuleName, setPrevRuleName] = useState(ruleName);
  if (prevRuleName !== ruleName) {
    setPrevRuleName(ruleName);
    setValue(SAMPLE_VALUES[ruleName]);
  }

  const passed = selectedRule.pattern.test(value);
  const patternText = selectedRule.pattern.toString();

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
