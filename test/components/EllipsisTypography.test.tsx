import { describe, expect, it, vi } from 'vitest';
import React from 'react';

// Mock withEllipsisTypography to avoid circular dependency at import time
// (components/EllipsisTypography -> hooks -> components)
vi.mock('../../src/components/EllipsisTypography/withEllipsisTypography', () => {
  return {
    __esModule: true,
    default: <T,>(Component: React.ComponentType<T>) => {
      const Mocked = (props: T & { text?: string; children?: React.ReactNode }) => (
        <Component {...(props as T)}>{props.text || props.children}</Component>
      );
      Mocked.displayName = 'MockedEllipsis';
      return Mocked;
    },
  };
});

import EllipsisParagraph from '../../src/components/EllipsisTypography/EllipsisParagraph';
import EllipsisText from '../../src/components/EllipsisTypography/EllipsisText';
import EllipsisTitle from '../../src/components/EllipsisTypography/EllipsisTitle';
import EllipsisLink from '../../src/components/EllipsisTypography/EllipsisLink';
import { render } from '@testing-library/react';

describe('EllipsisTypography leaf components', () => {
  it('EllipsisParagraph renders text', () => {
    const { container } = render(<EllipsisParagraph text="Hello" />);
    expect(container.textContent).toContain('Hello');
  });

  it('EllipsisParagraph renders children as text', () => {
    const { container } = render(<EllipsisParagraph>Hello children</EllipsisParagraph>);
    expect(container.textContent).toContain('Hello children');
  });

  it('EllipsisText renders text', () => {
    const { container } = render(<EllipsisText text="Hello" />);
    expect(container.textContent).toContain('Hello');
  });

  it('EllipsisText renders children', () => {
    const { container } = render(<EllipsisText>Hello children</EllipsisText>);
    expect(container.textContent).toContain('Hello children');
  });

  it('EllipsisTitle renders text', () => {
    const { container } = render(<EllipsisTitle text="Hello" />);
    expect(container.textContent).toContain('Hello');
  });

  it('EllipsisTitle renders children', () => {
    const { container } = render(<EllipsisTitle>Hello children</EllipsisTitle>);
    expect(container.textContent).toContain('Hello children');
  });

  it('EllipsisLink renders text', () => {
    const { container } = render(<EllipsisLink text="Hello" />);
    expect(container.textContent).toContain('Hello');
  });

  it('EllipsisLink renders children', () => {
    const { container } = render(<EllipsisLink>Hello children</EllipsisLink>);
    expect(container.textContent).toContain('Hello children');
  });
});
