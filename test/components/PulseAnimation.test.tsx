import type { PropsWithChildren } from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import PulseAnimation from '../../src/components/Animation/Pulse';
import ReactEasyContext, {
  defaultContextValue,
  type ReactEasyContextProps,
} from '../../src/components/ConfigProvider/context';

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

describe('PulseAnimation', () => {
  it('renders default 8 bars', () => {
    const { container } = render(<PulseAnimation />, { wrapper: createWrapper() });
    const bars = container.querySelectorAll('[class*="bar"]');
    expect(bars.length).toBe(8);
  });

  it('renders custom bar count', () => {
    const { container } = render(<PulseAnimation bars={4} />, { wrapper: createWrapper() });
    const bars = container.querySelectorAll('[class*="bar"]');
    expect(bars.length).toBe(4);
  });

  it('renders with custom barColor', () => {
    const { container } = render(<PulseAnimation barColor="red" />, { wrapper: createWrapper() });
    const bars = container.querySelectorAll('[class*="bar"]');
    expect(bars.length).toBeGreaterThan(0);
    expect((bars[0] as HTMLElement).style.backgroundColor).toBe('red');
  });

  it('renders with custom barGap', () => {
    const { container } = render(<PulseAnimation barGap="10px" />, { wrapper: createWrapper() });
    const root = container.firstChild as HTMLElement;
    expect(root.style.gap).toBe('10px');
  });

  it('renders with custom duration', () => {
    const { container } = render(<PulseAnimation duration={2} />, { wrapper: createWrapper() });
    const bars = container.querySelectorAll('[class*="bar"]');
    expect((bars[0] as HTMLElement).style.animationDuration).toBe('2s');
  });

  it('renders with custom delayRate', () => {
    const { container } = render(<PulseAnimation delayRate={0.1} bars={3} />, { wrapper: createWrapper() });
    const bars = container.querySelectorAll('[class*="bar"]');
    expect((bars[1] as HTMLElement).style.animationDelay).toBe('0.1s');
  });

  it('renders with className and style', () => {
    const { container } = render(<PulseAnimation className="my-pulse" style={{ opacity: 0.5 }} />, {
      wrapper: createWrapper(),
    });
    const root = container.firstChild as HTMLElement;
    expect(root.classList.contains('my-pulse')).toBe(true);
    expect(root.style.opacity).toBe('0.5');
  });
});
