import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Alert, Button, Card, Divider, Input, List, Space, Tag, Typography } from 'antd';
import usePropState from '../../../../src/hooks/usePropState';
import storyI18n, { storyT, useStoryT } from '../../../locales';
import apiDocEN from './api-doc.en-US.md?raw';
import apiDocCN from './api-doc.zh-CN.md?raw';
import introduceEN from './introduce.en-US.md?raw';
import introduceCN from './introduce.zh-CN.md?raw';

interface DraftValue {
  text: string;
}

interface UsePropStateStoryArgs {
  controlled: boolean;
  enabled: boolean;
  useIsEqual: boolean;
}

interface SyncEventLog {
  id: number;
  type: string;
  value: string;
  time: string;
}

const FALLBACK_VALUE: DraftValue = { text: 'untitled' };

const meta: Meta<UsePropStateStoryArgs> = {
  title: 'Hooks/usePropState',
  parameters: {
    docs: {
      description: {
        component: storyI18n.language === 'zh-CN' ? `${introduceCN}\n${apiDocCN}` : `${introduceEN}\n${apiDocEN}`,
      },
    },
  },
  args: {
    controlled: true,
    enabled: true,
    useIsEqual: false,
  },
  argTypes: {
    controlled: {
      control: 'boolean',
      description: storyT('storybook.stories.usePropState.argTypes.controlled.description'),
    },
    enabled: {
      control: 'boolean',
      description: storyT('storybook.stories.usePropState.argTypes.enabled.description'),
    },
    useIsEqual: {
      control: 'boolean',
      description: storyT('storybook.stories.usePropState.argTypes.useIsEqual.description'),
    },
  },
};

export default meta;
type Story = StoryObj<UsePropStateStoryArgs>;

export const Playground: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '- **EN:** The parent owns an object, and the hook mirrors it into local state. Push a new value to the prop, edit the state locally, or replace the prop with an equal-but-new object to see how `enabled` and `isEqual` change the outcome.\n- **CN:** 父组件持有一个对象，hook 将其镜像为本地 state。你可以把新值推给 prop、直接修改本地 state，或用一个内容相同但引用不同的新对象替换 prop，以观察 `enabled` 与 `isEqual` 带来的差异。',
      },
    },
  },
  render: function Render(args: UsePropStateStoryArgs) {
    return <UsePropStateStoryDemo {...args} />;
  },
};

export const Simple: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '- **EN:** The simplest form: `usePropState(title)` with no options at all. A string prop compares by value, so no `isEqual` is needed — edit the field locally, then push a title from the parent to see the local edit get replaced.\n- **CN:** 最简单的用法：`usePropState(title)`，完全不传 options。字符串 prop 按值比较，无需 `isEqual` —— 先本地编辑输入框，再从父组件推送一个标题，观察本地编辑被覆盖。',
      },
    },
  },
  render: function Render() {
    return <SimpleTitleDemo />;
  },
};

function UsePropStateStoryDemo({ controlled, enabled, useIsEqual }: UsePropStateStoryArgs) {
  const t = useStoryT();
  // The value a "parent" component would own. Its identity stays stable until it is replaced on purpose.
  const [parentValue, setParentValue] = useState<DraftValue>({ text: 'react-easy' });
  const [parentDraft, setParentDraft] = useState('react-easy');
  const [localDraft, setLocalDraft] = useState('');
  const [logs, setLogs] = useState<SyncEventLog[]>([]);

  const [state, setState] = usePropState<DraftValue>(controlled ? parentValue : undefined, {
    fallback: FALLBACK_VALUE,
    enabled,
    isEqual: useIsEqual ? (a, b) => a.text === b.text : undefined,
  });

  const appendLog = (type: string, value: string) => {
    const now = new Date();
    setLogs((prev) =>
      [
        {
          id: now.getTime() + prev.length,
          type,
          value,
          time: `${now.toLocaleTimeString()}.${now.getMilliseconds()}`,
        },
        ...prev,
      ].slice(0, 10),
    );
  };

  const pushToProp = () => {
    setParentValue({ text: parentDraft });
    appendLog('prop', parentDraft);
  };

  const replaceIdentity = () => {
    // Same content, brand new object reference.
    setParentValue({ text: parentValue.text });
    appendLog('identity', parentValue.text);
  };

  const setLocal = () => {
    setState({ text: localDraft });
    appendLog('local', localDraft);
  };

  const resetLocal = () => {
    // Reset to the hook's own baseline: the prop when controlled, the fallback otherwise.
    const baseline = controlled ? parentValue : FALLBACK_VALUE;
    setState(baseline);
    appendLog('reset', baseline.text);
  };

  const propText = controlled ? parentValue.text : undefined;
  const sameReference = controlled && parentValue === state;
  const statusTag = !controlled ? (
    <Tag color="blue">{t('storybook.stories.usePropState.uncontrolled')}</Tag>
  ) : propText === state.text ? (
    <Tag color="green">{t('storybook.stories.usePropState.inSync')}</Tag>
  ) : (
    <Tag color="orange">{t('storybook.stories.usePropState.diverged')}</Tag>
  );

  return (
    <Card variant="outlined" style={{ maxWidth: 920 }} title={t('storybook.stories.usePropState.cardTitle')}>
      <Space orientation="vertical" size="large" style={{ width: '100%' }}>
        <Typography.Paragraph style={{ marginBottom: 0 }}>
          {t('storybook.stories.usePropState.description')}
        </Typography.Paragraph>

        <Alert type="info" title={t('storybook.stories.usePropState.tip')} showIcon />

        <Space align="start" wrap size="large" style={{ width: '100%' }}>
          <Space orientation="vertical" size="small" style={{ minWidth: 320, flex: 1 }}>
            <Typography.Text strong>{t('storybook.stories.usePropState.externalLabel')}</Typography.Text>
            <Input
              value={parentDraft}
              onChange={(event) => setParentDraft(event.target.value)}
              placeholder={t('storybook.stories.usePropState.externalPlaceholder')}
              disabled={!controlled}
            />
            <Space wrap>
              <Button type="primary" onClick={pushToProp} disabled={!controlled}>
                {t('storybook.stories.usePropState.pushToProp')}
              </Button>
              <Button onClick={replaceIdentity} disabled={!controlled}>
                {t('storybook.stories.usePropState.replaceIdentity')}
              </Button>
            </Space>

            <Divider style={{ margin: '8px 0' }} />

            <Typography.Text strong>{t('storybook.stories.usePropState.internalLabel')}</Typography.Text>
            <Input
              value={localDraft}
              onChange={(event) => setLocalDraft(event.target.value)}
              placeholder={t('storybook.stories.usePropState.localPlaceholder')}
            />
            <Space wrap>
              <Button onClick={setLocal}>{t('storybook.stories.usePropState.setLocal')}</Button>
              <Button onClick={resetLocal}>{t('storybook.stories.usePropState.resetLocal')}</Button>
            </Space>
          </Space>

          <Space orientation="vertical" size="small" style={{ minWidth: 260 }}>
            <Typography.Text strong>{t('storybook.stories.usePropState.statusLabel')}</Typography.Text>
            {statusTag}
            <Typography.Text>
              {t('storybook.stories.usePropState.propValueLabel')}:{' '}
              <Typography.Text code>{propText ?? '--'}</Typography.Text>
            </Typography.Text>
            <Typography.Text>
              {t('storybook.stories.usePropState.stateValueLabel')}:{' '}
              <Typography.Text code>{state.text}</Typography.Text>
            </Typography.Text>
            <Typography.Text>
              {t('storybook.stories.usePropState.identityLabel')}:{' '}
              <Tag color={sameReference ? 'green' : 'default'}>{sameReference ? 'true' : 'false'}</Tag>
            </Typography.Text>
          </Space>
        </Space>

        <div>
          <Typography.Text strong>{t('storybook.stories.usePropState.eventLogTitle')}</Typography.Text>
          <List
            bordered
            size="small"
            style={{ marginTop: 8 }}
            rowKey="id"
            dataSource={logs}
            locale={{ emptyText: t('storybook.stories.usePropState.emptyLog') }}
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

const SIMPLE_TITLE_PRESETS = ['React Easy', 'Prop State', 'Hello World'];

/** The simplest usage: the `title` prop is mirrored into local state with no options at all. */
function SimpleTitleDemo() {
  const t = useStoryT();
  // Stands in for the parent component that owns the title.
  const [title, setTitle] = useState('React Easy');
  // No options: a string prop compares by value, so the default `Object.is` is already correct.
  const [draft, setDraft] = usePropState(title);
  const inSync = draft === title;

  return (
    <Card variant="outlined" style={{ maxWidth: 640 }} title={t('storybook.stories.usePropState.simple.cardTitle')}>
      <Space orientation="vertical" size="large" style={{ width: '100%' }}>
        <Typography.Paragraph style={{ marginBottom: 0 }}>
          {t('storybook.stories.usePropState.simple.description')}
        </Typography.Paragraph>

        <Typography.Text code>const [draft, setDraft] = usePropState(title);</Typography.Text>

        <Input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={t('storybook.stories.usePropState.simple.editPlaceholder')}
        />

        <Space wrap>
          <Typography.Text strong>{t('storybook.stories.usePropState.simple.presetLabel')}</Typography.Text>
          {SIMPLE_TITLE_PRESETS.map((preset) => (
            <Button key={preset} onClick={() => setTitle(preset)}>
              {preset}
            </Button>
          ))}
        </Space>

        <Space wrap>
          <Typography.Text strong>{t('storybook.stories.usePropState.propValueLabel')}</Typography.Text>
          <Tag>{title}</Tag>
          <Typography.Text strong>{t('storybook.stories.usePropState.stateValueLabel')}</Typography.Text>
          <Tag color={inSync ? 'green' : 'orange'}>{draft}</Tag>
          <Tag color={inSync ? 'green' : 'orange'}>
            {inSync ? t('storybook.stories.usePropState.inSync') : t('storybook.stories.usePropState.diverged')}
          </Tag>
        </Space>

        <Alert type="info" title={t('storybook.stories.usePropState.simple.tip')} showIcon />
      </Space>
    </Card>
  );
}
