import type { ReactElement } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Playground, Simple } from '../../.storybook/stories/hooks/usePropState/index.stories';

// antd v6 responsiveObserver / useBreakpoint require matchMedia in jsdom.
if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {
      // stub method (deprecated API)
    },
    removeListener: () => {
      // stub method (deprecated API)
    },
    addEventListener: () => {
      // stub method
    },
    removeEventListener: () => {
      // stub method
    },
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
}

const renderStory = (args: { controlled: boolean; enabled: boolean; useIsEqual: boolean }) => {
  const element = Playground.render!(args, {} as never) as ReactElement;
  const { container } = render(element);
  return container;
};

const hasLabelValue = (container: HTMLElement, label: string, value: string) =>
  Array.from(container.querySelectorAll('span')).some((el) => el.textContent === `${label}: ${value}`);

const setLocalDraft = (value: string) => {
  fireEvent.change(screen.getByPlaceholderText('Value edited locally'), { target: { value } });
  fireEvent.click(screen.getByRole('button', { name: 'Set local state' }));
};

describe('usePropState story', () => {
  it('renders translated labels and starts in sync', () => {
    const container = renderStory({ controlled: true, enabled: true, useIsEqual: false });

    expect(screen.getByText('State synced with a prop')).toBeTruthy();
    expect(screen.getByText('In sync')).toBeTruthy();
    expect(container.textContent).not.toContain('storybook.stories.usePropState');
    expect(hasLabelValue(container, 'Prop', 'react-easy')).toBe(true);
    expect(hasLabelValue(container, 'State', 'react-easy')).toBe(true);
  });

  it('syncs the internal state when a new value is pushed to the prop', () => {
    const container = renderStory({ controlled: true, enabled: true, useIsEqual: false });

    fireEvent.change(screen.getByPlaceholderText('Value owned by the parent'), { target: { value: 'updated' } });
    fireEvent.click(screen.getByRole('button', { name: 'Push to prop' }));

    expect(hasLabelValue(container, 'Prop', 'updated')).toBe(true);
    expect(hasLabelValue(container, 'State', 'updated')).toBe(true);
  });

  it('keeps a local edit until the prop changes', () => {
    const container = renderStory({ controlled: true, enabled: true, useIsEqual: false });

    setLocalDraft('local-draft');

    expect(hasLabelValue(container, 'State', 'local-draft')).toBe(true);
    expect(hasLabelValue(container, 'Prop', 'react-easy')).toBe(true);
    expect(screen.getByText('Diverged')).toBeTruthy();
  });

  it('resets a local edit when the prop object identity is replaced without isEqual', () => {
    const container = renderStory({ controlled: true, enabled: true, useIsEqual: false });

    setLocalDraft('local-draft');
    fireEvent.click(screen.getByRole('button', { name: 'Replace prop object (same content)' }));

    expect(hasLabelValue(container, 'State', 'react-easy')).toBe(true);
    expect(screen.getByText('In sync')).toBeTruthy();
  });

  it('keeps a local edit when the prop object identity is replaced with isEqual', () => {
    const container = renderStory({ controlled: true, enabled: true, useIsEqual: true });

    setLocalDraft('local-draft');
    fireEvent.click(screen.getByRole('button', { name: 'Replace prop object (same content)' }));

    expect(hasLabelValue(container, 'State', 'local-draft')).toBe(true);
    expect(screen.getByText('Diverged')).toBeTruthy();
  });

  it('resets a local edit back to the prop when controlled', () => {
    const container = renderStory({ controlled: true, enabled: true, useIsEqual: false });

    setLocalDraft('local-draft');
    fireEvent.click(screen.getByRole('button', { name: 'Reset local to prop' }));

    expect(hasLabelValue(container, 'State', 'react-easy')).toBe(true);
    expect(screen.getByText('In sync')).toBeTruthy();
  });

  it('uses the fallback and frees local edits when uncontrolled', () => {
    const container = renderStory({ controlled: false, enabled: true, useIsEqual: false });

    expect(screen.getByText('Uncontrolled (prop is undefined)')).toBeTruthy();
    expect(hasLabelValue(container, 'State', 'untitled')).toBe(true);

    setLocalDraft('free');
    expect(hasLabelValue(container, 'State', 'free')).toBe(true);

    // Prop controls are disabled in uncontrolled mode.
    expect(screen.getByRole('button', { name: 'Push to prop' })).toHaveProperty('disabled', true);
    expect(screen.getByRole('button', { name: 'Replace prop object (same content)' })).toHaveProperty('disabled', true);
  });

  it('resets a local edit back to the fallback when uncontrolled', () => {
    const container = renderStory({ controlled: false, enabled: true, useIsEqual: false });

    setLocalDraft('free');
    fireEvent.click(screen.getByRole('button', { name: 'Reset local to prop' }));

    // The prop is undefined, so the baseline is the fallback value, not the parent's object.
    expect(hasLabelValue(container, 'State', 'untitled')).toBe(true);
  });

  it('records every action in the sync log', () => {
    const container = renderStory({ controlled: true, enabled: true, useIsEqual: false });

    expect(screen.getByText('No events yet')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Replace prop object (same content)' }));

    expect(screen.queryByText('No events yet')).toBeNull();
    expect(container.textContent).toContain('identity');
  });
});

describe('usePropState Simple story', () => {
  const renderSimple = () => {
    // The Simple story takes no args; the meta-level args are required by the type only.
    const element = Simple.render!({ controlled: true, enabled: true, useIsEqual: false }, {} as never) as ReactElement;
    const { container } = render(element);
    return container;
  };

  const simpleInput = () => screen.getByPlaceholderText('Edit the local draft') as HTMLInputElement;

  it('renders the no-options snippet and translated labels', () => {
    const container = renderSimple();

    expect(screen.getByText('Simplest form: no options')).toBeTruthy();
    expect(screen.getByText('const [draft, setDraft] = usePropState(title);')).toBeTruthy();
    expect(container.textContent).not.toContain('storybook.stories.usePropState');
  });

  it('starts in sync with the prop value', () => {
    renderSimple();

    expect(screen.getByText('In sync')).toBeTruthy();
    expect(simpleInput().value).toBe('React Easy');
  });

  it('keeps a local edit and reports it as diverged', () => {
    renderSimple();

    fireEvent.change(simpleInput(), { target: { value: 'my draft' } });

    expect(simpleInput().value).toBe('my draft');
    expect(screen.getByText('Diverged')).toBeTruthy();
  });

  it('replaces the local edit when the parent pushes a different title', () => {
    renderSimple();

    fireEvent.change(simpleInput(), { target: { value: 'my draft' } });
    fireEvent.click(screen.getByRole('button', { name: 'Prop State' }));

    expect(simpleInput().value).toBe('Prop State');
    expect(screen.getByText('In sync')).toBeTruthy();
  });

  it('ignores a push of the title the parent already holds', () => {
    renderSimple();

    fireEvent.change(simpleInput(), { target: { value: 'my draft' } });
    // The prop did not change, so the default Object.is comparison must not resync.
    fireEvent.click(screen.getByRole('button', { name: 'React Easy' }));

    expect(simpleInput().value).toBe('my draft');
    expect(screen.getByText('Diverged')).toBeTruthy();
  });
});
