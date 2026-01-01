import { Typography } from 'antd';
import type { ParagraphProps } from 'antd/es/typography/Paragraph';
import withEllipsisTypography, { type MakeEllipsisTypographyProps } from './withEllipsisTypography';

export type EllipsisParagraphProps = MakeEllipsisTypographyProps<ParagraphProps>;

/**
 * - **EN:** A paragraph component with automatic ellipsis and tooltip functionality that displays a
 *   tooltip when the text overflows, and does not display a tooltip when the text does not
 *   overflow. The following three methods can enable the automatic tooltip feature:
 *
 *   1. Set the `ellipsis` property to `true`
 *   2. Set the `ellipsis.tooltip` property to `true`
 *   3. Set the `ellipsis.tooltip.title` property to `true`
 * - **CN:** 具有自动省略号和提示功能的段落组件，在文本溢出时显示工具提示，如果文本未溢出，则不显示工具提示。以下三种方式均可开启自动提示功能：
 *
 *   1. 设置 `ellipsis` 属性为 `true`
 *   2. 设置 `ellipsis.tooltip` 属性为 `true`
 *   3. 设置 `ellipsis.tooltip.title` 属性为 `true`
 */
const EllipsisParagraph = withEllipsisTypography<ParagraphProps>(Typography.Paragraph);

export default EllipsisParagraph;
