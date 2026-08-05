import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, Card, List, Space, Table, Tag, Typography } from 'antd';
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
          '- **EN:** Toggle selection availability and select rows to see how the hook exposes a `rowSelection` object that returns the selected row objects (not just keys) through its `onChange` callback.\n- **CN:** 切换选中可用开关并选择行，观察 hook 如何通过 `onChange` 返回选中的行对象（而不是仅返回行 key）。',
      },
    },
  },
  render: function Render(args: UseRowSelectionStoryArgs) {
    return <UseRowSelectionStoryDemo {...args} />;
  },
};

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
    },
    {
      title: t('storybook.stories.useRowSelection.columns.role'),
      dataIndex: 'role',
      render: (role: string) => <Tag>{role}</Tag>,
    },
  ];

  const data: UserRow[] = [
    {
      id: 1,
      name: t('storybook.stories.useRowSelection.data.alice'),
      role: t('storybook.stories.useRowSelection.roles.admin'),
    },
    {
      id: 2,
      name: t('storybook.stories.useRowSelection.data.bob'),
      role: t('storybook.stories.useRowSelection.roles.editor'),
    },
    {
      id: 3,
      name: t('storybook.stories.useRowSelection.data.cindy'),
      role: t('storybook.stories.useRowSelection.roles.viewer'),
    },
  ];

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
          pagination={false}
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

        <List
          size="small"
          bordered
          dataSource={selectedRows}
          locale={{ emptyText: t('storybook.stories.useRowSelection.emptySelection') }}
          renderItem={(item) => (
            <List.Item key={item.id}>
              <Space wrap>
                <Typography.Text code>{item.id}</Typography.Text>
                <Typography.Text>{item.name}</Typography.Text>
                <Tag>{item.role}</Tag>
              </Space>
            </List.Item>
          )}
        />
      </Space>
    </Card>
  );
}
