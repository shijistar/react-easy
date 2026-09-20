import type { ComponentType, PropsWithChildren, ReactElement } from 'react';
import { useEffect } from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { FormInstance } from 'antd';
import { App as AntdApp, ConfigProvider as AntdConfigProvider, Form } from 'antd';
import ConfigProvider from '../../src/components/ConfigProvider';
import ModalAction, { SubmitWithoutClosingSymbol } from '../../src/components/ModalAction/index';
import type { ModalActionRef } from '../../src/components/ModalAction/index';

// antd v6 responsiveObserver / useBreakpoint require matchMedia in jsdom.
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

// antd's dropdown / rc-resize-observer require ResizeObserver in jsdom.
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
  globalThis.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;
}

afterEach(() => {
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

function TestWrapper({ children }: PropsWithChildren) {
  return (
    <AntdConfigProvider>
      <AntdApp>
        <ConfigProvider>{children}</ConfigProvider>
      </AntdApp>
    </AntdConfigProvider>
  );
}

function renderModalAction(ui: ReactElement) {
  return render(ui, { wrapper: TestWrapper });
}

function bodyHasText(text: string): boolean {
  return document.body.textContent?.includes(text) ?? false;
}

function findOkButton(): HTMLButtonElement {
  return Array.from(document.body.querySelectorAll('.ant-btn')).find(
    (b) => b.textContent === 'OK',
  ) as HTMLButtonElement;
}

function findButton(label: string): HTMLButtonElement {
  return Array.from(document.body.querySelectorAll('button')).find((b) => b.textContent === label) as HTMLButtonElement;
}

const nameInput = () => document.body.querySelector('[data-testid="name-input"]') as HTMLInputElement;

interface SimpleFormData {
  name: string;
}

/** Registers `onSave` and renders a field, mirroring how a real form component is wired. */
const SimpleForm: ComponentType<{
  form?: FormInstance<SimpleFormData>;
  onSave?: (data: SimpleFormData) => unknown;
}> = ({ form, onSave }) => (
  <Form form={form} layout="vertical">
    <Form.Item name="name" label="Name">
      <input data-testid="name-input" />
    </Form.Item>
    <button type="button" onClick={() => onSave?.({ name: form?.getFieldValue('name') ?? '' })}>
      internal-save
    </button>
  </Form>
);

/** Form component that drives the dialog through the `setOpen` it receives. */
function makeSetOpenForm(onOpenSeen: (open: boolean) => void) {
  return function SetOpenForm({
    onOpenChange,
    setOpen,
  }: {
    onOpenChange?: (handler: (open: boolean) => void) => void;
    setOpen?: (open: boolean) => void;
  }) {
    useEffect(() => {
      onOpenChange?.(onOpenSeen);
    }, [onOpenChange]);
    return (
      <button type="button" onClick={() => setOpen?.(false)}>
        close-from-form
      </button>
    );
  };
}

function makeModalAction(props: Record<string, unknown>, ref: { current: unknown }) {
  return (
    <ModalAction
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {...(props as any)}
      ref={ref as never}
    />
  );
}

// jsdom-side coverage of ModalAction. The heavier integration suite lives in
// `test/browser/ModalAction.test.tsx` (real Ant Design, no mocks). This file renders the same
// component in jsdom, which keeps the dialog's internals exercised in the fast node project —
// notably the `FormCreator` wiring, which the browser-only suite cannot cover here because coverage
// from the two projects is merged per statement and their source maps disagree on some positions.
//
// Note: assertions avoid the close/leave animation. rc-motion needs real transition events, which
// jsdom never fires, so the dialog's DOM is not torn down here; the open listener is asserted instead.

describe('ModalAction (jsdom)', () => {
  it('opens via the trigger and passes a form instance to formComp', async () => {
    const ref = { current: null as ModalActionRef<unknown, SimpleFormData> | null };
    renderModalAction(
      makeModalAction({ title: 'Edit', formComp: SimpleForm, triggerProps: { children: 'Open' } }, ref),
    );

    // The trigger renders the dialog lazily: the form component is not mounted until it opens.
    expect(bodyHasText('internal-save')).toBe(false);

    await act(async () => {
      fireEvent.click(findButton('Open'));
    });

    await waitFor(() => expect(bodyHasText('Edit')).toBe(true));
    // `form` reaches formComp through the FormCreator wiring.
    expect(nameInput()).toBeTruthy();
    expect(bodyHasText('internal-save')).toBe(true);
  });

  it('submits the form data through onOk and runs afterOk with the result', async () => {
    const onOk = vi.fn().mockResolvedValue('saved');
    const afterOk = vi.fn();
    const ref = { current: null as ModalActionRef<unknown, SimpleFormData> | null };
    renderModalAction(
      makeModalAction({ title: 'Edit', formComp: SimpleForm, onOk, afterOk, triggerProps: { children: 'Open' } }, ref),
    );

    await act(async () => {
      ref.current?.show();
    });
    await waitFor(() => expect(bodyHasText('Edit')).toBe(true));

    await act(async () => {
      fireEvent.change(nameInput(), { target: { value: 'hello' } });
    });
    await act(async () => {
      fireEvent.click(findOkButton());
    });

    await waitFor(() => expect(onOk).toHaveBeenCalledWith({ name: 'hello' }, expect.anything()));
    await waitFor(() => expect(afterOk).toHaveBeenCalledWith('saved'));
  });

  it('keeps the dialog open when onOk returns SubmitWithoutClosingSymbol', async () => {
    const onOk = vi.fn().mockResolvedValue(SubmitWithoutClosingSymbol);
    const ref = { current: null as ModalActionRef<unknown, SimpleFormData> | null };
    renderModalAction(
      makeModalAction({ title: 'Edit', formComp: SimpleForm, onOk, triggerProps: { children: 'Open' } }, ref),
    );

    await act(async () => {
      ref.current?.show();
    });
    await waitFor(() => expect(bodyHasText('Edit')).toBe(true));

    await act(async () => {
      fireEvent.change(nameInput(), { target: { value: 'hello' } });
    });
    await act(async () => {
      fireEvent.click(findOkButton());
    });

    await waitFor(() => expect(onOk).toHaveBeenCalled());
    // The dialog must stay mounted.
    expect(bodyHasText('Edit')).toBe(true);
  });

  it('lets the form component close the dialog through setOpen', async () => {
    const onOpenSeen = vi.fn();
    const ref = { current: null as ModalActionRef<unknown, SimpleFormData> | null };
    renderModalAction(
      makeModalAction(
        { title: 'Edit', formComp: makeSetOpenForm(onOpenSeen), triggerProps: { children: 'Open' } },
        ref,
      ),
    );

    await act(async () => {
      ref.current?.show();
    });
    await waitFor(() => expect(bodyHasText('Edit')).toBe(true));

    await act(async () => {
      fireEvent.click(findButton('close-from-form'));
    });

    // `setOpen` from the form component runs the same handler the dialog uses, and it notifies the
    // open listener — asserting on that is stable in jsdom, unlike the leave animation.
    await waitFor(() => expect(onOpenSeen).toHaveBeenCalledWith(false));
  });
});
