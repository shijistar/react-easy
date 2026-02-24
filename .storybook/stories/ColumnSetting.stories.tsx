import { useMemo, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import ColumnSetting from '../../src/components/ColumnSetting';
import type { ColumnSettingItem } from '../../src/components/ColumnSetting';

type User = {
  id: number;
  name: string;
  age: number;
  city: string;
  role: string;
};

type ColumnSettingStoryArgs = {
  storageKey: string;
  useStorage: boolean;
};

const data: User[] = [
  { id: 1, name: 'Alice', age: 28, city: 'Shanghai', role: 'Admin' },
  { id: 2, name: 'Bob', age: 32, city: 'Beijing', role: 'Editor' },
  { id: 3, name: 'Cindy', age: 25, city: '广州', role: 'Viewer' },
];

const baseColumns: ColumnSettingItem<User>[] = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80, disabled: true },
  { title: '姓名', dataIndex: 'name', key: 'name' },
  { title: '年龄', dataIndex: 'age', key: 'age' },
  { title: '城市', dataIndex: 'city', key: 'city' },
  { title: '角色', dataIndex: 'role', key: 'role' },
];

const meta: Meta<ColumnSettingStoryArgs> = {
  title: 'Components/ColumnSetting',
  args: {
    useStorage: false,
    storageKey: 'storybook:column-setting',
  },
  argTypes: {
    useStorage: {
      control: 'boolean',
      description: `- **EN:** Whether to enable local storage persistence in this demo.
- **CN:** 当前示例中是否启用本地存储持久化。`,
    },
    storageKey: {
      control: 'text',
      description: `- **EN:** Local storage key for persisting column settings.
- **CN:** 用于持久化列设置的本地存储键。`,
    },
  },
};

export default meta;
type Story = StoryObj<ColumnSettingStoryArgs>;

export const Playground: Story = {
  render: (args: ColumnSettingStoryArgs) => {
    const [columns, setColumns] = useState<ColumnSettingItem<User>[]>(baseColumns);

    const tableColumns = useMemo<ColumnsType<User>>(
      () => columns.filter((col) => !col.hidden) as ColumnsType<User>,
      [columns]
    );

    return (
      <div style={{ maxWidth: 760 }}>
        <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'flex-end' }}>
          <ColumnSetting<ColumnSettingItem<User>>
            columns={columns}
            storageKey={args.useStorage ? args.storageKey : undefined}
            onChange={setColumns}
            triggerProps={{ children: '列设置' }}
          />
        </div>
        <Table<User> rowKey="id" dataSource={data} columns={tableColumns} pagination={false} />
      </div>
    );
  },
};
