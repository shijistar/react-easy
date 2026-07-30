import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import BreakLines from '../../src/components/BreakLines';

describe('BreakLines', () => {
  it('renders text with newlines as <br/> elements', () => {
    const { container } = render(<BreakLines value={'hello\nworld'} />);
    expect(container.querySelector('br')).toBeTruthy();
    expect(container.textContent).toContain('hello');
    expect(container.textContent).toContain('world');
  });

  it('renders plain text when there is no newline', () => {
    const { container } = render(<BreakLines value="hello world" />);
    expect(container.querySelector('br')).toBeNull();
    expect(container.textContent).toBe('hello world');
  });

  it('renders undefined value as empty fragment', () => {
    const { container } = render(<BreakLines value={undefined as unknown as string} />);
    expect(container.textContent).toBe('');
  });

  it('returns raw value when enabled is false', () => {
    const { container } = render(<BreakLines value={'a\nb'} enabled={false} />);
    expect(container.querySelector('br')).toBeNull();
    expect(container.textContent).toBe('a\nb');
  });

  it('uses custom EOL character', () => {
    const { container } = render(<BreakLines value="a|b" EOL="|" />);
    expect(container.querySelector('br')).toBeTruthy();
    expect(container.textContent).toContain('a');
    expect(container.textContent).toContain('b');
  });

  it('renders with a tagName wrapper', () => {
    const { container } = render(<BreakLines value={'hello\nworld'} tagName="div" />);
    expect(container.querySelector('div')).toBeTruthy();
    expect(container.querySelector('div')?.textContent).toContain('hello');
  });

  it('renders with className on wrapper tag', () => {
    const { container } = render(<BreakLines value="test" tagName="span" className="my-class" />);
    expect(container.querySelector('span.my-class')).toBeTruthy();
  });

  it('handles empty string value', () => {
    const { container } = render(<BreakLines value="" />);
    expect(container.textContent).toBe('');
  });
});
