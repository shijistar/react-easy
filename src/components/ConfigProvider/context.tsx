import { createContext, type ReactNode } from 'react';
import type { Langs } from '../../locales';

export interface ReactEasyContextProps {
  /**
   * - **EN:** Language of the component, used for global configuration, can be 'en-US' or 'zh-CN'
   * - **CN:** 组件的语言，用于全局配置，可以是'en-US'或'zh-CN'
   */
  lang?: Langs;
  /**
   * - **EN:** Default title of the confirm dialog, used for global configuration, can be normal text
   *   or the key of localized resources, the key of localized resources will be converted into
   *   localized text through the `localize` method
   * - **CN:** 确认弹框的默认标题，用于全局配置，可以是普通文本或本地化资源的键值，本地化资源的键值会通过`localize`方法转换成本地化文本
   */
  defaultConfirmTitle?: ReactNode;
  /**
   * - **EN:** Default content of the confirm dialog, used for global configuration, can be normal
   *   text or the key of localized resources, the key of localized resources will be converted into
   *   localized text through the `localize` method
   * - **CN:** 确认弹框的默认内容，用于全局配置，可以是普通文本或本地化资源的键值，本地化资源的键值会通过`localize`方法转换成本地化文本
   */
  defaultConfirmContent?: ReactNode;

  /**
   * - **EN:** Default title of the deletion confirmation dialog, used for global configuration, can
   *   be normal text or the key of localized resources, the key of localized resources will be
   *   converted into localized text through the `localize` method
   * - **CN:** 删除确认弹框的默认标题，用于全局配置，可以是普通文本或本地化资源的键值，本地化资源的键值会通过`localize`方法转换成本地化文本
   */
  defaultDeletionConfirmTitle?: ReactNode;

  /**
   * - **EN:** Default content of the deletion confirmation dialog, used for global configuration, can
   *   be normal text or the key of localized resources, the key of localized resources will be
   *   converted into localized text through the `localize` method
   * - **CN:** 删除确认弹框的默认内容，用于全局配置，可以是普通文本或本地化资源的键值，本地化资源的键值会通过`localize`方法转换成本地化文本
   */
  defaultDeletionConfirmContent?: ReactNode;

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
}

export const defaultContextValue: ReactEasyContextProps = {
  lang: 'en',
};

const ReactEasyContext = createContext<ReactEasyContextProps>(defaultContextValue);

export default ReactEasyContext;
