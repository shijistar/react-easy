import type { CSSProperties, HtmlHTMLAttributes } from 'react';
import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  LexicalNode,
  SerializedElementNode,
  Spread,
} from 'lexical';
import { shallowEqual, updateDomProps } from '../helpers';
import { BaseElementNode, type BaseElementProps } from './base';

/**
 * - EN: Props for the DivNode, combining DOM div attributes and element behavior flags.
 * - CN: DivNode 的属性，包含 DOM div 属性与元素行为标记。
 */
export interface DivNodeProps extends HtmlHTMLAttributes<HTMLDivElement>, BaseElementProps {}

export type SerializedDivNode = Spread<
  {
    props?: DivNodeProps;
  },
  SerializedElementNode
>;

/**
 * - EN: Lexical element node that renders a DOM div with controlled props.
 * - CN: 渲染为 DOM div 且可控制属性的 Lexical 元素节点。
 */
export class DivNode extends BaseElementNode<DivNodeProps> {
  static getType(): string {
    return 'html.div';
  }

  static clone(node: DivNode): DivNode {
    return new DivNode({ ...node.__props, key: node.getKey() });
  }

  protected getForceDisplay(): CSSProperties['display'] {
    return undefined;
  }

  createDOM(): HTMLElement {
    const div = document.createElement('div');
    const domProps = this.getUnderlyingProps(this.__props);
    if (domProps) {
      updateDomProps(div, domProps);
    }
    return div;
  }

  updateDOM(prevNode: DivNode, dom: HTMLElement): boolean {
    const prevProps = prevNode.__props;
    const currentProps = this.__props;
    const propsChanged = !shallowEqual(prevProps, currentProps);
    if (propsChanged) {
      updateDomProps(dom, this.getUnderlyingProps(currentProps));
    }
    return false;
  }

  static importDOM(): DOMConversionMap | null {
    return {
      div: (node: Node) => ({
        conversion: convertDivElement,
        priority: 1,
      }),
    };
  }

  static importJSON(serializedNode: SerializedDivNode): DivNode {
    return $createDivNode(serializedNode.props);
  }

  exportJSON(): SerializedDivNode {
    return {
      ...super.exportJSON(),
      props: this.__props,
      type: this.getType(),
    };
  }

  exportDOM(): DOMExportOutput {
    const element = this.createDOM();
    return { element };
  }

  isInline(): boolean {
    const display = this.__props?.style?.display ?? 'block';
    return (
      display === 'inline' ||
      display === 'inline-flex' ||
      display === 'inline-block' ||
      display === 'inline-grid' ||
      display === 'inline-table' ||
      display === 'inline-list-item'
    );
  }

  updateProps(props: DivNodeProps): void {
    const writable = this.getWritable();
    writable.__props = {
      ...writable.__props,
      ...props,
      style: {
        ...writable.__props?.style,
        ...props.style,
      },
    };
  }
}
/**
 * - EN: Convert a DOM node to a DivNode during import.
 * - CN: 在导入时将 DOM 节点转换为 DivNode。
 *
 * @param domNode Source DOM node | 源 DOM 节点
 */
function convertDivElement(domNode: Node): DOMConversionOutput {
  const element = domNode as HTMLElement;
  if (element.nodeName === 'DIV') {
    return { node: $createDivNode() };
  }
  return { node: null };
}
/**
 * - EN: Factory to create a DivNode.
 * - CN: 创建 DivNode 的工厂函数。
 *
 * @param props Props for the DivNode | DivNode 的属性
 */
export function $createDivNode(props?: DivNodeProps): DivNode {
  return new DivNode(props);
}
/**
 * - EN: Type guard to check if a node is DivNode.
 * - CN: 判断节点是否为 DivNode 的类型守卫。
 *
 * @param node Node to test | 要检测的节点
 */
export function $isDivNode(node: LexicalNode | null | undefined): node is DivNode {
  return node instanceof DivNode;
}
