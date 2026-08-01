import type React from 'react';
import { type PropsWithChildren } from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ReactEasyContext, {
  defaultContextValue,
  type ReactEasyContextProps,
} from '../../src/components/ConfigProvider/context';
import OverflowTags from '../../src/components/OverflowTags';

// ResizeObserver is not part of this component's functionality, but a dependency of the underlying library.
// Therefore, no callback is needed, just mock the type to avoid errors.
// Global polyfills for jsdom (needed by antd css-in-js / @rc-component/resize-observer)
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

// Mock rc-overflow to avoid ResizeObserver and layout dependency in jsdom
vi.mock('rc-overflow', () => {
  const MockOverflow = <T extends { value: string }>(props: {
    data?: T[];
    renderItem?: (item: T) => React.ReactNode;
    renderRest?: (omittedItems: T[]) => React.ReactNode;
    children?: React.ReactNode;
    className?: string;
  }) => {
    const { data, renderItem, renderRest, className } = props;
    return (
      <div className={className} data-testid="mock-overflow">
        {renderItem &&
          data?.map((item, i) => (
            <div key={item.value} data-testid={`item-${i}`}>
              {renderItem(item)}
            </div>
          ))}
        {renderRest && data && data.length > 0 && <div data-testid="rest-content">{renderRest(data)}</div>}
      </div>
    );
  };
  MockOverflow.displayName = 'MockOverflow';
  return { default: MockOverflow };
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

interface TestTag {
  label: string;
  value: string;
  icon?: React.ReactNode;
  color?: string;
}

const testTags: TestTag[] = [
  { label: 'Tag A', value: 'a' },
  { label: 'Tag B', value: 'b' },
  { label: 'Tag C', value: 'c' },
];

describe('OverflowTags', () => {
  it('renders tags with label as name', () => {
    const { container } = render(<OverflowTags tags={testTags} />, { wrapper: createWrapper() });
    expect(container.textContent).toContain('Tag A');
    expect(container.textContent).toContain('Tag B');
    expect(container.textContent).toContain('Tag C');
  });

  it('handles undefined tags (defaults to [])', () => {
    const { container } = render(<OverflowTags tags={undefined as unknown as TestTag[]} />, {
      wrapper: createWrapper(),
    });
    expect(container.textContent).toBeFalsy();
  });

  it('uses getTagName to extract display name', () => {
    const items = [
      { id: 1, display: 'First' },
      { id: 2, display: 'Second' },
    ];
    const { container } = render(<OverflowTags tags={items} getTagName={(t) => (t as { display: string }).display} />, {
      wrapper: createWrapper(),
    });
    expect(container.textContent).toContain('First');
    expect(container.textContent).toContain('Second');
  });

  it('falls back to name field when label is not present', () => {
    const items = [{ name: 'Named', id: 1 }];
    const { container } = render(<OverflowTags tags={items} />, { wrapper: createWrapper() });
    expect(container.textContent).toContain('Named');
  });

  it('falls back to toString() when no label/name', () => {
    const items = [42, 99];
    const { container } = render(<OverflowTags tags={items} />, { wrapper: createWrapper() });
    expect(container.textContent).toContain('42');
    expect(container.textContent).toContain('99');
  });

  it('uses getTagKey for key extraction in rest menu', () => {
    const items = [
      { code: 'x1', name: 'X1' },
      { code: 'x2', name: 'X2' },
    ];
    const { container } = render(<OverflowTags tags={items} getTagKey={(t) => (t as { code: string }).code} />, {
      wrapper: createWrapper(),
    });
    expect(container.textContent).toContain('X1');
    expect(container.textContent).toContain('X2');
  });

  it('supports tagProps as a function', () => {
    const { container } = render(
      <OverflowTags tags={testTags} tagProps={(tag) => ({ color: tag === testTags[0] ? 'red' : 'blue' }) as never} />,
      { wrapper: createWrapper() },
    );
    expect(container.textContent).toContain('Tag A');
  });

  it('supports tagProps as an object', () => {
    const { container } = render(<OverflowTags tags={testTags} tagProps={{ color: 'green' }} />, {
      wrapper: createWrapper(),
    });
    expect(container.textContent).toContain('Tag A');
  });

  it('renders with randomColors enabled', () => {
    const { container } = render(<OverflowTags tags={testTags} randomColors />, { wrapper: createWrapper() });
    expect(container.textContent).toContain('Tag A');
  });

  it('renders with className', () => {
    const { container } = render(<OverflowTags tags={testTags} className="my-overflow" />, {
      wrapper: createWrapper(),
    });
    expect(container.querySelector('.my-overflow')).toBeTruthy();
  });

  it('renders rest menu via ellipsisTagProps as function', () => {
    const { container } = render(<OverflowTags tags={testTags} ellipsisTagProps={() => ({ color: 'grey' })} />, {
      wrapper: createWrapper(),
    });
    expect(container.textContent).toContain('+');
  });

  it('renders rest menu via ellipsisTagProps as object', () => {
    const { container } = render(<OverflowTags tags={testTags} ellipsisTagProps={{ color: 'grey' }} />, {
      wrapper: createWrapper(),
    });
    expect(container.textContent).toContain('+');
  });

  it('renders with ellipsisDropdownProps', () => {
    const { container } = render(<OverflowTags tags={testTags} ellipsisDropdownProps={{ open: true }} />, {
      wrapper: createWrapper(),
    });
    expect(container.textContent).toContain('+');
  });

  it('uses icon from tag data', () => {
    const itemsWithIcon = [{ label: 'IconTag', value: '1', icon: <span data-testid="tag-icon">🔍</span> }];
    const { container } = render(<OverflowTags tags={itemsWithIcon} />, { wrapper: createWrapper() });
    expect(container.textContent).toContain('IconTag');
  });

  it('uses color from tag data', () => {
    const itemsWithColor: TestTag[] = [{ label: 'Colored', value: '1', color: 'red' }];
    const { container } = render(<OverflowTags tags={itemsWithColor} />, { wrapper: createWrapper() });
    expect(container.textContent).toContain('Colored');
  });
});
