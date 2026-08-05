import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Alert, Card, Input, Space, Tag, Typography } from 'antd';
import type { RuleRegExpFlags } from '../../../../src/hooks/useValidatorBuilder';
import useValidatorBuilder from '../../../../src/hooks/useValidatorBuilder';
import storyI18n, { storyT, useStoryT } from '../../../locales';
import apiDocEN from './api-doc.en-US.md?raw';
import apiDocCN from './api-doc.zh-CN.md?raw';
import introduceEN from './introduce.en-US.md?raw';
import introduceCN from './introduce.zh-CN.md?raw';

interface UseValidatorBuilderStoryArgs {
  letter: boolean;
  number: boolean;
  underscore: boolean;
  hyphen: boolean;
  chineseCharacter: boolean;
  max: number;
  testValue: string;
}

const meta: Meta<UseValidatorBuilderStoryArgs> = {
  title: 'Hooks/useValidatorBuilder',
  parameters: {
    docs: {
      description: {
        component: storyI18n.language === 'zh-CN' ? `${introduceCN}\n${apiDocCN}` : `${introduceEN}\n${apiDocEN}`,
      },
    },
  },
  args: {
    letter: true,
    number: true,
    underscore: false,
    hyphen: false,
    chineseCharacter: false,
    max: 20,
    testValue: 'abc123',
  },
  argTypes: {
    letter: {
      control: 'boolean',
      description: storyT('storybook.stories.useValidatorBuilder.argTypes.letter.description'),
    },
    number: {
      control: 'boolean',
      description: storyT('storybook.stories.useValidatorBuilder.argTypes.number.description'),
    },
    underscore: {
      control: 'boolean',
      description: storyT('storybook.stories.useValidatorBuilder.argTypes.underscore.description'),
    },
    hyphen: {
      control: 'boolean',
      description: storyT('storybook.stories.useValidatorBuilder.argTypes.hyphen.description'),
    },
    chineseCharacter: {
      control: 'boolean',
      description: storyT('storybook.stories.useValidatorBuilder.argTypes.chineseCharacter.description'),
    },
    max: {
      control: { type: 'number' },
      description: storyT('storybook.stories.useValidatorBuilder.argTypes.max.description'),
    },
    testValue: {
      control: 'text',
      description: storyT('storybook.stories.useValidatorBuilder.argTypes.testValue.description'),
    },
  },
};

export default meta;
type Story = StoryObj<UseValidatorBuilderStoryArgs>;

export const Playground: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '- **EN:** Toggle allowed character flags and a max length, then test a value against the generated rule. The resulting regex pattern is shown inline.\\n- **CN:** 切换允许的字符标志与最大长度，然后用生成规则测试一个值。生成的正则表达式会内联展示。',
      },
    },
  },
  render: function Render(args: UseValidatorBuilderStoryArgs) {
    return <UseValidatorBuilderStoryDemo {...args} />;
  },
};

function UseValidatorBuilderStoryDemo({
  letter,
  number,
  underscore,
  hyphen,
  chineseCharacter,
  max,
  testValue,
}: UseValidatorBuilderStoryArgs) {
  const t = useStoryT();
  const build = useValidatorBuilder();
  const [draft, setDraft] = useState('');

  const allowed: RuleRegExpFlags = {
    letter,
    number,
    underscore,
    hyphen,
    chineseCharacter,
    max: max || undefined,
  };

  const rule = build({ allowed });
  const passed = rule.pattern.test(testValue || draft);
  const patternText = rule.pattern.toString();

  return (
    <Card variant="outlined" style={{ maxWidth: 920 }} title={t('storybook.stories.useValidatorBuilder.cardTitle')}>
      <Space orientation="vertical" size="large" style={{ width: '100%' }}>
        <Typography.Paragraph style={{ marginBottom: 0 }}>
          {t('storybook.stories.useValidatorBuilder.description')}
        </Typography.Paragraph>

        <Space wrap>
          <Input
            style={{ maxWidth: 300 }}
            placeholder="abc123"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <Typography.Text strong>
            {t('storybook.stories.useValidatorBuilder.maxLabel')} {max}
          </Typography.Text>
        </Space>

        <Space wrap>
          <Tag color={letter ? 'green' : 'default'}>a-zA-Z</Tag>
          <Tag color={number ? 'green' : 'default'}>0-9</Tag>
          <Tag color={underscore ? 'green' : 'default'}>_</Tag>
          <Tag color={hyphen ? 'green' : 'default'}>-</Tag>
          <Tag color={chineseCharacter ? 'green' : 'default'}>汉字</Tag>
        </Space>

        <Space wrap>
          <Typography.Text strong>{t('storybook.stories.useValidatorBuilder.resultLabel')}</Typography.Text>
          <Tag color={passed ? 'green' : 'red'}>
            {passed ? t('storybook.stories.useValidatorBuilder.pass') : t('storybook.stories.useValidatorBuilder.fail')}
          </Tag>
          <Typography.Text strong>{t('storybook.stories.useValidatorBuilder.patternLabel')}</Typography.Text>
          <Typography.Text code copyable>
            {patternText}
          </Typography.Text>
        </Space>

        <Alert type="info" message={t('storybook.stories.useValidatorBuilder.tip')} showIcon />
      </Space>
    </Card>
  );
}
