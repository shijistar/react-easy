import { useContext, useMemo } from 'react';
import ReactEasyContext from '../components/ConfigProvider/context';
import { t } from '../locales';

const useT = (): typeof t => {
  const context = useContext(ReactEasyContext);
  const lang = context.lang;

  // eslint-disable-next-line @tiny-codes/react-hooks/exhaustive-deps
  return useMemo(() => t, [lang]);
};

export default useT;
