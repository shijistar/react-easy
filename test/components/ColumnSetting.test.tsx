import type { PropsWithChildren } from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ColumnSetting from '../../src/components/ColumnSetting';
import ReactEasyContext, {
  defaultContextValue,
  type ReactEasyContextProps,
} from '../../src/components/ConfigProvider/context';

// Global polyfills for jsdom (needed by antd css-in-js)
if (typeof ResizeObserver === 'undefined') {
  class ResizeObserverMock {
    observe() {
      // stub method
    }
    unobserve() {
      // stub method
    }
    disconnect() {
      // stub method
    }
  }
  globalThis.ResizeObserver = ResizeObserverMock;
}

// Mock hooks used by ColumnSetting
vi.mock('../../src/hooks/useT', () => ({
  default: () => (key: string) => {
    const map: Record<string, string> = {
      'components.ColumnSetting.title': 'Column Settings',
      'components.ColumnSetting.selectAll': 'Select All',
      'components.ColumnSetting.reset': 'Reset',
    };
    return map[key] ?? key;
  },
}));

// Controllable useLocalStorage mock: tests can seed the stored value and assert the setter.
const { storageMock } = vi.hoisted(() => ({
  storageMock: {
    value: undefined as string[] | undefined,
    setValue: vi.fn(),
    removeValue: vi.fn(),
  },
}));

vi.mock('../../src/hooks/useLocalStorage', () => ({
  default: (_key?: string) => [storageMock.value, storageMock.setValue, storageMock.removeValue] as const,
}));

function createWrapper(value?: Partial<ReactEasyContextProps>) {
  const contextValue: ReactEasyContextProps = {
    ...defaultContextValue,
    getPrefixCls: (suffixCls, customizePrefixCls?) => customizePrefixCls ?? `easy-${suffixCls}`,
    ...value,
  };
  return function Wrapper({ children }: PropsWithChildren) {
    return <ReactEasyContext.Provider value={contextValue}>{children}</ReactEasyContext.Provider>;
  };
}

const sampleColumns = [
  { key: 'col1', title: 'Column 1', dataIndex: 'c1' },
  { key: 'col2', title: 'Column 2', dataIndex: 'c2' },
  { key: 'col3', title: 'Column 3', dataIndex: 'c3', hidden: true },
];

const visibleColumns = [
  { key: 'col1', title: 'Column 1', dataIndex: 'c1' },
  { key: 'col2', title: 'Column 2', dataIndex: 'c2' },
  { key: 'col3', title: 'Column 3', dataIndex: 'c3' },
];

async function openDropdown(trigger: Element) {
  fireEvent.click(trigger);
  await waitFor(() => {
    expect(document.body.textContent).toContain('Column Settings');
  });
}

describe('ColumnSetting', () => {
  beforeEach(() => {
    storageMock.value = undefined;
    storageMock.setValue.mockClear();
    storageMock.removeValue.mockClear();
  });

  it('renders trigger button', () => {
    const { container } = render(<ColumnSetting columns={sampleColumns} />, { wrapper: createWrapper() });
    expect(container.querySelector('.easy-column-setting-trigger')).toBeTruthy();
  });

  it('renders with custom prefixCls', () => {
    const { container } = render(<ColumnSetting columns={sampleColumns} prefixCls="my-prefix" />, {
      wrapper: createWrapper(),
    });
    expect(container.querySelector('.my-prefix-trigger')).toBeTruthy();
  });

  it('renders trigger button with custom type from triggerProps', () => {
    const { container } = render(<ColumnSetting columns={sampleColumns} triggerProps={{ type: 'primary' }} />, {
      wrapper: createWrapper(),
    });
    const btn = container.querySelector('.easy-column-setting-trigger');
    expect(btn).toBeTruthy();
  });

  it('renders with storageKey', () => {
    const { container } = render(<ColumnSetting columns={sampleColumns} storageKey="test-key" />, {
      wrapper: createWrapper(),
    });
    expect(container.querySelector('.easy-column-setting-trigger')).toBeTruthy();
  });

  it('opens dropdown and renders popup', async () => {
    const { container } = render(<ColumnSetting columns={sampleColumns} />, { wrapper: createWrapper() });
    const trigger = container.querySelector('.easy-column-setting-trigger')!;
    await openDropdown(trigger);
    expect(document.body.textContent).toContain('Column Settings');
  });

  it('toggles one column on: fires onChange with updated visibility', async () => {
    const onChange = vi.fn();
    // col3 is hidden in sampleColumns -> rendered but unselected, so clicking it
    // exercises the checked=true branch of toggleOne.
    storageMock.value = ['col1', 'col2'];
    const { container } = render(<ColumnSetting columns={sampleColumns} onChange={onChange} />, {
      wrapper: createWrapper(),
    });
    const trigger = container.querySelector('.easy-column-setting-trigger')!;
    await openDropdown(trigger);

    const checkboxes = document.querySelectorAll<HTMLInputElement>('.easy-column-setting-column-item input');
    expect(checkboxes.length).toBe(3);
    fireEvent.click(checkboxes[2]); // check hidden col3
    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
    });
    const next = onChange.mock.calls[0][0] as Array<{ key: string; hidden?: boolean }>;
    expect(next.find((c) => c.key === 'col3')?.hidden).toBeFalsy();
  });

  it('toggles one column off: hides the column', async () => {
    const onChange = vi.fn();
    storageMock.value = ['col1', 'col2', 'col3'];
    const { container } = render(<ColumnSetting columns={visibleColumns} onChange={onChange} />, {
      wrapper: createWrapper(),
    });
    const trigger = container.querySelector('.easy-column-setting-trigger')!;
    await openDropdown(trigger);

    const checkboxes = document.querySelectorAll<HTMLInputElement>('.easy-column-setting-column-item input');
    fireEvent.click(checkboxes[2]); // uncheck col3
    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
    });
    const next = onChange.mock.calls[0][0] as Array<{ key: string; hidden?: boolean }>;
    expect(next.find((c) => c.key === 'col3')?.hidden).toBeTruthy();
  });

  it('blocks unchecking the last visible column (keeps at least one)', async () => {
    const onChange = vi.fn();
    const single = [{ key: 'only', title: 'Only', dataIndex: 'o' }];
    storageMock.value = ['only'];
    const { container } = render(<ColumnSetting columns={single} onChange={onChange} />, {
      wrapper: createWrapper(),
    });
    const trigger = container.querySelector('.easy-column-setting-trigger')!;
    await openDropdown(trigger);

    const checkbox = document.querySelector<HTMLInputElement>('.easy-column-setting-column-item input')!;
    // Only one selected column -> checkbox is disabled (disableUncheck).
    expect(checkbox.disabled).toBe(true);
    // Force the change event anyway to exercise the guard branch.
    fireEvent.change(checkbox, { target: { checked: false } });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('selects all columns', async () => {
    const onChange = vi.fn();
    // sampleColumns has col3 hidden -> col3 is not selected, so isAllChecked is
    // false and clicking Select All exercises the checked=true branch.
    storageMock.value = ['col1', 'col2'];
    const { container } = render(<ColumnSetting columns={sampleColumns} onChange={onChange} />, {
      wrapper: createWrapper(),
    });
    const trigger = container.querySelector('.easy-column-setting-trigger')!;
    await openDropdown(trigger);

    const selectAllBtn = [...document.querySelectorAll('button')].find((b) => b.textContent?.includes('Select All'))!;
    expect(selectAllBtn).toBeTruthy();
    fireEvent.click(selectAllBtn);
    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
    });
    const next = onChange.mock.calls[0][0] as Array<{ key: string; hidden?: boolean }>;
    expect(next.every((c) => !c.hidden)).toBe(true);
  });

  it('unchecks all columns but keeps a fallback first column', async () => {
    const onChange = vi.fn();
    storageMock.value = ['col1', 'col2', 'col3'];
    const { container } = render(<ColumnSetting columns={visibleColumns} onChange={onChange} />, {
      wrapper: createWrapper(),
    });
    const trigger = container.querySelector('.easy-column-setting-trigger')!;
    await openDropdown(trigger);

    const selectAllBtn = [...document.querySelectorAll('button')].find((b) => b.textContent?.includes('Select All'))!;
    fireEvent.click(selectAllBtn); // currently all checked -> uncheck all
    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
    });
    const next = onChange.mock.calls[0][0] as Array<{ key: string; hidden?: boolean }>;
    // At least one column stays visible (fallback).
    expect(next.filter((c) => !c.hidden).length).toBeGreaterThanOrEqual(1);
  });

  it('unchecks all selectable columns but keeps disabled columns selected', async () => {
    const onChange = vi.fn();
    // col1 is disabled: it lives in selectedKeys but not in allSelectableKeys,
    // so uncheck-all keeps it (nextArr.length > 0 branch of handleCheckAll).
    const colsWithDisabled = [
      { key: 'col1', title: 'C1', dataIndex: 'c1', disabled: true },
      { key: 'col2', title: 'C2', dataIndex: 'c2' },
    ];
    storageMock.value = ['col1', 'col2'];
    const { container } = render(<ColumnSetting columns={colsWithDisabled} onChange={onChange} />, {
      wrapper: createWrapper(),
    });
    const trigger = container.querySelector('.easy-column-setting-trigger')!;
    await openDropdown(trigger);

    const selectAllBtn = [...document.querySelectorAll('button')].find((b) => b.textContent?.includes('Select All'))!;
    fireEvent.click(selectAllBtn); // all checked -> uncheck all; col1 (disabled) survives
    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
    });
    const next = onChange.mock.calls[0][0] as Array<{ key: string; hidden?: boolean }>;
    const visibleKeys = next.filter((c) => !c.hidden).map((c) => c.key);
    expect(visibleKeys).toContain('col1');
  });

  it('resets to initial keys when they exist', async () => {
    const onChange = vi.fn();
    storageMock.value = ['col1', 'col2', 'col3'];
    const { container } = render(<ColumnSetting columns={visibleColumns} onChange={onChange} />, {
      wrapper: createWrapper(),
    });
    const trigger = container.querySelector('.easy-column-setting-trigger')!;
    await openDropdown(trigger); // opening sets initialKeys = all visible

    // Uncheck col3 first.
    const checkboxes = document.querySelectorAll<HTMLInputElement>('.easy-column-setting-column-item input');
    fireEvent.click(checkboxes[2]);
    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
    });
    onChange.mockClear();

    const resetBtn = [...document.querySelectorAll('button')].find((b) => b.textContent?.includes('Reset'))!;
    fireEvent.click(resetBtn);
    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
    });
    const next = onChange.mock.calls[0][0] as Array<{ key: string; hidden?: boolean }>;
    expect(next.every((c) => !c.hidden)).toBe(true); // back to all visible
  });

  it('resets to first column key when initial keys are empty', async () => {
    const onChange = vi.fn();
    // All columns hidden -> normalizeToSelectedKeys returns [] and opening the
    // dropdown keeps initialKeys empty; then selecting one column makes
    // hasChange true so Reset is enabled and falls back to [keys[0]].
    const allHidden = [
      { key: 'col1', title: 'C1', dataIndex: 'c1', hidden: true },
      { key: 'col2', title: 'C2', dataIndex: 'c2', hidden: true },
    ];
    storageMock.value = undefined;
    const { container } = render(<ColumnSetting columns={allHidden} onChange={onChange} />, {
      wrapper: createWrapper(),
    });
    const trigger = container.querySelector('.easy-column-setting-trigger')!;
    await openDropdown(trigger);

    const checkboxes = document.querySelectorAll<HTMLInputElement>('.easy-column-setting-column-item input');
    fireEvent.click(checkboxes[0]); // select col1 -> hasChange becomes true
    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
    });
    onChange.mockClear();

    const resetBtn = [...document.querySelectorAll('button')].find((b) => b.textContent?.includes('Reset'))!;
    fireEvent.click(resetBtn);
    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
    });
    const next = onChange.mock.calls[0][0] as Array<{ key: string; hidden?: boolean }>;
    const visibleKeys = next.filter((c) => !c.hidden).map((c) => c.key);
    expect(visibleKeys).toContain('col1');
  });

  it('closing dropdown clears initialKeys so storage-diff effect re-fires onChange', async () => {
    const onChange = vi.fn();
    storageMock.value = ['col1'];
    const { container } = render(
      <ColumnSetting columns={visibleColumns} onChange={onChange} storageKey="close-key" />,
      { wrapper: createWrapper() },
    );
    const trigger = container.querySelector('.easy-column-setting-trigger')!;
    await openDropdown(trigger);
    // Opening normalized initialKeys (['col1','col2','col3']); storage differs
    // (['col1']) so onChange fired already. Clear to observe the close side effect.
    onChange.mockClear();

    // Close with an outside click (rc-trigger clickOutside). Closing runs
    // handleOpenChange(false) -> setInitialKeys([]) -> storage-diff effect fires
    // onChange again with the stored selection. This is the observable proof
    // that the close branch (L163) executed.
    fireEvent.mouseDown(document.body);
    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
    });
  });

  it('fires onChange from storage when storage value differs from initial keys', async () => {
    const onChange = vi.fn();
    // storageKey is required: the effect gates on storageRef.current.
    storageMock.value = ['col1']; // storage says only col1 visible, initial normalize is col1+col2+col3
    const { container } = render(<ColumnSetting columns={visibleColumns} onChange={onChange} storageKey="diff-key" />, {
      wrapper: createWrapper(),
    });
    const trigger = container.querySelector('.easy-column-setting-trigger')!;
    // Opening the dropdown sets initialKeys to normalized columns; the storage-diff
    // effect then fires onChange with the stored selection.
    await openDropdown(trigger);
    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
    });
  });

  it('forwards popupProps.onClick', async () => {
    const popupOnClick = vi.fn();
    const { container } = render(<ColumnSetting columns={sampleColumns} popupProps={{ onClick: popupOnClick }} />, {
      wrapper: createWrapper(),
    });
    const trigger = container.querySelector('.easy-column-setting-trigger')!;
    await openDropdown(trigger);

    const popup = document.querySelector('.easy-column-setting-popup')!;
    fireEvent.click(popup);
    expect(popupOnClick).toHaveBeenCalled();
  });

  it('forwards checkAllProps.onClick and resetProps.onClick', async () => {
    const checkAllClick = vi.fn();
    const resetClick = vi.fn();
    const { container } = render(
      <ColumnSetting
        columns={visibleColumns}
        checkAllProps={{ onClick: checkAllClick }}
        resetProps={{ onClick: resetClick }}
      />,
      { wrapper: createWrapper() },
    );
    const trigger = container.querySelector('.easy-column-setting-trigger')!;
    await openDropdown(trigger);

    const selectAllBtn = [...document.querySelectorAll('button')].find((b) => b.textContent?.includes('Select All'))!;
    fireEvent.click(selectAllBtn);
    expect(checkAllClick).toHaveBeenCalled();

    const resetBtn = [...document.querySelectorAll('button')].find((b) => b.textContent?.includes('Reset'))!;
    fireEvent.click(resetBtn);
    expect(resetClick).toHaveBeenCalled();
  });

  it('falls back column label to dataIndex then key index', async () => {
    const cols = [{ title: 'Has Title' }, { dataIndex: 'onlyDataIndex' }, {}];
    const { container } = render(<ColumnSetting columns={cols} />, { wrapper: createWrapper() });
    const trigger = container.querySelector('.easy-column-setting-trigger')!;
    await openDropdown(trigger);
    expect(document.body.textContent).toContain('Has Title');
    expect(document.body.textContent).toContain('onlyDataIndex');
  });

  it('renders disabled columns as disabled checkboxes', async () => {
    const colsWithDisabled = [
      { key: 'col1', title: 'C1', dataIndex: 'c1' },
      { key: 'col2', title: 'C2', dataIndex: 'c2', disabled: true },
    ];
    storageMock.value = ['col1', 'col2'];
    const { container } = render(<ColumnSetting columns={colsWithDisabled} />, { wrapper: createWrapper() });
    const trigger = container.querySelector('.easy-column-setting-trigger')!;
    await openDropdown(trigger);

    const checkboxes = document.querySelectorAll<HTMLInputElement>('.easy-column-setting-column-item input');
    expect(checkboxes.length).toBe(2);
    expect(checkboxes[1].disabled).toBe(true);
  });

  it('uses renderColumnTitle for custom column titles', async () => {
    const { container } = render(
      <ColumnSetting columns={sampleColumns} renderColumnTitle={(col) => `Custom: ${col.title || col.dataIndex}`} />,
      { wrapper: createWrapper() },
    );
    const trigger = container.querySelector('.easy-column-setting-trigger')!;
    await openDropdown(trigger);
    expect(document.body.textContent).toContain('Custom: Column 1');
  });

  it('persists selection to storage when storageKey is provided', async () => {
    storageMock.value = ['col1', 'col2', 'col3'];
    const { container } = render(<ColumnSetting columns={visibleColumns} storageKey="persist-key" />, {
      wrapper: createWrapper(),
    });
    const trigger = container.querySelector('.easy-column-setting-trigger')!;
    await openDropdown(trigger);

    const checkboxes = document.querySelectorAll<HTMLInputElement>('.easy-column-setting-column-item input');
    fireEvent.click(checkboxes[2]); // uncheck col3 -> write storage
    await waitFor(() => {
      expect(storageMock.setValue).toHaveBeenCalled();
    });
  });
});
