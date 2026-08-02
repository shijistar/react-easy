import { act, fireEvent, render, waitFor } from '@testing-library/react';
import { $createParagraphNode, $getNodeByKey, $getRoot, createEditor, type LexicalEditor } from 'lexical';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CloseIconNode } from '../../src/components/Lexical/nodes/CloseIcon';
import { DivNode } from '../../src/components/Lexical/nodes/DivNode';
import { ExtendTextNode } from '../../src/components/Lexical/nodes/ExtendTextNode';
import {
  $createSelectNode,
  $insertSelectNode,
  $isSelectNode,
  SelectNode,
} from '../../src/components/Lexical/nodes/SelectNode';

// Lexical 0.33.1 测试规则（spike 实证）+ SelectComponent 渲染依赖：
// - decorate → SelectComponent 使用 useLexicalComposerContext → mock 注入真实 editor
// - mock editor 必须是创建 node 的同一 editor（否则 node.setValue 跨 editor 报错）
const { mockEditorRef } = vi.hoisted(() => ({ mockEditorRef: { current: null as LexicalEditor | null } }));

vi.mock('@lexical/react/LexicalComposerContext', () => ({
  useLexicalComposerContext: () => [mockEditorRef.current, null],
}));

// SelectNode 泛型默认值即 any（源码 SelectNode.tsx 同判据），
// 类型别名避免在多个类型位置重复书写 any。
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
      // 同一 props 引用 → shallowEqual 浅比较相等
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
      // textContentMode='label' 但 value='missing' 不在 options → option?.label falsy → 回退 valueContent
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
    let prop!: string | undefined;
    editor.update(() => {
      const node = $createSelectNode({ options: [{ value: 'a', label: 'A' }], defaultValue: 'a' });
      node.updateProps({ textContentMode: 'label' });
      prop = node.getProp('textContentMode');
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
    // antd v6 Select 内部 @rc-component/resize-observer 需要全局 ResizeObserver（jsdom 无）
    // 参照 EditableText.form.test.tsx 既有模式：no-op stub 即可（antd 只需 observe 不抛错）
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
    // antd Select 渲染到容器
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
      // 必须挂载到 editor 树：SelectComponent.handleChange 的 editor.update 内
      // node.setValue() 需要 node 存在于 active editor state
      $getRoot().append(node);
    });
    await flush();
    mockEditorRef.current = editor;
    const { container } = render(node.decorate() as never);
    // antd v6 Select 无 .ant-select-selector，用 .ant-select-content 打开下拉（探针实证）
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
    // node.setValue 经 getWritable() 修改的是按 key 克隆的最新节点；
    // 外层捕获的 node 引用是旧副本 → read 回调内按 key 取最新节点读值
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
      // 挂载到 editor 树（handleClear 内 node.setValue 需要 active state）
      $getRoot().append(node);
    });
    await flush();
    mockEditorRef.current = editor;
    const { container } = render(node.decorate() as never);
    // 探针实证：antd v6 clear 按钮必须 mouseDown + click 组合触发（纯 click/原生 click 不触发）
    await act(async () => {
      fireEvent.mouseDown(container.querySelector('.ant-select-clear')!);
      fireEvent.click(container.querySelector('.ant-select-clear')!);
    });
    await flush();
    expect(cleared).toBe(1);
    // 与 onChange 用例同因：setValue 经 getWritable() 改克隆节点，须按 key 取最新节点读值
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
