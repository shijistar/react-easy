import type { FC, ReactNode } from 'react';
import AntHelperContext, { type AntHelperContextProps } from './context';

export interface ConfigProviderProps extends AntHelperContextProps {
  children: ReactNode;
}

/**
 * **EN:** Provide global configuration for AntdHelper
 *
 * **CN:** 提供AntdHelper的全局配置
 */
const ConfigProvider: FC<ConfigProviderProps> = (props) => {
  const { children, ...restProps } = props;
  return <AntHelperContext.Provider value={restProps}>{children}</AntHelperContext.Provider>;
};

export default ConfigProvider;
