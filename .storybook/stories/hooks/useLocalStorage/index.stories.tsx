import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Alert, Button, Card, Input, Space, Switch, Typography } from 'antd';
import useLocalStorage from '../../../../src/hooks/useLocalStorage';
import storyI18n, { storyT, useStoryT } from '../../../locales';
import apiDocEN from './api-doc.en-US.md?raw';
import apiDocCN from './api-doc.zh-CN.md?raw';
import introduceEN from './introduce.en-US.md?raw';
import introduceCN from './introduce.zh-CN.md?raw';

interface UseLocalStorageStoryArgs {
  sync: boolean;
}

const meta: Meta<UseLocalStorageStoryArgs> = {
  title: 'Hooks/useLocalStorage',
  parameters: {
    docs: {
      description: {
        component: storyI18n.language === 'zh-CN' ? `${introduceCN}\n${apiDocCN}` : `${introduceEN}\n${apiDocEN}`,
      },
    },
  },
  args: {
    sync: true,
  },
  argTypes: {
    sync: {
      control: 'boolean',
      description: storyT('storybook.stories.useLocalStorage.argTypes.sync.description'),
    },
  },
};

export default meta;
type Story = StoryObj<UseLocalStorageStoryArgs>;

const STORAGE_KEY = 'storybook.useLocalStorage.demo';

export const Playground: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '- **EN:** Type into the input to persist the value to `localStorage`. Toggle `sync` to enable/disable cross-tab synchronization, and use **Remove** to clear the stored value.\\n- **CN:** 在输入框中输入内容即可持久化到 `localStorage`。切换 `sync` 开启/关闭跨标签页同步，点击**移除**清除已存储的值。',
      },
    },
  },
  render: function Render(args: UseLocalStorageStoryArgs) {
    return <UseLocalStorageStoryDemo {...args} />;
  },
};

function UseLocalStorageStoryDemo({ sync }: UseLocalStorageStoryArgs) {
  const t = useStoryT();
  const [draft, setDraft] = useState('');
  const [value, setValue, remove] = useLocalStorage<string>(STORAGE_KEY, '');

  return (
    <Card variant="outlined" style={{ maxWidth: 920 }} title={t('storybook.stories.useLocalStorage.cardTitle')}>
      <Space orientation="vertical" size="large" style={{ width: '100%' }}>
        <Typography.Paragraph style={{ marginBottom: 0 }}>
          {t('storybook.stories.useLocalStorage.description')}
        </Typography.Paragraph>

        <Space wrap>
          <Input
            style={{ maxWidth: 360 }}
            placeholder={t('storybook.stories.useLocalStorage.inputPlaceholder')}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <Button type="primary" onClick={() => setValue(draft)}>
            {t('storybook.stories.useLocalStorage.save')}
          </Button>
          <Button danger onClick={remove}>
            {t('storybook.stories.useLocalStorage.remove')}
          </Button>
        </Space>

        <Space wrap>
          <Typography.Text strong>{t('storybook.stories.useLocalStorage.syncLabel')}</Typography.Text>
          <Switch checked={sync} disabled />
          <Typography.Text strong>{t('storybook.stories.useLocalStorage.valueLabel')}</Typography.Text>
          <Typography.Text code>{value || '—'}</Typography.Text>
        </Space>

        <Alert type="info" title={t('storybook.stories.useLocalStorage.tip')} showIcon />
      </Space>
    </Card>
  );
}
