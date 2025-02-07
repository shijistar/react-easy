import { useContext } from 'react';
import AntHelperContext, { defaultContextValue } from '../components/ConfigProvider/context';

const useValidateContext = () => {
  const context = useContext(AntHelperContext);
  if (!context || context === defaultContextValue) {
    console.warn(
      `ConfigProvider should be wrapped outside of any components of @tiny-codes/react-helpers!

import { ConfigProvider } from '@tiny-codes/react-helpers';
<ConfigProvider>
  <App />
</ConfigProvider>`
    );
  }
  return context;
};

export default useValidateContext;
