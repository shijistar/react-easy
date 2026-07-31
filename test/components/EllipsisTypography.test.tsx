import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import EllipsisLink from '../../src/components/EllipsisTypography/EllipsisLink';
import EllipsisParagraph from '../../src/components/EllipsisTypography/EllipsisParagraph';
import EllipsisText from '../../src/components/EllipsisTypography/EllipsisText';
import EllipsisTitle from '../../src/components/EllipsisTypography/EllipsisTitle';

// Global polyfills for jsdom
if (typeof ResizeObserver === 'undefined') {
  class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  // @ts-expect-error - global polyfill
  globalThis.ResizeObserver = ResizeObserverMock;
}

describe('EllipsisTypography real leaf components', () => {
  // ---------- EllipsisParagraph ----------
  describe('EllipsisParagraph', () => {
    it('renders text prop', () => {
      const { container } = render(<EllipsisParagraph text="Hello paragraph" />);
      expect(container.textContent).toContain('Hello paragraph');
    });

    it('renders children', () => {
      const { container } = render(<EllipsisParagraph>Children para</EllipsisParagraph>);
      expect(container.textContent).toContain('Children para');
    });

    it('text prop takes precedence over children', () => {
      const { container } = render(<EllipsisParagraph text="Text wins">Children ignored</EllipsisParagraph>);
      expect(container.textContent).toContain('Text wins');
      expect(container.textContent).not.toContain('Children ignored');
    });

    it('renders with Ant Design paragraph class', () => {
      const { container } = render(<EllipsisParagraph text="Styled" />);
      const paragraph = container.querySelector('.ant-typography');
      expect(paragraph).toBeTruthy();
    });

    it('supports watchResize=false', () => {
      const { container } = render(<EllipsisParagraph text="No resize" watchResize={false} />);
      expect(container.textContent).toContain('No resize');
    });

    it('supports copyable prop', () => {
      const { container } = render(<EllipsisParagraph text="Copyable" copyable />);
      expect(container.textContent).toContain('Copyable');
    });
  });

  // ---------- EllipsisText ----------
  describe('EllipsisText', () => {
    it('renders text prop', () => {
      const { container } = render(<EllipsisText text="Hello text" />);
      expect(container.textContent).toContain('Hello text');
    });

    it('renders children', () => {
      const { container } = render(<EllipsisText>Children text</EllipsisText>);
      expect(container.textContent).toContain('Children text');
    });

    it('text prop takes precedence over children', () => {
      const { container } = render(<EllipsisText text="Text wins">Children ignored</EllipsisText>);
      expect(container.textContent).toContain('Text wins');
      expect(container.textContent).not.toContain('Children ignored');
    });

    it('renders as span element', () => {
      const { container } = render(<EllipsisText text="Inline" />);
      // Ant Design Typography.Text renders as <span>
      const span = container.querySelector('span');
      expect(span).toBeTruthy();
    });

    it('supports code type', () => {
      const { container } = render(<EllipsisText text="Code text" code />);
      expect(container.textContent).toContain('Code text');
    });

    it('supports strong type', () => {
      const { container } = render(<EllipsisText text="Strong text" strong />);
      expect(container.textContent).toContain('Strong text');
    });

    it('supports disabled prop', () => {
      const { container } = render(<EllipsisText text="Disabled text" disabled />);
      expect(container.textContent).toContain('Disabled text');
    });

    it('supports mark prop', () => {
      const { container } = render(<EllipsisText text="Marked text" mark />);
      expect(container.textContent).toContain('Marked text');
    });

    it('supports underline prop', () => {
      const { container } = render(<EllipsisText text="Underlined text" underline />);
      expect(container.textContent).toContain('Underlined text');
    });

    it('supports delete prop', () => {
      const { container } = render(<EllipsisText text="Deleted text" delete />);
      expect(container.textContent).toContain('Deleted text');
    });

    it('supports keyboard prop', () => {
      const { container } = render(<EllipsisText text="Keyboard text" keyboard />);
      expect(container.textContent).toContain('Keyboard text');
    });

    it('supports italic prop', () => {
      const { container } = render(<EllipsisText text="Italic text" italic />);
      expect(container.textContent).toContain('Italic text');
    });
  });

  // ---------- EllipsisTitle ----------
  describe('EllipsisTitle', () => {
    it('renders text prop', () => {
      const { container } = render(<EllipsisTitle text="Hello title" />);
      expect(container.textContent).toContain('Hello title');
    });

    it('renders children', () => {
      const { container } = render(<EllipsisTitle>Children title</EllipsisTitle>);
      expect(container.textContent).toContain('Children title');
    });

    it('renders with Ant Design header element', () => {
      const { container } = render(<EllipsisTitle text="Heading" />);
      const heading = container.querySelector('h1, h2, h3, h4, h5');
      expect(heading).toBeTruthy();
    });

    it('supports level prop', () => {
      const { container } = render(<EllipsisTitle text="Level 2" level={2} />);
      const h2 = container.querySelector('h2');
      expect(h2).toBeTruthy();
    });

    it('supports level 3', () => {
      const { container } = render(<EllipsisTitle text="Level 3" level={3} />);
      expect(container.textContent).toContain('Level 3');
    });

    it('supports level 4', () => {
      const { container } = render(<EllipsisTitle text="Level 4" level={4} />);
      expect(container.textContent).toContain('Level 4');
    });

    it('supports level 5', () => {
      const { container } = render(<EllipsisTitle text="Level 5" level={5} />);
      expect(container.textContent).toContain('Level 5');
    });

    it('supports copyable prop', () => {
      const { container } = render(<EllipsisTitle text="Copyable title" copyable />);
      expect(container.textContent).toContain('Copyable title');
    });
  });

  // ---------- EllipsisLink ----------
  describe('EllipsisLink', () => {
    it('renders text prop', () => {
      const { container } = render(<EllipsisLink text="Hello link" />);
      expect(container.textContent).toContain('Hello link');
    });

    it('renders children', () => {
      const { container } = render(<EllipsisLink>Children link</EllipsisLink>);
      expect(container.textContent).toContain('Children link');
    });

    it('renders as anchor element', () => {
      const { container } = render(<EllipsisLink text="Clickable" />);
      expect(container.querySelector('a')).toBeTruthy();
    });

    it('supports href prop', () => {
      const { container } = render(<EllipsisLink text="Link" href="https://example.com" />);
      const link = container.querySelector('a');
      expect(link?.getAttribute('href')).toBe('https://example.com');
    });

    it('supports target prop', () => {
      const { container } = render(<EllipsisLink text="New tab" href="/test" target="_blank" />);
      const link = container.querySelector('a');
      expect(link?.getAttribute('target')).toBe('_blank');
    });

    it('supports disabled prop', () => {
      const { container } = render(<EllipsisLink text="Disabled link" disabled />);
      expect(container.textContent).toContain('Disabled link');
    });

    it('supports copyable prop', () => {
      const { container } = render(<EllipsisLink text="Copyable link" copyable />);
      expect(container.textContent).toContain('Copyable link');
    });
  });
});
