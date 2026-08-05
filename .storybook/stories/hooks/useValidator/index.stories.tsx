import type { Meta, StoryObj } from '@storybook/react-vite';
import { Alert, Card, Space, Tag, Typography } from 'antd';
import useValidator from '../../../../src/hooks/useValidator';
import type { RuleRegExpFlags } from '../../../../src/hooks/useValidatorBuilder';
import storyI18n, { storyT, useStoryT } from '../../../locales';
import apiDocEN from './api-doc.en-US.md?raw';
import apiDocCN from './api-doc.zh-CN.md?raw';
import introduceEN from './introduce.en-US.md?raw';
import introduceCN from './introduce.zh-CN.md?raw';

interface UseValidatorStoryArgs {
  letter: boolean;
  number: boolean;
  underscore: boolean;
  hyphen: boolean;
  chineseCharacter: boolean;
  max: number;
  testValue: string;
}

const meta: Meta<UseValidatorStoryArgs> = {
  title: 'Hooks/useValidator',
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
    letter: { control: 'boolean', description: storyT('storybook.stories.useValidator.argTypes.letter.description') },
    number: { control: 'boolean', description: storyT('storybook.stories.useValidator.argTypes.number.description') },
    underscore: {
      control: 'boolean',
      description: storyT('storybook.stories.useValidator.argTypes.underscore.description'),
    },
    hyphen: { control: 'boolean', description: storyT('storybook.stories.useValidator.argTypes.hyphen.description') },
    chineseCharacter: {
      control: 'boolean',
      description: storyT('storybook.stories.useValidator.argTypes.chineseCharacter.description'),
    },
    max: {
      control: { type: 'number' },
      description: storyT('storybook.stories.useValidator.argTypes.max.description'),
    },
    testValue: {
      control: 'text',
      description: storyT('storybook.stories.useValidator.argTypes.testValue.description'),
    },
  },
};

export default meta;
type Story = StoryObj<UseValidatorStoryArgs>;

export const Playground: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '- **EN:** Toggle allowed character flags and a max length, then test a value against the generated rule. The resulting regex pattern is shown inline.\\n- **CN:** 切换允许的字符标志与最大长度，然后用生成规则测试一个值。生成的正则表达式会内联展示。',
      },
    },
  },
  render: function Render(args: UseValidatorStoryArgs) {
    return <UseValidatorStoryDemo {...args} />;
  },
};

function UseValidatorStoryDemo({
  letter,
  number,
  underscore,
  hyphen,
  chineseCharacter,
  max,
  testValue,
}: UseValidatorStoryArgs) {
  const t = useStoryT();

  const allowed: RuleRegExpFlags = {
    letter,
    number,
    underscore,
    hyphen,
    chineseCharacter,
    max: max || undefined,
  };

  const rule = useValidator({ allowed });
  const passed = rule.pattern.test(testValue);

  return (
    <Card variant="outlined" style={{ maxWidth: 920 }} title={t('storybook.stories.useValidator.cardTitle')}>
      <Space orientation="vertical" size="large" style={{ width: '100%' }}>
        <Typography.Paragraph style={{ marginBottom: 0 }}>
          {t('storybook.stories.useValidator.description')}
        </Typography.Paragraph>

        <Space wrap>
          <Typography.Text strong>
            {t('storybook.stories.useValidator.maxLabel')} {max}
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
          <Typography.Text strong>{t('storybook.stories.useValidator.testLabel')}</Typography.Text>
          <Typography.Text code>{testValue}</Typography.Text>
          <Tag color={passed ? 'green' : 'red'}>
            {passed ? t('storybook.stories.useValidator.pass') : t('storybook.stories.useValidator.fail')}
          </Tag>
        </Space>

        <Space wrap>
          <Typography.Text strong>{t('storybook.stories.useValidator.patternLabel')}</Typography.Text>
          <Typography.Text code copyable>
            {rule.pattern.toString()}
          </Typography.Text>
        </Space>

        <Alert type="info" message={t('storybook.stories.useValidator.tip')} showIcon />
      </Space>
    </Card>
  );
}
