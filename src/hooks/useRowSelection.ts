import type { Key } from 'react';
import { useEffect, useMemo, useRef } from 'react';
import type { TableRowSelection } from 'antd/es/table/interface';

export type UseRowSelectionOption<T extends object = Record<string, unknown>> = Omit<
  TableRowSelection<T>,
  'preserveSelectedRowKeys' | 'selectedRowKeys' | 'onChange'
> & {
  /**
   * - **EN:** The selected row objects.
   * - **CN:** 选中的行对象。
   */
  value?: T[];
  /**
   * - **EN:** Callback function triggered when the selected rows change.
   * - **CN:** 当选中的行发生变化时触发的回调函数。
   *
   * @param value - The selected row objects | 选中的行对象
   */
  onChange?: (value: T[]) => void;
  /**
   * - **EN:** The field name or function to get the key of the object. If not set, the `id` or `code`
   *   field will be used as the key by default.
   * - **CN:** 获取对象key的字段名或函数，如果不设置，则默认使用 `id` 或 `code` 字段作为key。
   */
  rowKey?: keyof T | ((item: T) => string);
  /**
   * - **EN:** Whether to support table selection. If set to `false`, the table row selection feature
   *   will be disabled.
   * - **CN:** 是否支持表格选择，如果设置为`false`，则禁用table的行选择功能。
   *
   * @default true
   */
  checkable?: boolean;
  /**
   * - **EN:** Cache of all selected objects, used to initialize the internal cache.
   *
   *   This usage is not very common and is generally used for persistent caching outside the Table,
   *   such as saving in localStorage or, in the case of a MicroApp, saving in the main application,
   *   so that when the Table is destroyed and re-entered, it can restore all previously selected
   *   cached objects (otherwise, data across pages will be lost).
   * - **CN:** 所有被选中对象的缓存，用于初始化内部的缓存对象。
   *
   *   这种用法不太常见，一般用于在Table外进行持久化缓存，例如保存在localStorage中、或作为MicroApp时保存在主应用中，
   *   从而在Table被销毁后再次进入时能恢复之前选中的所有缓存对象（否则跨页的数据会丢失）。
   */
  cache?: T[];
};

/**
 * - **EN:** Generate the `rowSelection` property settings for the Table component, supporting
 *   cross-page selection. The `onChange` callback returns the selected row objects instead of the
 *   selected row keys.
 *
 *   Use `rowKey` to specify the key of the row object. If not specified, it will try to get the `id`
 *   or `code` field from the row object as the key.
 * - **CN:** 生成Table组件的rowSelection属性设置，支持跨页选中，`onChange`返回选中的行对象，而不是选中的行key。
 *
 *   使用 `rowKey` 来指定行对象的key，如果不指定，则会尝试从行对象中获取 `id` 或 `code` 字段作为key。
 */
function useRowSelection<T extends object = Record<string, unknown>>(options?: UseRowSelectionOption<T>) {
  const { value, rowKey, onChange, checkable = true, cache, ...restOptions } = options || {};
  const keys = useMemo(() => value?.map((item) => getKey(item, rowKey)), [value, rowKey]);
  const selectedCacheRef = useRef(new Map(cache?.map((item) => [getKey(item, rowKey), item])));

  useEffect(() => {
    // Remove items that no longer exist in selectedCacheRef
    // When the parent component's directory type or domain changes, the value will be reset, and the selectedCacheRef needs to be cleared
    selectedCacheRef.current.forEach((item) => {
      const itemKey = getKey(item, rowKey);
      if (!(value || []).some((v) => getKey(v, rowKey) === itemKey)) {
        selectedCacheRef.current.delete(itemKey);
      }
    });
  }, [rowKey, value]);

  return checkable !== false
    ? ({
        ...restOptions,
        preserveSelectedRowKeys: true,
        selectedRowKeys: keys,
        onChange: (selectedKeys, selectedRows) => {
          //  Remove the deselected items
          selectedCacheRef.current.forEach((item) => {
            const key = getKey(item, rowKey);
            if (!selectedKeys?.includes(key as Key)) {
              selectedCacheRef.current.delete(key);
            }
          });
          // Add new selected items
          selectedRows?.forEach((item) => {
            const key = getKey(item, rowKey);
            selectedCacheRef.current.set(key, item);
          });
          onChange?.(selectedKeys.map((id) => selectedCacheRef.current.get(id as string)).filter(Boolean) as T[]);
        },
      } as TableRowSelection<T>)
    : undefined;
}

function getKey<T extends object = Record<string, unknown>>(
  item: T,
  keyField?: keyof T | ((item: T) => string)
): keyof T | string {
  if (!item) {
    return '';
  }
  if (typeof keyField === 'function') {
    return keyField(item);
  }
  return (
    (item[keyField!] as keyof T) ||
    ('id' in item ? (item['id'] as string) : '') ||
    ('code' in item ? (item['code'] as string) : '')
  );
}
export default useRowSelection;
