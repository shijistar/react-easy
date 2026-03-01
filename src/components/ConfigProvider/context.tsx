import { createContext, type ReactNode } from 'react';
import type { Langs } from '../../locales';
import type { PulseAnimationProps } from '../Animation/Pulse';
import type { BreakLinesProps } from '../BreakLines';
import type { ColumnSettingProps } from '../ColumnSetting';
import type { ConfirmActionProps } from '../ConfirmAction';
import type { ContextMenuProps } from '../ContextMenu';
import type { EditableTextProps } from '../EditableText';
import type { ModalActionProps } from '../ModalAction';

export interface ReactEasyContextProps {
  /**
   * - **EN:** Language of the component, used for global configuration, can be 'en-US' or 'zh-CN'
   * - **CN:** 组件的语言，用于全局配置，可以是'en-US'或'zh-CN'
   *
   * @default 'en-US'
   */
  lang?: Langs;
  /**
   * - **EN:** Get localized text
   * - **CN:** 获取本地化文本
   *
   * @param key Normal text or key of local resource | 普通文本或本地资源的键值
   * @param args Parameters of the localized text | 本地化文本的参数
   *
   * @returns Localized text | 本地化文本
   */
  localize?: <T>(key: T, args?: Record<string, unknown>) => ReactNode;

  /**
   * - **EN:** Global configuration for `PulseAnimation` component, which can be used to set default
   *   animation properties for all `PulseAnimation` components in the application.
   * - **CN:** `PulseAnimation`组件的全局配置，可以用来设置应用中所有`PulseAnimation`组件的默认动画属性。
   */
  PulseAnimation?: PulseAnimationProps;
  /**
   * - **EN:** Global configuration for `BreakLines` component, which can be used to set default
   *   properties for all `BreakLines` components in the application.
   * - **CN:** `BreakLines`组件的全局配置，可以用来设置应用中所有`BreakLines`组件的默认属性。
   */
  BreakLines?: BreakLinesProps;
  /**
   * - **EN:** Global configuration for `ColumnSetting` component, which can be used to set default
   *   properties for all `ColumnSetting` components in the application.
   * - **CN:** `ColumnSetting`组件的全局配置，可以用来设置应用中所有`ColumnSetting`组件的默认属性。
   */
  ColumnSetting?: ColumnSettingProps;
  /**
   * - **EN:** Global configuration for `ContextMenu` component, which can be used to set default
   *   properties for all `ContextMenu` components in the application.
   * - **CN:** `ContextMenu`组件的全局配置，可以用来设置应用中所有`ContextMenu`组件的默认属性。
   */
  ContextMenu?: ContextMenuProps;
  /**
   * - **EN:** Global configuration for `EditableText` component, which can be used to set default
   *   properties for all `EditableText` components in the application.
   * - **CN:** `EditableText`组件的全局配置，可以用来设置应用中所有`EditableText`组件的默认属性。
   */
  EditableText?: EditableTextProps;

  /**
   * - **EN:** Global configuration for `ConfirmAction` component, which can be used to set default
   *   modal title and content for all `ConfirmAction` components in the application.
   * - **CN:** `ConfirmAction`组件的全局配置，可以用来设置应用中所有`ConfirmAction`组件的默认模态框标题和内容。
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ConfirmAction?: ConfirmActionProps<any, never>;
  /** @deprecated Use `ConfirmAction.title` instead */
  defaultConfirmTitle?: ReactNode;
  /** @deprecated Use `ConfirmAction.content` instead */
  defaultConfirmContent?: ReactNode;

  /**
   * - **EN:** Global configuration for `DeleteConfirmAction` component, which can be used to set
   *   default modal title and content for all `DeleteConfirmAction` components in the application.
   * - **CN:** `DeleteConfirmAction`组件的全局配置，可以用来设置应用中所有`DeleteConfirmAction`组件的默认模态框标题和内容。
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  DeletionConfirmAction?: ConfirmActionProps<any, never>;
  /** @deprecated Use `DeletionConfirmAction.title` instead */
  defaultDeletionConfirmTitle?: ReactNode;
  /** @deprecated Use `DeletionConfirmAction.content` instead */
  defaultDeletionConfirmContent?: ReactNode;

  /**
   * - **EN:** Global configuration for `ModalAction` component, which can be used to set default
   *   modal title and content for all `ModalAction` components in the application.
   * - **CN:** `ModalAction`组件的全局配置，可以用来设置应用中所有`ModalAction`组件的默认模态框标题和内容。
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ModalAction?: Partial<ModalActionProps<any, any, any, any, any>>;
}

export const defaultContextValue: ReactEasyContextProps = {
  lang: 'en-US',
};

const ReactEasyContext = createContext<ReactEasyContextProps>(defaultContextValue);

export default ReactEasyContext;
