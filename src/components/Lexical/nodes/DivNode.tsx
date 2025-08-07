import type { CSSProperties, HtmlHTMLAttributes } from 'react';
import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  LexicalNode,
  SerializedElementNode,
  Spread,
} from 'lexical';
import { updateDomProps } from '../helpers';
import { BaseElementNode, type BaseElementProps } from './base';

export interface DivNodeProps extends HtmlHTMLAttributes<HTMLDivElement>, BaseElementProps {}

export type SerializedDivNode = Spread<
  {
    props?: DivNodeProps;
  },
  SerializedElementNode
>;

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
    const propsChanged = !this.shallowEqual(prevProps, currentProps);
    if (propsChanged) {
      updateDomProps(dom, this.getUnderlyingProps(currentProps));
    }
    // 不重新创建
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
    const display = this.__props?.style?.display;
    return (
      display === 'inline' ||
      display === 'inline-flex' ||
      display === 'inline-block' ||
      display === 'inline-grid' ||
      display === 'inline-table' ||
      display === 'inline-list-item'
    );
  }

  getPropValue<K extends keyof DivNodeProps>(key: K): DivNodeProps[K] | undefined {
    return this.__props?.[key];
  }
  setProps(props: DivNodeProps): void {
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private shallowEqual(obj1: any, obj2: any): boolean {
    if (obj1 === obj2) return true;
    if (!obj1 || !obj2) return false;

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) return false;

    for (const key of keys1) {
      if (key === 'style') {
        // 特殊处理 style 对象
        if (!this.shallowEqual(obj1[key], obj2[key])) return false;
      } else if (obj1[key] !== obj2[key]) {
        return false;
      }
    }

    return true;
  }
}

function convertDivElement(domNode: Node): DOMConversionOutput {
  const element = domNode as HTMLElement;
  if (element.nodeName === 'DIV') {
    return { node: $createDivNode() };
  }
  return { node: null };
}

export function $createDivNode(props?: DivNodeProps): DivNode {
  return new DivNode(props);
}

export function $isDivNode(node: LexicalNode | null | undefined): node is DivNode {
  return node instanceof DivNode;
}
