import type { ComponentType, PropsWithChildren, ReactNode } from 'react';
import { createRef, forwardRef, useEffect } from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type * as AntdModule from 'antd';
import { Button } from 'antd';
import ReactEasyContext from '../../src/components/ConfigProvider/context';
import ConfirmAction, {
  type ActionCompConstraint,
  type ConfirmActionRef,
  genRenderer,
  withDefaultConfirmActionProps,
} from '../../src/components/ConfirmAction';
import withConfirmAction, { withConfirmActionInternal } from '../../src/components/ConfirmAction/withConfirmAction';

// coloredText wraps string titles into <Typography.Text type="warning"> when
// no explicit titleColor is given (type defaults to 'confirm'). Extract the
// underlying text for assertion.
const textOf = (node: unknown): unknown => {
  if (node && typeof node === 'object' && 'props' in (node as { props?: object })) {
    const props = (node as { props?: { children?: unknown } }).props;
    return props?.children ?? node;
  }
  return node;
};

// --- hoisted stores for antd imperative Modal API ---
const modalStore = vi.hoisted(() => {
  const store: {
    calls: Record<string, unknown>[];
    updateCalls: Record<string, unknown>[];
    destroyCalls: number;
  } = { calls: [], updateCalls: [], destroyCalls: 0 };
  const makeApi = () => ({
    update: vi.fn((patch: Record<string, unknown>) => {
      store.updateCalls.push(patch);
    }),
    destroy: vi.fn(() => {
      store.destroyCalls += 1;
    }),
    then: undefined,
  });
  return {
    store,
    confirm: vi.fn((config: Record<string, unknown>) => {
      store.calls.push(config);
      return makeApi();
    }),
    warning: vi.fn((config: Record<string, unknown>) => {
      store.calls.push(config);
      return makeApi();
    }),
    error: vi.fn((config: Record<string, unknown>) => {
      store.calls.push(config);
      return makeApi();
    }),
    info: vi.fn((config: Record<string, unknown>) => {
      store.calls.push(config);
      return makeApi();
    }),
    success: vi.fn((config: Record<string, unknown>) => {
      store.calls.push(config);
      return makeApi();
    }),
  };
});

const appStore = vi.hoisted(() => ({
  // Default: no `modal.confirm` on the App instance -> ConfirmAction falls back to Modal.
  value: { modal: { confirm: undefined } as unknown },
}));

vi.mock('antd', async (importOriginal) => {
  const antd = await importOriginal<typeof AntdModule>();
  return {
    ...antd,
    App: {
      ...antd.App,
      useApp: () => appStore.value,
    },
    Modal: {
      ...antd.Modal,
      confirm: modalStore.confirm,
      warning: modalStore.warning,
      error: modalStore.error,
      info: modalStore.info,
      success: modalStore.success,
    },
  };
});

// --- test wrapper with ReactEasyContext defaults ---
const createWrapper = (contextOverrides: Record<string, unknown> = {}) => {
  const Wrapper = ({ children }: PropsWithChildren) => (
    <ReactEasyContext.Provider
      value={
        {
          ...contextOverrides,
        } as never
      }
    >
      {children}
    </ReactEasyContext.Provider>
  );
  Wrapper.displayName = 'ConfirmActionTestWrapper';
  return Wrapper;
};

beforeEach(() => {
  modalStore.store.calls.length = 0;
  modalStore.store.updateCalls.length = 0;
  modalStore.store.destroyCalls = 0;
  modalStore.confirm.mockClear();
  modalStore.warning.mockClear();
  modalStore.error.mockClear();
  modalStore.info.mockClear();
  modalStore.success.mockClear();
  appStore.value = { modal: { confirm: undefined } };
});

describe('ConfirmAction', () => {
  it('renders a Button trigger with children by default', () => {
    const { container } = render(
      <ConfirmAction>
        <span>Open</span>
      </ConfirmAction>,
      { wrapper: createWrapper() },
    );
    const btn = container.querySelector('button');
    expect(btn).toBeTruthy();
    expect(btn?.textContent).toContain('Open');
  });

  it('opens the confirm modal on trigger click with merged props', async () => {
    const { container } = render(
      <ConfirmAction title="Delete?" content="Are you sure?" okText="Yes">
        <span>Go</span>
      </ConfirmAction>,
      { wrapper: createWrapper() },
    );
    fireEvent.click(container.querySelector('button')!);
    await waitFor(() => expect(modalStore.confirm).toHaveBeenCalledTimes(1));
    const config = modalStore.store.calls[0];
    expect(textOf(config.title)).toBe('Delete?');
    expect(textOf(config.content)).toBe('Are you sure?');
    expect(config.okText).toBe('Yes');
    expect(config.autoFocusButton).toBeNull();
    expect(config.closable).toBe(true);
  });

  it('merges focusable config over the default autoFocusButton null', async () => {
    const { container } = render(
      <ConfirmAction focusable={{ autoFocusButton: 'ok' }} title="F">
        <span>Go</span>
      </ConfirmAction>,
      { wrapper: createWrapper() },
    );
    fireEvent.click(container.querySelector('button')!);
    await waitFor(() => expect(modalStore.confirm).toHaveBeenCalledTimes(1));
    const config = modalStore.store.calls[0];
    expect(config.focusable).toEqual({ autoFocusButton: 'ok' });
  });

  it('uses default title/content from ReactEasyContext when props omit them', async () => {
    const { container } = render(
      <ConfirmAction>
        <span>Go</span>
      </ConfirmAction>,
      {
        wrapper: createWrapper({
          defaultConfirmTitle: '默认标题',
          defaultConfirmContent: '默认内容',
        }),
      },
    );
    fireEvent.click(container.querySelector('button')!);
    await waitFor(() => expect(modalStore.confirm).toHaveBeenCalledTimes(1));
    expect(textOf(modalStore.store.calls[0].title)).toBe('默认标题');
    expect(textOf(modalStore.store.calls[0].content)).toBe('默认内容');
  });

  it('merges global context defaults under props', async () => {
    const { container } = render(
      <ConfirmAction title="FromProps">
        <span>Go</span>
      </ConfirmAction>,
      {
        wrapper: createWrapper({
          ConfirmAction: { title: 'FromContext', okText: 'CtxOk' },
        }),
      },
    );
    fireEvent.click(container.querySelector('button')!);
    await waitFor(() => expect(modalStore.confirm).toHaveBeenCalledTimes(1));
    const config = modalStore.store.calls[0];
    expect(textOf(config.title)).toBe('FromProps');
    expect(config.okText).toBe('CtxOk');
  });

  it('applies danger mode to okButtonProps and title fallback color', async () => {
    const { container } = render(
      <ConfirmAction danger title="Danger">
        <span>Go</span>
      </ConfirmAction>,
      { wrapper: createWrapper() },
    );
    fireEvent.click(container.querySelector('button')!);
    await waitFor(() => expect(modalStore.confirm).toHaveBeenCalledTimes(1));
    const config = modalStore.store.calls[0];
    expect(config.okButtonProps).toMatchObject({ type: 'primary', danger: true });
    expect(String(config.rootClassName)).toContain('easy-confirm-root-color-danger');
  });

  it('maps type="warn" to modal.warning', async () => {
    const { container } = render(
      <ConfirmAction type="warn" title="Warn">
        <span>Go</span>
      </ConfirmAction>,
      { wrapper: createWrapper() },
    );
    fireEvent.click(container.querySelector('button')!);
    await waitFor(() => expect(modalStore.warning).toHaveBeenCalledTimes(1));
    expect(modalStore.confirm).not.toHaveBeenCalled();
  });

  it('maps type="error" to modal.error', async () => {
    const { container } = render(
      <ConfirmAction type="error" title="Err">
        <span>Go</span>
      </ConfirmAction>,
      { wrapper: createWrapper() },
    );
    fireEvent.click(container.querySelector('button')!);
    await waitFor(() => expect(modalStore.error).toHaveBeenCalledTimes(1));
  });

  it('uses App.useApp().modal when it exposes confirm', async () => {
    const appModalConfirm = vi.fn(() => ({
      update: vi.fn(),
      destroy: vi.fn(),
    }));
    appStore.value = { modal: { confirm: appModalConfirm } };
    const { container } = render(
      <ConfirmAction title="ViaApp">
        <span>Go</span>
      </ConfirmAction>,
      { wrapper: createWrapper() },
    );
    fireEvent.click(container.querySelector('button')!);
    await waitFor(() => expect(appModalConfirm).toHaveBeenCalledTimes(1));
    expect(modalStore.confirm).not.toHaveBeenCalled();
  });

  it('calls onBeforeOpen and passes its result to onOk', async () => {
    const onBeforeOpen = vi.fn(async () => ({ payload: 42 }));
    const onOk = vi.fn(async () => 'saved');
    const afterOk = vi.fn();
    const { container } = render(
      <ConfirmAction onBeforeOpen={onBeforeOpen} onOk={onOk} afterOk={afterOk} title="T">
        <span>Go</span>
      </ConfirmAction>,
      { wrapper: createWrapper() },
    );
    fireEvent.click(container.querySelector('button')!);
    await waitFor(() => expect(modalStore.confirm).toHaveBeenCalledTimes(1));
    const config = modalStore.store.calls[0];
    const onOkCb = config.onOk as () => Promise<unknown>;
    await act(async () => {
      await onOkCb();
    });
    // onOk receives trigger event args first, then the extra beforeOpenResult payload.
    expect(onOk).toHaveBeenCalledWith(expect.anything(), { beforeOpenResult: { payload: 42 } });
    expect(afterOk).toHaveBeenCalledWith('saved');
  });

  it('does not open the modal when onBeforeOpen throws', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const onBeforeOpen = vi.fn(async () => {
      throw new Error('blocked');
    });
    const { container } = render(
      <ConfirmAction onBeforeOpen={onBeforeOpen} title="T">
        <span>Go</span>
      </ConfirmAction>,
      { wrapper: createWrapper() },
    );
    await act(async () => {
      fireEvent.click(container.querySelector('button')!);
    });
    await new Promise((r) => setTimeout(r, 0));
    expect(modalStore.confirm).not.toHaveBeenCalled();
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it('toggles loading and disables buttons while onOk is pending', async () => {
    let resolveOk!: (v: string) => void;
    const onOk = vi.fn(() => new Promise<string>((resolve) => (resolveOk = resolve)));
    const { container } = render(
      <ConfirmAction onOk={onOk} title="T">
        <span>Go</span>
      </ConfirmAction>,
      { wrapper: createWrapper() },
    );
    fireEvent.click(container.querySelector('button')!);
    await waitFor(() => expect(modalStore.confirm).toHaveBeenCalledTimes(1));
    const config = modalStore.store.calls[0];
    const onOkCb = config.onOk as () => Promise<unknown>;
    let pending!: Promise<unknown>;
    act(() => {
      pending = onOkCb();
    });
    await waitFor(() => expect(modalStore.store.updateCalls.length).toBeGreaterThan(0));
    expect(modalStore.store.updateCalls[0]).toMatchObject({
      closable: false,
      okButtonProps: { loading: true },
      cancelButtonProps: { disabled: true },
    });
    await act(async () => {
      resolveOk('done');
      await pending;
    });
    expect(modalStore.store.updateCalls[1]).toMatchObject({
      closable: true,
      okButtonProps: { loading: false },
      cancelButtonProps: { disabled: false },
    });
  });

  it('skips afterOk when onOk throws and still restores loading state', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const onOk = vi.fn(async () => {
      throw new Error('boom');
    });
    const afterOk = vi.fn();
    const { container } = render(
      <ConfirmAction onOk={onOk} afterOk={afterOk} title="T">
        <span>Go</span>
      </ConfirmAction>,
      { wrapper: createWrapper() },
    );
    fireEvent.click(container.querySelector('button')!);
    await waitFor(() => expect(modalStore.confirm).toHaveBeenCalledTimes(1));
    const config = modalStore.store.calls[0];
    const onOkCb = config.onOk as () => Promise<unknown>;
    // The internal onOk wrapper has try/finally without catch (index.tsx L271-305),
    // so the rejection propagates to the caller after the finally restores loading.
    await act(async () => {
      await expect(onOkCb()).rejects.toThrow('boom');
    });
    expect(afterOk).not.toHaveBeenCalled();
    expect(modalStore.store.updateCalls.at(-1)).toMatchObject({ okButtonProps: { loading: false } });
    consoleError.mockRestore();
  });

  it('forwards trigger event args and api to triggerProps event handler', async () => {
    const triggerOnClick = vi.fn();
    const { container } = render(
      <ConfirmAction
        triggerComponent={Button}
        triggerEvent="onClick"
        triggerProps={{ onClick: triggerOnClick, children: 'Ctx' } as never}
        title="T"
      >
        <span>Go</span>
      </ConfirmAction>,
      { wrapper: createWrapper() },
    );
    fireEvent.click(container.querySelector('button')!);
    await waitFor(() => expect(modalStore.confirm).toHaveBeenCalledTimes(1));
    expect(triggerOnClick).toHaveBeenCalled();
    const args = triggerOnClick.mock.calls[0];
    expect(args.at(-1)).toHaveProperty('api');
  });

  it('exposes show() via ref which opens the modal', async () => {
    const ref = createRef<ConfirmActionRef>();
    render(
      <ConfirmAction ref={ref} title="ViaRef">
        <span>Go</span>
      </ConfirmAction>,
      { wrapper: createWrapper() },
    );
    await act(async () => {
      ref.current?.show();
    });
    await waitFor(() => expect(modalStore.confirm).toHaveBeenCalledTimes(1));
  });

  it('renders a Switch trigger when triggerComponent is Switch', async () => {
    const { container } = render(
      <ConfirmAction.Switch title="SwitchCfm">
        <span>SwitchLabel</span>
      </ConfirmAction.Switch>,
      { wrapper: createWrapper() },
    );
    const switchInput = container.querySelector('button[role="switch"]');
    expect(switchInput).toBeTruthy();
  });

  it('renders a Link trigger for ConfirmAction.Link', () => {
    const { container } = render(<ConfirmAction.Link title="LinkCfm">LinkLabel</ConfirmAction.Link>, {
      wrapper: createWrapper(),
    });
    expect(container.querySelector('a')?.textContent).toContain('LinkLabel');
  });

  it('opens via Switch onChange event', async () => {
    const { container } = render(
      <ConfirmAction.Switch title="SwitchOpen" danger>
        <span>Switch</span>
      </ConfirmAction.Switch>,
      { wrapper: createWrapper() },
    );
    const switchBtn = container.querySelector('button[role="switch"]')!;
    fireEvent.click(switchBtn);
    await waitFor(() => expect(modalStore.confirm).toHaveBeenCalledTimes(1));
    expect(modalStore.store.calls[0].okButtonProps).toMatchObject({ type: 'primary', danger: true });
  });

  it('merges object defaults in withDefaultConfirmActionProps (props win for scalars)', () => {
    const Composed = withDefaultConfirmActionProps(
      (props: { title?: string; okText?: string; triggerProps?: { children?: ReactNode } }) => {
        return <div data-title={props.title} data-oktext={props.okText} />;
      },
      { title: 'DefaultTitle', okText: 'DefaultOk' },
    );
    const { container } = render(<Composed title="Explicit" />, { wrapper: createWrapper() });
    expect(container.querySelector('div')?.getAttribute('data-title')).toBe('Explicit');
    expect(container.querySelector('div')?.getAttribute('data-oktext')).toBe('DefaultOk');
  });

  it('supports function defaults in withDefaultConfirmActionProps', () => {
    const Composed = withDefaultConfirmActionProps(
      (props: { title?: string; okText?: string }) => {
        return <div data-title={props.title} data-oktext={props.okText} />;
      },
      (actualProps: { title?: string }) => ({ title: actualProps.title ?? 'FuncDefault' }),
    );
    const { container } = render(<Composed />, { wrapper: createWrapper() });
    expect(container.querySelector('div')?.getAttribute('data-title')).toBe('FuncDefault');
  });

  it('uses delete defaults for confirmType=delete via genRenderer', async () => {
    const DeleteConfirm = genRenderer({ confirmType: 'delete' });
    const { container } = render(
      <DeleteConfirm title="Delete?" content="Really?">
        <span>Delete</span>
      </DeleteConfirm>,
      {
        wrapper: createWrapper({
          DeletionConfirmAction: { okText: 'DeleteOk' },
        }),
      },
    );
    fireEvent.click(container.querySelector('button')!);
    await waitFor(() => expect(modalStore.confirm).toHaveBeenCalledTimes(1));
    expect(modalStore.store.calls[0].okText).toBe('DeleteOk');
  });

  it('applies primary titleColor via coloredText', async () => {
    const { container } = render(
      <ConfirmAction titleColor="primary" title="PrimaryTitle">
        <span>Go</span>
      </ConfirmAction>,
      { wrapper: createWrapper() },
    );
    fireEvent.click(container.querySelector('button')!);
    await waitFor(() => expect(modalStore.confirm).toHaveBeenCalledTimes(1));
    const title = modalStore.store.calls[0].title as { props?: { style?: { color?: string }; children?: unknown } };
    expect(title.props?.style).toHaveProperty('color');
    expect(title.props?.children).toBe('PrimaryTitle');
  });

  it('merges triggerProps.style from global context defaults', async () => {
    const { container } = render(
      <ConfirmAction title="T">
        <span>Go</span>
      </ConfirmAction>,
      {
        wrapper: createWrapper({
          ConfirmAction: { triggerProps: { style: { color: 'red' } } },
        }),
      },
    );
    const btn = container.querySelector('button') as HTMLElement;
    expect(btn.style.color).toBe('red');
  });

  it('calls onOk with empty trigger args when opened via ref.show()', async () => {
    const onOk = vi.fn(async () => 'ok');
    const ref = createRef<ConfirmActionRef>();
    render(
      <ConfirmAction ref={ref} onOk={onOk} title="T">
        <span>Go</span>
      </ConfirmAction>,
      { wrapper: createWrapper() },
    );
    await act(async () => {
      ref.current?.show();
    });
    await waitFor(() => expect(modalStore.confirm).toHaveBeenCalledTimes(1));
    const config = modalStore.store.calls[0];
    const onOkCb = config.onOk as () => Promise<unknown>;
    await act(async () => {
      await onOkCb();
    });
    // No trigger event args were captured: triggerEventArgsRef is undefined, so
    // the `?? []` fallback is exercised and onOk receives only the extra payload.
    expect(onOk).toHaveBeenCalledWith({ beforeOpenResult: undefined });
  });

  it('does not bind trigger event when triggerEvent is falsy', async () => {
    // The generic Event is inferred as never on the base ConfirmAction, so cast
    // to a concrete shape to pass a falsy triggerEvent at runtime.
    const FalsyEventConfirm = ConfirmAction as unknown as ComponentType<{
      triggerEvent?: null;
      title?: string;
      children?: ReactNode;
    }>;
    const { container } = render(
      <FalsyEventConfirm triggerEvent={null} title="T">
        <span>Go</span>
      </FalsyEventConfirm>,
      { wrapper: createWrapper() },
    );
    fireEvent.click(container.querySelector('button')!);
    await new Promise((r) => setTimeout(r, 20));
    expect(modalStore.confirm).not.toHaveBeenCalled();
  });

  it('warns when ReactEasyContext is missing', () => {
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(
      <ConfirmAction title="NoCtx">
        <span>Go</span>
      </ConfirmAction>,
    );
    expect(consoleWarn).toHaveBeenCalledWith(expect.stringContaining('ConfigProvider should be wrapped'));
    consoleWarn.mockRestore();
  });
});

describe('withConfirmAction', () => {
  interface CustomActionProps {
    triggerDom: ReactNode;
    setOK: (handler: (...args: unknown[]) => unknown) => void;
    label?: string;
  }
  const CustomAction = forwardRef<Record<string, unknown>, CustomActionProps>((props, ref) => {
    return (
      <div data-label={props.label}>
        {props.triggerDom}
        <span data-testid="custom-action" ref={ref as never}>
          custom
        </span>
      </div>
    );
  });
  CustomAction.displayName = 'CustomAction';

  it('renders action component with triggerDom and opens via setOK-registered handler', async () => {
    const handler = vi.fn(async () => 'handled');
    const RegisteringAction = forwardRef<Record<string, unknown>, CustomActionProps>((props, ref) => {
      useEffect(() => {
        props.setOK(handler);
      }, [props]);
      return (
        <div data-label={props.label}>
          {props.triggerDom}
          <span ref={ref as never}>custom</span>
        </div>
      );
    });
    RegisteringAction.displayName = 'RegisteringAction';
    const Wrapped = withConfirmAction<
      CustomActionProps & ActionCompConstraint,
      Record<string, unknown>,
      'onClick',
      Record<string, unknown>
    >(RegisteringAction as never, { label: 'CustomLabel' } as never);
    const { container } = render(
      <Wrapped label="Override">
        <span>Go</span>
      </Wrapped>,
      { wrapper: createWrapper() },
    );
    const innerBtn = container.querySelector('button');
    expect(innerBtn).toBeTruthy();
    fireEvent.click(innerBtn!);
    await waitFor(() => expect(modalStore.confirm).toHaveBeenCalledTimes(1));
    const config = modalStore.store.calls[0];
    const onOkCb = config.onOk as () => Promise<unknown>;
    await act(async () => {
      await onOkCb();
    });
    expect(handler).toHaveBeenCalled();
  });

  it('supports function defaults in withConfirmAction', () => {
    const Wrapped = withConfirmAction(CustomAction, ((actualProps: { label?: string }) => ({
      label: actualProps.label ?? 'FuncLabel',
    })) as never);
    const { container } = render(
      <Wrapped>
        <span>Go</span>
      </Wrapped>,
      { wrapper: createWrapper() },
    );
    expect(container.querySelector('div')?.getAttribute('data-label')).toBe('FuncLabel');
  });

  it('executes useImperativeHandle factory when ref is accessed', () => {
    const ref = createRef<ConfirmActionRef>();
    const Wrapped = withConfirmAction(CustomAction, { label: 'RefLabel' } as never);
    render(
      <Wrapped ref={ref as never}>
        <span>Go</span>
      </Wrapped>,
      { wrapper: createWrapper() },
    );
    act(() => {
      void ref.current;
    });
    // The factory runs and merges actionRef.current + customRef (customRef stays
    // null because isForwardRef is false in this environment).
    expect(ref.current).toBeTruthy();
  });

  it('exposes internal withConfirmActionInternal with delete defaults', () => {
    const Wrapped = withConfirmActionInternal(CustomAction, { confirmType: 'delete' }, { title: 'DelTitle' } as never);
    expect(Wrapped).toBeTruthy();
    const { container } = render(
      <Wrapped>
        <span>Go</span>
      </Wrapped>,
      { wrapper: createWrapper() },
    );
    expect(container.querySelector('button')).toBeTruthy();
  });
});

describe('ConfirmAction static typed triggers', () => {
  it('exposes Button/Switch/Link statics', () => {
    expect(ConfirmAction.Button).toBeTruthy();
    expect(ConfirmAction.Switch).toBeTruthy();
    expect(ConfirmAction.Link).toBeTruthy();
  });

  it('renders Typography.Link content for Link trigger', () => {
    const { container } = render(<ConfirmAction.Link title="T">LinkGo</ConfirmAction.Link>, {
      wrapper: createWrapper(),
    });
    const link = container.querySelector('a');
    expect(link?.textContent).toBe('LinkGo');
  });
});
