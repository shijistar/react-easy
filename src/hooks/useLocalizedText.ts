import { type ReactNode, useContext } from 'react';
import AntdHelperContext, { type ReactEasyContextProps } from '../components/ConfigProvider/context';

/**
 * A custom hook that converts input content to localized text using the localize method from
 * AntdHelperContext
 *
 * @param content - The content to be localized
 *
 * @returns The localized text
 */
const useLocalizedText: NonNullable<ReactEasyContextProps['localize']> = (content, args) => {
  const { localize } = useContext(AntdHelperContext);
  return localize ? localize(content, args) : (content as ReactNode);
};

export default useLocalizedText;
