import type React from 'react';
import { describe, expect, it, vi } from 'vitest';
import DeleteConfirmAction from '../../src/components/DeleteConfirmAction/index';
import withDeleteConfirmAction from '../../src/components/DeleteConfirmAction/withDeleteConfirmAction';

// Mock ConfirmAction (Phase C, high-cost) to avoid its dependency chain in Phase A tests
vi.mock('../../src/components/ConfirmAction/index', () => {
  return {
    __esModule: true,
    genRenderer: () => {
      const Comp = () => null;
      Comp.displayName = 'MockRender';
      return Comp;
    },
    withDefaultConfirmActionProps:
      () =>
      <P,>(Component: React.ComponentType<P>) =>
        Component,
  };
});

vi.mock('../../src/components/ConfirmAction/withConfirmAction', () => ({
  __esModule: true,
  withConfirmActionInternal: () => {
    const HOC = <P,>(Component: React.ComponentType<P>) => Component;
    return HOC;
  },
}));

describe('DeleteConfirmAction', () => {
  it('exports the default component', () => {
    expect(DeleteConfirmAction).toBeDefined();
    expect(typeof DeleteConfirmAction).toBe('object');
  });

  it('has Button static property', () => {
    expect(DeleteConfirmAction.Button).toBeDefined();
  });

  it('has Switch static property', () => {
    expect(DeleteConfirmAction.Switch).toBeDefined();
  });

  it('has Link static property', () => {
    expect(DeleteConfirmAction.Link).toBeDefined();
  });
});

describe('withDeleteConfirmAction', () => {
  it('is a function', () => {
    expect(typeof withDeleteConfirmAction).toBe('function');
  });

  it('returns a HOC when called with a component', () => {
    const Dummy = vi.fn(() => null);
    Dummy.displayName = 'Dummy';
    const result = withDeleteConfirmAction(Dummy);
    expect(typeof result).toBe('function');
  });
});
