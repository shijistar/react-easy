import { act, fireEvent, render, waitFor } from '@testing-library/react';
import { $createParagraphNode, $getNodeByKey, $getRoot, createEditor, type LexicalEditor } from 'lexical';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CloseIconNode } from '../../../src/components/Lexical/nodes/CloseIcon';
import { DivNode } from '../../../src/components/Lexical/nodes/DivNode';
import { ExtendTextNode } from '../../../src/components/Lexical/nodes/ExtendTextNode';
import {
  $createSelectNode,
  $insertSelectNode,
  $isSelectNode,
  SelectNode,
} from '../../../src/components/Lexical/nodes/SelectNode';

// Lexical 0.33.1 Test Rules (spike empirical) SelectComponent rendering dependencies:
// - decorate → SelectComponent uses useLexicalComposerContext → mock inject real editor
// - mock editor must be the same editor that created the node (otherwise node.setValue across editors will throw an error)
const { mockEditorRef } = vi.hoisted(() => ({ mockEditorRef: { current: null as LexicalEditor | null } }));

vi.mock('@lexical/react/LexicalComposerContext', () => ({
  useLexicalComposerContext: () => [mockEditorRef.current, null],
}));

// The default generic value for SelectNode is any (same criterion as in the source code SelectNode.tsx),
// using a type alias avoids repeatedly writing any in multiple type positions.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySelectNode = SelectNode<any, any>;

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

describe('Lexical SelectNode — class methods', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });
  afterEach(() => {
    try {
      expect(vi.mocked(console.error)).not.toHaveBeenCalled();
    } finally {
      vi.restoreAllMocks();
    }
  });

  it('getType / clone / guard / factory', async () => {
    const editor = makeEditor([SelectNode]);
    editor.update(() => {
      const node = $createSelectNode({ options: [{ value: 'a', label: 'A' }], defaultValue: 'a' });
      expect(node.getType()).toBe('antd.Select');
      expect($isSelectNode(node)).toBe(true);
      expect($isSelectNode(null)).toBe(false);
      const cloned = SelectNode.clone(node);
      expect(cloned.getType()).toBe('antd.Select');
      expect(cloned.getValue()).toBe('a');
    });
    await flush();
  });

  it('create without props covers BaseDecoratorNode props||{} branch (L167)', async () => {
    const editor = makeEditor([SelectNode]);
    let node!: AnySelectNode;
    editor.update(() => {
      node = $createSelectNode();
    });
    await flush();
    expect(node).toBeTruthy();
    expect(node.getValue()).toBeUndefined();
  });

  it('createDOM applies containerStyle', async () => {
    const editor = makeEditor([SelectNode]);
    let node!: AnySelectNode;
    editor.update(() => {
      node = $createSelectNode({ containerStyle: { display: 'block' } });
    });
    await flush();
    const dom = node.createDOM();
    expect(dom.tagName).toBe('SPAN');
    expect(dom.style.display).toBe('block');
  });

  it('updateDOM returns propsChanged', async () => {
    const editor = makeEditor([SelectNode]);
    let node!: AnySelectNode;
    let nodeChanged!: AnySelectNode;
    let nodeSame!: AnySelectNode;
    editor.update(() => {
      // Same props reference → shallowEqual shallow comparison equal
      const sharedProps = { defaultValue: 'a', options: [{ value: 'a', label: 'A' }] };
      node = $createSelectNode(sharedProps);
      nodeChanged = $createSelectNode({ defaultValue: 'b', options: [{ value: 'b', label: 'B' }] });
      nodeSame = $createSelectNode(sharedProps);
    });
    await flush();
    const dom = document.createElement('span');
    expect(nodeChanged.updateDOM(node, dom)).toBe(true);
    expect(nodeSame.updateDOM(node, dom)).toBe(false);
  });

  it('isInline always true', async () => {
    const editor = makeEditor([SelectNode]);
    let inline!: boolean;
    editor.update(() => {
      inline = $createSelectNode({}).isInline();
    });
    await flush();
    expect(inline).toBe(true);
  });

  it('getTextContent: value mode with spaceAround (default)', async () => {
    const editor = makeEditor([SelectNode]);
    let text!: string;
    editor.update(() => {
      text = $createSelectNode({ options: [{ value: 'a', label: 'Alpha' }], defaultValue: 'a' }).getTextContent();
    });
    await flush();
    expect(text).toBe(' a ');
  });

  it('getTextContent: label mode', async () => {
    const editor = makeEditor([SelectNode]);
    let text!: string;
    editor.update(() => {
      text = $createSelectNode({
        options: [{ value: 'a', label: 'Alpha' }],
        defaultValue: 'a',
        textContentMode: 'label',
      }).getTextContent();
    });
    await flush();
    expect(text).toBe(' Alpha ');
  });

  it('getTextContent: label mode falls back to value when option not found (L102 cond-expr)', async () => {
    const editor = makeEditor([SelectNode]);
    let text!: string;
    editor.update(() => {
      // textContentMode='label' but value='missing' is not in options → option?.label falsy → fallback to valueContent
      text = $createSelectNode({
        options: [{ value: 'a', label: 'Alpha' }],
        defaultValue: 'missing',
        textContentMode: 'label',
      }).getTextContent();
    });
    await flush();
    expect(text).toBe(' missing ');
  });

  it('getTextContent: spaceAround=false, no value → empty content', async () => {
    const editor = makeEditor([SelectNode]);
    let text!: string;
    editor.update(() => {
      text = $createSelectNode({ defaultValue: 'x', spaceAround: false }).getTextContent();
      const noValue = $createSelectNode({ spaceAround: false }).getTextContent();
      expect(noValue).toBe('');
    });
    await flush();
    expect(text).toBe('x');
  });

  it('setValue updates value (with editor context)', async () => {
    const editor = makeEditor([SelectNode]);
    let value!: string | undefined;
    editor.update(() => {
      const node = $createSelectNode({ defaultValue: 'a' });
      node.setValue('b');
      value = node.getValue();
    });
    await flush();
    expect(value).toBe('b');
  });

  it('getProp / updateProps', async () => {
    const editor = makeEditor([SelectNode]);
    let prop: unknown;
    editor.update(() => {
      const node = $createSelectNode({ options: [{ value: 'a', label: 'A' }], defaultValue: 'a' });
      node.updateProps({ textContentMode: 'label' });
      prop = node.getProp('textContentMode') ?? undefined;
    });
    await flush();
    expect(prop).toBe('label');
  });

  it('importJSON / exportJSON roundtrip', async () => {
    const editor = makeEditor([SelectNode]);
    let json!: ReturnType<AnySelectNode['exportJSON']>;
    editor.update(() => {
      json = $createSelectNode({ options: [{ value: 'a', label: 'A' }], defaultValue: 'a' }).exportJSON();
    });
    await flush();
    expect(json.type).toBe('antd.Select');
    const editor2 = makeEditor([SelectNode]);
    let value!: string | undefined;
    editor2.update(() => {
      const imported = SelectNode.importJSON(json);
      value = imported.getValue();
    });
    await flush();
    expect(value).toBe('a');
  });
});

describe('Lexical SelectNode — decorate render chain', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    /* 
      antd v6 Select internally uses @rc-component/resize-observer which 
      requires a global ResizeObserver (not available in jsdom). 
      Refer to the existing pattern in EditableText.form.test.tsx: 
      a no-op stub is sufficient (antd only needs to observe without throwing errors). 
    */
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {
          // noop: antd rc-resize-observer only requires observe to exist
        }
        unobserve() {
          // noop
        }
        disconnect() {
          // noop
        }
      },
    );
  });
  afterEach(() => {
    try {
      expect(vi.mocked(console.error)).not.toHaveBeenCalled();
    } finally {
      vi.restoreAllMocks();
      vi.unstubAllGlobals();
    }
  });

  it('decorate renders antd Select with value', async () => {
    const editor = makeEditor([SelectNode]);
    let node!: AnySelectNode;
    editor.update(() => {
      node = $createSelectNode({ options: [{ value: 'a', label: 'Alpha' }], defaultValue: 'a' });
    });
    mockEditorRef.current = editor;
    const { container } = render(node.decorate() as never);
    // antd Select rendered to container
    expect(container.querySelector('.ant-select')).toBeTruthy();
    expect(container.textContent).toContain('Alpha');
  });

  it('SelectComponent onChange writes value through editor.update', async () => {
    const editor = makeEditor([SelectNode]);
    let node!: AnySelectNode;
    let changedValue: unknown;
    editor.update(() => {
      node = $createSelectNode({
        options: [
          { value: 'a', label: 'Alpha' },
          { value: 'b', label: 'Beta' },
        ],
        defaultValue: 'a',
        onChange: (v: string) => {
          changedValue = v;
        },
      });
      // Must be mounted to the editor tree: inside editor.update of SelectComponent.handleChange
      // node.setValue() requires the node to exist in the active editor state
      $getRoot().append(node);
    });
    await flush();
    mockEditorRef.current = editor;
    const { container } = render(node.decorate() as never);
    // antd v6 Select has no .ant-select-selector, use .ant-select-content to open the dropdown (probed and verified)
    await act(async () => {
      fireEvent.mouseDown(container.querySelector('.ant-select-content')!);
    });
    await waitFor(() => {
      expect(document.body.querySelector('.ant-select-item-option')).toBeTruthy();
    });
    const options = Array.from(document.body.querySelectorAll('.ant-select-item-option'));
    const beta = options.find((el) => el.textContent?.includes('Beta'));
    expect(beta).toBeTruthy();
    await act(async () => {
      fireEvent.click(beta!);
    });
    await flush();
    expect(changedValue).toBe('b');
    // node.setValue modifies the latest cloned node by key via getWritable();
    // the outer captured node reference is the old copy → read the latest node by key inside the read callback
    const currentValue = readRoot(editor, () => {
      const latest = $getNodeByKey(node.getKey());
      return latest ? (latest as AnySelectNode).getValue() : undefined;
    });
    expect(currentValue).toBe('b');
  });

  it('SelectComponent onClear clears value', async () => {
    const editor = makeEditor([SelectNode]);
    let node!: AnySelectNode;
    let cleared = 0;
    editor.update(() => {
      node = $createSelectNode({
        options: [{ value: 'a', label: 'Alpha' }],
        defaultValue: 'a',
        allowClear: true,
        onClear: () => {
          cleared += 1;
        },
      });
      // Must be mounted to the editor tree: inside handleClear node.setValue requires the active state
      $getRoot().append(node);
    });
    await flush();
    mockEditorRef.current = editor;
    const { container } = render(node.decorate() as never);
    // Probed and verified: antd v6 clear button must be triggered with a combination of mouseDown + click (pure click/native click does not trigger)
    await act(async () => {
      fireEvent.mouseDown(container.querySelector('.ant-select-clear')!);
      fireEvent.click(container.querySelector('.ant-select-clear')!);
    });
    await flush();
    expect(cleared).toBe(1);
    // Same reason as the onChange test case: setValue modifies the latest cloned node via getWritable(), must read the latest node by key
    const currentValue = readRoot(editor, () => {
      const latest = $getNodeByKey(node.getKey());
      return latest ? (latest as AnySelectNode).getValue() : undefined;
    });
    expect(currentValue).toBeUndefined();
  });

  it('$insertSelectNode appends node into editor', async () => {
    const editor = makeEditor([SelectNode]);
    editor.update(() => {
      $getRoot().append($createParagraphNode());
      $insertSelectNode(editor, { options: [{ value: 'a', label: 'A' }], defaultValue: 'a' });
    });
    await flush();
    const types = readRoot(editor, () =>
      $getRoot()
        .getChildren()
        .map((c) => c.getType()),
    );
    expect(types).toContain('antd.Select');
  });
});
