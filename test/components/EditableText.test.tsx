import type { PropsWithChildren } from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ReactEasyContext, {
  defaultContextValue,
  type ReactEasyContextProps,
} from '../../src/components/ConfigProvider/context';
import EditableText from '../../src/components/EditableText';
import type { EditableTextProps } from '../../src/components/EditableText';

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

// antd v6 responsiveObserver / useBreakpoint require matchMedia in jsdom
if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {
      // stub method (deprecated API)
    },
    removeListener: () => {
      // stub method (deprecated API)
    },
    addEventListener: () => {
      // stub method
    },
    removeEventListener: () => {
      // stub method
    },
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
}

// Mock useT so EditableText renders without a full i18n provider
vi.mock('../../src/hooks/useT', () => ({
  default: () => (key: string) => {
    const map: Record<string, string> = {
      'components.EditableText.edit': 'Edit',
      'components.EditableText.placeholder': 'Please input',
      'components.EditableText.save': 'Save',
      'components.EditableText.cancel': 'Cancel',
      'components.EditableText.requiredMsg': 'Required',
    };
    return map[key] ?? key;
  },
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

type Props = Omit<EditableTextProps<string, 'Text' | 'Paragraph' | 'Title' | 'Link', 'Input' | 'TextArea'>, 'onOk'> & {
  onOk?: (value: string | undefined) => void | Promise<void>;
};

// onOk is required by EditableTextProps; inject a no-op default so each test
// only declares the props it actually asserts on. rerender is wrapped to keep
// the same default onOk across controlled-mode re-renders.
function renderEditable(props: Props) {
  const { onOk = vi.fn(), ...rest } = props;
  const utils = render(<EditableText onOk={onOk} {...rest} />, { wrapper: createWrapper() });
  return {
    ...utils,
    rerender(next: Props) {
      const nextOnOk = next.onOk ?? onOk;
      const { onOk: _nextOnOk, ...nextRest } = next;
      utils.rerender(<EditableText onOk={nextOnOk} {...nextRest} />);
    },
  };
}

describe('EditableText', () => {
  it('renders default view mode with value (Text + Input)', () => {
    const { container } = renderEditable({ value: 'Hello World' });
    expect(container.textContent).toContain('Hello World');
    expect(container.querySelector('.easy-editable-text-edit-icon')).toBeTruthy();
  });

  it('renders displayText as ReactNode', () => {
    const { container } = renderEditable({ value: 'raw', displayText: <span>Custom Node</span> });
    expect(container.textContent).toContain('Custom Node');
    expect(container.textContent).not.toContain('raw');
  });

  it('renders displayText from function', () => {
    const displayFn = vi.fn((v: string | undefined) => `Formatted: ${v}`);
    const { container } = renderEditable({ value: 'abc', displayText: displayFn });
    expect(displayFn).toHaveBeenCalledWith('abc');
    expect(container.textContent).toContain('Formatted: abc');
  });

  it('hides text when displayText is false (?? does not fall back on false)', () => {
    const { container } = renderEditable({ value: 'raw', displayText: false });
    // displayTextInProps ?? value?.toString() -> false ?? 'raw' === false (nullish
    // coalescing only falls back on null/undefined), so the text is not rendered.
    expect(container.textContent).not.toContain('raw');
  });

  it('renders children with priority over displayText', () => {
    const { container } = renderEditable({
      value: 'raw',
      displayText: 'Display',
      children: <span>Child Content</span>,
    });
    expect(container.textContent).toContain('Child Content');
    expect(container.textContent).not.toContain('Display');
  });

  it('renders with textComp Title (margin-bottom zeroed)', () => {
    const { container } = renderEditable({ value: 'Title', textComp: 'Title' });
    expect(container.textContent).toContain('Title');
  });

  it('renders with textComp Paragraph', () => {
    const { container } = renderEditable({ value: 'Para', textComp: 'Paragraph' });
    expect(container.textContent).toContain('Para');
  });

  it('renders with textComp Link', () => {
    const { container } = renderEditable({ value: 'Link', textComp: 'Link' });
    expect(container.textContent).toContain('Link');
  });

  it('renders with textComp Text (explicit)', () => {
    const { container } = renderEditable({ value: 'Text', textComp: 'Text' });
    expect(container.textContent).toContain('Text');
  });

  it('applies block=true to both view and editing modes', () => {
    const { container } = renderEditable({ value: 'Block', block: true });
    expect(container.querySelector('.easy-editable-text-view-mode-block')).toBeTruthy();
  });

  it('applies block object with separate view/editing flags', async () => {
    const { container } = renderEditable({ value: 'BlockObj', block: { view: false, editing: true } });
    // view mode: block.view=false -> no view-mode-block class
    expect(container.querySelector('.easy-editable-text-view-mode-block')).toBeNull();

    // enter editing mode: editingBlock=true -> edit-mode container has form
    fireEvent.click(container.querySelector('.easy-editable-text-edit-icon')!);
    await waitFor(() => {
      expect(container.querySelector('.easy-editable-text-edit-mode')).toBeTruthy();
    });
  });

  it('enters editing mode on edit icon click', async () => {
    const { container } = renderEditable({ value: 'Edit Me' });
    fireEvent.click(container.querySelector('.easy-editable-text-edit-icon')!);
    await waitFor(() => {
      expect(container.querySelector('.easy-editable-text-edit-mode')).toBeTruthy();
    });
  });

  it('does not render edit icon when editable=false', () => {
    const { container } = renderEditable({ value: 'NoEdit', editable: false });
    expect(container.querySelector('.easy-editable-text-edit-icon')).toBeNull();
  });

  it('supports controlled editing and calls onEditingChange', async () => {
    const onEditingChange = vi.fn();
    const { container, rerender } = renderEditable({
      value: 'Controlled',
      editing: false,
      onEditingChange,
    });
    // View mode initially
    expect(container.querySelector('.easy-editable-text-edit-mode')).toBeNull();

    // Controlled editing=true -> form appears
    rerender({ value: 'Controlled', editing: true, onEditingChange });
    await waitFor(() => {
      expect(container.querySelector('.easy-editable-text-edit-mode')).toBeTruthy();
    });

    // Controlled editing=false -> back to view mode
    rerender({ value: 'Controlled', editing: false, onEditingChange });
    await waitFor(() => {
      expect(container.querySelector('.easy-editable-text-edit-mode')).toBeNull();
    });
  });

  it('calls onEditingChange when entering edit mode via icon click', async () => {
    const onEditingChange = vi.fn();
    const { container } = renderEditable({ value: 'X', onEditingChange });
    fireEvent.click(container.querySelector('.easy-editable-text-edit-icon')!);
    await waitFor(() => {
      expect(onEditingChange).toHaveBeenCalledWith(true);
    });
  });

  it('runs full onOk chain: edit -> submit -> onChange -> exit editing', async () => {
    const onOk = vi.fn().mockResolvedValue(undefined);
    const onChange = vi.fn();
    const onEditingChange = vi.fn();
    const { container } = renderEditable({
      value: 'Old',
      onOk,
      onChange,
      onEditingChange,
    });

    // Enter editing
    fireEvent.click(container.querySelector('.easy-editable-text-edit-icon')!);
    await waitFor(() => {
      expect(container.querySelector('input')).toBeTruthy();
    });

    // Change the value and submit
    const input = container.querySelector('input')!;
    fireEvent.change(input, { target: { value: 'New Value' } });
    fireEvent.click(container.querySelector('.easy-editable-text-form-btn-save')!);

    await waitFor(() => {
      expect(onOk).toHaveBeenCalledWith('New Value');
      expect(onChange).toHaveBeenCalledWith('New Value');
      expect(onEditingChange).toHaveBeenCalledWith(false);
    });
    // Back to view mode showing the new value
    await waitFor(() => {
      expect(container.textContent).toContain('New Value');
    });
  });

  it('keeps editing state when onOk throws', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const onOk = vi.fn().mockRejectedValue(new Error('save failed'));
    const { container } = renderEditable({ value: 'Fail', onOk });

    fireEvent.click(container.querySelector('.easy-editable-text-edit-icon')!);
    await waitFor(() => {
      expect(container.querySelector('input')).toBeTruthy();
    });
    fireEvent.change(container.querySelector('input')!, { target: { value: 'x' } });
    fireEvent.click(container.querySelector('.easy-editable-text-form-btn-save')!);

    await waitFor(() => {
      expect(onOk).toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalled();
    });
    // Still in editing mode (handleOk catch path does not exit)
    expect(container.querySelector('.easy-editable-text-edit-mode')).toBeTruthy();
    errorSpy.mockRestore();
  });

  it('runs cancel chain: edit -> cancel -> onCancel -> exit editing', async () => {
    const onCancel = vi.fn().mockResolvedValue(undefined);
    const { container } = renderEditable({ value: 'Cancel Me', onCancel });

    fireEvent.click(container.querySelector('.easy-editable-text-edit-icon')!);
    await waitFor(() => {
      expect(container.querySelector('.easy-editable-text-edit-mode')).toBeTruthy();
    });
    fireEvent.click(container.querySelector('.easy-editable-text-form-btn-close')!);

    await waitFor(() => {
      expect(onCancel).toHaveBeenCalled();
      expect(container.querySelector('.easy-editable-text-edit-mode')).toBeNull();
    });
  });

  it('renders custom edit icon', () => {
    const { container } = renderEditable({
      value: 'CustomIcon',
      editIcon: <span data-testid="custom-edit">✏️</span>,
    });
    expect(container.querySelector('[data-testid="custom-edit"]')).toBeTruthy();
  });

  it('exposes static getEllipsisConfig helper', () => {
    const config = EditableText.getEllipsisConfig('some content');
    expect(config.tooltip).toEqual({
      title: 'some content',
      overlayStyle: { maxWidth: 500 },
    });
    // undefined content also works
    const empty = EditableText.getEllipsisConfig(undefined);
    expect(empty.tooltip.title).toBeUndefined();
  });
});
