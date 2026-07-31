import type { PropsWithChildren } from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ReactEasyContext, {
  defaultContextValue,
  type ReactEasyContextProps,
} from '../../src/components/ConfigProvider/context';
import Loading from '../../src/components/Loading';

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

describe('Loading', () => {
  it('renders Spin wrapper when children provided', () => {
    const { container } = render(
      <Loading>
        <div>content</div>
      </Loading>,
      { wrapper: createWrapper() },
    );
    expect(container.querySelector('.ant-spin')).toBeTruthy();
    expect(container.textContent).toContain('content');
  });

  it('renders standalone spinner when no children and spinning=true', () => {
    const { container } = render(<Loading />, { wrapper: createWrapper() });
    expect(container.querySelector('.ant-spin')).toBeTruthy();
  });

  it('renders nothing standalone when spinning=false', () => {
    const { container } = render(<Loading spinning={false} />, { wrapper: createWrapper() });
    expect(container.textContent).toBe('');
  });

  it('renders children with spinning=false', () => {
    const { container } = render(
      <Loading spinning={false}>
        <span>visible</span>
      </Loading>,
      { wrapper: createWrapper() },
    );
    expect(container.textContent).toContain('visible');
  });

  it('renders with absolute mode', () => {
    const { container } = render(<Loading mode="absolute" />, { wrapper: createWrapper() });
    // The standalone div with absolute class should be rendered
    const standalone = container.querySelector('[class*="absolute"]');
    expect(standalone).toBeTruthy();
    expect(container.querySelector('.ant-spin')).toBeTruthy();
  });

  it('applies rootClassName and rootStyle', () => {
    const { container } = render(<Loading rootClassName="my-root" rootStyle={{ color: 'red' }} spinning={true} />, {
      wrapper: createWrapper(),
    });
    const root = container.querySelector('.my-root');
    expect(root).toBeTruthy();
  });
});
