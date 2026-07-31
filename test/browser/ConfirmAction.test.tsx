import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ComponentType, ReactElement } from 'react';
import ConfirmAction from '../../src/components/ConfirmAction/index';
import withConfirmAction from '../../src/components/ConfirmAction/withConfirmAction';
import type { ConfirmActionRef } from '../../src/components/ConfirmAction/index';
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

describe('ConfirmAction (browser, real AntD)', () => {
  it('opens confirm modal via ref.show() and renders title/content in portal', async () => {
    const ref = { current: null as ConfirmActionRef | null };
    renderInBrowser(<ConfirmAction ref={ref as never} title="Delete this?" content="Sure?" />);
    act(() => {
      ref.current?.show();
    });
    await waitFor(() => expect(bodyHasText('Delete this?')).toBe(true));
    expect(bodyHasText('Sure?')).toBe(true);
  });

  it('opens via trigger Button click', async () => {
    const onOk = vi.fn();
    renderInBrowser(<ConfirmAction.Button title="Hi" content="Body" onOk={onOk}>Open</ConfirmAction.Button>);
    fireEvent.click(screen.getByText('Open'));
    await waitFor(() => expect(bodyHasText('Hi')).toBe(true));
  });

  it('applies danger mode styling (primary + danger button)', async () => {
    const ref = { current: null as ConfirmActionRef | null };
    renderInBrowser(<ConfirmAction ref={ref as never} title="Danger" content="x" danger />);
    act(() => {
      ref.current?.show();
    });
    await waitFor(() => expect(bodyHasText('Danger')).toBe(true));
    const okBtn = document.body.querySelector('.ant-btn-primary.ant-btn-dangerous') as HTMLButtonElement | null;
    expect(okBtn).not.toBeNull();
  });

  it('uses warning color class for type=confirm default title', async () => {
    const ref = { current: null as ConfirmActionRef | null };
    renderInBrowser(<ConfirmAction ref={ref as never} title="Warn title" content="x" type="confirm" />);
    act(() => {
      ref.current?.show();
    });
    await waitFor(() => {
      const titleEl = document.body.querySelector('.easy-confirm-root-color-warning');
      expect(titleEl).not.toBeNull();
    });
  });

  it('uses warning modal for type=warn', async () => {
    const ref = { current: null as ConfirmActionRef | null };
    renderInBrowser(<ConfirmAction ref={ref as never} title="Warn type" content="x" type="warn" />);
    act(() => {
      ref.current?.show();
    });
    await waitFor(() => expect(bodyHasText('Warn type')).toBe(true));
  });

  it('respects explicit titleColor override (renders Typography.Text)', async () => {
    const ref = { current: null as ConfirmActionRef | null };
    renderInBrowser(<ConfirmAction ref={ref as never} title="Colored" content="x" titleColor="primary" />);
    act(() => {
      ref.current?.show();
    });
    await waitFor(() => {
      const colored = document.body.querySelector('.ant-typography') as HTMLElement | null;
      expect(colored).not.toBeNull();
    });
  });

  it('blocks opening when onBeforeOpen throws', async () => {
    const onOk = vi.fn();
    const onBeforeOpen = vi.fn().mockRejectedValue(new Error('blocked'));
    renderInBrowser(
      <ConfirmAction.Button title="No open" content="x" onOk={onOk} onBeforeOpen={onBeforeOpen}>
        Trigger
      </ConfirmAction.Button>,
    );
    fireEvent.click(screen.getByText('Trigger'));
    await waitFor(() => expect(onBeforeOpen).toHaveBeenCalled());
    expect(bodyHasText('No open')).toBe(false);
    expect(onOk).not.toHaveBeenCalled();
  });

  it('calls onOk then afterOk on confirm', async () => {
    const onOk = vi.fn().mockResolvedValue('result');
    const afterOk = vi.fn();
    const ref = { current: null as ConfirmActionRef | null };
    renderInBrowser(<ConfirmAction ref={ref as never} title="Confirm me" content="x" onOk={onOk} afterOk={afterOk} />);
    act(() => {
      ref.current?.show();
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
    await waitFor(() => expect(afterOk).toHaveBeenCalledWith('result'));
  });

  it('shows loading state during async onOk and closes after', async () => {
    let resolveOnOk: (v: unknown) => void = () => {};
    const onOk = vi.fn().mockImplementation(
      () => new Promise((res) => {
        resolveOnOk = res;
      }),
    );
    const ref = { current: null as ConfirmActionRef | null };
    renderInBrowser(<ConfirmAction ref={ref as never} title="Async" content="x" onOk={onOk} />);
    act(() => {
      ref.current?.show();
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
    await waitFor(() => {
      expect(document.body.querySelector('.ant-modal-confirm')).toBeNull();
    });
  });

  it('does not call afterOk when onOk rejects', async () => {
    // AntD Modal catches the rejection internally, but Vitest's promise tracker
    // detects the rejection before AntD's catch runs. Suppress it here.
    const handler = (event: PromiseRejectionEvent) => {
      if (event.reason?.message === 'fail') {
        event.preventDefault();
      }
    };
    window.addEventListener('unhandledrejection', handler);
    const onOk = vi.fn().mockRejectedValue(new Error('fail'));
    const afterOk = vi.fn();
    const ref = { current: null as ConfirmActionRef | null };
    renderInBrowser(<ConfirmAction ref={ref as never} title="Fail" content="x" onOk={onOk} afterOk={afterOk} />);
    act(() => {
      ref.current?.show();
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
    await waitFor(() => expect(afterOk).not.toHaveBeenCalled());
    window.removeEventListener('unhandledrejection', handler);
  });

  it('withConfirmAction HOC renders without throwing and exposes trigger', async () => {
    const Dummy = vi.fn(() => <button type="button">dummy</button>);
    const Wrapped = withConfirmAction(Dummy as never, { title: 'HOC', content: 'x' }) as unknown as ComponentType<{
      ref?: unknown;
    }>;
    const ref = { current: null as ConfirmActionRef | null };
    renderInBrowser(<Wrapped ref={ref as never} />);
    expect(screen.getByText('dummy')).toBeTruthy();
  });
});
