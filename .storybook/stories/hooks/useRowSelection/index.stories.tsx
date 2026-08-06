import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, Card, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import useRowSelection from '../../../../src/hooks/useRowSelection';
import storyI18n, { storyT, useStoryT } from '../../../locales';
import apiDocEN from './api-doc.en-US.md?raw';
import apiDocCN from './api-doc.zh-CN.md?raw';
import introduceEN from './introduce.en-US.md?raw';
import introduceCN from './introduce.zh-CN.md?raw';

interface UseRowSelectionStoryArgs {
  checkable: boolean;
}

interface UserRow {
  id: number;
  name: string;
  role: string;
}

const NAMES = ['alice', 'bob', 'cindy', 'dave', 'erin', 'frank', 'grace', 'henry', 'iris', 'jack', 'kate'] as const;

const ROLES = ['admin', 'editor', 'viewer'] as const;

const PAGE_SIZE = 10;
const ROW_COUNT = 26;

const meta: Meta<UseRowSelectionStoryArgs> = {
  title: 'Hooks/useRowSelection',
  parameters: {
    docs: {
      description: {
        component: storyI18n.language === 'zh-CN' ? `${introduceCN}\n${apiDocCN}` : `${introduceEN}\n${apiDocEN}`,
      },
    },
  },
  args: {
    checkable: true,
  },
  argTypes: {
    checkable: {
      control: 'boolean',
      description: storyT('storybook.stories.useRowSelection.argTypes.checkable.description'),
    },
  },
};

export default meta;
type Story = StoryObj<UseRowSelectionStoryArgs>;

export const Playground: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '- **EN:** Toggle selection availability and select rows **across pages** to see how the hook exposes a `rowSelection` object that keeps the selected row objects (not just keys) consistent through its `onChange` callback.\\n- **CN:** 切换选中可用开关并在**多个分页**中选择行，观察 hook 通过 `onChange` 返回选中的行对象（而不是仅返回行 key），并跨页保持一致。',
      },
    },
  },
  render: function Render(args: UseRowSelectionStoryArgs) {
    return <UseRowSelectionStoryDemo {...args} />;
  },
};

function buildData(t: typeof storyT): UserRow[] {
  return Array.from({ length: ROW_COUNT }, (_, index) => {
    const nameKey = NAMES[index % NAMES.length];
    const roleKey = ROLES[index % ROLES.length];
    return {
      id: index + 1,
      name: t(`storybook.stories.useRowSelection.data.${nameKey}`),
      role: t(`storybook.stories.useRowSelection.roles.${roleKey}`),
    };
  });
}

function UseRowSelectionStoryDemo({ checkable }: UseRowSelectionStoryArgs) {
  const t = useStoryT();
  const [selectedRows, setSelectedRows] = useState<UserRow[]>([]);

  const rowSelection = useRowSelection<UserRow>({
    value: selectedRows,
    onChange: setSelectedRows,
    checkable,
    rowKey: 'id',
  });

  const columns: ColumnsType<UserRow> = [
    {
      title: t('storybook.stories.useRowSelection.columns.name'),
      dataIndex: 'name',
      render: (name: string, record: UserRow) => (
        <Space>
          <Typography.Text code>{record.id}</Typography.Text>
          <span>{name}</span>
        </Space>
      ),
    },
    {
      title: t('storybook.stories.useRowSelection.columns.role'),
      dataIndex: 'role',
      render: (role: string) => <Tag>{role}</Tag>,
    },
  ];

  const data: UserRow[] = buildData(t);

  return (
    <Card variant="outlined" style={{ maxWidth: 920 }} title={t('storybook.stories.useRowSelection.cardTitle')}>
      <Space orientation="vertical" size="large" style={{ width: '100%' }}>
        <Typography.Paragraph style={{ marginBottom: 0 }}>
          {t('storybook.stories.useRowSelection.description')}
        </Typography.Paragraph>

        <Table<UserRow>
          rowKey="id"
          columns={columns}
          dataSource={data}
          rowSelection={rowSelection}
          pagination={{ pageSize: PAGE_SIZE }}
        />

        <Space align="center" wrap style={{ width: '100%', justifyContent: 'space-between' }}>
          <Typography.Text strong>
            {t('storybook.stories.useRowSelection.selectedCount', { count: selectedRows.length })}
          </Typography.Text>
          <Button
            onClick={() => {
              setSelectedRows([]);
            }}
            disabled={selectedRows.length === 0}
          >
            {t('storybook.stories.useRowSelection.clear')}
          </Button>
        </Space>

        {selectedRows.length > 0 ? (
          <Space wrap size={[8, 4]} data-testid="inline-selected">
            <Typography.Text type="secondary">{t('storybook.stories.useRowSelection.columns.name')}:</Typography.Text>
            {selectedRows.map((item) => (
              <Tag key={item.id} color="blue">
                #{item.id} {item.name} · {item.role}
              </Tag>
            ))}
          </Space>
        ) : (
          <Typography.Text type="secondary">{t('storybook.stories.useRowSelection.emptySelection')}</Typography.Text>
        )}
      </Space>
    </Card>
  );
}
