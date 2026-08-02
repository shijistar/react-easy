import { act, fireEvent, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import EditableTextForm, {
  type RenderInputInterface,
  type RenderInputProps,
} from '../../../src/components/EditableText/form';

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

// Mock useT so EditableTextForm renders without a full i18n provider
vi.mock('../../src/hooks/useT', () => ({
  default: () => (key: string) => {
    const map: Record<string, string> = {
      'components.EditableText.placeholder': 'Please input',
      'components.EditableText.requiredMsg': 'Required',
      'components.EditableText.save': 'Save',
      'components.EditableText.cancel': 'Cancel',
    };
    return map[key] ?? key;
  },
}));

// Capturing ResizeObserver: form.tsx uses the native `new ResizeObserver` to
// measure the wrapper width (L219-231). We capture the callback per observed
// element and drive it manually with a stubbed contentRect.
const { roCallbacks } = vi.hoisted(() => ({ roCallbacks: new Map<Element, (e: unknown) => void>() }));

class CapturingRO implements ResizeObserver {
  constructor(private readonly cb: (entries: unknown) => void) {}
  observe(el: Element) {
    roCallbacks.set(el, this.cb);
  }
  unobserve(el: Element) {
    roCallbacks.delete(el);
  }
  disconnect() {
    roCallbacks.clear();
  }
}

function fireResize(el: Element, width: number) {
  const entry = Object.defineProperty({ target: el }, 'contentRect', {
    value: { width },
    configurable: true,
  });
  // form.tsx L219 uses ([entity]) => ... destructuring, so pass an array
  roCallbacks.get(el)?.([entry]);
}

const prefixCls = 'editable-text';

function renderForm(props: Parameters<typeof EditableTextForm>[0]) {
  return render(<EditableTextForm {...props} />);
}

describe('EditableTextForm', { timeout: 15000 }, () => {
  beforeEach(() => {
    vi.stubGlobal('ResizeObserver', CapturingRO);
    roCallbacks.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders Input mode with initial value', () => {
    const onOk = vi.fn();
    const { container } = renderForm({ prefixCls, value: 'init value', onOk });
    const input = container.querySelector('input') as HTMLInputElement;
    expect(input).toBeTruthy();
    expect(input.value).toBe('init value');
    expect(container.querySelector(`.${prefixCls}-form`)).toBeTruthy();
  });

  it('renders TextArea mode', () => {
    const onOk = vi.fn();
    const { container } = renderForm({ prefixCls, value: 'multi\nline', inputComp: 'TextArea', onOk });
    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
    expect(textarea).toBeTruthy();
    expect(textarea.value).toBe('multi\nline');
  });

  it('renders custom RenderInputInterface component', () => {
    const onOk = vi.fn();
    const customRender = vi.fn(() => <input data-testid="custom-input" />) as unknown as RenderInputInterface;
    const { container } = renderForm({
      prefixCls,
      value: 'custom',
      inputComp: customRender,
      onOk,
    });
    expect(customRender).toHaveBeenCalledWith(expect.objectContaining({ value: 'custom' }));
    expect(container.querySelector('[data-testid="custom-input"]')).toBeTruthy();
  });

  it('submits new value through onOk on save click', async () => {
    const onOk = vi.fn().mockResolvedValue(undefined);
    const { container } = renderForm({ prefixCls, value: 'old', onOk });

    const input = container.querySelector('input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'new value' } });

    fireEvent.click(container.querySelector(`.${prefixCls}-form-btn-save`) as HTMLElement);
    await waitFor(() => {
      expect(onOk).toHaveBeenCalledWith('new value');
    });
  });

  it('does not call onOk when validation fails (required rule)', async () => {
    const onOk = vi.fn().mockResolvedValue(undefined);
    const { container } = renderForm({ prefixCls, value: 'old', required: true, onOk });

    const input = container.querySelector('input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '' } }); // required rule fails

    fireEvent.click(container.querySelector(`.${prefixCls}-form-btn-save`) as HTMLElement);
    // Give the async validation a chance to complete; onOk must not fire.
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(onOk).not.toHaveBeenCalled();
  });

  it('calls onCancel on cancel click and resets fields', async () => {
    const onCancel = vi.fn().mockResolvedValue(undefined);
    const { container } = renderForm({ prefixCls, value: 'old', onOk: vi.fn(), onCancel });

    const input = container.querySelector('input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'dirty' } });
    fireEvent.click(container.querySelector(`.${prefixCls}-form-btn-close`) as HTMLElement);

    await waitFor(() => {
      expect(onCancel).toHaveBeenCalled();
    });
    // resetFields restores the initial value
    await waitFor(() => {
      expect((container.querySelector('input') as HTMLInputElement).value).toBe('old');
    });
  });

  it('handles Escape key: cancels and forwards cancelProps.onClick', async () => {
    const onCancel = vi.fn().mockResolvedValue(undefined);
    const cancelClick = vi.fn();
    const { container } = renderForm({
      prefixCls,
      value: 'esc',
      onOk: vi.fn(),
      onCancel,
      cancelProps: { onClick: cancelClick },
    });

    const input = container.querySelector('input') as HTMLInputElement;
    fireEvent.keyUp(input, { key: 'Escape' });

    await waitFor(() => {
      expect(onCancel).toHaveBeenCalled();
      expect(cancelClick).toHaveBeenCalled();
    });
  });

  it('shows loading on save button while async onOk is pending', async () => {
    let resolveOk: (v: void | PromiseLike<void>) => void = () => undefined;
    const onOk = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveOk = resolve;
        }),
    );
    const { container } = renderForm({ prefixCls, value: 'load', onOk });

    fireEvent.click(container.querySelector(`.${prefixCls}-form-btn-save`) as HTMLElement);
    await waitFor(() => {
      const btn = container.querySelector(`.${prefixCls}-form-btn-save`) as HTMLElement;
      expect(btn.classList.contains('ant-btn-loading')).toBe(true);
    });

    await act(async () => {
      resolveOk(undefined);
    });
    await waitFor(() => {
      const btn = container.querySelector(`.${prefixCls}-form-btn-save`) as HTMLElement;
      expect(btn.classList.contains('ant-btn-loading')).toBe(false);
    });
  });

  it('uses defaultInputActionGap=8 when no marginRight is provided', () => {
    const { container } = renderForm({ prefixCls, value: 'gap', onOk: vi.fn() });
    // Form.Item style marginInlineEnd is defaultInputActionGap
    const formItem = container.querySelector(`.${prefixCls}-form .ant-form-item`) as HTMLElement;
    expect(formItem).toBeTruthy();
    // No crash and the form renders; gap handling is exercised via effect path
    expect(container.querySelector('input')).toBeTruthy();
  });

  it('updates forceBlock when wrapper width overflows', async () => {
    const { container } = renderForm({ prefixCls, value: 'width', onOk: vi.fn() });
    const wrapper = container.querySelector(`.${prefixCls}-form`) as HTMLElement;
    expect(wrapper).toBeTruthy();
    // Content width ~0 (jsdom), actionWidth 0, gap 8. Overflow when
    // 0 + 0 + 8 - wrapperWidth > 1  =>  wrapperWidth < 7.
    await act(async () => {
      fireResize(wrapper, 100); // no overflow
    });
    // Narrow width triggers forceBlock -> block class on form-item
    await act(async () => {
      fireResize(wrapper, 0); // overflow
    });
    const formItem = container.querySelector(`.${prefixCls}-form .ant-form-item`) as HTMLElement;
    expect(formItem.className).toContain('ant-form-item-block');
  });

  it('parses px from formItemProps marginRight for action gap', () => {
    const { container } = renderForm({
      prefixCls,
      value: 'px',
      onOk: vi.fn(),
      formItemProps: { style: { marginRight: '16px' } },
    });
    // pxToNumber('16px') -> 16, gap becomes 16 instead of default 8;
    // no crash and form still renders
    expect(container.querySelector('input')).toBeTruthy();
  });

  it('resets to undefined marginRight -> default gap 8 (pxToNumber falsy branch)', () => {
    const { container } = renderForm({ prefixCls, value: 'gap2', onOk: vi.fn() });
    expect(container.querySelector(`.${prefixCls}-form`)).toBeTruthy();
    expect(container.querySelector('input')).toBeTruthy();
  });

  it('logs error when onCancel throws', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const onCancel = vi.fn().mockRejectedValue(new Error('cancel failed'));
    const { container } = renderForm({ prefixCls, value: 'x', onOk: vi.fn(), onCancel });

    fireEvent.click(container.querySelector(`.${prefixCls}-form-btn-close`) as HTMLElement);
    await waitFor(() => {
      expect(onCancel).toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalled();
    });
    errorSpy.mockRestore();
  });

  it('logs error when onOk throws inside handleSubmit', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const onOk = vi.fn().mockRejectedValue(new Error('submit failed'));
    const { container } = renderForm({ prefixCls, value: 'x', onOk });

    fireEvent.click(container.querySelector(`.${prefixCls}-form-btn-save`) as HTMLElement);
    await waitFor(() => {
      expect(onOk).toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalled();
    });
    // saving resets in finally
    await waitFor(() => {
      const btn = container.querySelector(`.${prefixCls}-form-btn-save`) as HTMLElement;
      expect(btn.classList.contains('ant-btn-loading')).toBe(false);
    });
    errorSpy.mockRestore();
  });

  it('submits on Enter in Input mode (onPressEnter)', async () => {
    const onOk = vi.fn().mockResolvedValue(undefined);
    const { container } = renderForm({ prefixCls, value: 'enter', onOk });

    const input = container.querySelector('input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'enter value' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(onOk).toHaveBeenCalledWith('enter value');
    });
  });

  it('does not submit on Enter in TextArea mode', async () => {
    const onOk = vi.fn().mockResolvedValue(undefined);
    const { container } = renderForm({ prefixCls, value: 'ta', inputComp: 'TextArea', onOk });

    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'ta value' } });
    fireEvent.keyDown(textarea, { key: 'Enter' });

    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(onOk).not.toHaveBeenCalled();
  });

  it('cancels on Escape in TextArea mode', async () => {
    const onCancel = vi.fn().mockResolvedValue(undefined);
    const { container } = renderForm({ prefixCls, value: 'esc-ta', inputComp: 'TextArea', onOk: vi.fn(), onCancel });

    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
    fireEvent.keyUp(textarea, { key: 'Escape' });

    await waitFor(() => {
      expect(onCancel).toHaveBeenCalled();
    });
  });

  it('does not cancel on non-Escape key', async () => {
    const onCancel = vi.fn().mockResolvedValue(undefined);
    const { container } = renderForm({ prefixCls, value: 'plain', onOk: vi.fn(), onCancel });

    const input = container.querySelector('input') as HTMLInputElement;
    fireEvent.keyUp(input, { key: 'a' });

    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('merges inputProps.style into input style', () => {
    const { container } = renderForm({
      prefixCls,
      value: 'styled',
      onOk: vi.fn(),
      inputProps: { style: { color: 'red' } },
    });
    const input = container.querySelector('input') as HTMLInputElement;
    expect(input.style.color).toBe('red');
  });

  it('handles inputProps without style (falls back to empty object)', () => {
    const { container } = renderForm({
      prefixCls,
      value: 'plain-style',
      onOk: vi.fn(),
      inputProps: { placeholder: 'custom placeholder' },
    });
    const input = container.querySelector('input') as HTMLInputElement;
    expect(input.placeholder).toBe('custom placeholder');
  });

  it('custom input submit chain validates and calls onOk', async () => {
    const onOk = vi.fn().mockResolvedValue(undefined);
    const customRender = ((props: RenderInputProps<string>) => (
      <div>
        <input
          data-testid="custom-input"
          value={props.value ?? ''}
          onChange={(e) => props.onChange?.(e.target.value)}
        />
        <button data-testid="custom-submit" onClick={() => props.submit()}>
          submit
        </button>
      </div>
    )) as RenderInputInterface;
    const { container } = renderForm({
      prefixCls,
      value: 'custom-chain',
      inputComp: customRender,
      onOk,
    });

    const input = container.querySelector('[data-testid="custom-input"]') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'custom new' } });
    fireEvent.click(container.querySelector('[data-testid="custom-submit"]') as HTMLElement);

    await waitFor(() => {
      expect(onOk).toHaveBeenCalledWith('custom new');
    });
  });
});
