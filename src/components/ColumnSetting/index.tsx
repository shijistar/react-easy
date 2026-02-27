import { useContext, useEffect, useMemo, useState } from 'react';
import { Button, Checkbox, ConfigProvider, Divider, Dropdown, Space, Typography } from 'antd';
import type { ButtonProps, DropdownProps } from 'antd';
import type { ColumnType } from 'antd/es/table';
import classNames from 'classnames';
import { ReloadOutlined, SettingOutlined } from '@ant-design/icons';
import { useRefFunction, useRefValue } from '../../hooks';
import useLocalStorage from '../../hooks/useLocalStorage';
import useT from '../../hooks/useT';
import useStyle from './style';

export interface ColumnSettingProps<T extends ColumnSettingItem = ColumnSettingItem> {
  /**
   * - **EN:** The columns to be displayed in the column setting.
   * - **CN:** 列设置中要显示的列。
   */
  columns: T[];
  /**
   * - **EN:** Callback function triggered when the selected columns change.
   * - **CN:** 选中列变化时触发的回调函数。
   */
  onChange?: (nextColumns: T[]) => void;
  /**
   * - **EN:** Set a local storage key for persisting column settings. If not set, local storage is
   *   not enabled.
   * - **CN:** 设置一个本地存储的键值，用于持久化保存列设置。如果未设置，则不启用本地存储。
   */
  storageKey?: string;
  /**
   * - **EN:** Function to render custom column titles.
   * - **CN:** 自定义列标题的渲染函数。
   */
  renderColumnTitle?: (col: ColumnSettingItem, index: number) => React.ReactNode;
  /**
   * - **EN:** Props for the button that triggers the dropdown.
   * - **CN:** 触发下拉菜单的按钮属性。
   */
  triggerProps?: ButtonProps;
  /**
   * - **EN:** Props for the dropdown component.
   * - **CN:** 下拉菜单组件的属性。
   */
  dropdownProps?: DropdownProps;
  /**
   * - **EN:** Props for the dropdown popup container.
   * - **CN:** 下拉菜单弹出层容器的属性。
   */
  popupProps?: React.HTMLAttributes<HTMLDivElement>;
  /**
   * - **EN:** Props for the "Check All" button.
   * - **CN:** “全选”按钮的属性。
   */
  checkAllProps?: ButtonProps;
  /**
   * - **EN:** Props for the "Reset" button.
   * - **CN:** “重置”按钮的属性。
   */
  resetProps?: ButtonProps;
  /**
   * - **EN:** Custom prefix for the component's CSS class.
   * - **CN:** 组件的自定义 CSS 类前缀。
   */
  prefixCls?: string;
}

/**
 * - **EN:** A component for configuring table column visibility.
 * - **CN:** 用于配置表格列可见性的组件。
 */
function ColumnSetting<T extends ColumnSettingItem = ColumnSettingItem>(props: ColumnSettingProps<T>) {
  const {
    columns,
    storageKey,
    triggerProps,
    dropdownProps,
    popupProps,
    prefixCls: prefixClsInProps,
    checkAllProps,
    resetProps,
    onChange,
    renderColumnTitle,
  } = props;
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const prefixCls = getPrefixCls('column-setting', prefixClsInProps);
  const [wrapCSSVar, hashId, cssVarCls] = useStyle(prefixCls);
  const [open, setOpen] = useState(false);
  const t = useT();
  const [selectedKeysFromStorage, setSelectedKeysFromStorage] = useLocalStorage<string[]>(storageKey, []);
  const [initialKeys, setInitialKeys] = useState<string[]>(selectedKeysFromStorage ?? []);
  const [selectedKeys, setSelectedKeys] = useState<string[]>(initialKeys);
  const storageRef = useRefValue(storageKey);
  const selectedKeysFromStorageRef = useRefValue(selectedKeysFromStorage);
  const hasChange = useMemo(() => {
    return [...selectedKeys].sort().join(',') !== initialKeys.join(',');
  }, [selectedKeys, initialKeys]);

  // Compute keys and selectable keys
  const keys = useMemo(() => columns.map((c, i) => String(getColKey(c, i))), [columns]);
  const allSelectableKeys = useMemo(
    () =>
      columns
        .map((c, i) => ({ k: String(getColKey(c, i)), disabled: !!c.disabled }))
        .filter((x) => !x.disabled)
        .map((x) => x.k),
    [columns]
  );
  const isAllChecked = allSelectableKeys.length > 0 && allSelectableKeys.every((k) => selectedKeys.includes(k));
  const isIndeterminate = selectedKeys.length > 0 && !isAllChecked;

  // Fire change event when selectedKeysFromStorage changes
  const change = useRefFunction((nextSelected: string[], fireEvent?: boolean) => {
    setSelectedKeys(nextSelected);
    if (storageKey) {
      setSelectedKeysFromStorage(nextSelected);
    }
    if (fireEvent) {
      const next = columns.map((col, i) => {
        const k = String(getColKey(col, i));
        const visible = nextSelected.includes(k);
        return { ...col, hidden: !visible } as T;
      });
      onChange?.(next as T[]);
    }
  });

  // Toggle one column change
  const toggleOne = (key: string, checked: boolean) => {
    const next = new Set(selectedKeys);
    if (checked) {
      next.add(key);
    } else {
      // Keep at least one visible column
      if (selectedKeys.length <= 1) return;
      next.delete(key);
    }
    const nextArr = Array.from(next);
    change(nextArr, true);
  };

  // Toggle all columns change
  const handleCheckAll = (checked: boolean) => {
    const nextArr = checked
      ? Array.from(new Set([...selectedKeys, ...allSelectableKeys]))
      : selectedKeys.filter((k) => !allSelectableKeys.includes(k)).slice(0, 1);
    const ensured = checked ? nextArr : nextArr.length > 0 ? nextArr : [keys[0]];
    change(ensured, true);
  };

  // Reset to initial selected columns
  const handleReset = () => {
    const next = initialKeys.length > 0 ? initialKeys : [keys[0]];
    change(next, true);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      setInitialKeys(normalizeToSelectedKeys(columns));
    } else {
      setInitialKeys([]);
    }
  };

  // Sync when columns change
  useEffect(() => {
    const next = normalizeToSelectedKeys(columns);
    change(next, false);
  }, [columns]);

  // Fire change on mount if storage exists and differs from initial values
  useEffect(() => {
    if (
      storageRef.current &&
      selectedKeysFromStorageRef.current &&
      selectedKeysFromStorageRef.current.join(',') !== initialKeys.join(',')
    ) {
      change(selectedKeysFromStorageRef.current, true);
    }
  }, [initialKeys]);

  const dropdownRender = () => (
    <div
      {...popupProps}
      className={classNames(`${prefixCls}-popup`, popupProps?.className)}
      onClick={(e) => {
        e.stopPropagation();
        popupProps?.onClick?.(e);
      }}
    >
      <Typography.Text className={`${prefixCls}-popup-title`}>{t('components.ColumnSetting.title')}</Typography.Text>
      <Space direction="vertical" className={`${prefixCls}-column-list`} size={12}>
        {columns.map((col, idx) => {
          const k = String(getColKey(col, idx));
          const label = col.title ?? col.dataIndex ?? k;
          const checked = selectedKeys.includes(k);
          const disabled = !!col.disabled;
          const disableUncheck = !disabled && checked && selectedKeys.length <= 1; // 禁止取消最后一个
          return (
            <Checkbox
              key={k}
              className={`${prefixCls}-column-item`}
              disabled={disabled || disableUncheck}
              checked={checked}
              onChange={(e) => toggleOne(k, e.target.checked)}
            >
              <span className={`${prefixCls}-column-item-title`}>{renderColumnTitle?.(col, idx) ?? label}</span>
            </Checkbox>
          );
        })}
      </Space>
      <Divider className={`${prefixCls}-divider`} />
      <div className={`${prefixCls}-footer`}>
        <Button
          type="text"
          {...checkAllProps}
          className={classNames(`${prefixCls}-select-all`, checkAllProps?.className)}
          onClick={(e) => {
            handleCheckAll(!isAllChecked);
            checkAllProps?.onClick?.(e);
          }}
        >
          <Checkbox checked={isAllChecked} indeterminate={isIndeterminate}></Checkbox>
          {t('components.ColumnSetting.selectAll')}
        </Button>
        <Button
          type="text"
          icon={<ReloadOutlined />}
          disabled={!hasChange}
          {...resetProps}
          className={classNames(`${prefixCls}-reset`, resetProps?.className)}
          onClick={(e) => {
            handleReset();
            resetProps?.onClick?.(e);
          }}
        >
          {t('components.ColumnSetting.reset')}
        </Button>
      </div>
    </div>
  );

  return wrapCSSVar(
    <Dropdown
      open={open}
      onOpenChange={handleOpenChange}
      trigger={['click']}
      dropdownRender={dropdownRender} // To be compatible with lower versions of antd
      popupRender={dropdownRender}
      placement="bottomRight"
      {...dropdownProps}
      rootClassName={classNames(hashId, cssVarCls, prefixCls, `${prefixCls}-dropdown`, dropdownProps?.className)}
    >
      <Button
        icon={<SettingOutlined />}
        {...triggerProps}
        className={classNames(hashId, cssVarCls, prefixCls, `${prefixCls}-trigger`, triggerProps?.className)}
      />
    </Dropdown>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ColumnSettingItem<T = any> extends ColumnType<T> {
  /**
   * - **EN:** Disable toggling visibility for this column.
   * - **CN:** 禁止切换此列的可见性。
   */
  disabled?: boolean;
}

function getColKey(col: ColumnType, idx: number): React.Key {
  return col.key ?? (col.dataIndex as string) ?? idx;
}

function normalizeToSelectedKeys(cols: ColumnType[]): string[] {
  return cols
    .map((c, i) => ({ key: String(getColKey(c, i)), hidden: !!c.hidden }))
    .filter((c) => !c.hidden)
    .map((c) => c.key)
    .sort();
}

export default ColumnSetting;
