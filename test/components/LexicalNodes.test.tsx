import { render } from '@testing-library/react';
import { $createParagraphNode, $getRoot, createEditor, type LexicalEditor } from 'lexical';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { $createCloseIconNode, $isCloseIconNode, CloseIconNode } from '../../src/components/Lexical/nodes/CloseIcon';
import { $createDivNode, $isDivNode, DivNode } from '../../src/components/Lexical/nodes/DivNode';
import {
  $createExtendTextNode,
  $isExtendTextNode,
  ExtendTextNode,
} from '../../src/components/Lexical/nodes/ExtendTextNode';
import { SelectNode } from '../../src/components/Lexical/nodes/SelectNode';

// Lexical 0.33.1 测试规则（spike 实证）：
// 1. 自定义节点类必须注册 createEditor({ nodes: [...] })
// 2. 断言绝不能放在 update() 回调内（抛错被 onError 吞）→ flush 后 read() 收集值，回调外断言
// 3. 节点引用不能跨 update/read 闭包；read 回调内取的节点必须立即在回调内读值
// 4. update() 内抛错被 onError 吞掉 → 前置 expect(result).toBeTruthy()
const ALL_NODES = [DivNode, ExtendTextNode, CloseIconNode, SelectNode];

function makeEditor(nodes: (typeof ALL_NODES)[number][] = ALL_NODES): LexicalEditor {
  return createEditor({ nodes });
}

async function flush(): Promise<void> {
  await new Promise((r) => setTimeout(r, 0));
}

describe('Lexical DivNode', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });
  afterEach(() => {
    expect(vi.mocked(console.error)).not.toHaveBeenCalled();
    vi.restoreAllMocks();
  });

  it('getType / clone / factory / guard', async () => {
    const editor = makeEditor([DivNode]);
    let node!: DivNode;
    editor.update(() => {
      node = $createDivNode({ className: 'a', style: { display: 'block' } });
      expect(node.getType()).toBe('html.div');
      expect($isDivNode(node)).toBe(true);
      expect($isDivNode(null)).toBe(false);
      const cloned = DivNode.clone(node);
      expect(cloned.getType()).toBe('html.div');
    });
    await flush();
    expect(node).toBeTruthy();
  });

  it('createDOM renders props onto div', async () => {
    const editor = makeEditor([DivNode]);
    let node!: DivNode;
    editor.update(() => {
      node = $createDivNode({ className: 'div-a', style: { display: 'block' } } as never);
      node.__props = { ...node.__props, 'data-x': '1' } as never;
    });
    await flush();
    const dom = node.createDOM();
    expect(dom.tagName).toBe('DIV');
    expect(dom.className).toBe('div-a');
    expect(dom.style.display).toBe('block');
    expect(dom.getAttribute('data-x')).toBe('1');
  });

  it('updateDOM applies props when changed, skips when unchanged', async () => {
    const editor = makeEditor([DivNode]);
    let prev!: DivNode;
    let next!: DivNode;
    let nextSame!: DivNode;
    editor.update(() => {
      prev = $createDivNode({ className: 'a' });
      next = $createDivNode({ className: 'b' });
      nextSame = $createDivNode({ className: 'a' });
    });
    await flush();
    const dom = document.createElement('div');
    dom.className = 'old';
    const changed = next.updateDOM(prev, dom);
    expect(changed).toBe(false);
    expect(dom.className).toBe('b');
    const unchanged = nextSame.updateDOM(prev, dom);
    expect(unchanged).toBe(false);
    expect(dom.className).toBe('b');
  });

  it('importDOM converts div to node, non-div to null', async () => {
    const editor = makeEditor([DivNode]);
    let result!: { divType: string | null; spanType: string | null };
    editor.update(() => {
      const map = DivNode.importDOM();
      expect(map).toBeTruthy();
      const divConv = map!.div(document.createElement('div'));
      const spanConv = map!.div(document.createElement('span'));
      const divOut = divConv?.conversion(divConv ? document.createElement('div') : (null as never));
      const spanOut = spanConv?.conversion(spanConv ? document.createElement('span') : (null as never));
      result = {
        divType: divOut?.node && !Array.isArray(divOut.node) ? divOut.node.getType() : null,
        spanType: spanOut?.node && !Array.isArray(spanOut.node) ? spanOut.node.getType() : null,
      };
    });
    await flush();
    expect(result.divType).toBe('html.div');
    expect(result.spanType).toBeNull();
  });

  it('importJSON / exportJSON roundtrip preserves props', async () => {
    const editor = makeEditor([DivNode]);
    let json!: ReturnType<DivNode['exportJSON']>;
    editor.update(() => {
      const node = $createDivNode({ className: 'c', style: { color: 'red' } });
      json = node.exportJSON();
    });
    await flush();
    expect(json.type).toBe('html.div');
    const editor2 = makeEditor([DivNode]);
    let imported!: DivNode;
    editor2.update(() => {
      imported = DivNode.importJSON(json);
    });
    await flush();
    expect(imported.getType()).toBe('html.div');
  });

  it('exportDOM returns created element', async () => {
    const editor = makeEditor([DivNode]);
    let node!: DivNode;
    editor.update(() => {
      node = $createDivNode({ className: 'exported' });
    });
    await flush();
    const { element } = node.exportDOM();
    const el = element as HTMLElement | null;
    expect(el?.tagName).toBe('DIV');
    expect(el?.className).toBe('exported');
  });

  it('isInline detects inline display values', async () => {
    const editor = makeEditor([DivNode]);
    let inline!: boolean;
    let block!: boolean;
    let defaultInline!: boolean;
    editor.update(() => {
      inline = $createDivNode({ style: { display: 'inline-block' } }).isInline();
      block = $createDivNode({ style: { display: 'block' } }).isInline();
      defaultInline = $createDivNode({}).isInline();
    });
    await flush();
    expect(inline).toBe(true);
    expect(block).toBe(false);
    expect(defaultInline).toBe(false);
  });

  it('updateProps deep-merges style and props', async () => {
    const editor = makeEditor([DivNode]);
    let node!: DivNode;
    let style!: string | undefined;
    editor.update(() => {
      node = $createDivNode({ className: 'a', style: { color: 'red' } });
      node.updateProps({ className: 'b', style: { fontSize: '12px' } });
      style = node.getProp('style')?.fontSize;
    });
    await flush();
    expect(style).toBe('12px');
    expect(node.getProp('className')).toBe('b');
    expect(node.getProp('style')?.color).toBe('red');
  });

  it('BaseElementNode defaults via DivNode', async () => {
    const editor = makeEditor([DivNode]);
    let defaults!: { empty: boolean; before: boolean; after: boolean };
    editor.update(() => {
      const node = $createDivNode({});
      defaults = {
        empty: node.canBeEmpty(),
        before: node.canInsertTextBefore(),
        after: node.canInsertTextAfter(),
      };
    });
    await flush();
    expect(defaults).toEqual({ empty: false, before: true, after: true });
  });

  it('getUnderlyingProps strips base element flags', async () => {
    const editor = makeEditor([DivNode]);
    let stripped!: Record<string, unknown>;
    editor.update(() => {
      const node = $createDivNode({
        canBeRemoved: false,
        canBeReplaced: false,
        canBeEmpty: false,
        canInsertTextBefore: false,
        canInsertTextAfter: false,
        className: 'keep',
      } as never);
      stripped = node.getUnderlyingProps(node.__props as never) as Record<string, unknown>;
    });
    await flush();
    expect(stripped.className).toBe('keep');
    expect('canBeRemoved' in stripped).toBe(false);
    expect('canBeEmpty' in stripped).toBe(false);
    expect('canInsertTextBefore' in stripped).toBe(false);
    expect('canInsertTextAfter' in stripped).toBe(false);
  });

  it('getUnderlyingProps with undefined props returns empty object', async () => {
    const editor = makeEditor([DivNode]);
    let stripped!: Record<string, unknown>;
    editor.update(() => {
      const node = $createDivNode({});
      stripped = node.getUnderlyingProps(undefined) as Record<string, unknown>;
    });
    await flush();
    expect(stripped).toEqual({});
  });

  it('remove delegates to BaseElementNode super when removable', async () => {
    const editor = makeEditor([DivNode]);
    editor.update(() => {
      const root = $getRoot();
      const node = $createDivNode({ className: 'removable' });
      root.append(node);
      expect(root.getChildren().length).toBe(1);
      node.remove();
      expect(root.getChildren().length).toBe(0);
    });
    await flush();
  });

  it('replace delegates to BaseElementNode super when replaceable', async () => {
    const editor = makeEditor([DivNode]);
    editor.update(() => {
      const root = $getRoot();
      const node = $createDivNode({ className: 'old' });
      root.append(node);
      const replacement = $createDivNode({ className: 'new' });
      node.replace(replacement);
      expect(root.getChildren().length).toBe(1);
      expect(root.getFirstChild()?.getType()).toBe('html.div');
    });
    await flush();
  });
});

describe('Lexical ExtendTextNode', () => {
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

  it('getType / clone / guard / text props', async () => {
    const editor = makeEditor([ExtendTextNode]);
    let node!: ExtendTextNode;
    editor.update(() => {
      node = $createExtendTextNode({ text: 'hello', prefixText: 'pre' });
      expect(node.getType()).toBe('html.TextNode');
      expect($isExtendTextNode(node)).toBe(true);
      expect(node.getTextContent()).toBe('hello');
      const cloned = ExtendTextNode.clone(node);
      expect(cloned.getTextContent()).toBe('hello');
    });
    await flush();
    expect(node).toBeTruthy();
  });

  it('create without props covers props||{} branch', async () => {
    const editor = makeEditor([ExtendTextNode]);
    let node!: ExtendTextNode;
    editor.update(() => {
      node = $createExtendTextNode();
      expect(node.getType()).toBe('html.TextNode');
    });
    await flush();
    expect(node).toBeTruthy();
  });

  it('remove with canBeRemoved=false keeps text (uses prefixText fallback)', async () => {
    const editor = makeEditor([ExtendTextNode]);
    let text!: string;
    editor.update(() => {
      const node = $createExtendTextNode({ text: 'keep', prefixText: 'fallback', canBeRemoved: false });
      node.remove();
      text = node.getTextContent();
    });
    await flush();
    expect(text).toBe('fallback');
  });

  it('remove with canBeRemoved=false falls back to single space when no prefixText', async () => {
    const editor = makeEditor([ExtendTextNode]);
    let text!: string;
    editor.update(() => {
      const node = $createExtendTextNode({ text: 'keep', canBeRemoved: false });
      node.remove();
      text = node.getTextContent();
    });
    await flush();
    expect(text).toBe(' ');
  });

  it('remove delegates to super when removable (node removed from tree)', async () => {
    const editor = makeEditor([ExtendTextNode]);
    editor.update(() => {
      const root = $getRoot();
      const p = $createParagraphNode();
      const node = $createExtendTextNode({ text: 'bye' });
      p.append(node);
      root.append(p);
      expect(root.getTextContent()).toBe('bye');
      node.remove();
      expect(root.getTextContent()).toBe('');
    });
    await flush();
  });

  it('replace with canBeReplaced=false keeps text and selects next', async () => {
    const editor = makeEditor([ExtendTextNode]);
    let text!: string;
    editor.update(() => {
      const root = $getRoot();
      const p = $createParagraphNode();
      const node = $createExtendTextNode({ text: 'keep', canBeReplaced: false });
      p.append(node);
      root.append(p);
      const replacement = $createExtendTextNode({ text: 'new' });
      const returned = node.replace(replacement);
      text = returned.getTextContent();
    });
    await flush();
    expect(text).toBe('keep');
  });

  it('replace with canBeReplaced=false uses text fallback when empty', async () => {
    const editor = makeEditor([ExtendTextNode]);
    let text!: string;
    editor.update(() => {
      const root = $getRoot();
      const p = $createParagraphNode();
      const node = $createExtendTextNode({ canBeReplaced: false });
      p.append(node);
      root.append(p);
      const returned = node.replace($createExtendTextNode({ text: 'new' }));
      text = returned.getTextContent();
    });
    await flush();
    expect(text).toBe(' ');
  });

  it('replace delegates to super when replaceable', async () => {
    const editor = makeEditor([ExtendTextNode]);
    let text!: string;
    editor.update(() => {
      const root = $getRoot();
      const p = $createParagraphNode();
      const node = $createExtendTextNode({ text: 'old' });
      p.append(node);
      root.append(p);
      const replacement = $createExtendTextNode({ text: 'new' });
      node.replace(replacement);
      text = root.getTextContent();
    });
    await flush();
    expect(text).toBe('new');
  });

  it('importJSON / exportJSON roundtrip', async () => {
    const editor = makeEditor([ExtendTextNode]);
    let json!: ReturnType<ExtendTextNode['exportJSON']>;
    editor.update(() => {
      json = $createExtendTextNode({ text: 'abc', prefixText: 'p' }).exportJSON();
    });
    await flush();
    expect(json.type).toBe('html.TextNode');
    expect(json.text).toBe('abc');
    const editor2 = makeEditor([ExtendTextNode]);
    let importedText!: string;
    editor2.update(() => {
      const imported = ExtendTextNode.importJSON(json);
      importedText = imported.getTextContent();
    });
    await flush();
    expect(importedText).toBe('abc');
  });
});

describe('Lexical CloseIconNode', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });
  afterEach(() => {
    expect(vi.mocked(console.error)).not.toHaveBeenCalled();
    vi.restoreAllMocks();
  });

  it('getType / clone / guard / serialization', async () => {
    const editor = makeEditor([CloseIconNode]);
    let node!: CloseIconNode;
    let json!: ReturnType<CloseIconNode['exportJSON']>;
    editor.update(() => {
      node = $createCloseIconNode({ parentClassName: 'parent' });
      expect(node.getType()).toBe('CloseIcon');
      expect($isCloseIconNode(node)).toBe(true);
      expect(node.isInline()).toBe(false);
      const cloned = CloseIconNode.clone(node);
      expect(cloned.getType()).toBe('CloseIcon');
      json = node.exportJSON();
    });
    await flush();
    expect(json.type).toBe('CloseIcon');
    const editor2 = makeEditor([CloseIconNode]);
    let imported!: CloseIconNode;
    editor2.update(() => {
      imported = CloseIconNode.importJSON(json);
    });
    await flush();
    expect(imported.getType()).toBe('CloseIcon');
  });

  it('createDOM injects antd token style with parent class', async () => {
    const editor = makeEditor([CloseIconNode]);
    let node!: CloseIconNode;
    editor.update(() => {
      node = $createCloseIconNode({ parentClassName: 'parent' });
    });
    await flush();
    const dom = node.createDOM();
    expect(dom.tagName).toBe('SPAN');
    expect(dom.className).toContain('lexical-close-icon');
    const styleEl = dom.querySelector('style');
    expect(styleEl).toBeTruthy();
    expect(styleEl?.innerHTML).toContain('.parent {');
    expect(styleEl?.innerHTML).toContain('position: absolute');
  });

  it('createDOM without parentClassName skips parent rule', async () => {
    const editor = makeEditor([CloseIconNode]);
    let node!: CloseIconNode;
    editor.update(() => {
      node = $createCloseIconNode({ parentClassName: '' });
    });
    await flush();
    const dom = node.createDOM();
    const styleEl = dom.querySelector('style');
    expect(styleEl?.innerHTML).not.toContain('position: relative');
  });

  it('updateDOM always returns false', async () => {
    const editor = makeEditor([CloseIconNode]);
    let node!: CloseIconNode;
    editor.update(() => {
      node = $createCloseIconNode({ parentClassName: 'p' });
    });
    await flush();
    expect(node.updateDOM()).toBe(false);
  });

  it('getProp / updateProps via BaseDecoratorNode', async () => {
    const editor = makeEditor([CloseIconNode]);
    let prop!: string | undefined;
    editor.update(() => {
      const node = $createCloseIconNode({ parentClassName: 'p', className: 'a' });
      node.updateProps({ className: 'b' });
      prop = node.getProp('className');
    });
    await flush();
    expect(prop).toBe('b');
  });

  it('remove / replace delegate to BaseDecoratorNode super', async () => {
    const editor = makeEditor([CloseIconNode]);
    editor.update(() => {
      const root = $getRoot();
      const node = $createCloseIconNode({ parentClassName: 'p' });
      root.append(node);
      expect(root.getChildren().length).toBe(1);
      node.remove();
      expect(root.getChildren().length).toBe(0);
      const node2 = $createCloseIconNode({ parentClassName: 'p' });
      root.append(node2);
      const rep = $createCloseIconNode({ parentClassName: 'p' });
      node2.replace(rep);
      expect(root.getChildren().length).toBe(1);
    });
    await flush();
  });

  it('getUnderlyingProps(undefined) returns empty (L197 binary-expr right side)', async () => {
    const editor = makeEditor([CloseIconNode]);
    let stripped!: Record<string, unknown>;
    editor.update(() => {
      const node = $createCloseIconNode({ parentClassName: 'p' });
      stripped = node.getUnderlyingProps(undefined) as Record<string, unknown>;
    });
    await flush();
    expect(stripped).toEqual({});
  });

  it('getUnderlyingProps strips decorator-only keys', async () => {
    const editor = makeEditor([CloseIconNode]);
    let stripped!: Record<string, unknown>;
    editor.update(() => {
      const node = $createCloseIconNode({
        parentClassName: 'p',
        icon: <span>custom</span>,
        iconClassName: 'ic',
        iconStyle: { color: 'red' },
        onClick: () => undefined,
        className: 'keep',
      } as never);
      stripped = node.getUnderlyingProps(node.__props as never) as Record<string, unknown>;
    });
    await flush();
    expect(stripped.className).toBe('keep');
    expect('icon' in stripped).toBe(false);
    expect('iconClassName' in stripped).toBe(false);
    expect('iconStyle' in stripped).toBe(false);
    expect('onClick' in stripped).toBe(false);
  });

  it('decorate renders default CloseCircleOutlined with onClick', () => {
    const editor = makeEditor([CloseIconNode]);
    let node!: CloseIconNode;
    editor.update(() => {
      node = $createCloseIconNode({ parentClassName: 'p', onClick: () => undefined });
    });
    const { container } = render(node.decorate() as never);
    expect(container.querySelector('.anticon-close-circle')).toBeTruthy();
  });

  it('decorate renders custom icon when provided', () => {
    const editor = makeEditor([CloseIconNode]);
    let node!: CloseIconNode;
    editor.update(() => {
      node = $createCloseIconNode({ parentClassName: 'p', icon: <span data-test="custom-icon">X</span> });
    });
    const { container } = render(node.decorate() as never);
    expect(container.querySelector('[data-test="custom-icon"]')).toBeTruthy();
  });
});
