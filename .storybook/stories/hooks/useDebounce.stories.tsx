import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Alert, Button, Card, Divider, Input, List, Space, Typography } from 'antd';
import useDebounce from '../../../src/hooks/useDebounce';
import { useStoryT } from '../../locales';

interface UseDebounceStoryArgs {
  wait: number;
  leading: boolean;
  maxWait: number;
}

interface DebounceEventLog {
  id: number;
  type: string;
  value: string;
  time: string;
}

const meta: Meta<UseDebounceStoryArgs> = {
  title: 'Hooks/useDebounce',
  parameters: {
    docs: {
      description: {
        component: `- **EN:** Demonstrates how to use \`useDebounce\` to debounce a search-like action with configurable \`wait\`, \`leading\`, and \`maxWait\` behavior, plus runtime controls for canceling, disabling, and re-enabling execution.
- **CN:** 演示如何使用 \`useDebounce\` 对类似搜索的动作进行防抖，并支持 \`wait\`、\`leading\`、\`maxWait\` 配置，同时提供取消、禁用与重新启用等运行时控制。`,
      },
    },
  },
  args: {
    wait: 500,
    leading: false,
    maxWait: 0,
  },
  argTypes: {
    wait: {
      control: { type: 'range', min: 0, max: 3000, step: 100 },
      description: `- **EN:** The debounce delay in milliseconds.
- **CN:** 防抖延迟（毫秒）。`,
    },
    leading: {
      control: 'boolean',
      description: `- **EN:** Whether the first call executes immediately.
- **CN:** 是否在首次调用时立即执行。`,
    },
    maxWait: {
      control: { type: 'range', min: 0, max: 5000, step: 100 },
      description: `- **EN:** Maximum time to wait before forcing execution. Use \`0\` to disable.
- **CN:** 强制执行的最大等待时间，设为 \`0\` 表示关闭。`,
    },
  },
};

export default meta;
type Story = StoryObj<UseDebounceStoryArgs>;

export const Playground: Story = {
  parameters: {
    docs: {
      description: {
        story: `- **EN:** Type a value and either press the trigger button or keep typing to observe how the debounced callback is delayed, canceled, or forced by \`maxWait\`.
- **CN:** 输入内容后，可点击触发按钮，或持续输入以观察防抖回调如何被延迟、取消，或在 \`maxWait\` 到达时被强制执行。`,
      },
    },
  },
  render: function Render(args: UseDebounceStoryArgs) {
    return <UseDebounceStoryDemo {...args} />;
  },
};

function UseDebounceStoryDemo({ wait, leading, maxWait }: UseDebounceStoryArgs) {
  const t = useStoryT();
  const [query, setQuery] = useState('react easy');
  const [appliedQuery, setAppliedQuery] = useState('');
  const [eventLogs, setEventLogs] = useState<DebounceEventLog[]>([]);
  const [pendingHint, setPendingHint] = useState<string | null>(null);
  const [isDisabled, setIsDisabled] = useState(false);

  const debouncedApply = useDebounce(
    (value: string) => {
      setAppliedQuery(value);
      setPendingHint(null);
      appendEventLog('execute', value);
    },
    [wait, leading, maxWait],
    {
      wait,
      leading,
      maxWait,
    }
  );

  function appendEventLog(type: string, value: string) {
    const now = new Date();
    setEventLogs((prev) => {
      const next = [
        {
          id: now.getTime() + prev.length,
          type,
          value,
          time: `${now.toLocaleTimeString()}.${now.getMilliseconds()}`,
        },
        ...prev,
      ];
      return next.slice(0, 10);
    });
  }

  const scheduleApply = (value: string) => {
    setPendingHint(value);
    appendEventLog('schedule', value);
    debouncedApply(value);
  };

  const cancelPending = () => {
    debouncedApply.cancel();
    setPendingHint(null);
    appendEventLog('cancel', query);
  };

  const toggleDisabled = (checked: boolean) => {
    setIsDisabled(checked);
    if (checked) {
      debouncedApply.cancel();
      setPendingHint(null);
      debouncedApply.disable();
      appendEventLog('disable', query);
    } else {
      debouncedApply.enable();
      appendEventLog('enable', query);
    }
  };

  const statusMessage = isDisabled
    ? t('storybook.stories.useDebounce.disabledStatus')
    : pendingHint
      ? t('storybook.stories.useDebounce.pendingStatus')
      : appliedQuery
        ? t('storybook.stories.useDebounce.executedStatus')
        : t('storybook.stories.useDebounce.enabledStatus');

  return (
    <Card bordered style={{ maxWidth: 920 }} title={t('storybook.stories.useDebounce.cardTitle')}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Typography.Paragraph style={{ marginBottom: 0 }}>
          {t('storybook.stories.useDebounce.description')}
        </Typography.Paragraph>

        <Space align="start" wrap style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space direction="vertical" size="small" style={{ minWidth: 280, flex: 1 }}>
            <Typography.Text strong>{t('storybook.stories.useDebounce.currentValue')}</Typography.Text>
            <Input
              value={query}
              onChange={(event) => {
                const nextValue = event.target.value;
                setQuery(nextValue);
                scheduleApply(nextValue);
              }}
              placeholder={t('storybook.stories.useDebounce.inputPlaceholder')}
            />
            <Space wrap>
              <Button type="primary" onClick={() => scheduleApply(query)}>
                {t('storybook.stories.useDebounce.trigger')}
              </Button>
              <Button onClick={cancelPending}>{t('storybook.stories.useDebounce.cancel')}</Button>
              <Button onClick={() => toggleDisabled(true)} disabled={isDisabled}>
                {t('storybook.stories.useDebounce.disable')}
              </Button>
              <Button onClick={() => toggleDisabled(false)} disabled={!isDisabled}>
                {t('storybook.stories.useDebounce.enable')}
              </Button>
            </Space>
          </Space>

          <Space direction="vertical" size="small" style={{ minWidth: 260 }}>
            <Typography.Text strong>{t('storybook.stories.useDebounce.waitLabel')}</Typography.Text>
            <Typography.Text>{`${wait} ms`}</Typography.Text>
            <Typography.Text strong>{t('storybook.stories.useDebounce.leadingLabel')}</Typography.Text>
            <Typography.Text>{leading ? 'true' : 'false'}</Typography.Text>
            <Typography.Text strong>{t('storybook.stories.useDebounce.maxWaitLabel')}</Typography.Text>
            <Typography.Text>{maxWait > 0 ? `${maxWait} ms` : '--'}</Typography.Text>
            <Divider style={{ margin: '8px 0' }} />
            <Alert
              type={isDisabled ? 'warning' : pendingHint ? 'info' : appliedQuery ? 'success' : undefined}
              message={statusMessage}
              description={
                <Space direction="vertical" size={0}>
                  <Typography.Text>
                    {t('storybook.stories.useDebounce.debouncedValue')}: {appliedQuery || '--'}
                  </Typography.Text>
                  <Typography.Text type="secondary">
                    {pendingHint
                      ? `${t('storybook.stories.useDebounce.pendingStatus')}: ${pendingHint}`
                      : `${t('storybook.stories.useDebounce.currentValue')}: ${query}`}
                  </Typography.Text>
                </Space>
              }
              showIcon
            />
          </Space>
        </Space>

        <div>
          <Typography.Text strong>{t('storybook.stories.useDebounce.eventLogTitle')}</Typography.Text>
          <List
            bordered
            size="small"
            style={{ marginTop: 8 }}
            rowKey="id"
            dataSource={eventLogs}
            locale={{ emptyText: t('storybook.stories.useDebounce.emptyLog') }}
            renderItem={(item) => (
              <List.Item key={item.id}>
                <Space split={<Divider type="vertical" />} size="small" wrap>
                  <Typography.Text code>{item.type}</Typography.Text>
                  <Typography.Text>{item.value}</Typography.Text>
                  <Typography.Text type="secondary">{item.time}</Typography.Text>
                </Space>
              </List.Item>
            )}
          />
        </div>
      </Space>
    </Card>
  );
}
