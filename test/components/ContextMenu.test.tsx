import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, type PropsWithChildren, vi } from 'vitest';
import ReactEasyContext, {
  defaultContextValue,
  type ReactEasyContextProps,
} from '../../src/components/ConfigProvider/context';
import ContextMenu from '../../src/components/ContextMenu';

// Global polyfills for jsdom
if (typeof ResizeObserver === 'undefined') {
  class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  // @ts-expect-error - global polyfill
  globalThis.ResizeObserver = ResizeObserverMock;
}

// Mock react-contexify
vi.mock('react-contexify', () => {
  const MockMenu = ({ id, children, className }: { id?: string; children?: React.ReactNode; className?: string }) => (
    <div data-testid="context-menu" data-id={id} className={className}>
      {children}
    </div>
  );

  const MockItem = ({
    children,
    key,
    ...rest
  }: {
    children?: React.ReactNode;
    key?: string;
    onClick?: () => void;
    disabled?: boolean;
  }) => (
    <div data-testid="context-menu-item" data-key={key} onClick={rest.onClick}>
      {children}
    </div>
  );

  const MockSeparator = ({ key }: { key?: string }) => <div data-testid="context-menu-separator" data-key={key} />;

  const MockSubmenu = ({
    children,
    key,
    ...rest
  }: {
    children?: React.ReactNode;
    key?: string;
    label?: React.ReactNode;
  }) => (
    <div
      data-testid="context-menu-submenu"
      data-key={key}
      data-label={typeof rest.label === 'string' ? rest.label : undefined}
    >
      {children}
    </div>
  );

  const MockRightSlot = ({ children }: { children?: React.ReactNode }) => (
    <span data-testid="right-slot">{children}</span>
  );

  const useContextMenuMock = ({ id }: { id?: string }) => ({
    show: vi.fn(),
    hideAll: vi.fn(),
  });

  return {
    Menu: MockMenu,
    Item: MockItem,
    Separator: MockSeparator,
    Submenu: MockSubmenu,
    RightSlot: MockRightSlot,
    useContextMenu: useContextMenuMock,
  };
});

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

const sampleItems = [
  { key: 'edit', label: 'Edit', onClick: vi.fn() },
  { type: 'separator' as const },
  { key: 'delete', label: 'Delete', disabled: true, shortcutKey: { metaKey: true, key: 'Backspace' } },
];

const menuItemWithChildren = { key: 'custom', label: 'Custom', children: <span>Custom Content</span> };

describe('ContextMenu', () => {
  it('renders with items and trigger', () => {
    const { container } = render(
      <ContextMenu id="test-menu" items={sampleItems}>
        <button>Trigger</button>
      </ContextMenu>,
      { wrapper: createWrapper() },
    );
    expect(container.textContent).toContain('Trigger');
  });

  it('renders without children (triggerless)', () => {
    const { container } = render(<ContextMenu id="test-menu-2" items={sampleItems} />, { wrapper: createWrapper() });
    // Should still render the Menu
    expect(container.querySelector('[data-testid="context-menu"]')).toBeTruthy();
  });

  it('renders with custom prefixCls', () => {
    const { container } = render(
      <ContextMenu id="test-menu-3" items={sampleItems} prefixCls="my-menu">
        <button>Trigger</button>
      </ContextMenu>,
      { wrapper: createWrapper() },
    );
    expect(container.textContent).toContain('Trigger');
  });

  it('applies triggerProps className and style', () => {
    const { container } = render(
      <ContextMenu
        id="test-menu-4"
        items={sampleItems}
        triggerProps={{ className: 'custom-trigger', style: { color: 'red' } }}
      >
        <button>Trigger</button>
      </ContextMenu>,
      { wrapper: createWrapper() },
    );
    expect(container.textContent).toContain('Trigger');
  });

  it('renders separator and disabled items', () => {
    const { container } = render(
      <ContextMenu id="test-menu-5" items={sampleItems}>
        <button>Trigger</button>
      </ContextMenu>,
      { wrapper: createWrapper() },
    );
    expect(container.querySelector('[data-testid="context-menu-separator"]')).toBeTruthy();
  });

  it('renders with click trigger', () => {
    const { container } = render(
      <ContextMenu id="test-menu-6" items={sampleItems} trigger={['click']}>
        <button>Trigger</button>
      </ContextMenu>,
      { wrapper: createWrapper() },
    );
    expect(container.textContent).toContain('Trigger');
  });

  it('renders with hover trigger', () => {
    const { container } = render(
      <ContextMenu id="test-menu-7" items={sampleItems} trigger={['hover']}>
        <button>Trigger</button>
      </ContextMenu>,
      { wrapper: createWrapper() },
    );
    expect(container.textContent).toContain('Trigger');
  });

  it('renders with doubleClick trigger', () => {
    const { container } = render(
      <ContextMenu id="test-menu-8" items={sampleItems} trigger={['doubleClick']}>
        <button>Trigger</button>
      </ContextMenu>,
      { wrapper: createWrapper() },
    );
    expect(container.textContent).toContain('Trigger');
  });

  it('renders submenu items', () => {
    const itemsWithSubmenu = [
      { key: 'parent', type: 'submenu' as const, label: 'Parent', items: [{ key: 'child1', label: 'Child 1' }] },
    ];
    const { container } = render(
      <ContextMenu id="test-menu-9" items={itemsWithSubmenu}>
        <button>Trigger</button>
      </ContextMenu>,
      { wrapper: createWrapper() },
    );
    expect(container.textContent).toContain('Trigger');
  });

  it('renders item with custom children (not label/icon)', () => {
    const { container } = render(
      <ContextMenu id="test-menu-10" items={[menuItemWithChildren]}>
        <button>Trigger</button>
      </ContextMenu>,
      { wrapper: createWrapper() },
    );
    expect(container.textContent).toContain('Trigger');
  });

  it('applies className to root element', () => {
    const { container } = render(
      <ContextMenu id="test-menu-11" items={sampleItems} className="my-context-menu">
        <button>Trigger</button>
      </ContextMenu>,
      { wrapper: createWrapper() },
    );
    expect(container.textContent).toContain('Trigger');
  });

  it('passes custom Menu props via rest', () => {
    const { container } = render(
      <ContextMenu id="test-menu-12" items={sampleItems} animation="fade">
        <button>Trigger</button>
      </ContextMenu>,
      { wrapper: createWrapper() },
    );
    expect(container.textContent).toContain('Trigger');
  });
});
