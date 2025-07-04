import { useCallback, useRef } from 'react';

/**
 * - **EN:** Generate an immutable function reference, the dependencies inside the function will be
 *   updated in real time, but the function itself will not change, which is very useful when used
 *   as a dependency of `useEffect`.
 * - **CN:** 生成一个引用不可变的函数，函数内部的依赖项会保持实时更新，但函数本身不会变化，在作为 `useEffect` 的依赖时非常有用
 *
 * @param fn Function body | 函数体
 *
 * @returns An function with immutable reference | 引用不可变的函数
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const useRefFunction = <T extends (...args: any[]) => any>(fn: T | undefined) => {
  const ref = useRef<T | undefined>(fn);
  ref.current = fn;

  // eslint-disable-next-line @tiny-codes/react-hooks/exhaustive-deps
  return useCallback(((...args: any[]) => ref.current?.(...args)) as T, []);
};

export default useRefFunction;
