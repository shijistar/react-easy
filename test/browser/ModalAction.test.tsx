import type { ComponentType, PropsWithChildren, ReactElement } from 'react';
import { createElement, useEffect } from 'react';
import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App as AntdApp, ConfigProvider as AntdConfigProvider, Form, type FormInstance } from 'antd';
import ConfigProvider from '../../src/components/ConfigProvider';
import ModalAction, {
  SubmitWithoutClosingSymbol,
  withDefaultModalActionProps,
  withModalAction,
} from '../../src/components/ModalAction/index';
import type { ModalActionRef } from '../../src/components/ModalAction/index';
import { BrowserTestWrapper } from './helpers';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function renderInBrowser(ui: ReactElement) {
  return render(ui, { wrapper: BrowserTestWrapper });
}

function bodyHasText(text: string): boolean {
  return document.body.textContent?.includes(text) ?? false;
}

function findOkButton(): HTMLButtonElement {
  return Array.from(document.body.querySelectorAll('.ant-btn')).find(
    (b) => b.textContent === 'OK',
  ) as HTMLButtonElement;
}

interface SimpleFormData {
  name: string;
}

const SimpleForm: ComponentType<{
  form?: FormInstance<SimpleFormData>;
  onSave?: (data: SimpleFormData) => unknown;
}> = ({ form, onSave }) => (
  <Form form={form} layout="vertical">
    <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Name is required' }]}>
      <input data-testid="name-input" />
    </Form.Item>
    <button type="button" onClick={() => onSave?.({ name: form?.getFieldValue('name') ?? '' })}>
      internal-save
    </button>
  </Form>
);

// Minimal ModalAction props (cast to never to bypass complex generics in test harness)
function makeModalAction(props: Record<string, unknown>, ref: { current: unknown }) {
  return (
    <ModalAction
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {...(props as any)}
      ref={ref as unknown}
    />
  );
}

describe('ModalAction (browser, real AntD)', () => {
  it('opens modal via ref.show()', async () => {
    const ref = { current: null as ModalActionRef<unknown, SimpleFormData> | null };
    renderInBrowser(
      makeModalAction({ title: 'Edit', formComp: SimpleForm as never, triggerProps: { children: 'Open' } }, ref),
    );
    await act(async () => {
      ref.current?.show();
    });
    await waitFor(() => expect(bodyHasText('Edit')).toBe(true));
  });

  it('does not submit when validateFields fails (empty required field)', async () => {
    const onOk = vi.fn();
    const ref = { current: null as ModalActionRef<unknown, SimpleFormData> | null };
    renderInBrowser(
      makeModalAction({ title: 'Edit', formComp: SimpleForm as never, onOk, triggerProps: { children: 'Open' } }, ref),
    );
    await act(async () => {
      ref.current?.show();
    });
    await waitFor(() => expect(bodyHasText('Edit')).toBe(true));
    const okBtn = await waitFor(() => {
      const btn = findOkButton();
      expect(btn).toBeTruthy();
      return btn!;
    });
    await act(async () => {
      fireEvent.click(okBtn);
    });
    await waitFor(() => expect(onOk).not.toHaveBeenCalled());
    expect(bodyHasText('Edit')).toBe(true);
  });

  it('closes and calls afterOk when onOk returns a normal value', async () => {
    const onOk = vi.fn().mockResolvedValue('saved');
    const afterOk = vi.fn();
    const ref = { current: null as ModalActionRef<unknown, SimpleFormData> | null };
    renderInBrowser(
      makeModalAction(
        { title: 'Edit', formComp: SimpleForm as never, onOk, afterOk, triggerProps: { children: 'Open' } },
        ref,
      ),
    );
    await act(async () => {
      ref.current?.show();
    });
    await waitFor(() => expect(bodyHasText('Edit')).toBe(true));
    const nameInput = document.body.querySelector('[data-testid="name-input"]') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'hello' } });
    });
    const okBtn = await waitFor(() => {
      const btn = findOkButton();
      expect(btn).toBeTruthy();
      return btn!;
    });
    await act(async () => {
      fireEvent.click(okBtn);
    });
    await waitFor(() => expect(onOk).toHaveBeenCalled());
    await waitFor(() => expect(afterOk).toHaveBeenCalledWith('saved'));
    await waitFor(() => expect(bodyHasText('Edit')).toBe(false));
  });

  it('does NOT close when onOk returns SubmitWithoutClosingSymbol', async () => {
    const onOk = vi.fn().mockResolvedValue(SubmitWithoutClosingSymbol);
    const ref = { current: null as ModalActionRef<unknown, SimpleFormData> | null };
    renderInBrowser(
      makeModalAction({ title: 'Edit', formComp: SimpleForm as never, onOk, triggerProps: { children: 'Open' } }, ref),
    );
    await act(async () => {
      ref.current?.show();
    });
    await waitFor(() => expect(bodyHasText('Edit')).toBe(true));
    const nameInput = document.body.querySelector('[data-testid="name-input"]') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'hello' } });
    });
    const okBtn = await waitFor(() => {
      const btn = findOkButton();
      expect(btn).toBeTruthy();
      return btn!;
    });
    await act(async () => {
      fireEvent.click(okBtn);
    });
    await waitFor(() => expect(onOk).toHaveBeenCalled());
    await waitFor(() => expect(bodyHasText('Edit')).toBe(true));
  });

  it('shows loading state during async onOk', async () => {
    let resolveOnOk: (v: unknown) => void = () => {
      // stub method
    };
    const onOk = vi.fn().mockImplementation(
      () =>
        new Promise((res) => {
          resolveOnOk = res;
        }),
    );
    const ref = { current: null as ModalActionRef<unknown, SimpleFormData> | null };
    renderInBrowser(
      makeModalAction({ title: 'Edit', formComp: SimpleForm as never, onOk, triggerProps: { children: 'Open' } }, ref),
    );
    await act(async () => {
      ref.current?.show();
    });
    await waitFor(() => expect(bodyHasText('Edit')).toBe(true));
    const nameInput = document.body.querySelector('[data-testid="name-input"]') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'hello' } });
    });
    const okBtn = await waitFor(() => {
      const btn = findOkButton();
      expect(btn).toBeTruthy();
      return btn!;
    });
    await act(async () => {
      fireEvent.click(okBtn);
    });
    await waitFor(() => expect(onOk).toHaveBeenCalled());
    await waitFor(() => {
      expect(document.body.querySelector('.ant-btn-loading')).not.toBeNull();
    });
    await act(async () => {
      resolveOnOk('done');
    });
    await waitFor(() => expect(bodyHasText('Edit')).toBe(false));
  });

  it('respects custom okText from props (mergeProps outer layer)', async () => {
    const ref = { current: null as ModalActionRef<unknown, SimpleFormData> | null };
    renderInBrowser(
      makeModalAction(
        { title: 'Edit', okText: '保存', formComp: SimpleForm as never, triggerProps: { children: 'Open' } },
        ref,
      ),
    );
    await act(async () => {
      ref.current?.show();
    });
    // Ant Design renders CJK button text with inter-character spacing in the DOM
    // e.g., "保存" becomes "保 存" in the rendered button text
    await waitFor(() => {
      // Ant Design inserts inter-character spacing for CJK: "保存" renders as "保 存"
      const okBtn = Array.from(document.body.querySelectorAll('.ant-btn-primary')).find((b) =>
        b.textContent?.includes('保'),
      );
      expect(okBtn).toBeTruthy();
    });
  });
});

// ===== Advanced coverage: trigger interactions, onSave chain, HOCs =====

let receivedOpens: boolean[] = [];
let resetFieldsSpy: ReturnType<typeof vi.spyOn> | undefined;

/** formComp that registers onSave via the FormCompPropsConstraint API on mount */
const SaveForm: ComponentType<{
  form?: FormInstance<SimpleFormData>;
  onSave?: (handler: (data: SimpleFormData) => unknown) => void;
  saveResult?: unknown;
}> = ({ form, onSave, saveResult }) => {
  useEffect(() => {
    onSave?.(() => saveResult ?? { name: 'from-onSave' });
  }, [onSave, saveResult]);
  return (
    <Form form={form}>
      <Form.Item name="name" label="Name">
        <input data-testid="name-input" />
      </Form.Item>
    </Form>
  );
};

/** formComp that registers an open listener and can setOpen from inside */
const ListenerForm: ComponentType<{
  form?: FormInstance<SimpleFormData>;
  onOpenChange?: (handler: (open: boolean) => void) => void;
  setOpen?: (open: boolean) => void;
}> = ({ form, onOpenChange, setOpen }) => {
  useEffect(() => {
    onOpenChange?.((open) => {
      receivedOpens.push(open);
    });
    setOpen?.(true);
  }, [onOpenChange, setOpen]);
  return (
    <Form form={form}>
      <Form.Item name="name" label="Name">
        <input data-testid="name-input" />
      </Form.Item>
    </Form>
  );
};

/** formComp that spies on resetFields (destroyOnClose=false path) */
const ResetForm: ComponentType<{ form?: FormInstance<SimpleFormData> }> = ({ form }) => {
  useEffect(() => {
    if (form) {
      resetFieldsSpy = vi.spyOn(form, 'resetFields');
    }
  }, [form]);
  return (
    <Form form={form}>
      <Form.Item name="name" label="Name">
        <input data-testid="name-input" />
      </Form.Item>
    </Form>
  );
};

/** formComp without any fields: validateFields resolves to {} (empty-data warn path) */
const EmptyForm: ComponentType<{ form?: FormInstance<SimpleFormData> }> = ({ form }) => <Form form={form} />;

/** Render a static trigger variant (ModalAction.Button/Switch/Link) with minimal typing friction */
function renderStaticTrigger(Comp: unknown, props: Record<string, unknown>, ref: { current: unknown }) {
  return renderInBrowser(createElement(Comp as never, { ...props, ref } as never));
}

function findCancelButton(): HTMLButtonElement {
  return Array.from(document.body.querySelectorAll('.ant-btn')).find(
    (b) => b.textContent === 'Cancel',
  ) as HTMLButtonElement;
}

function BrowserTestWrapperWithGlobalDefaults({ children }: PropsWithChildren) {
  return (
    <AntdConfigProvider>
      <AntdApp>
        <ConfigProvider ModalAction={{ title: 'Global Title' }}>{children}</ConfigProvider>
      </AntdApp>
    </AntdConfigProvider>
  );
}

describe('ModalAction (advanced browser paths)', () => {
  beforeEach(() => {
    receivedOpens = [];
    resetFieldsSpy = undefined;
  });

  it('opens via trigger click and forwards trigger props onClick', async () => {
    const onClick = vi.fn();
    const ref = { current: null as ModalActionRef<unknown, SimpleFormData> | null };
    renderInBrowser(
      makeModalAction(
        { title: 'Edit', formComp: SimpleForm as never, triggerProps: { children: 'Open', onClick } },
        ref,
      ),
    );
    const trigger = await waitFor(() => {
      const btn = Array.from(document.body.querySelectorAll('button')).find((b) => b.textContent === 'Open');
      expect(btn).toBeTruthy();
      return btn as HTMLButtonElement;
    });
    await act(async () => {
      fireEvent.click(trigger);
    });
    await waitFor(() => expect(bodyHasText('Edit')).toBe(true));
    expect(onClick).toHaveBeenCalled();
  });

  it('hides trigger when triggerProps.show is false', async () => {
    renderInBrowser(
      makeModalAction(
        { title: 'Edit', formComp: SimpleForm as never, triggerProps: { children: 'Open', show: false } },
        { current: null },
      ),
    );
    await waitFor(() => {
      const btn = Array.from(document.body.querySelectorAll('button')).find((b) => b.textContent === 'Open');
      expect(btn).toBeFalsy();
    });
  });

  it('renders trigger without event wiring when triggerEvent is falsy', async () => {
    // triggerEvent defaults to 'onClick' (L206), but an explicit falsy value
    // (null is not replaced by the default) exercises the `: {}` branch of the
    // trigger event spread (L323): the trigger renders but never opens the modal.
    const ref = { current: null as ModalActionRef<unknown, SimpleFormData> | null };
    renderInBrowser(
      makeModalAction(
        {
          title: 'Edit',
          formComp: SimpleForm as never,
          triggerEvent: null as never,
          triggerProps: { children: 'Open' },
        },
        ref,
      ),
    );
    const trigger = await waitFor(() => {
      const btn = Array.from(document.body.querySelectorAll('button')).find((b) => b.textContent === 'Open');
      expect(btn).toBeTruthy();
      return btn as HTMLButtonElement;
    });
    await act(async () => {
      fireEvent.click(trigger);
    });
    await waitFor(() => {
      expect(bodyHasText('Edit')).toBe(false);
    });
  });

  it('uses show function from triggerProps', async () => {
    const { rerender } = renderInBrowser(
      makeModalAction(
        { title: 'Edit', formComp: SimpleForm as never, triggerProps: { children: 'Open', show: () => false } },
        { current: null },
      ),
    );
    await waitFor(() => {
      const btn = Array.from(document.body.querySelectorAll('button')).find((b) => b.textContent === 'Open');
      expect(btn).toBeFalsy();
    });
    rerender(
      makeModalAction(
        { title: 'Edit', formComp: SimpleForm as never, triggerProps: { children: 'Open', show: () => true } },
        { current: null },
      ),
    );
    await waitFor(() => {
      const btn = Array.from(document.body.querySelectorAll('button')).find((b) => b.textContent === 'Open');
      expect(btn).toBeTruthy();
    });
  });

  it('respects controlled open prop', async () => {
    const ref = { current: null as ModalActionRef<unknown, SimpleFormData> | null };
    const ui = makeModalAction(
      { title: 'Ctrl', open: true, formComp: SimpleForm as never, triggerProps: { children: 'Open' } },
      ref,
    );
    const { rerender } = renderInBrowser(ui);
    await waitFor(() => expect(bodyHasText('Ctrl')).toBe(true));
    rerender(
      makeModalAction(
        { title: 'Ctrl', open: false, formComp: SimpleForm as never, triggerProps: { children: 'Open' } },
        ref,
      ),
    );
    await waitFor(() => expect(bodyHasText('Ctrl')).toBe(false));
  });

  it('does not open when onBeforeOpen throws', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const ref = { current: null as ModalActionRef<unknown, SimpleFormData> | null };
    renderInBrowser(
      makeModalAction(
        {
          title: 'Blocked',
          formComp: SimpleForm as never,
          onBeforeOpen: () => {
            throw new Error('blocked');
          },
          triggerProps: { children: 'Open' },
        },
        ref,
      ),
    );
    await expect(ref.current?.show()).rejects.toThrow('blocked');
    expect(errorSpy).toHaveBeenCalled();
    expect(bodyHasText('Blocked')).toBe(false);
    errorSpy.mockRestore();
  });

  it('keeps modal open when formComp onSave returns SubmitWithoutClosingSymbol', async () => {
    const ref = { current: null as ModalActionRef<unknown, SimpleFormData> | null };
    renderInBrowser(
      makeModalAction(
        {
          title: 'Edit',
          formComp: SaveForm as never,
          formProps: { saveResult: SubmitWithoutClosingSymbol } as never,
          triggerProps: { children: 'Open' },
        },
        ref,
      ),
    );
    await act(async () => {
      ref.current?.show();
    });
    await waitFor(() => expect(bodyHasText('Edit')).toBe(true));
    const nameInput = document.body.querySelector('[data-testid="name-input"]') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'hello' } });
    });
    const okBtn = await waitFor(() => {
      const btn = findOkButton();
      expect(btn).toBeTruthy();
      return btn!;
    });
    await act(async () => {
      fireEvent.click(okBtn);
    });
    await waitFor(() => expect(bodyHasText('Edit')).toBe(true));
  });

  it('passes onSave result to onOk and closes', async () => {
    const onOk = vi.fn().mockResolvedValue(undefined);
    const afterOk = vi.fn();
    const ref = { current: null as ModalActionRef<unknown, SimpleFormData> | null };
    renderInBrowser(
      makeModalAction(
        {
          title: 'Edit',
          formComp: SaveForm as never,
          onOk,
          afterOk,
          triggerProps: { children: 'Open' },
        },
        ref,
      ),
    );
    await act(async () => {
      ref.current?.show();
    });
    await waitFor(() => expect(bodyHasText('Edit')).toBe(true));
    const okBtn = await waitFor(() => {
      const btn = findOkButton();
      expect(btn).toBeTruthy();
      return btn!;
    });
    await act(async () => {
      fireEvent.click(okBtn);
    });
    await waitFor(() => expect(onOk).toHaveBeenCalledWith({ name: 'from-onSave' }, expect.anything()));
    await waitFor(() => expect(afterOk).toHaveBeenCalledWith(undefined));
    await waitFor(() => expect(bodyHasText('Edit')).toBe(false));
  });

  it('warns when validateFields returns an empty object', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const onOk = vi.fn().mockResolvedValue(undefined);
    const ref = { current: null as ModalActionRef<unknown, SimpleFormData> | null };
    renderInBrowser(
      makeModalAction({ title: 'Edit', formComp: EmptyForm as never, onOk, triggerProps: { children: 'Open' } }, ref),
    );
    await act(async () => {
      ref.current?.show();
    });
    await waitFor(() => expect(bodyHasText('Edit')).toBe(true));
    const okBtn = await waitFor(() => {
      const btn = findOkButton();
      expect(btn).toBeTruthy();
      return btn!;
    });
    await act(async () => {
      fireEvent.click(okBtn);
    });
    await waitFor(() => expect(warnSpy).toHaveBeenCalled());
    await waitFor(() => expect(onOk).toHaveBeenCalled());
    warnSpy.mockRestore();
  });

  it('closes via onSave result when onOk is absent', async () => {
    const afterOk = vi.fn();
    const ref = { current: null as ModalActionRef<unknown, SimpleFormData> | null };
    renderInBrowser(
      makeModalAction(
        {
          title: 'Edit',
          formComp: SaveForm as never,
          afterOk,
          triggerProps: { children: 'Open' },
        },
        ref,
      ),
    );
    await act(async () => {
      ref.current?.show();
    });
    await waitFor(() => expect(bodyHasText('Edit')).toBe(true));
    const okBtn = await waitFor(() => {
      const btn = findOkButton();
      expect(btn).toBeTruthy();
      return btn!;
    });
    await act(async () => {
      fireEvent.click(okBtn);
    });
    await waitFor(() => expect(afterOk).toHaveBeenCalledWith({ name: 'from-onSave' }));
    await waitFor(() => expect(bodyHasText('Edit')).toBe(false));
  });

  it('calls onCancel and closes on cancel button', async () => {
    const onCancel = vi.fn();
    const ref = { current: null as ModalActionRef<unknown, SimpleFormData> | null };
    renderInBrowser(
      makeModalAction(
        { title: 'Edit', formComp: SimpleForm as never, onCancel, triggerProps: { children: 'Open' } },
        ref,
      ),
    );
    await act(async () => {
      ref.current?.show();
    });
    await waitFor(() => expect(bodyHasText('Edit')).toBe(true));
    const cancelBtn = await waitFor(() => {
      const btn = findCancelButton();
      expect(btn).toBeTruthy();
      return btn!;
    });
    await act(async () => {
      fireEvent.click(cancelBtn);
    });
    await waitFor(() => expect(onCancel).toHaveBeenCalled());
    await waitFor(() => expect(bodyHasText('Edit')).toBe(false));
  });

  it('stays open and logs when onOk rejects', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const onOk = vi.fn().mockRejectedValue(new Error('boom'));
    const afterOk = vi.fn();
    const ref = { current: null as ModalActionRef<unknown, SimpleFormData> | null };
    renderInBrowser(
      makeModalAction(
        {
          title: 'Edit',
          formComp: SimpleForm as never,
          onOk,
          afterOk,
          triggerProps: { children: 'Open' },
        },
        ref,
      ),
    );
    await act(async () => {
      ref.current?.show();
    });
    await waitFor(() => expect(bodyHasText('Edit')).toBe(true));
    const nameInput = document.body.querySelector('[data-testid="name-input"]') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'hello' } });
    });
    const okBtn = await waitFor(() => {
      const btn = findOkButton();
      expect(btn).toBeTruthy();
      return btn!;
    });
    await act(async () => {
      fireEvent.click(okBtn);
    });
    await waitFor(() => expect(onOk).toHaveBeenCalled());
    await waitFor(() => expect(errorSpy).toHaveBeenCalled());
    expect(afterOk).not.toHaveBeenCalled();
    expect(bodyHasText('Edit')).toBe(true);
    errorSpy.mockRestore();
  });

  it('accepts boolean mask prop', async () => {
    const ref = { current: null as ModalActionRef<unknown, SimpleFormData> | null };
    renderInBrowser(
      makeModalAction(
        { title: 'Mask', mask: false, formComp: SimpleForm as never, triggerProps: { children: 'Open' } },
        ref,
      ),
    );
    await act(async () => {
      ref.current?.show();
    });
    await waitFor(() => expect(bodyHasText('Mask')).toBe(true));
  });

  it('resets form fields on reopen when destroyOnClose is false', async () => {
    const ref = { current: null as ModalActionRef<unknown, SimpleFormData> | null };
    renderInBrowser(
      makeModalAction(
        {
          title: 'Keep',
          destroyOnClose: false,
          destroyOnHidden: false,
          formComp: ResetForm as never,
          triggerProps: { children: 'Open' },
        },
        ref,
      ),
    );
    await act(async () => {
      ref.current?.show();
    });
    await waitFor(() => expect(bodyHasText('Keep')).toBe(true));
    await waitFor(() => expect(resetFieldsSpy).toBeDefined());
    // close (DOM retained because destroyOnHidden=false), then reopen -> open flips
    // false->true and form exists -> resetFields runs
    const cancelBtn = await waitFor(() => {
      const btn = findCancelButton();
      expect(btn).toBeTruthy();
      return btn!;
    });
    await act(async () => {
      fireEvent.click(cancelBtn);
    });
    // Wait for the close state to commit before reopening (wrap stays in DOM,
    // so assert on the hidden style instead of body text).
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });
    await act(async () => {
      ref.current?.show();
    });
    await waitFor(() => expect(bodyHasText('Keep')).toBe(true));
    await waitFor(() => expect(resetFieldsSpy).toHaveBeenCalled());
  });

  it('registers open listener and supports setOpen from formComp', async () => {
    const ref = { current: null as ModalActionRef<unknown, SimpleFormData> | null };
    renderInBrowser(
      makeModalAction({ title: 'Listen', formComp: ListenerForm as never, triggerProps: { children: 'Open' } }, ref),
    );
    await act(async () => {
      ref.current?.show();
    });
    await waitFor(() => expect(bodyHasText('Listen')).toBe(true));
    await waitFor(() => expect(receivedOpens.length).toBeGreaterThan(0));
    expect(receivedOpens[0]).toBe(true);
  });

  it('ModalAction.Button static trigger opens on click', async () => {
    const ref = { current: null as ModalActionRef<unknown, SimpleFormData> | null };
    renderStaticTrigger(ModalAction.Button, { title: 'Btn', formComp: SimpleForm, children: 'Open Btn' }, ref);
    const trigger = await waitFor(() => {
      const btn = Array.from(document.body.querySelectorAll('button')).find((b) => b.textContent === 'Open Btn');
      expect(btn).toBeTruthy();
      return btn as HTMLButtonElement;
    });
    await act(async () => {
      fireEvent.click(trigger);
    });
    await waitFor(() => expect(bodyHasText('Btn')).toBe(true));
  });

  it('ModalAction.Switch static trigger opens on change', async () => {
    const ref = { current: null as ModalActionRef<unknown, SimpleFormData> | null };
    renderStaticTrigger(ModalAction.Switch, { title: 'Switch', formComp: SimpleForm }, ref);
    const sw = await waitFor(() => {
      const el = document.body.querySelector('.ant-switch');
      expect(el).toBeTruthy();
      return el as HTMLElement;
    });
    await act(async () => {
      fireEvent.click(sw);
    });
    await waitFor(() => expect(bodyHasText('Switch')).toBe(true));
  });

  it('ModalAction.Link static trigger opens on click', async () => {
    const ref = { current: null as ModalActionRef<unknown, SimpleFormData> | null };
    renderStaticTrigger(ModalAction.Link, { title: 'Link', formComp: SimpleForm, children: 'Open Link' }, ref);
    const trigger = await waitFor(() => {
      const a = Array.from(document.body.querySelectorAll('a')).find((x) => x.textContent === 'Open Link');
      expect(a).toBeTruthy();
      return a as HTMLAnchorElement;
    });
    await act(async () => {
      fireEvent.click(trigger);
    });
    await waitFor(() => expect(bodyHasText('Link')).toBe(true));
  });

  it('withModalAction HOC renders and opens', async () => {
    const WrappedSave = withModalAction(
      SaveForm as never,
      { title: 'Wrapped Title', triggerProps: { children: 'Open Wrapped' } } as never,
    );
    const ref = { current: null as ModalActionRef<unknown, SimpleFormData> | null };
    renderInBrowser(createElement(WrappedSave as never, { ref } as never));
    const trigger = await waitFor(() => {
      const btn = Array.from(document.body.querySelectorAll('button')).find((b) => b.textContent === 'Open Wrapped');
      expect(btn).toBeTruthy();
      return btn as HTMLButtonElement;
    });
    await act(async () => {
      fireEvent.click(trigger);
    });
    await waitFor(() => expect(bodyHasText('Wrapped Title')).toBe(true));
  });

  it('withModalAction merges global defaults from ConfigProvider', async () => {
    const WrappedSave = withModalAction(SaveForm as never, { triggerProps: { children: 'Open Global' } } as never);
    const ref = { current: null as ModalActionRef<unknown, SimpleFormData> | null };
    render(createElement(WrappedSave as never, { ref } as never), {
      wrapper: BrowserTestWrapperWithGlobalDefaults,
    });
    const trigger = await waitFor(() => {
      const btn = Array.from(document.body.querySelectorAll('button')).find((b) => b.textContent === 'Open Global');
      expect(btn).toBeTruthy();
      return btn as HTMLButtonElement;
    });
    await act(async () => {
      fireEvent.click(trigger);
    });
    await waitFor(() => expect(bodyHasText('Global Title')).toBe(true));
  });

  it('withModalAction supports function defaultProps', async () => {
    const WrappedSave = withModalAction(
      SaveForm as never,
      (() => ({ title: 'Func Title', triggerProps: { children: 'Open Func', style: { opacity: 1 } } })) as never,
    );
    const ref = { current: null as ModalActionRef<unknown, SimpleFormData> | null };
    renderInBrowser(createElement(WrappedSave as never, { ref } as never));
    const trigger = await waitFor(() => {
      const btn = Array.from(document.body.querySelectorAll('button')).find((b) => b.textContent === 'Open Func');
      expect(btn).toBeTruthy();
      return btn as HTMLButtonElement;
    });
    await act(async () => {
      fireEvent.click(trigger);
    });
    await waitFor(() => expect(bodyHasText('Func Title')).toBe(true));
  });

  it('withDefaultModalActionProps supports function defaultProps', async () => {
    const FuncDefault = withDefaultModalActionProps(
      ModalAction as never,
      (() => ({ title: 'Func Default', triggerProps: { children: 'Open FuncDefault' } })) as never,
    );
    const ref = { current: null as ModalActionRef<unknown, SimpleFormData> | null };
    renderInBrowser(createElement(FuncDefault as never, { ref, formComp: SimpleForm } as never));
    const trigger = await waitFor(() => {
      const btn = Array.from(document.body.querySelectorAll('button')).find(
        (b) => b.textContent === 'Open FuncDefault',
      );
      expect(btn).toBeTruthy();
      return btn as HTMLButtonElement;
    });
    await act(async () => {
      fireEvent.click(trigger);
    });
    await waitFor(() => expect(bodyHasText('Func Default')).toBe(true));
  });
});
