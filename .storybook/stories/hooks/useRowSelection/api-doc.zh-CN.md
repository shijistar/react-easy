## API

### 参数 —— UseRowSelectionOption\<T\>

继承 `Omit<TableRowSelection<T>, 'preserveSelectedRowKeys' | 'selectedRowKeys' | 'onChange'>`。

| 参数        | 说明                                                         | 类型                               | 默认值 |
| ----------- | ------------------------------------------------------------ | ---------------------------------- | ------ |
| `value`     | 选中的行对象                                                 | `T[]`                              | -      |
| `onChange`  | 选中行变化时触发的回调，参数为行对象                         | `(value: T[]) => void`             | -      |
| `rowKey`    | 获取对象 key 的字段名或函数；不设置时默认使用 `id` 或 `code` | `keyof T \| ((item: T) => string)` | -      |
| `checkable` | 是否支持表格选择；为 `false` 时禁用行选择功能                | `boolean`                          | `true` |
| `cache`     | 所有被选中对象的缓存，用于初始化内部缓存（持久化场景）       | `T[]`                              | -      |

> 其余 `TableRowSelection` 选项（如 `type`、`columnWidth`、`getCheckboxProps`）原样透传。

### 返回值

| 成员           | 说明                                                      | 签名                                |
| -------------- | --------------------------------------------------------- | ----------------------------------- |
| `rowSelection` | 传给 `Table` 的 rowSelection 配置；禁用时返回 `undefined` | `TableRowSelection<T> \| undefined` |
