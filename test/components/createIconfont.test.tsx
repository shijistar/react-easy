import { describe, expect, it, vi, type PropsWithChildren } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import ReactEasyContext, {
  defaultContextValue,
  type ReactEasyContextProps,
} from '../../src/components/ConfigProvider/context';

// Mock @ant-design/icons to avoid script URL fetch in tests
vi.mock('@ant-design/icons', () => ({
  createFromIconfontCN: () => {
    const MockIconfont = (props: Record<string, unknown>) => (
      <span data-testid="mock-iconfont" {...(props as Record<string, unknown>)}>
        icon
      </span>
    );
    MockIconfont.displayName = 'MockIconfont';
    return MockIconfont;
  },
}));

import { createIconfont } from '../../src/components/Iconfont/createIconfont';

function createWrapper(value?: Partial<ReactEasyContextProps>) {
  const contextValue: ReactEasyContextProps = {
    ...defaultContextValue,
    getPrefixCls: (suffixCls: string, customizePrefixCls?: string) => customizePrefixCls ?? `easy-${suffixCls}`,
    ...value,
  };
  return function Wrapper({ children }: PropsWithChildren) {
    return <ReactEasyContext.Provider value={contextValue}>{children}</ReactEasyContext.Provider>;
  };
}

describe('createIconfont', () => {
  it('creates an Iconfont component from the factory', () => {
    const Iconfont = createIconfont('//at.alicdn.com/t/font_8d5l8fzk5b87iudi.js');
    const { container } = render(<Iconfont type="icon-test" />, { wrapper: createWrapper() });
    const el = container.querySelector('[data-testid="mock-iconfont"]');
    expect(el).toBeTruthy();
    // With default empty iconPrefix, type.startsWith('') is true, so type is unchanged
    expect(el?.getAttribute('type')).toBe('icon-test');
  });

  it('uses custom iconPrefix', () => {
    const Iconfont = createIconfont('//at.alicdn.com/t/font_xxx.js', { iconPrefix: 'myicon' });
    const { container } = render(<Iconfont type="icon-test" />, { wrapper: createWrapper() });
    const el = container.querySelector('[data-testid="mock-iconfont"]');
    expect(el?.getAttribute('type')).toBe('myicon-icon-test');
  });

  it('does not prepend prefix if type already starts with iconPrefix', () => {
    const Iconfont = createIconfont('//at.alicdn.com/t/font_xxx.js', { iconPrefix: 'icon' });
    const { container } = render(<Iconfont type="icon-test" />, { wrapper: createWrapper() });
    const el = container.querySelector('[data-testid="mock-iconfont"]');
    expect(el?.getAttribute('type')).toBe('icon-test');
  });

  it('uses size as fontSize in style', () => {
    const Iconfont = createIconfont('//at.alicdn.com/t/font_xxx.js');
    const { container } = render(<Iconfont type="test" size="20px" />, { wrapper: createWrapper() });
    const el = container.querySelector('[data-testid="mock-iconfont"]') as HTMLElement;
    expect(el.style.fontSize).toBe('20px');
  });

  it('renders with className', () => {
    const Iconfont = createIconfont('//at.alicdn.com/t/font_xxx.js');
    const { container } = render(<Iconfont type="test" className="my-icon" />, { wrapper: createWrapper() });
    const el = container.querySelector('[data-testid="mock-iconfont"]');
    expect(el?.classList.contains('my-icon')).toBe(true);
  });

  it('renders with spin and rotate props passed through', () => {
    const Iconfont = createIconfont('//at.alicdn.com/t/font_xxx.js');
    const { container } = render(<Iconfont type="test" spin rotate={90} />, { wrapper: createWrapper() });
    const el = container.querySelector('[data-testid="mock-iconfont"]');
    expect(el).toBeTruthy();
  });
});
