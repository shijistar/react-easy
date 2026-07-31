import React from 'react';
import { screen } from '@testing-library/dom';
import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import FormItemControl from '../../src/components/FormItemControl';

describe('FormItemControl', () => {
  it('renders children with value and onChange props', () => {
    const renderFn = vi.fn(() => <input data-testid="input" />);
    // FormItemControl receives value/onChange from Form.Item via spread at runtime
    render(
      (React.createElement as unknown as typeof React.createElement)(FormItemControl as never, {
        value: 'test-value',
        onChange: () => {
          // stub method
        },
        children: renderFn,
      }),
    );
    expect(renderFn).toHaveBeenCalledWith(
      expect.objectContaining({
        value: 'test-value',
        onChange: expect.any(Function),
      }),
    );
  });

  it('passes onChange to children correctly', () => {
    const onChangeSpy = vi.fn();
    render(
      (React.createElement as unknown as typeof React.createElement)(FormItemControl as never, {
        value: 'test',
        onChange: onChangeSpy,
        children: ({ onChange }: { onChange: (v: string) => void }) => (
          <button onClick={() => onChange('new')} data-testid="btn">
            X
          </button>
        ),
      }),
    );
    screen.getByTestId('btn').click();
    expect(onChangeSpy).toHaveBeenCalledWith('new');
  });

  it('renders children as a function', () => {
    const { container } = render(
      (React.createElement as unknown as typeof React.createElement)(FormItemControl as never, {
        value: 'a',
        onChange: () => {
          // stub method
        },
        children: () => React.createElement('span', { 'data-testid': 'rendered' }, 'child'),
      }),
    );
    expect(container.querySelector('[data-testid="rendered"]')).toBeTruthy();
  });
});
