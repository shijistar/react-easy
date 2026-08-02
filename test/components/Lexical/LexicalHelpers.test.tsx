import {
  $createNodeSelection,
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $setSelection,
  createEditor,
  type ElementNode,
  type LexicalEditor,
} from 'lexical';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearEditorContent,
  findNode,
  findNodes,
  getDomAttributes,
  insertNodeAtCursor,
  insertTextAtCursor,
  shallowEqual,
  updateDomProps,
  updateDomStyle,
} from '../../../src/components/Lexical/helpers';
import { BaseNodeHelper } from '../../../src/components/Lexical/nodes/base';
import { CloseIconNode } from '../../../src/components/Lexical/nodes/CloseIcon';
import { $createDivNode, $isDivNode, DivNode } from '../../../src/components/Lexical/nodes/DivNode';
import { $createExtendTextNode, ExtendTextNode } from '../../../src/components/Lexical/nodes/ExtendTextNode';
import { SelectNode } from '../../../src/components/Lexical/nodes/SelectNode';

// Lexical 0.33.1 Test Rules (spike nested probe demonstration):
// 1. Custom node classes must be registered with createEditor({ nodes: [...] })
// 2. Assertions must never be placed inside the update() callback (errors are swallowed by onError) → collect values with read() after flush, assert outside the callback
// 3. Node references cannot cross update/read closures; nodes obtained inside a read callback must have their values read immediately within the callback
// 4. Errors thrown inside update() are swallowed by onError → use a prior expect(result).toBeTruthy()
const ALL_NODES = [DivNode, ExtendTextNode, CloseIconNode, SelectNode];

function makeEditor(nodes: (typeof ALL_NODES)[number][] = ALL_NODES): LexicalEditor {
  return createEditor({ nodes });
}

async function flush(): Promise<void> {
  await new Promise((r) => setTimeout(r, 0));
}

function readRoot<T>(editor: LexicalEditor, collect: () => T): T {
  let out!: T;
  editor.getEditorState().read(() => {
    out = collect();
  });
  return out;
}

describe('Lexical helpers — insertNodeAtCursor', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });
  afterEach(() => {
    expect(vi.mocked(console.error)).not.toHaveBeenCalled();
    vi.restoreAllMocks();
  });

  it('appends ElementNode directly when no selection (root.append path)', async () => {
    const editor = makeEditor([DivNode]);
    editor.update(() => {
      const div = $createDivNode({ className: 'x' });
      insertNodeAtCursor(editor, div);
    });
    await flush();
    const { len, isDiv } = readRoot(editor, () => {
      const children = $getRoot().getChildren();
      return { len: children.length, isDiv: children.length > 0 && $isDivNode(children[0]) };
    });
    expect(len).toBe(1);
    expect(isDiv).toBe(true);
  });

  it('wraps non-element node in DivNode when no selection', async () => {
    const editor = makeEditor([DivNode, ExtendTextNode]);
    editor.update(() => {
      const textNode = $createExtendTextNode({ text: 'abc' });
      insertNodeAtCursor(editor, textNode);
    });
    await flush();
    const { len, isDiv, text } = readRoot(editor, () => {
      const children = $getRoot().getChildren();
      return {
        len: children.length,
        isDiv: children.length > 0 && $isDivNode(children[0]),
        text: children.length > 0 ? children[0].getTextContent() : '',
      };
    });
    expect(len).toBe(1);
    expect(isDiv).toBe(true);
    expect(text).toBe('abc');
  });

  it('appends to Paragraph when range selection focus is a paragraph', async () => {
    const editor = makeEditor([DivNode]);
    editor.update(() => {
      const root = $getRoot();
      const p = $createParagraphNode();
      root.append(p);
      p.select(0, 0);
      const div = $createDivNode({ className: 'y' });
      insertNodeAtCursor(editor, div);
    });
    await flush();
    const paraChildCount = readRoot(editor, () => {
      const children: ElementNode[] = $getRoot().getChildren();
      return children.length > 0 ? children[0].getChildren().length : -1;
    });
    expect(paraChildCount).toBe(1);
  });

  it('inserts after TextNode when range selection focus is text', async () => {
    const editor = makeEditor([DivNode]);
    editor.update(() => {
      const root = $getRoot();
      const p = $createParagraphNode();
      const text = $createTextNode('hello');
      p.append(text);
      root.append(p);
      text.select(0, 0);
      const div = $createDivNode({ className: 'z' });
      insertNodeAtCursor(editor, div);
    });
    await flush();
    const afterTextIsDiv = readRoot(editor, () => {
      const root = $getRoot();
      const p: ElementNode | null = root.getFirstChild();
      const text = p?.getFirstChild();
      const next = text?.getNextSibling();
      return next !== null && next !== undefined && $isDivNode(next);
    });
    expect(afterTextIsDiv).toBe(true);
  });

  it('appends to DivNode when range selection focus is a DivNode', async () => {
    const editor = makeEditor([DivNode]);
    editor.update(() => {
      const root = $getRoot();
      const div1 = $createDivNode({ className: 'a' });
      root.append(div1);
      div1.select(0, 0);
      const div2 = $createDivNode({ className: 'b' });
      insertNodeAtCursor(editor, div2);
    });
    await flush();
    const div1ChildCount = readRoot(editor, () => {
      const root = $getRoot();
      const first: ElementNode | null = root.getFirstChild();
      return first ? first.getChildren().length : -1;
    });
    expect(div1ChildCount).toBe(1);
  });

  it('uses insertNodes path for non-range selection (NodeSelection replaces selected node)', async () => {
    const editor = makeEditor([DivNode]);
    editor.update(() => {
      const root = $getRoot();
      const p = $createParagraphNode();
      root.append(p);
      const sel = $createNodeSelection();
      sel.add(p.getKey());
      $setSelection(sel);
      const div = $createDivNode({ className: 'ns' });
      insertNodeAtCursor(editor, div);
    });
    await flush();
    // Probe Verification: NodeSelection.insertNodes is
    // replacement semantics (p is replaced by div, root still has 1 child)
    const { count, types } = readRoot(editor, () => {
      const children = $getRoot().getChildren();
      return { count: children.length, types: children.map((c) => c.getType()) };
    });
    expect(count).toBe(1);
    expect(types[0]).toBe('html.div');
  });

  it('falls to selection.insertNodes when range focus is a non-paragraph/text/div element (root)', async () => {
    const editor = makeEditor([DivNode]);
    editor.update(() => {
      const root = $getRoot();
      const p = $createParagraphNode();
      root.append(p);
      // focus points to the root itself → neither Paragraph/Text/Div → insertNodes branch
      root.select(0, 0);
      const div = $createDivNode({ className: 'root-focus' });
      insertNodeAtCursor(editor, div);
    });
    await flush();
    const count = readRoot(editor, () => $getRoot().getChildren().length);
    expect(count).toBeGreaterThanOrEqual(1);
  });

  it('handles range selection whose focus node no longer exists (lastNode null)', async () => {
    const editor = makeEditor([DivNode]);
    editor.update(() => {
      const root = $getRoot();
      const p = $createParagraphNode();
      root.append(p);
      p.select(0, 0);
      // Remove focus node → selection.focus.getNode() returns null → L29 false branch
      p.remove();
      const div = $createDivNode({ className: 'no-focus' });
      insertNodeAtCursor(editor, div);
    });
    await flush();
    // Passes if no error is thrown (L29-41 skipped overall)
    const count = readRoot(editor, () => $getRoot().getChildren().length);
    expect(count).toBeGreaterThanOrEqual(1);
  });
});

describe('Lexical helpers — insertTextAtCursor / clearEditorContent', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });
  afterEach(() => {
    expect(vi.mocked(console.error)).not.toHaveBeenCalled();
    vi.restoreAllMocks();
  });

  it('inserts text into existing paragraph when no selection', async () => {
    const editor = makeEditor();
    editor.update(() => {
      $getRoot().append($createParagraphNode());
    });
    await flush();
    insertTextAtCursor(editor, 'hello');
    await flush();
    const text = readRoot(editor, () => $getRoot().getTextContent());
    expect(text).toBe('hello');
  });

  it('wraps text in DivNode when root has no paragraph', async () => {
    const editor = makeEditor([DivNode]);
    insertTextAtCursor(editor, 'abc');
    await flush();
    const { text, isDiv } = readRoot(editor, () => {
      const children = $getRoot().getChildren();
      return {
        text: $getRoot().getTextContent(),
        isDiv: children.length > 0 && $isDivNode(children[0]),
      };
    });
    expect(text).toBe('abc');
    expect(isDiv).toBe(true);
  });

  it('inserts text at selection position', async () => {
    const editor = makeEditor();
    editor.update(() => {
      const root = $getRoot();
      const p = $createParagraphNode();
      const text = $createTextNode('world');
      p.append(text);
      root.append(p);
      text.select(0, 0);
    });
    await flush();
    insertTextAtCursor(editor, 'hello');
    await flush();
    const text = readRoot(editor, () => $getRoot().getTextContent());
    expect(text).toBe('helloworld');
  });

  it('clearEditorContent resets non-empty editor', async () => {
    const editor = makeEditor([DivNode]);
    insertTextAtCursor(editor, 'hello');
    await flush();
    expect(readRoot(editor, () => $getRoot().getTextContent())).toBe('hello');
    clearEditorContent(editor);
    await flush();
    expect(readRoot(editor, () => $getRoot().getTextContent())).toBe('');
  });
});

describe('Lexical helpers — findNode / findNodes', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });
  afterEach(() => {
    expect(vi.mocked(console.error)).not.toHaveBeenCalled();
    vi.restoreAllMocks();
  });

  it('findNode returns first match or undefined', async () => {
    const editor = makeEditor();
    editor.update(() => {
      const root = $getRoot();
      const p = $createParagraphNode();
      p.append($createTextNode('a'));
      root.append(p);
    });
    await flush();
    const firstText = readRoot(editor, () => {
      const first = findNode(editor, (node) => node.getType() === 'text');
      return first ? first.getTextContent() : null;
    });
    expect(firstText).toBe('a');
    const none = readRoot(editor, () => findNode(editor, () => false));
    expect(none).toBeUndefined();
  });

  it('findNodes respects stopOnFirstMatch', async () => {
    const editor = makeEditor();
    editor.update(() => {
      const root = $getRoot();
      const p1 = $createParagraphNode();
      p1.append($createTextNode('a'));
      root.append(p1);
      const p2 = $createParagraphNode();
      p2.append($createTextNode('b'));
      root.append(p2);
    });
    await flush();
    const { allLen, firstLen } = readRoot(editor, () => {
      const all = findNodes(editor, (node) => node.getType() === 'text');
      const first = findNodes(editor, (node) => node.getType() === 'text', { stopOnFirstMatch: true });
      return { allLen: all.length, firstLen: first.length };
    });
    expect(allLen).toBe(2);
    expect(firstLen).toBe(1);
  });
});

describe('Lexical helpers — DOM prop utilities', () => {
  it('updateDomProps writes className/style/attrs and clears previous', () => {
    const div = document.createElement('div');
    updateDomProps(div, {
      className: 'a',
      style: { color: 'red', fontSize: '12px' },
      'data-x': '1',
      onClick: () => undefined,
    } as never);
    expect(div.className).toBe('a');
    expect(div.getAttribute('data-x')).toBe('1');
    expect(div.style.color).toBe('red');
    expect(typeof (div as unknown as { onclick?: unknown }).onclick).toBe('function');
    updateDomProps(div, { className: 'b' } as never);
    expect(div.className).toBe('b');
    expect(div.getAttribute('style')).toBeNull();
    expect(div.getAttribute('data-x')).toBeNull();
  });

  it('updateDomProps preserves data-lexical attributes while clearing others', () => {
    const div = document.createElement('div');
    div.setAttribute('data-lexical-text', 'keep');
    div.setAttribute('data-custom', 'drop');
    updateDomProps(div, { className: 'x' } as never);
    expect(div.getAttribute('data-lexical-text')).toBe('keep');
    expect(div.getAttribute('data-custom')).toBeNull();
  });

  it('updateDomProps skips undefined style values and null/undefined attrs', () => {
    const div = document.createElement('div');
    updateDomProps(div, {
      style: { color: 'blue', opacity: undefined },
      title: null,
      'data-ok': undefined,
    } as never);
    expect(div.style.color).toBe('blue');
    expect(div.getAttribute('title')).toBeNull();
    expect(div.getAttribute('data-ok')).toBeNull();
  });

  it('updateDomProps no-op on undefined dom and empty props', () => {
    expect(() => updateDomProps(undefined, { className: 'x' } as never)).not.toThrow();
    const div = document.createElement('div');
    updateDomProps(div, undefined as never);
    expect(div.getAttribute('style')).toBeNull();
    expect(div.className).toBe('');
  });

  it('updateDomStyle writes and clears, skips undefined values', () => {
    const div = document.createElement('div');
    updateDomStyle(div, { display: 'block' });
    expect(div.style.display).toBe('block');
    updateDomStyle(div, { opacity: undefined } as never);
    expect(div.style.opacity).toBe('');
    updateDomStyle(div, undefined);
    expect(div.getAttribute('style')).toBeNull();
    expect(() => updateDomStyle(undefined, { display: 'block' })).not.toThrow();
  });

  it('getDomAttributes collects attrs/className/style, skips class/style attrs', () => {
    const div = document.createElement('div');
    div.setAttribute('data-a', '1');
    div.setAttribute('class', 'ignored');
    div.setAttribute('style', 'ignored');
    div.className = 'real-cls';
    div.style.color = 'red';
    const attrs = getDomAttributes(div) as Record<string, unknown>;
    expect(attrs?.['data-a']).toBe('1');
    expect(attrs?.className).toBe('real-cls');
    expect((attrs?.style as Record<string, string> | undefined)?.color).toBe('red');
    expect(getDomAttributes(undefined)).toBeUndefined();
  });

  it('getDomAttributes omits className but returns empty style object (jsdom style always truthy)', () => {
    const div = document.createElement('div');
    div.setAttribute('data-b', '2');
    const attrs = getDomAttributes(div) as Record<string, string | object> | undefined;
    expect(attrs?.['data-b']).toBe('2');
    expect(attrs?.className).toBeUndefined();
    // Probe verification: In jsdom, div.style is always a truthy CSSStyleDeclaration → returns {} instead of undefined
    expect(attrs?.style).toEqual({});
  });

  it('getDomAttributes returns empty object for style-less fake dom (L270 false branch)', () => {
    // Probe verification: In jsdom, real HTMLElement.style is always truthy; use a fake object without style to hit the false branch
    const fakeDom = {
      attributes: [],
      className: '',
      style: undefined,
    } as never;
    const attrs = getDomAttributes(fakeDom) as Record<string, unknown> | undefined;
    expect(attrs).toEqual({});
  });

  it('shallowEqual covers style nesting, null, key-count mismatch', () => {
    expect(shallowEqual({ style: { color: 'red' } }, { style: { color: 'red' } })).toBe(true);
    expect(shallowEqual({ style: { color: 'red' } }, { style: { color: 'blue' } })).toBe(false);
    expect(shallowEqual({ a: 1, b: 2 }, { a: 1 })).toBe(false);
    expect(shallowEqual({ a: 1 }, { a: 2 })).toBe(false);
    expect(shallowEqual(null, {})).toBe(false);
    expect(shallowEqual({}, null)).toBe(false);
    expect(shallowEqual(1, 1)).toBe(true);
  });
});

describe('Lexical base — BaseNodeHelper', () => {
  it('guards remove/replace and strips helper flags', () => {
    const calls = { remove: 0, replace: 0 };
    const helper = new BaseNodeHelper({ canBeRemoved: false, canBeReplaced: false }, {
      remove: () => {
        calls.remove += 1;
      },
      replace: (n: unknown) => n,
    } as never);
    helper.hooks.remove();
    helper.hooks.replace({} as never);
    expect(calls.remove).toBe(0);
    expect(calls.replace).toBe(0);

    const allowed = new BaseNodeHelper(undefined, {
      remove: () => {
        calls.remove += 1;
      },
      replace: (n: unknown) => n,
    } as never);
    allowed.hooks.remove();
    expect(calls.remove).toBe(1);

    const stripped = helper.getUnderlyingProps({ canBeRemoved: false, canBeReplaced: false, x: 1 } as never);
    expect((stripped as { x?: number }).x).toBe(1);
    expect('canBeRemoved' in (stripped as object)).toBe(false);
  });
});
