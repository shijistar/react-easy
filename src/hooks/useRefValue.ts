import type { MutableRefObject } from 'react';
import { useRef } from 'react';

/**
 * - **EN:** Get a mutable ref object and automatically update the value change
 * - **CN:** 获取一个可变的ref对象，并自动更新值变化
 *
 * @param value the wrapped value | 被包装的值
 *
 * @returns A mutable ref object, but the reference is immutable | 可变的ref对象，但引用不可变
 */
const useRefValue = <T>(value: T): MutableRefObject<T> => {
  const ref = useRef<T>(value);
  ref.current = value;
  return ref;
};

export default useRefValue;
