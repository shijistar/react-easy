import type { LexicalNode } from 'lexical';
import { DecoratorNode, ElementNode } from 'lexical';

/**
 * - EN: Common behavior flags for custom nodes.
 * - CN: 自定义节点的通用行为标记。
 */
export interface BaseNodeProps {
  /**
   * - EN: Whether the node can be removed. Default `true`.
   * - CN: 是否可被删除，默认 `true`。
   */
  canBeRemoved?: boolean;
  /**
   * - EN: Whether the node can be replaced. Default `true`.
   * - CN: 是否可被替换，默认 `true`。
   */
  canBeReplaced?: boolean;
}
/**
 * - EN: Extra behavior flags for element nodes.
 * - CN: 元素节点的附加行为标记。
 */
export interface BaseElementProps extends BaseNodeProps {
  /**
   * - EN: Whether an element is allowed to be empty. Default `false`.
   * - CN: 是否允许节点为空，默认 `false`。
   */
  canBeEmpty?: boolean;
  /**
   * - EN: Allow inserting text at the start of the element. Default `true`.
   * - CN: 是否允许在节点内的起始位置插入文本，默认 `true`。
   */
  canInsertTextBefore?: boolean;
  /**
   * - EN: Allow inserting text at the end of the element. Default `true`.
   * - CN: 是否允许在节点内的结束位置插入文本，默认 `true`。
   */
  canInsertTextAfter?: boolean;
}

export type BaseDecoratorNodeProps = BaseNodeProps;

/**
 * - EN: A helper wrapping base behaviors (remove/replace) with guard flags.
 * - CN: 封装基础行为（删除/替换）并根据标记进行限制的帮助器。
 *
 * @param props Node behavior flags | 节点行为标记
 * @param superMethods Methods delegated to the underlying node | 委托给底层节点的方法
 */
export class BaseNodeHelper<P extends BaseNodeProps> {
  __props: (P & BaseNodeProps) | undefined;
  __superMethods: Pick<LexicalNode, 'replace' | 'remove'>;

  constructor(props: P | undefined, superMethods: Pick<LexicalNode, 'replace' | 'remove'>) {
    this.__props = props as P & BaseNodeProps;
    this.__superMethods = superMethods;
  }

  hooks = {
    remove: (preserveEmptyParent?: boolean): void => {
      if (this.__props?.canBeRemoved === false) {
        return;
      }
      this.__superMethods.remove(preserveEmptyParent);
    },

    replace: <N extends LexicalNode>(replaceWith: N, includeChildren?: boolean): N => {
      if (this.__props?.canBeReplaced === false) {
        return this as unknown as N;
      }
      return this.__superMethods.replace(replaceWith, includeChildren);
    },
  };
  /**
   * - EN: Strip helper-only flags from props for DOM usage.
   * - CN: 去除仅用于帮助器的标记属性，得到用于 DOM 的纯属性。
   *
   * @param props Props including helper flags | 含帮助标记的属性
   */
  getUnderlyingProps(props: P & BaseNodeProps): Omit<P, keyof BaseNodeProps> {
    /* eslint-disable @typescript-eslint/no-unused-vars */
    const { canBeRemoved, canBeReplaced, ...restProps } = props;
    /* eslint-enable @typescript-eslint/no-unused-vars */
    return restProps as P;
  }
}

/**
 * - EN: Base element node with behavior flags.
 * - CN: 带行为标记的基础元素节点。
 */
export class BaseElementNode<P extends BaseElementProps> extends ElementNode {
  __props: P | undefined;
  __base: BaseNodeHelper<P>;

  constructor(props?: P & { key?: string }) {
    const { key, ...restProps } = props || {};
    super(key);
    this.__props = restProps as P;
    this.__base = new BaseNodeHelper<P>(this.__props, {
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
  }

  canBeEmpty(): boolean {
    return this.__props?.canBeEmpty ?? false;
  }

  canInsertTextBefore(): boolean {
    return this.__props?.canInsertTextBefore ?? true;
  }

  canInsertTextAfter(): boolean {
    return this.__props?.canInsertTextAfter ?? true;
  }

  getProp(propName: keyof P): P[typeof propName] {
    return this.__props?.[propName] as P[typeof propName];
  }

  updateProps(props: Partial<P>): void {
    const writable = this.getWritable();
    writable.__props = {
      ...writable.__props!,
      ...props,
    };
  }

  /**
   * - EN: Strip element-specific flags and return DOM props.
   * - CN: 去除元素特有的标记并返回 DOM 属性。
   *
   * @param props Element props including flags | 含标记的元素属性
   */
  getUnderlyingProps(props: P | undefined): Omit<P, keyof BaseElementProps> {
    const baseProps = this.__base.getUnderlyingProps(props ?? ({} as P));
    /* eslint-disable @typescript-eslint/no-unused-vars */
    const { canBeEmpty, canInsertTextBefore, canInsertTextAfter, ...restProps } = baseProps;
    /* eslint-enable @typescript-eslint/no-unused-vars */
    return restProps as P;
  }
}

/**
 * - EN: Base decorator node with behavior flags.
 * - CN: 带行为标记的基础装饰器节点。
 */
export class BaseDecoratorNode<T, P extends BaseDecoratorNodeProps> extends DecoratorNode<T> {
  __props: P | undefined;
  __base: BaseNodeHelper<P>;

  constructor(props?: P & { key?: string }) {
    const { key, ...restProps } = props || {};
    super(key);
    this.__props = restProps as P;

    this.__base = new BaseNodeHelper<P>(this.__props, {
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
  }
  getProp(propName: keyof P): P[typeof propName] {
    return this.__props?.[propName] as P[typeof propName];
  }

  updateProps(props: Partial<P>): void {
    const writable = this.getWritable();
    writable.__props = {
      ...writable.__props!,
      ...props,
    };
  }

  /**
   * - EN: Strip decorator-specific flags and return DOM props.
   * - CN: 去除装饰器特有的标记并返回 DOM 属性。
   *
   * @param props Decorator props including flags | 含标记的装饰器属性
   */
  getUnderlyingProps(props: P | undefined): Omit<P, keyof BaseDecoratorNodeProps> {
    const baseProps = this.__base.getUnderlyingProps(props ?? ({} as P));
    /* eslint-disable @typescript-eslint/no-unused-vars */
    const { ...restProps } = baseProps;
    /* eslint-enable @typescript-eslint/no-unused-vars */
    return restProps as P;
  }
}
