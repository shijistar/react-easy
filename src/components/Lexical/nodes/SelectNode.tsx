import { type CSSProperties, type ReactNode, useCallback } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { Select } from 'antd';
import type { SelectProps } from 'antd';
import type { BaseOptionType, DefaultOptionType } from 'antd/es/select';
import type { LexicalEditor, LexicalNode, SerializedLexicalNode, Spread } from 'lexical';
import { insertNodeAtCursor, updateDomStyle } from '../helpers';
import type { BaseDecoratorNodeProps } from './base';
import { BaseDecoratorNode } from './base';

/**
 * - EN: Props for SelectNode, extending antd Select props plus behavior flags.
 * - CN: SelectNode 的属性，基于 antd Select 属性并附加行为标记。
 */
export interface SelectNodeProps<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ValueType = any,
  OptionType extends BaseOptionType | DefaultOptionType = DefaultOptionType,
> extends SelectProps<ValueType, OptionType>,
    BaseDecoratorNodeProps {
  /**
   * - EN: When reading editor textContent, whether to use option label or value. Default `value`.
   * - CN: 在获取 editor 的 textContent 时，使用选项的 label 还是 value。默认 `value`。
   * - label: use option label as text
   * - value: use option value as text
   */
  textContentMode?: 'label' | 'value';
  /**
   * - EN: Add a space around textContent. Default `true`.
   * - CN: 是否在 textContent 两边添加一个空格，默认 `true`。
   */
  spaceAround?: boolean;
  /**
   * - EN: Container DOM style.
   * - CN: 容器样式。
   */
  containerStyle?: CSSProperties;
}

export class SelectNode<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ValueType = any,
  OptionType extends BaseOptionType | DefaultOptionType = DefaultOptionType,
> extends BaseDecoratorNode<ReactNode, SelectNodeProps<ValueType, OptionType>> {
  __value: ValueType | undefined;

  constructor(props?: SelectNodeProps<ValueType, OptionType> & { key?: string }) {
    super(props);
    this.__value = props?.defaultValue ?? undefined;
  }
  static getType(): string {
    return 'antd.Select';
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static clone<ValueType = any, OptionType extends BaseOptionType | DefaultOptionType = DefaultOptionType>(
    node: SelectNode<ValueType, OptionType>
  ): SelectNode<ValueType, OptionType> {
    return new SelectNode<ValueType, OptionType>({ ...node.__props, key: node.getKey() });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static importJSON<ValueType = any, OptionType extends BaseOptionType | DefaultOptionType = DefaultOptionType>(
    serializedNode: SerializedSelectNode<ValueType, OptionType>
  ): SelectNode<ValueType, OptionType> {
    return $createSelectNode(serializedNode.props);
  }

  exportJSON(): SerializedSelectNode<ValueType, OptionType> {
    return {
      ...super.exportJSON(),
      props: this.__props,
      type: this.getType(),
      version: 1,
    };
  }

  createDOM(): HTMLElement {
    const span = document.createElement('span');
    updateDomStyle(span, this.__props?.containerStyle);
    return span;
  }

  updateDOM(): false {
    return false;
  }

  decorate(): ReactNode {
    return <SelectComponent node={this} />;
  }

  isInline(): boolean {
    return true;
  }

  getTextContent(): string {
    let content: string;
    const valueContent = this.__value ? String(this.__value) : '';
    if (this.__props?.textContentMode === 'label') {
      const option = this.__props?.options?.find((opt) => opt.value === this.__value);
      content = option?.label ? String(option.label) : valueContent;
    } else {
      content = valueContent;
    }
    if (this.__props?.spaceAround !== false) {
      return ` ${content} `;
    }
    return content;
  }

  getValue(): ValueType | undefined {
    return this.__value;
  }

  setValue(value: ValueType | undefined): void {
    const writable = this.getWritable();
    writable.__value = value;
  }

  getPropValue(
    propName: keyof SelectNodeProps<ValueType, OptionType>
  ): SelectNodeProps<ValueType, OptionType>[typeof propName] {
    return this.__props?.[propName];
  }

  setProps(props: Partial<SelectNodeProps<ValueType, OptionType>>): void {
    const writable = this.getWritable();
    writable.__props = {
      ...writable.__props,
      ...props,
    };
  }
}

/**
 * - EN: React decorator component rendered for SelectNode.
 * - CN: SelectNode 对应的 React 装饰组件。
 *
 * @param node The bound SelectNode instance | 关联的 SelectNode 实例
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SelectComponent<ValueType = any, OptionType extends BaseOptionType | DefaultOptionType = DefaultOptionType>({
  node,
}: SelectComponentProps<ValueType, OptionType>): ReactNode {
  const underlyingProps = node.getUnderlyingProps(node.__props);
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const { textContentMode, spaceAround, containerStyle, ...selectProps } = underlyingProps;
  /* eslint-enable @typescript-eslint/no-unused-vars */
  const [editor] = useLexicalComposerContext();

  const handleChange = useCallback<NonNullable<SelectNodeProps<ValueType, OptionType>['onChange']>>(
    (value, options) => {
      editor.update(() => {
        node.setValue(value);
        node.__props?.onChange?.(value, options);
      });
    },
    [editor, node]
  );

  const handleClear = useCallback(() => {
    editor.update(() => {
      node.setValue(undefined);
      node.__props?.onClear?.();
    });
  }, [editor, node]);

  return <Select {...selectProps} value={node.getValue()} onChange={handleChange} onClear={handleClear} />;
}

/**
 * - EN: Factory to create a SelectNode.
 * - CN: 创建 SelectNode 的工厂函数。
 *
 * @param props Props for the Select node | Select 节点的属性
 */
export function $createSelectNode<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ValueType = any,
  OptionType extends BaseOptionType | DefaultOptionType = DefaultOptionType,
>(props?: SelectNodeProps<ValueType, OptionType>): SelectNode<ValueType, OptionType> {
  return new SelectNode<ValueType, OptionType>(props);
}

/**
 * - EN: Type guard to check whether a node is SelectNode.
 * - CN: 判断节点是否为 SelectNode 的类型守卫。
 *
 * @param node Node to test | 要检测的节点
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function $isSelectNode(node: LexicalNode | null | undefined): node is SelectNode<any, any> {
  return node instanceof SelectNode;
}

/**
 * - EN: Insert a SelectNode at the current cursor position.
 * - CN: 在当前光标位置插入一个 SelectNode。
 *
 * @param editor LexicalEditor instance | LexicalEditor 实例
 * @param props Props for the Select node | Select 节点的属性
 */
export function $insertSelectNode<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ValueType = any,
  OptionType extends BaseOptionType | DefaultOptionType = DefaultOptionType,
>(editor: LexicalEditor, props: SelectNodeProps<ValueType, OptionType>): void {
  editor.update(() => {
    const selectNode = $createSelectNode<ValueType, OptionType>({
      ...props,
      containerStyle: {
        paddingLeft: '8px',
        paddingRight: '8px',
        ...props.containerStyle,
      },
    });
    insertNodeAtCursor(editor, selectNode);
  });
}

/**
 * - EN: Props passed to the Select decorator component.
 * - CN: 传递给 Select 装饰组件的属性。
 */
interface SelectComponentProps<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ValueType = any,
  OptionType extends BaseOptionType | DefaultOptionType = DefaultOptionType,
> {
  node: SelectNode<ValueType, OptionType>;
}
type SerializedSelectNode<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ValueType = any,
  OptionType extends BaseOptionType | DefaultOptionType = DefaultOptionType,
> = Spread<
  {
    props?: SelectNodeProps<ValueType, OptionType>;
  },
  SerializedLexicalNode
>;
