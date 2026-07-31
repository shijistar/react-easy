import type { ComponentType, ReactElement } from 'react';
import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Form, type FormInstance } from 'antd';
import ModalAction, { SubmitWithoutClosingSymbol } from '../../src/components/ModalAction/index';
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
