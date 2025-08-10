import { type CSSProperties, type HtmlHTMLAttributes, type ReactNode } from 'react';
import { theme } from 'antd';
import classNames from 'classnames';
import type { LexicalNode, SerializedLexicalNode, Spread } from 'lexical';
import { CloseCircleOutlined } from '@ant-design/icons';
import { randomChars } from '../../../utils';
import { updateDomProps } from '../helpers';
import type { BaseDecoratorNodeProps, BaseNodeProps } from './base';
import { BaseDecoratorNode } from './base';

const CLOSE_ICON_CLASSNAME = 'lexical-close-icon';

export interface CloseIconNodeProps extends HtmlHTMLAttributes<HTMLSpanElement>, BaseDecoratorNodeProps {
  /**
   * - EN: Parent element class name, used to add positioning styles to the parent element.
   * - CN: 父元素的类名，用于给父元素添加定位样式
   */
  parentClassName: string;
  /**
   * - EN: The custom icon to display, optional
   * - CN: 要显示的自定义图标，可选
   */
  icon?: ReactNode;
  /**
   * - EN: The default class name for the close icon element. This property is invalid if `icon` is
   *   set.
   * - CN: 默认关闭图标元素的类名，如果设置了 `icon` 则该属性无效
   */
  iconClassName?: string;
  /**
   * - EN: The custom style for the close icon element. This property is invalid if `icon` is set.
   * - CN: 自定义关闭图标元素的样式，如果设置了 `icon` 则该属性无效
   */
  iconStyle?: CSSProperties;
  /**
   * - EN: The click event handler for the close icon element.
   * - CN: 关闭图标元素的点击事件
   */
  onClick?: (e: React.MouseEvent<HTMLSpanElement>) => void;
}

/**
 * - EN: A node that represents a close icon.
 * - CN: 一个关闭图标的节点。
 */
export class CloseIconNode extends BaseDecoratorNode<ReactNode, CloseIconNodeProps> {
  __hashId: string;

  constructor(props: CloseIconNodeProps & { key?: string }) {
    super(props);
    this.__hashId = `hash-${randomChars(6)}`;
  }

  static getType(): string {
    return 'CloseIcon';
  }

  static clone(node: CloseIconNode): CloseIconNode {
    return new CloseIconNode({ ...node.__props!, key: node.getKey() });
  }

  static importJSON(serializedNode: SerializedCloseIconNode): CloseIconNode {
    return $createCloseIconNode(serializedNode.props);
  }

  exportJSON(): SerializedCloseIconNode {
    return {
      ...super.exportJSON(),
      props: this.__props!,
      type: this.getType(),
      version: 1,
    };
  }

  createDOM(): HTMLElement {
    const span = document.createElement('span');
    const underlyingProps = this.getUnderlyingProps(this.__props);
    const className = classNames(CLOSE_ICON_CLASSNAME, this.__hashId, underlyingProps?.className);
    updateDomProps(span, { ...underlyingProps, className });
    const stylesheet = document.createElement('style');
    const token = theme.getDesignToken();
    const parentCls = this.__props?.parentClassName ? `.${this.__props.parentClassName}` : '';
    stylesheet.innerHTML = `
      ${
        parentCls
          ? `
          ${parentCls} { 
            position: relative;
          }
          `
          : ''
      }
      ${parentCls} .${CLOSE_ICON_CLASSNAME}.${this.__hashId} {
        position: absolute;
        top: 0;
        right: 0;
        transform: translate(50%, -50%);
        color: ${token.colorTextDisabled};
        font-size: ${token.fontSizeSM}px;
        line-height: 0;
        z-index: 1;
        opacity: 0;
        cursor: pointer;
        pointer-events: none;
        transition: opacity 0.2s ease;
      }
      ${parentCls}:hover .${CLOSE_ICON_CLASSNAME}.${this.__hashId} {
        opacity: 1;
        pointer-events: auto;
      }
      ${parentCls}:hover .${CLOSE_ICON_CLASSNAME}.${this.__hashId}:hover {
        color: ${token.colorTextSecondary};
      }
    `;
    span.append(stylesheet);
    return span;
  }

  updateDOM() {
    return false;
  }

  decorate(): ReactNode {
    return <CloseIconComponent node={this} />;
  }

  isInline(): boolean {
    return false;
  }

  getPropValue(propName: keyof CloseIconNodeProps): CloseIconNodeProps[typeof propName] {
    return this.__props?.[propName];
  }

  setProps(props: Partial<CloseIconNodeProps>): void {
    const writable = this.getWritable();
    writable.__props = {
      ...writable.__props!,
      ...props,
    };
  }

  getUnderlyingProps(props: CloseIconNodeProps | undefined): Omit<CloseIconNodeProps, keyof BaseNodeProps> {
    const excludeProps = super.getUnderlyingProps(props);
    /* eslint-disable @typescript-eslint/no-unused-vars */
    const { icon, iconClassName, iconStyle, onClick, ...rest } = excludeProps || {};
    /* eslint-enable @typescript-eslint/no-unused-vars */
    return rest;
  }
}

/**
 * - EN: React decorator component rendered for CloseIconNode.
 * - CN: CloseIconNode 对应的 React 装饰组件。
 *
 * @param node The bound CloseIconNode instance | 关联的 CloseIconNode 实例
 */
function CloseIconComponent({ node }: CloseIconComponentProps): ReactNode {
  const { icon, iconClassName, iconStyle, onClick } = node.__props || {};

  const closeIcon = icon ?? (
    <CloseCircleOutlined className={classNames(node.__hashId, iconClassName)} style={iconStyle} onClick={onClick} />
  );
  return closeIcon;
}

/**
 * - EN: Factory to create a CloseIconNode.
 * - CN: 创建 CloseIconNode 的工厂函数。
 *
 * @param props Props for the CloseIcon node | CloseIcon 节点的属性
 */
export function $createCloseIconNode(props: CloseIconNodeProps): CloseIconNode {
  return new CloseIconNode(props);
}

/**
 * - EN: Type guard to check whether a node is CloseIconNode.
 * - CN: 判断节点是否为 CloseIconNode 的类型守卫。
 *
 * @param node Node to test | 要检测的节点
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function $isCloseIconNode(node: LexicalNode | null | undefined): node is CloseIconNode {
  return node instanceof CloseIconNode;
}

interface CloseIconComponentProps {
  node: CloseIconNode;
}
type SerializedCloseIconNode = Spread<
  {
    props: CloseIconNodeProps;
  },
  SerializedLexicalNode
>;
