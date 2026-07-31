import type { PropsWithChildren } from 'react';
import { App as AntdApp, ConfigProvider as AntdConfigProvider } from 'antd';
import ConfigProvider from '../../src/components/ConfigProvider';

/**
 * 真实集成测试包裹：提供 antd App（app.modal）、antd ConfigProvider（getPrefixCls）、 react-easy
 * ConfigProvider（ReactEasyContext）。不 mock 任何 Ant Design 内部。
 */
export function BrowserTestWrapper({ children }: PropsWithChildren) {
  return (
    <AntdConfigProvider>
      <AntdApp>
        <ConfigProvider>{children}</ConfigProvider>
      </AntdApp>
    </AntdConfigProvider>
  );
}
