import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import useRowSelection from '../../src/hooks/useRowSelection';

describe('useRowSelection', () => {
  it('returns undefined when checkable is false', () => {
    const { result } = renderHook(() => useRowSelection({ checkable: false }));

    expect(result.current).toBeUndefined();
  });

  it('supports custom function rowKey and keeps cross-page cache', () => {
    const onChange = vi.fn();
    const rowA = { code: 'a', name: 'A' };
    const rowB = { code: 'b', name: 'B' };
    const rowC = { code: 'c', name: 'C' };
    const { result, rerender } = renderHook(
      ({ value }) =>
        useRowSelection({
          value,
          cache: [rowB],
          rowKey: (item: { code: string }) => item.code,
          onChange,
        }),
      {
        initialProps: { value: [rowA] },
      },
    );

    expect(result.current?.selectedRowKeys).toEqual(['a']);

    act(() => {
      result.current?.onChange?.(['a', 'b'], [rowA, rowB], {} as never);
    });

    expect(onChange).toHaveBeenLastCalledWith([rowA, rowB]);

    act(() => {
      result.current?.onChange?.(['b', 'c'], [rowC], {} as never);
    });

    expect(onChange).toHaveBeenLastCalledWith([rowB, rowC]);

    rerender({ value: [] });

    act(() => {
      result.current?.onChange?.(['a'], [], {} as never);
    });

    expect(onChange).toHaveBeenLastCalledWith([]);
  });

  it('supports string rowKey, id/code fallback and filters missing rows', () => {
    const onChange = vi.fn();
    const byId = { id: 'id-1', label: 'row-1' };
    const byCode = { code: 'code-1', label: 'row-2' };
    const byField = { uuid: 'u-1', label: 'row-3' };

    const { result } = renderHook(() =>
      useRowSelection({
        value: [byId as never, byCode as never, byField as never],
        rowKey: 'uuid' as never,
        onChange,
      }),
    );

    expect(result.current?.selectedRowKeys).toEqual(['id-1', 'code-1', 'u-1']);

    act(() => {
      result.current?.onChange?.(['missing'], [undefined as never], {} as never);
    });

    expect(onChange).toHaveBeenLastCalledWith([]);
  });

  it('clears stale cache entries when value is absent and supports default options', () => {
    const onChange = vi.fn();
    const cached = { code: 'cached', label: 'cached-row' };
    const { result } = renderHook(() => useRowSelection({ cache: [cached], onChange }));

    act(() => {
      result.current?.onChange?.(['cached'], [], {} as never);
    });

    expect(result.current?.preserveSelectedRowKeys).toBe(true);
    expect(onChange).toHaveBeenLastCalledWith([]);

    const { result: emptyOptionsResult } = renderHook(() => useRowSelection());
    expect(emptyOptionsResult.current?.selectedRowKeys).toBeUndefined();
  });

  it('retains cached rows that still exist in value and falls back to code when rowKey is missing', () => {
    const onChange = vi.fn();
    const cached = { code: 'code-only', label: 'still-here' };
    const { result } = renderHook(() =>
      useRowSelection({
        cache: [cached],
        value: [cached],
        onChange,
      }),
    );

    expect(result.current?.selectedRowKeys).toEqual(['code-only']);

    act(() => {
      result.current?.onChange?.(['code-only'], [], {} as never);
    });

    expect(onChange).toHaveBeenLastCalledWith([cached]);
  });

  it('returns an empty key when neither rowKey, id nor code exists', () => {
    const row = { name: 'no-key' };
    const { result } = renderHook(() => useRowSelection({ value: [row] as never }));

    expect(result.current?.selectedRowKeys).toEqual(['']);
  });
});
