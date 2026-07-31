import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ReactEasyContext from '../../src/components/ConfigProvider/context';
import ConfigProvider from '../../src/components/ConfigProvider/index';

describe('ConfigProvider', () => {
  it('renders children', () => {
    const { container } = render(
      <ConfigProvider>
        <span data-testid="child">hello</span>
      </ConfigProvider>,
    );
    expect(container.querySelector('[data-testid="child"]')).toBeTruthy();
    expect(container.textContent).toContain('hello');
  });

  it('has ConfigContext attached', () => {
    expect(ConfigProvider.ConfigContext).toBe(ReactEasyContext);
  });

  it('has displayName set', () => {
    expect(ConfigProvider.displayName).toBe('ReactEasyConfigProvider');
  });

  it('accepts prefixCls prop', () => {
    const { container } = render(
      <ConfigProvider prefixCls="custom-prefix">
        <span>test</span>
      </ConfigProvider>,
    );
    expect(container.textContent).toContain('test');
  });

  it('accepts lang prop', () => {
    const { container } = render(
      <ConfigProvider lang="zh-CN">
        <span>test</span>
      </ConfigProvider>,
    );
    expect(container.textContent).toContain('test');
  });

  it('accepts className and style', () => {
    const { container } = render(
      <ConfigProvider className="my-config" style={{ color: 'red' }}>
        <span>test</span>
      </ConfigProvider>,
    );
    expect(container.textContent).toContain('test');
  });

  it('accepts locales prop for a known language (zh-CN)', () => {
    const { container } = render(
      <ConfigProvider lang="zh-CN" locales={{ key: 'value' }}>
        <span>test</span>
      </ConfigProvider>,
    );
    expect(container.textContent).toContain('test');
  });

  it('accepts locales prop without lang (defaults to en-US)', () => {
    const { container } = render(
      <ConfigProvider locales={{ key: 'value' }}>
        <span>test</span>
      </ConfigProvider>,
    );
    expect(container.textContent).toContain('test');
  });

  it('accepts locales prop for an unknown language', () => {
    const { container } = render(
      // @ts-expect-error: because of testing with custom lang
      <ConfigProvider lang="fr-FR" locales={{ key: 'value' }}>
        <span>test</span>
      </ConfigProvider>,
    );
    expect(container.textContent).toContain('test');
  });

  it('has a child that can consume getPrefixCls from context', () => {
    const Consumer = () => {
      const ctx = React.useContext(ReactEasyContext);
      return <span data-prefix={ctx.getPrefixCls?.('test')}>ok</span>;
    };
    const { container } = render(
      <ConfigProvider>
        <Consumer />
      </ConfigProvider>,
    );
    const span = container.querySelector('[data-prefix]');
    expect(span?.getAttribute('data-prefix')).toContain('easy-test');
  });

  it('handles lang matching current locale gracefully', () => {
    // After previous tests, locale is 'en-US', so passing lang="en-US" covers the
    // false branch of `langInProps !== locales.language` (line 55)
    const { container } = render(
      <ConfigProvider lang="en-US">
        <span>test</span>
      </ConfigProvider>,
    );
    expect(container.textContent).toContain('test');
  });
});
