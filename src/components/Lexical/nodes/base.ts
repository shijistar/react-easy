import type { LexicalNode } from 'lexical';
import { DecoratorNode, ElementNode } from 'lexical';

export interface BaseNodeProps {
  /** 是否可被删除，默认 `true` */
  canBeRemoved?: boolean;
  /** 是否可被替换，默认 `true` */
  canBeReplaced?: boolean;
}
export interface BaseElementProps extends BaseNodeProps {
  /**
   * 是否允许节点为空，默认 `false`
   *
   * - `true` - 允许节点为空
   * - `false` - 不允许节点为空，当最后一个子节点被删除后，节点也会被删除
   */
  canBeEmpty?: boolean;
  /** 是否允许在节点内的起始位置插入文本，默认 `true` */
  canInsertTextBefore?: boolean;
  /** 是否允许在节点内的结束位置插入文本，默认 `true` */
  canInsertTextAfter?: boolean;
}

export type BaseDecoratorNodeProps = BaseNodeProps;

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
  getUnderlyingProps(props: P & BaseNodeProps): Omit<P, keyof BaseNodeProps> {
    /* eslint-disable @typescript-eslint/no-unused-vars */
    const { canBeRemoved, canBeReplaced, ...restProps } = props;
    /* eslint-enable @typescript-eslint/no-unused-vars */
    return restProps as P;
  }
}

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

  getUnderlyingProps(props: P | undefined): Omit<P, keyof BaseElementProps> {
    const baseProps = this.__base.getUnderlyingProps(props ?? ({} as P));
    /* eslint-disable @typescript-eslint/no-unused-vars */
    const { canBeEmpty, canInsertTextBefore, canInsertTextAfter, ...restProps } = baseProps;
    /* eslint-enable @typescript-eslint/no-unused-vars */
    return restProps as P;
  }
}

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

  getUnderlyingProps(props: P | undefined): Omit<P, keyof BaseDecoratorNodeProps> {
    const baseProps = this.__base.getUnderlyingProps(props ?? ({} as P));
    /* eslint-disable @typescript-eslint/no-unused-vars */
    const { ...restProps } = baseProps;
    /* eslint-enable @typescript-eslint/no-unused-vars */
    return restProps as P;
  }
}
