import { useContext } from 'react';
import ReactEasyContext, { defaultContextValue } from '../components/ConfigProvider/context';

const useContextValidator = () => {
  const context = useContext(ReactEasyContext);
  if (!context || context === defaultContextValue) {
    console.warn(
      `ConfigProvider should be wrapped outside of any components of @tiny-codes/react-easy!

import { ConfigProvider } from '@tiny-codes/react-easy';
<ConfigProvider>
  <App />
</ConfigProvider>`
    );
  }
  return context;
};

export default useContextValidator;
