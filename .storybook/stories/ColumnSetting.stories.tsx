import { useEffect, useMemo, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import ColumnSetting from '../../src/components/ColumnSetting';
import type { ColumnSettingItem, ColumnSettingProps } from '../../src/components/ColumnSetting';
import { storyT, useStoryT } from '../locales';

interface User {
  id: number;
  name: string;
  age: number;
  city: string;
  role: string;
}
type ColumnSettingStoryArgs = ColumnSettingProps;

const buildBaseColumns = (t: ReturnType<typeof useStoryT>): ColumnSettingItem<User>[] => [
  { title: t('storybook.stories.ColumnSetting.columns.id'), dataIndex: 'id', key: 'id', width: 80, disabled: true },
  { title: t('storybook.stories.ColumnSetting.columns.name'), dataIndex: 'name', key: 'name' },
  { title: t('storybook.stories.ColumnSetting.columns.age'), dataIndex: 'age', key: 'age' },
  { title: t('storybook.stories.ColumnSetting.columns.city'), dataIndex: 'city', key: 'city' },
  { title: t('storybook.stories.ColumnSetting.columns.role'), dataIndex: 'role', key: 'role' },
];

const meta: Meta<ColumnSettingStoryArgs> = {
  title: 'Components/ColumnSetting',
  component: ColumnSetting,
  args: {
    storageKey: 'storybook:column-setting',
    columns: buildBaseColumns(storyT),
  },
  argTypes: {},
};

export default meta;
type Story = StoryObj<ColumnSettingStoryArgs>;

export const Playground: Story = {
  render: function Render(args: ColumnSettingStoryArgs) {
    const t = useStoryT();
    const [columns, setColumns] = useState<ColumnSettingItem<User>[]>(() => buildBaseColumns(t));
    const data: User[] = useMemo(
      () => [
        {
          id: 1,
          name: t('storybook.stories.ColumnSetting.data.alice'),
          age: 28,
          city: t('storybook.stories.ColumnSetting.data.shanghai'),
          role: t('storybook.stories.ColumnSetting.data.admin'),
        },
        {
          id: 2,
          name: t('storybook.stories.ColumnSetting.data.bob'),
          age: 32,
          city: t('storybook.stories.ColumnSetting.data.beijing'),
          role: t('storybook.stories.ColumnSetting.data.editor'),
        },
        {
          id: 3,
          name: t('storybook.stories.ColumnSetting.data.cindy'),
          age: 25,
          city: t('storybook.stories.ColumnSetting.data.guangzhou'),
          role: t('storybook.stories.ColumnSetting.data.viewer'),
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
            storageKey={args.storageKey}
            onChange={setColumns}
            triggerProps={{ children: t('storybook.stories.ColumnSetting.trigger') }}
          />
        </div>
        <Table<User> rowKey="id" dataSource={data} columns={tableColumns} pagination={false} />
      </div>
    );
  },
};
