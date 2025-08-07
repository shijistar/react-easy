import type { LexicalNode, NodeKey, SerializedTextNode, Spread } from 'lexical';
import { TextNode } from 'lexical';
import type { BaseNodeProps } from './base';
import { BaseNodeHelper } from './base';

export interface ExtendTextNodeProps extends BaseNodeProps {
  text?: string;
}

export class ExtendTextNode extends TextNode {
  __props: ExtendTextNodeProps | undefined;
  __base: BaseNodeHelper<ExtendTextNodeProps>;

  constructor(props?: ExtendTextNodeProps & { key?: NodeKey }) {
    const { key, ...restProps } = props || {};
    super(props?.text, key);
    this.__props = restProps;
    this.__base = new BaseNodeHelper<ExtendTextNodeProps>(this.__props, {
      remove: () => super.remove(),
      replace: (replaceWith, includeChildren) => super.replace(replaceWith, includeChildren),
    });
    Object.keys(this.__base.hooks).forEach((key) => {
      const method = this.__base.hooks[key as keyof typeof this.__base.hooks];
      if (typeof method === 'function') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this[key as keyof this] = method.bind(this.__base) as any;
      }
    });
    this.replace = <N extends LexicalNode>(replaceWith: N, includeChildren?: boolean): N => {
      if (this.__props?.canBeReplaced === false) {
        this.setTextContent(this.__props?.text || '');
        this.selectNext();
        return this as unknown as N;
      }
      return super.replace(replaceWith, includeChildren);
    };
  }

  static getType(): string {
    return 'html.TextNode';
  }

  static clone(node: ExtendTextNode): ExtendTextNode {
    return new ExtendTextNode({ ...node.__props, text: node.__text, key: node.getKey() });
  }

  static importJSON(serializedNode: SerializedExtendTextNode): ExtendTextNode {
    return $createExtendTextNode({
      ...serializedNode.props,
      text: serializedNode.text,
    });
  }

  exportJSON(): SerializedExtendTextNode {
    return {
      ...super.exportJSON(),
      props: this.__props,
      text: this.__text,
      type: this.getType(),
    };
  }
}

export type SerializedExtendTextNode = Spread<
  {
    props?: ExtendTextNodeProps;
    text: string;
  },
  SerializedTextNode
>;

export function $createExtendTextNode(props?: ExtendTextNodeProps): ExtendTextNode {
  return new ExtendTextNode(props);
}

export function $isExtendTextNode(node: LexicalNode | null | undefined): node is ExtendTextNode {
  return node instanceof ExtendTextNode;
}
