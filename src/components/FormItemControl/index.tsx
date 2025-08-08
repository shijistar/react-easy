import type { FC, ReactNode } from 'react';

export interface FormItemControlProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children: (options: { value: any; onChange: (value: any) => void }) => ReactNode;
}

/**
 * - **EN:** FormItemControl is a component that wraps custom content into a valid Form.Item control,
 *   and must be used as a direct child of Form.Item. It provides its children with a `value` and an
 *   `onChange` function, allowing them to interact with the form state. This is useful for creating
 *   custom form controls that need to integrate with Ant Design's Form.Item.
 * - **CN:** FormItemControl 是一个将自定义内容包装成有效的 Form.Item 控件的组件，必须作为 Form.Item 的直接子节点使用。它向子组件提供了一个
 *   `value` 和一个 `onChange` 函数，使得子组件能够与表单状态进行交互。这对于创建需要与 Ant Design 的 `Form.Item` 集成的自定义表单控件非常有用。
 */
const FormItemControl: FC<FormItemControlProps> = (props) => {
  // eslint-disable-next-line react/prop-types
  const { children, value, onChange } = props as FormItemControlProps & {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onChange: (value: any) => void;
  };

  return children({ value, onChange });
};

export default FormItemControl;
