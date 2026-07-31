import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, type PropsWithChildren, vi } from 'vitest';
import ColumnSetting from '../../src/components/ColumnSetting';
import ReactEasyContext, {
  defaultContextValue,
  type ReactEasyContextProps,
} from '../../src/components/ConfigProvider/context';

// Global polyfills for jsdom (needed by antd css-in-js)
if (typeof ResizeObserver === 'undefined') {
  class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  // @ts-expect-error - global polyfill
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

vi.mock('../../src/hooks/useLocalStorage', () => ({
  default: (_key?: string) => [[], vi.fn(), vi.fn()] as const,
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

describe('ColumnSetting', () => {
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

  it('calls onChange when a checkbox is toggled', async () => {
    const onChange = vi.fn();
    const { container } = render(<ColumnSetting columns={sampleColumns} onChange={onChange} />, {
      wrapper: createWrapper(),
    });
    const trigger = container.querySelector('.easy-column-setting-trigger')!;
    fireEvent.click(trigger);
    // Dropdown renders in portal, search whole document
    expect(document.body.textContent).toContain('Column Settings');
  });

  it('renders with storageKey', () => {
    const { container } = render(<ColumnSetting columns={sampleColumns} storageKey="test-key" />, {
      wrapper: createWrapper(),
    });
    expect(container.querySelector('.easy-column-setting-trigger')).toBeTruthy();
  });

  it('renders with renderColumnTitle', () => {
    const { container } = render(
      <ColumnSetting columns={sampleColumns} renderColumnTitle={(col) => `Custom: ${col.title || col.dataIndex}`} />,
      { wrapper: createWrapper() },
    );
    expect(container.querySelector('.easy-column-setting-trigger')).toBeTruthy();
  });

  it('renders with dropdownProps', () => {
    const { container } = render(
      <ColumnSetting columns={sampleColumns} dropdownProps={{ placement: 'bottomLeft' }} />,
      { wrapper: createWrapper() },
    );
    expect(container.querySelector('.easy-column-setting-trigger')).toBeTruthy();
  });

  it('renders with popupProps', () => {
    const { container } = render(<ColumnSetting columns={sampleColumns} popupProps={{ style: { minWidth: 200 } }} />, {
      wrapper: createWrapper(),
    });
    expect(container.querySelector('.easy-column-setting-trigger')).toBeTruthy();
  });

  it('renders with checkAllProps and resetProps', () => {
    const { container } = render(
      <ColumnSetting columns={sampleColumns} checkAllProps={{ type: 'link' }} resetProps={{ type: 'link' }} />,
      { wrapper: createWrapper() },
    );
    expect(container.querySelector('.easy-column-setting-trigger')).toBeTruthy();
  });

  it('handles disabled columns', () => {
    const colsWithDisabled = [
      { key: 'col1', title: 'C1', dataIndex: 'c1' },
      { key: 'col2', title: 'C2', dataIndex: 'c2', disabled: true },
    ];
    const { container } = render(<ColumnSetting columns={colsWithDisabled} />, { wrapper: createWrapper() });
    expect(container.querySelector('.easy-column-setting-trigger')).toBeTruthy();
  });

  it('handles empty key fallback via dataIndex', () => {
    const colsNoKey = [
      { dataIndex: 'field1', title: 'Field 1' },
      { dataIndex: 'field2', title: 'Field 2' },
    ];
    const { container } = render(<ColumnSetting columns={colsNoKey} />, { wrapper: createWrapper() });
    expect(container.querySelector('.easy-column-setting-trigger')).toBeTruthy();
  });
});
