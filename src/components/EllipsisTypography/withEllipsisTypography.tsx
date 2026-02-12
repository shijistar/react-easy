import type { ComponentType } from 'react';
import { useEffect, useMemo, useState } from 'react';
import type { TooltipProps } from 'antd';
import { Tooltip } from 'antd';
import type { EllipsisConfig } from 'antd/es/typography/Base';
import type { ParagraphProps } from 'antd/es/typography/Paragraph';
import type { TextProps } from 'antd/es/typography/Text';
import type { TitleProps } from 'antd/es/typography/Title';

function withEllipsisTypography<T extends TextProps | ParagraphProps | TitleProps>(
  Component: ComponentType<MakeEllipsisTypographyProps<T>>
) {
  return function EllipsisText(props: MakeEllipsisTypographyProps<T>) {
    const { ellipsis = true, text, ...rest } = props;
    const [isEllipsis, setIsEllipsis] = useState(false);
    const [dom, setDom] = useState<HTMLElement | null>(null);
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

    useEffect(() => {
      if (dom && isAuto) {
        Promise.resolve().then(() => {
          setIsEllipsis(dom.scrollWidth > dom.clientWidth || dom.scrollHeight > dom.clientHeight);
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
  text: string | undefined;
};

export default withEllipsisTypography;
