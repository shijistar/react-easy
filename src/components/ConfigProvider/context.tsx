import { createContext, type ReactNode } from 'react';

export interface AntHelperContextProps {
  // /** 获取本地化文本 */
  /**
   * **EN:** Get localized text
   *
   * **ZH:** 获取本地化文本
   *
   * @param key Normal text or key of local resource | 普通文本或本地资源的键值
   * @param args Parameters of the localized text | 本地化文本的参数
   *
   * @returns Localized text | 本地化文本
   */
  localize?: <T extends string>(key: T | undefined, args?: Record<string, unknown>) => ReactNode | undefined;
}

export const defaultContextValue: AntHelperContextProps = {};

const AntHelperContext = createContext<AntHelperContextProps>(defaultContextValue);

export default AntHelperContext;
