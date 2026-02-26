import { useEffect, useMemo, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import ColumnSetting from '../../src/components/ColumnSetting';
import type { ColumnSettingItem } from '../../src/components/ColumnSetting';
import { useStoryT } from '../locales';

interface User {
  id: number;
  name: string;
  age: number;
  city: string;
  role: string;
}

interface ColumnSettingStoryArgs {
  storageKey: string;
  useStorage: boolean;
}

const buildBaseColumns = (t: ReturnType<typeof useStoryT>): ColumnSettingItem<User>[] => [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80, disabled: true },
  { title: t('storybook.stories.ColumnSetting.columns.name'), dataIndex: 'name', key: 'name' },
  { title: t('storybook.stories.ColumnSetting.columns.age'), dataIndex: 'age', key: 'age' },
  { title: t('storybook.stories.ColumnSetting.columns.city'), dataIndex: 'city', key: 'city' },
  { title: t('storybook.stories.ColumnSetting.columns.role'), dataIndex: 'role', key: 'role' },
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
      table: { defaultValue: { summary: 'false（demo）' } },
    },
    storageKey: {
      control: 'text',
      description: `- **EN:** Local storage key for persisting column settings.
- **CN:** 用于持久化列设置的本地存储键。`,
      table: { defaultValue: { summary: 'storybook:column-setting（demo）' } },
    },
  },
};

export default meta;
type Story = StoryObj<ColumnSettingStoryArgs>;

export const Playground: Story = {
  render: function Render(args: ColumnSettingStoryArgs) {
    const t = useStoryT();
    const [columns, setColumns] = useState<ColumnSettingItem<User>[]>(() => buildBaseColumns(t));
    const data: User[] = useMemo(
      () => [
        { id: 1, name: 'Alice', age: 28, city: t('storybook.stories.ColumnSetting.data.shanghai'), role: 'Admin' },
        { id: 2, name: 'Bob', age: 32, city: t('storybook.stories.ColumnSetting.data.beijing'), role: 'Editor' },
        {
          id: 3,
          name: 'Cindy',
          age: 25,
          city: t('storybook.stories.ColumnSetting.data.guangzhou'),
          role: 'Viewer',
        },
      ],
      [t]
    );

    useEffect(() => {
      const nextBaseColumns = buildBaseColumns(t);
      const titleMap = new Map(nextBaseColumns.map((col) => [String(col.key), col.title]));
      setColumns((prev) => prev.map((col) => ({ ...col, title: titleMap.get(String(col.key)) ?? col.title })));
    }, [t]);

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
            triggerProps={{ children: t('storybook.stories.ColumnSetting.trigger') }}
          />
        </div>
        <Table<User> rowKey="id" dataSource={data} columns={tableColumns} pagination={false} />
      </div>
    );
  },
};
