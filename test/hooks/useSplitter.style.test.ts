import { describe, expect, it, vi } from 'vitest';

describe('useSplitter style hook', () => {
  it('registers splitter styles and generates directional/state styles', async () => {
    vi.resetModules();
    let capturedPrefix = '';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let capturedStyleFn: ((token: any, info: any) => Record<string, any>) | undefined;
    const returnedHook = vi.fn(() => ({
      wrapCSSVar: (node: unknown) => node,
      hashId: 'hash',
      cssVarCls: 'css-var',
    }));

    vi.doMock('../../src/utils/internal', () => ({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      genStyleHooksCompitible: vi.fn((prefix: string, styleFn: (token: any, info: any) => Record<string, any>) => {
        capturedPrefix = prefix;
        capturedStyleFn = styleFn;
        return returnedHook;
      }),
    }));

    const module = await import('../../src/hooks/style/useSplitter');

    expect(module.default).toBe(returnedHook);
    expect(capturedPrefix).toBe('EasySplitter');

    const styles = capturedStyleFn?.(
      {
        componentCls: '.easy-splitter',
        EasySplitter: { splitterDefaultWidth: 3 },
        colorPrimaryActive: 'red',
        colorPrimaryHover: 'blue',
        colorBorder: 'gray',
      },
      {},
    );

    expect(styles?.['.easy-splitter'].flex).toBe('none');
    expect(styles?.['.easy-splitter']['&.easy-splitter-vertical'].cursor).toBe('col-resize');
    expect(styles?.['.easy-splitter']['&.easy-splitter-vertical']['.easy-splitter-handle'].width).toBe(
      'var(--splitter-width, 3px)',
    );
    expect(styles?.['.easy-splitter']['&.easy-splitter-horizontal'].cursor).toBe('row-resize');
    expect(styles?.['.easy-splitter']['&.easy-splitter-horizontal']['.easy-splitter-handle'].height).toBe(
      'var(--splitter-width, 3px)',
    );
    expect(styles?.['.easy-splitter']['&:hover']['.easy-splitter-handle'].background).toBe('red');
    expect(styles?.['.easy-splitter']['&.easy-splitter-dragging']['.easy-splitter-handle'].background).toBe('blue');
    expect(styles?.['.easy-splitter']['&.easy-splitter-hover']['.easy-splitter-handle'].background).toBe('red');
    expect(styles?.['.easy-splitter']['.easy-splitter-handle'].background).toBe('gray');
  });

  it('falls back to default splitter width when no component token is provided', async () => {
    vi.resetModules();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let capturedStyleFn: ((token: any, info: any) => Record<string, any>) | undefined;

    vi.doMock('../../src/utils/internal', () => ({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      genStyleHooksCompitible: vi.fn((_prefix: string, styleFn: (token: any, info: any) => Record<string, any>) => {
        capturedStyleFn = styleFn;
        return vi.fn();
      }),
    }));

    await import('../../src/hooks/style/useSplitter');

    const styles = capturedStyleFn?.(
      {
        componentCls: '.easy-splitter',
        colorPrimaryActive: 'red',
        colorPrimaryHover: 'blue',
        colorBorder: 'gray',
      },
      {},
    );

    expect(styles?.['.easy-splitter']['&.easy-splitter-vertical']['.easy-splitter-handle'].width).toBe(
      'var(--splitter-width, 1px)',
    );
  });
});
