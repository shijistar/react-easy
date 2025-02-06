import { useContext } from 'react';
import AntHelperContext from '../components/ConfigProvider/context';

const useValidateContext = () => {
  const context = useContext(AntHelperContext);
  if (!context) {
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
