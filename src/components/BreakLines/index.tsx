import { createElement, type FC, Fragment, type ReactNode } from 'react';

export interface BreakLinesProps {
  /**
   * **EN:** Text content
   *
   * **CN:** 文本内容
   */
  value: string | undefined;
  /**
   * **EN:** Whether to enable line breaking
   *
   * **CN:** 是否启用换行功能
   *
   * @default true
   */
  enabled?: boolean;
  /**
   * **EN:** Line break character
   *
   * **CN:** 换行符
   *
   * @default '\n'
   */
  EOL?: string;
  /**
   * **CN:** 渲染dom节点的标签名
   *
   * **EN:** Render the tag name of the DOM node
   *
   * @default false
   */
  // eslint-disable-next-line @typescript-eslint/ban-types
  tagName?: 'span' | 'div' | 'i' | 'pre' | (string & {}) | false;
  /**
   * **EN:** The CSS class name of the dom node, if `tagName` is set to false, this property is
   * invalid
   *
   * **CN:** dom节点的css类名，如果`tagName`设置为false，则此属性无效
   */
  className?: string;
}

/**
 * **EN:** Output a piece of text, keeping line breaks
 *
 * **CN:** 输出一段文本，保留换行符
 *
 * @example
 *   <BreakLines value="hello \n world" />;
 *   // hello <br/> world
 */
const BreakLines: FC<BreakLinesProps> = (props) => {
  const { value, className, tagName = false, enabled = true, EOL = '\n' } = props;

  let content: ReactNode;
  if (value) {
    if (enabled) {
      if (value.includes(EOL)) {
        const segments = value?.split(EOL);
        content = segments.map((str, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <Fragment key={`${str}::::${i}`}>
            {str}
            {i !== segments.length - 1 && <br />}
          </Fragment>
        ));
      } else {
        content = value;
      }
    } else {
      content = value;
    }
  } else {
    content = value;
  }

  if (tagName) {
    return createElement(tagName, { className }, content);
  } else {
    return <>{content}</>;
  }
};

export default BreakLines;
