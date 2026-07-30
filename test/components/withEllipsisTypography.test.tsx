import React from 'react';
import type { ComponentType } from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import withEllipsisTypography from '../../src/components/EllipsisTypography/withEllipsisTypography';

// A simple Typography-like component for testing the HOC
const MockTypography: ComponentType<{
  children?: React.ReactNode;
  ellipsis?: unknown;
  ref?: React.Ref<HTMLElement>;
}> = (props) => {
  const { children, ...rest } = props;
  return (
    <span data-testid="mock-type" {...rest}>
      {children}
    </span>
  );
};

const EllipsisTypography = withEllipsisTypography(MockTypography);

describe('withEllipsisTypography', () => {
  it('renders text prop content', () => {
    const { container } = render(<EllipsisTypography text="Hello World" />);
    expect(container.textContent).toContain('Hello World');
  });

  it('renders children when text is not provided', () => {
    const { container } = render(<EllipsisTypography>Child Content</EllipsisTypography>);
    expect(container.textContent).toContain('Child Content');
  });

  it('text prop takes precedence over children', () => {
    const { container } = render(<EllipsisTypography text="Text Prop">Children</EllipsisTypography>);
    expect(container.textContent).toContain('Text Prop');
  });

  it('renders with ellipsis as true (isAutoEllipsis)', () => {
    const { container } = render(<EllipsisTypography text="Test" ellipsis={true} />);
    expect(container.textContent).toContain('Test');
  });

  it('renders with tooltip true (isAutoTooltip)', () => {
    const { container } = render(<EllipsisTypography text="Test" ellipsis={{ tooltip: true } as never} />);
    expect(container.textContent).toContain('Test');
  });

  it('renders with tooltip.title true (isAutoTooltipTitle)', () => {
    const { container } = render(<EllipsisTypography text="Test" ellipsis={{ tooltip: { title: true } } as never} />);
    expect(container.textContent).toContain('Test');
  });

  it('renders with custom ellipsis object (no auto)', () => {
    const { container } = render(<EllipsisTypography text="Test" ellipsis={{ rows: 2 }} />);
    expect(container.textContent).toContain('Test');
  });

  it('renders with watchResize set to false', () => {
    const { container } = render(<EllipsisTypography text="Test" watchResize={false} />);
    expect(container.textContent).toContain('Test');
  });

  it('handles isAuto=false when ellipsis is a plain object without tooltip', () => {
    const { container } = render(
      <EllipsisTypography text="Test" ellipsis={{ rows: 3, tooltip: { title: 'custom' } } as never} />,
    );
    expect(container.textContent).toContain('Test');
  });
});
