import type { ComponentType } from 'react';
import { useEffect, useMemo, useState } from 'react';
import type { TooltipProps } from 'antd';
import { Tooltip } from 'antd';
import type { EllipsisConfig } from 'antd/es/typography/Base';
import type { ParagraphProps } from 'antd/es/typography/Paragraph';
import type { TextProps } from 'antd/es/typography/Text';
import type { TitleProps } from 'antd/es/typography/Title';
import { useResizeDetector } from 'react-resize-detector';
import { useRefFunction, useRefValue } from '../../hooks';

function withEllipsisTypography<T extends TextProps | ParagraphProps | TitleProps>(
  Component: ComponentType<MakeEllipsisTypographyProps<T>>
) {
  return function EllipsisText(props: MakeEllipsisTypographyProps<T>) {
    const { ellipsis = true, children, text = children, watchResize = true, ...rest } = props;
    const [isEllipsis, setIsEllipsis] = useState(false);
    const [dom, setDom] = useState<HTMLElement | null>(null);
    const domRef = useRefValue(dom);
    const isAutoEllipsis = useMemo(() => ellipsis === true, [ellipsis]);
    const isAutoTooltip = useMemo(() => typeof ellipsis === 'object' && ellipsis.tooltip === true, [ellipsis]);
    const isAutoTooltipTitle = useMemo(
      () =>
        typeof ellipsis === 'object' &&
        ellipsis.tooltip &&
        typeof ellipsis.tooltip === 'object' &&
        'title' in ellipsis.tooltip &&
        ellipsis.tooltip.title === true,
      [ellipsis]
    );
    const isAuto = useMemo(
      () => isAutoEllipsis || isAutoTooltip || isAutoTooltipTitle,
      [isAutoEllipsis, isAutoTooltip, isAutoTooltipTitle]
    );
    const tooltipTitle = useMemo(() => (isEllipsis ? text : undefined), [isEllipsis, text]);

    const detectEllipsis = useRefFunction(
      () => dom && setIsEllipsis(dom.scrollWidth > dom.clientWidth || dom.scrollHeight > dom.clientHeight)
    );
    useResizeDetector({
      targetRef: watchResize ? domRef : undefined,
      onResize: detectEllipsis,
      refreshRate: 10,
      refreshOptions: {
        leading: false,
      },
    });

    useEffect(() => {
      if (dom && isAuto) {
        Promise.resolve().then(() => {
          detectEllipsis();
        });
      }
    }, [text, isAuto, dom]);

    return (
      <Tooltip {...((ellipsis as EllipsisConfig)?.tooltip as TooltipProps)} title={tooltipTitle}>
        <Component
          ref={setDom}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          {...(rest as any)}
          ellipsis={
            isAutoEllipsis
              ? { tooltip: undefined }
              : isAutoTooltip
                ? {
                    ...(ellipsis as EllipsisConfig),
                    tooltip: undefined,
                  }
                : isAutoTooltipTitle
                  ? {
                      ...(ellipsis as EllipsisConfig),
                      tooltip: {
                        ...((ellipsis as EllipsisConfig)?.tooltip as TooltipProps),
                        title: undefined,
                      },
                    }
                  : ellipsis
          }
        >
          {text}
        </Component>
      </Tooltip>
    );
  };
}

export type MakeEllipsisTypographyProps<T> = Omit<T, 'children'> & {
  /**
   * - **EN:** The text content to display. If not provided, the children will be used.
   * - **CN:** 要显示的文本内容。如果未提供，将使用子元素。
   */
  text?: string | undefined;
  /**
   * - **EN:** The children content to display. The `text` prop will take precedence if both are
   *   provided.
   * - **CN:** 要显示的子元素内容。如果同时提供了 `text` 属性，将优先使用 `text`。
   */
  children?: string | undefined | null;
  /**
   * - **EN:** Whether to monitor the component's size and adjust the ellipsis accordingly.
   * - **CN:** 是否监控组件的大小并相应地调整省略号。
   *
   * @default true
   */
  watchResize?: boolean;
};

export default withEllipsisTypography;
