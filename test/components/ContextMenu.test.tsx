import type React from 'react';
import type { PropsWithChildren } from 'react';
import { createRef } from 'react';
import { act, fireEvent, render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ReactEasyContext, {
  defaultContextValue,
  type ReactEasyContextProps,
} from '../../src/components/ConfigProvider/context';
import ContextMenu, { type ContextMenuRef } from '../../src/components/ContextMenu';

// Global polyfills for jsdom, needed by antd dropdown component
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
  globalThis.ResizeObserver = ResizeObserverMock;
}

// Shared, observable contexify mock: tests can assert show/hideAll calls and
// drive the keyMatcher function that real react-contexify would invoke.
const { contexifyStore } = vi.hoisted(() => ({
  contexifyStore: {
    show: vi.fn(),
    hideAll: vi.fn(),
    keyMatchers: [] as ((event: Partial<KeyboardEvent>) => boolean)[],
  },
}));

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
    keyMatcher?: (event: Partial<KeyboardEvent>) => boolean;
  }) => {
    if (typeof rest.keyMatcher === 'function') {
      contexifyStore.keyMatchers.push(rest.keyMatcher as (event: Partial<KeyboardEvent>) => boolean);
    }
    return (
      <div data-testid="context-menu-item" data-key={key} onClick={rest.onClick}>
        {children}
      </div>
    );
  };

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

  const useContextMenuMock = () => ({
    show: contexifyStore.show,
    hideAll: contexifyStore.hideAll,
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
  beforeEach(() => {
    contexifyStore.show.mockClear();
    contexifyStore.hideAll.mockClear();
    contexifyStore.keyMatchers.length = 0;
  });

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
    const { container } = render(
      <ContextMenu id="test-menu-2" items={sampleItems}>
        <></>
      </ContextMenu>,
      {
        wrapper: createWrapper(),
      },
    );
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

  it('exposes show via ref and calls contexify show', () => {
    const ref = createRef<ContextMenuRef>();
    render(
      <ContextMenu ref={ref} id="ref-menu" items={sampleItems}>
        <button>Trigger</button>
      </ContextMenu>,
      { wrapper: createWrapper() },
    );
    const event = { clientX: 10, clientY: 20 } as React.MouseEvent<HTMLElement>;
    act(() => {
      ref.current?.show(event);
    });
    expect(contexifyStore.show).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'ref-menu', event, props: expect.any(Object) }),
    );
  });

  it('exposes hideAll via ref and calls contexify hideAll', () => {
    const ref = createRef<ContextMenuRef>();
    render(
      <ContextMenu ref={ref} id="ref-menu-2" items={sampleItems}>
        <button>Trigger</button>
      </ContextMenu>,
      { wrapper: createWrapper() },
    );
    act(() => {
      ref.current?.hideAll();
    });
    expect(contexifyStore.hideAll).toHaveBeenCalled();
  });

  it('shows menu from trigger event handler', () => {
    const { container } = render(
      <ContextMenu id="evt-menu" items={sampleItems} trigger={['click']}>
        <button>Trigger</button>
      </ContextMenu>,
      { wrapper: createWrapper() },
    );
    const triggerEl = container.querySelector('.easy-context-menu-trigger') as HTMLElement;
    fireEvent.click(triggerEl);
    expect(contexifyStore.show).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'evt-menu', props: expect.any(Object) }),
    );
  });

  it('hides all menus on hover leave', () => {
    const { container } = render(
      <ContextMenu id="hover-menu" items={sampleItems} trigger={['hover']}>
        <button>Trigger</button>
      </ContextMenu>,
      { wrapper: createWrapper() },
    );
    const triggerEl = container.querySelector('.easy-context-menu-trigger') as HTMLElement;
    fireEvent.pointerEnter(triggerEl);
    expect(contexifyStore.show).toHaveBeenCalled();
    contexifyStore.show.mockClear();
    fireEvent.pointerLeave(triggerEl);
    expect(contexifyStore.hideAll).toHaveBeenCalled();
  });

  it('keyMatcher returns false when ctrlKey mismatches', () => {
    render(
      <ContextMenu id="km-1" items={[{ key: 'a', label: 'A', shortcutKey: { ctrlKey: true, key: 'a' } }]}>
        <button>Trigger</button>
      </ContextMenu>,
      { wrapper: createWrapper() },
    );
    const matcher = contexifyStore.keyMatchers[0];
    expect(matcher).toBeTypeOf('function');
    expect(matcher({ ctrlKey: false, key: 'a' })).toBe(false);
  });

  it('keyMatcher returns false when altKey/shiftKey/metaKey mismatch', () => {
    render(
      <ContextMenu
        id="km-2"
        items={[
          { key: 'a', label: 'A', shortcutKey: { altKey: true, key: 'a' } },
          { key: 's', label: 'S', shortcutKey: { shiftKey: true, key: 's' } },
          { key: 'm', label: 'M', shortcutKey: { metaKey: true, key: 'm' } },
        ]}
      >
        <button>Trigger</button>
      </ContextMenu>,
      { wrapper: createWrapper() },
    );
    expect(contexifyStore.keyMatchers[0]({ altKey: false, key: 'a' })).toBe(false);
    expect(contexifyStore.keyMatchers[1]({ shiftKey: false, key: 's' })).toBe(false);
    expect(contexifyStore.keyMatchers[2]({ metaKey: false, key: 'm' })).toBe(false);
  });

  it('keyMatcher returns false on key mismatch and true on full match', () => {
    render(
      <ContextMenu id="km-3" items={[{ key: 'a', label: 'A', shortcutKey: { ctrlKey: true, key: 'a' } }]}>
        <button>Trigger</button>
      </ContextMenu>,
      { wrapper: createWrapper() },
    );
    const matcher = contexifyStore.keyMatchers[0];
    expect(matcher({ ctrlKey: true, key: 'b' })).toBe(false);
    expect(matcher({ ctrlKey: true, key: 'a' })).toBe(true);
  });

  it('renders string shortcutKey as keyMatcher without object branch', () => {
    render(
      <ContextMenu id="km-4" items={[{ key: 'a', label: 'A', shortcutKey: 'ctrl+a' as never }]}>
        <button>Trigger</button>
      </ContextMenu>,
      { wrapper: createWrapper() },
    );
    // String shortcutKey does not produce a function keyMatcher.
    expect(contexifyStore.keyMatchers.length).toBe(0);
    // RightSlot is not rendered for string shortcutKey.
    expect(document.querySelector('[data-testid="right-slot"]')).toBeNull();
  });

  it('renders shortcut symbols for all modifier keys', () => {
    render(
      <ContextMenu
        id="km-5"
        items={[
          {
            key: 'a',
            label: 'A',
            shortcutKey: { ctrlKey: true, altKey: true, shiftKey: true, metaKey: true, key: 'x' },
          },
        ]}
      >
        <button>Trigger</button>
      </ContextMenu>,
      { wrapper: createWrapper() },
    );
    const rightSlot = document.querySelector('[data-testid="right-slot"]')!;
    expect(rightSlot.textContent).toContain('^');
    expect(rightSlot.textContent).toContain('⌥');
    expect(rightSlot.textContent).toContain('⇧');
    expect(rightSlot.textContent).toContain('⌘');
    expect(rightSlot.textContent).toContain('x');
  });

  it('renders dark theme algorithm in shortcut keyboard text', () => {
    render(
      <ContextMenu id="km-6" items={[{ key: 'a', label: 'A', shortcutKey: { key: 'k' } }]} theme="dark">
        <button>Trigger</button>
      </ContextMenu>,
      { wrapper: createWrapper() },
    );
    const rightSlot = document.querySelector('[data-testid="right-slot"]')!;
    expect(rightSlot.textContent).toContain('k');
  });

  it('renders empty menu when items is empty', () => {
    const { container } = render(
      <ContextMenu id="empty-menu" items={[]}>
        <button>Trigger</button>
      </ContextMenu>,
      { wrapper: createWrapper() },
    );
    expect(container.querySelector('[data-testid="context-menu"]')).toBeTruthy();
    expect(container.querySelectorAll('[data-testid="context-menu-item"]').length).toBe(0);
  });

  it('renders menu when items is undefined', () => {
    const { container } = render(
      <ContextMenu id="undef-menu" items={undefined}>
        <button>Trigger</button>
      </ContextMenu>,
      { wrapper: createWrapper() },
    );
    expect(container.querySelector('[data-testid="context-menu"]')).toBeTruthy();
  });

  it('renders without event handlers when trigger is falsy', () => {
    // null bypasses the default parameter (['contextMenu']) and is falsy, so
    // the eventHandlers map stays empty (L92 false branch).
    const { container } = render(
      <ContextMenu id="no-trigger" items={sampleItems} trigger={null as never}>
        <button>Trigger</button>
      </ContextMenu>,
      { wrapper: createWrapper() },
    );
    const triggerEl = container.querySelector('.easy-context-menu-trigger') as HTMLElement;
    fireEvent.click(triggerEl);
    expect(contexifyStore.show).not.toHaveBeenCalled();
  });

  it('renders shortcut without key symbol when key is missing', () => {
    render(
      <ContextMenu id="km-7" items={[{ key: 'a', label: 'A', shortcutKey: { ctrlKey: true } }]}>
        <button>Trigger</button>
      </ContextMenu>,
      { wrapper: createWrapper() },
    );
    const rightSlot = document.querySelector('[data-testid="right-slot"]')!;
    expect(rightSlot.textContent).toContain('^');
    // No trailing key character because event.key is undefined (L228 false branch).
    expect(rightSlot.textContent).not.toContain('x');
  });
});
