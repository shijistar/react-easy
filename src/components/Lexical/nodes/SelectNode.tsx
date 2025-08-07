import { type CSSProperties, type ReactNode, useCallback } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { Select } from 'antd';
import type { SelectProps } from 'antd';
import type { BaseOptionType, DefaultOptionType } from 'antd/es/select';
import type { LexicalEditor, LexicalNode, SerializedLexicalNode, Spread } from 'lexical';
import { insertNodeAtCursor, updateDomStyle } from '../helpers';
import type { BaseDecoratorNodeProps } from './base';
import { BaseDecoratorNode } from './base';

export interface SelectNodeProps<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ValueType = any,
  OptionType extends BaseOptionType | DefaultOptionType = DefaultOptionType,
> extends SelectProps<ValueType, OptionType>,
    BaseDecoratorNodeProps {
  /**
   * 在获取editor的textContent时，是否将选项的label作为文本内容插入到编辑器中，默认 `value`
   *
   * - `label` - 将选项的label作为文本内容
   * - `value` - 将选项的value作为文本内容
   */
  textContentMode?: 'label' | 'value';
  /** 是否在`textContext`两边添加一个空格，默认`true` */
  spaceAround?: boolean;
  /** 容器样式 */
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getPropValue(propName: keyof SelectNodeProps<ValueType, OptionType>): any {
    return this.__props?.[propName];
  }

  setProps(props: SelectNodeProps<ValueType, OptionType>): void {
    const writable = this.getWritable();
    writable.__props = {
      ...writable.__props,
      ...props,
    };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SelectComponent<ValueType = any, OptionType extends BaseOptionType | DefaultOptionType = DefaultOptionType>({
  node,
}: SelectComponentProps<ValueType, OptionType>): ReactNode {
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const { textContentMode, spaceAround, containerStyle, ...selectProps } = node.__props || {};
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

export function $createSelectNode<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ValueType = any,
  OptionType extends BaseOptionType | DefaultOptionType = DefaultOptionType,
>(props?: SelectNodeProps<ValueType, OptionType>): SelectNode<ValueType, OptionType> {
  return new SelectNode<ValueType, OptionType>(props);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function $isSelectNode(node: LexicalNode | null | undefined): node is SelectNode<any, any> {
  return node instanceof SelectNode;
}

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

interface SelectComponentProps<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ValueType = any,
  OptionType extends BaseOptionType | DefaultOptionType = DefaultOptionType,
> {
  node: SelectNode<ValueType, OptionType>;
}
export type SerializedSelectNode<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ValueType = any,
  OptionType extends BaseOptionType | DefaultOptionType = DefaultOptionType,
> = Spread<
  {
    props?: SelectNodeProps<ValueType, OptionType>;
  },
  SerializedLexicalNode
>;
