import type { CSSProperties, HtmlHTMLAttributes } from 'react';
import type { LexicalEditor, LexicalNode } from 'lexical';
import {
  $createTextNode,
  $getRoot,
  $getSelection,
  $isDecoratorNode,
  $isElementNode,
  $isParagraphNode,
  $isRangeSelection,
  $isTextNode,
} from 'lexical';
import { $createDivNode, $isDivNode } from '../nodes/DivNode';

/**
 * - EN: Insert a node at the current cursor position.
 * - CN: 将节点插入到当前光标位置。
 *
 * @param editor LexicalEditor instance | LexicalEditor 实例
 * @param node Node to insert | 要插入的节点
 */
export function insertNodeAtCursor(editor: LexicalEditor, node: LexicalNode): void {
  editor.update(() => {
    const selection = $getSelection();
    if (selection) {
      if ($isRangeSelection(selection)) {
        // 如果没有选取，则直接在根节点末尾插入
        const lastNode = selection.focus.getNode();
        if (lastNode) {
          if ($isParagraphNode(lastNode)) {
            lastNode.append(node);
          } else if ($isTextNode(lastNode)) {
            // 如果最后一个节点是文本节点，则在其后插入 SelectNode
            lastNode.insertAfter(node);
          } else if ($isDivNode(lastNode)) {
            lastNode.append(node);
          } else {
            selection.insertNodes([node]);
          }
          node.selectNext();
        }
      } else {
        selection.insertNodes([node]);
        node.selectNext();
      }
    } else {
      const root = $getRoot();
      let nodeToInsert: LexicalNode = node;
      if ($isElementNode(node) || $isDecoratorNode(node)) {
        nodeToInsert = node;
      } else {
        const container = $createDivNode({
          style: { display: 'inline-block' },
        });
        container.append(node);
        nodeToInsert = container;
      }
      root.append(nodeToInsert);
      node.selectNext();
    }
  });
}

/**
 * - EN: Insert text at the current cursor position.
 * - CN: 将文本插入到当前光标位置。
 *
 * @param editor LexicalEditor instance | LexicalEditor 实例
 * @param text Text to insert | 要插入的文本
 */
export function insertTextAtCursor(editor: LexicalEditor, text: string): void {
  editor?.update(() => {
    const textNode = $createTextNode(text);
    const root = $getRoot();
    const selection = $getSelection();
    if (selection) {
      // 插入光标位置
      selection.insertText(text);
    } else {
      // 如果没有选取，则直接在根节点末尾插入
      const lastNode = root.getLastChild();
      if (lastNode && $isParagraphNode(lastNode)) {
        lastNode.append(textNode);
      } else {
        const container = $createDivNode({
          style: { display: 'inline-block' },
        });
        container.append(textNode);
        root.append(container);
      }
    }
  });
}

/**
 * - EN: Clear the editor content.
 * - CN: 清空编辑器内容。
 *
 * @param editor LexicalEditor instance | LexicalEditor 实例
 */
export function clearEditorContent(editor: LexicalEditor) {
  const state = editor.getEditorState();
  const stateJson = state.toJSON();
  // 默认创建一个ParagraphNode
  const newJson = {
    ...stateJson,
    root: {
      ...stateJson.root,
      children: [
        {
          children: [],
          direction: null,
          format: '',
          indent: 0,
          type: 'paragraph',
          version: 1,
          textFormat: 0,
          textStyle: '',
        },
      ],
    },
  };
  const emptyState = editor.parseEditorState(JSON.stringify(newJson));
  editor.setEditorState(emptyState);
  editor.update(() => {
    const root = $getRoot();
    root.clear();
  });
}

/**
 * - EN: Find the first node that matches the predicate.
 * - CN: 查找第一个符合条件的节点。
 *
 * @param editor LexicalEditor instance | LexicalEditor 实例
 * @param predicate Function to test whether a node matches | 用于匹配节点的函数
 *
 * @returns The matched node, or undefined | 符合条件的第一个节点，或 undefined
 */
export function findNode<T extends LexicalNode>(
  editor: LexicalEditor,
  predicate: (node: LexicalNode) => boolean
): T | undefined {
  const matched = findNodes<T>(editor, predicate, { stopOnFirstMatch: true });
  return matched[0];
}
/**
 * - EN: Find all nodes that match the predicate.
 * - CN: 查找所有符合条件的节点数组。
 *
 * @param editor LexicalEditor instance | LexicalEditor 实例
 * @param predicate Function to test whether a node matches | 用于匹配节点的函数
 * @param options Options | 选项
 *
 * @returns An array of matched nodes | 符合条件的节点数组
 */
export function findNodes<T extends LexicalNode>(
  editor: LexicalEditor,
  predicate: (node: LexicalNode) => boolean,
  options?: {
    stopOnFirstMatch?: boolean;
  }
): T[] {
  const matched: T[] = [];
  editor.getEditorState().read(() => {
    const root = $getRoot();
    const traverse = (node: LexicalNode, result: T[]) => {
      if (predicate(node)) {
        result.push(node as unknown as T);
        if (options?.stopOnFirstMatch) {
          return;
        }
      }
      if ($isElementNode(node)) {
        const children = node.getChildren();
        for (const child of children) {
          traverse(child, result);
          if (options?.stopOnFirstMatch && result.length > 0) {
            return;
          }
        }
      }
    };
    traverse(root, matched);
  });
  return matched;
}

/**
 * - EN: Update properties on a DOM element.
 * - CN: 更新 DOM 元素的属性。
 *
 * @param dom Target DOM element to update | 要更新的 DOM 元素
 * @param props Props to set on the element | 要设置的属性
 */
export function updateDomProps(dom: HTMLElement | undefined, props: HtmlHTMLAttributes<HTMLElement>): void {
  if (!dom) return;
  Array.from(dom.attributes).forEach((attr) => {
    if (!attr.name.startsWith('data-lexical')) {
      dom.removeAttribute(attr.name);
    }
  });

  dom.removeAttribute('style');
  dom.removeAttribute('class');

  if (props) {
    Object.entries(props).forEach(([key, value]) => {
      if (key === 'style' && value) {
        Object.entries(value as CSSProperties).forEach(([styleKey, styleValue]) => {
          if (styleValue !== undefined) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (dom.style as any)[styleKey] = styleValue;
          }
        });
      } else if (key === 'className' && value) {
        dom.className = value as string;
      } else if (key.startsWith('on') && typeof value === 'function') {
        dom[key.toLowerCase() as 'onclick'] = value as (event: MouseEvent) => void;
      } else if (value !== undefined && value !== null) {
        dom.setAttribute(key, value.toString());
      }
    });
  }
}

/**
 * - EN: Update style on a DOM element.
 * - CN: 更新 DOM 元素的样式。
 *
 * @param dom Target DOM element to update | 要更新的 DOM 元素
 * @param style Style to set | 要设置的样式
 */
export function updateDomStyle(dom: HTMLElement | undefined, style: CSSProperties | undefined): void {
  if (!dom) return;
  dom.removeAttribute('style');
  if (style) {
    Object.entries(style).forEach(([styleKey, styleValue]) => {
      if (styleValue !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (dom.style as any)[styleKey] = styleValue;
      }
    });
  }
}

/**
 * - EN: Get attributes from a DOM element.
 * - CN: 从 DOM 元素获取属性。
 *
 * @param dom Target DOM element | 目标 DOM 元素
 *
 * @returns Element attributes | 元素属性
 */
export function getDomAttributes(dom: HTMLElement | undefined): HtmlHTMLAttributes<HTMLElement> | undefined {
  if (!dom) return undefined;

  const attributes: HtmlHTMLAttributes<HTMLElement> = {};
  Array.from(dom.attributes).forEach((attr) => {
    if (attr.name === 'class' || attr.name === 'style') {
      return;
    }
    attributes[attr.name as keyof HtmlHTMLAttributes<HTMLElement>] = attr.value;
  });

  if (dom.className) {
    attributes.className = dom.className;
  }

  if (dom.style) {
    const styles: CSSProperties = {};
    Array.from(dom.style).forEach((styleName) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (styles as any)[styleName] = (dom.style as any)[styleName];
    });
    attributes.style = styles;
  }

  return attributes;
}
