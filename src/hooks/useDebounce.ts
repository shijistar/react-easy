import { useCallback, useEffect, useRef } from 'react';
import useRefFunction from './useRefFunction';

export interface UseDebounceOptions {
  /**
   * - **EN:** Whether to execute at the start of the wait period. Default is `false`.
   * - **CN:** 是否在等待周期开始时执行，默认值为 `false`
   */
  leading?: boolean;
  /**
   * - **EN:** Regular debounce interval in milliseconds. Default is `0`, meaning no debounce.
   * - **CN:** 常规防抖间隔 (ms)，默认值为 `0`, 表示不进行防抖
   */
  wait?: number;
  /**
   * - **EN:** Maximum wait time in milliseconds. Default is `0`, meaning no maximum wait.
   * - **CN:** 最大等待时间 (ms)，默认值为 `0`, 表示不限制最大等待时间
   */
  maxWait?: number;
}
/**
 * - **EN:** Debounce Hook with dual trigger mechanisms:
 *
 *   1. Traditional debounce: Executes after a specified interval without new calls.
 *   2. Max wait: Forces execution after exceeding a specified maximum wait time.
 * - **CN:** 防抖 Hook：具有两种触发机制:
 *
 *   1. 传统防抖：等待指定时间内无新调用后执行
 *   2. 最大等待：超过指定最大等待时间后强制执行
 *
 * @param fn The function to debounce | 需要防抖的函数
 * @param deps Dependency array, re-creates the debounced function when dependencies change |
 *   依赖项数组，当依赖变化时重新创建防抖函数
 * @param options Configuration options | 配置选项
 *
 * @returns The debounced function | 防抖处理后的函数
 */
function useDebounce<T extends (...args: any[]) => unknown>(
  fn: T,
  deps: React.DependencyList,
  options: UseDebounceOptions = {}
): DebouncedFunc<T> {
  const { wait = 0, maxWait = 0, leading = false } = options;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fnRef = useRef<T>(fn);
  const lastExecutedTimeRef = useRef<number>(0); // The last execution timestamp
  const lastArgsRef = useRef<unknown[]>([]); // The last call arguments
  const isDisabledRef = useRef<boolean>(false); // Whether debounce is disabled

  // Update the latest function reference
  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  // The actual execution function
  const executeFunction = useCallback(() => {
    timeoutRef.current = null;
    lastExecutedTimeRef.current = Date.now();
    fnRef.current(...lastArgsRef.current);
  }, []);

  // The debounced function
  const debouncedFunction = useRefFunction((...args: Parameters<T>) => {
    if (isDisabledRef.current) {
      return;
    }
    const now = Date.now();
    lastArgsRef.current = args;

    // If leading is true and it's the first call, execute immediately
    if (leading && timeoutRef.current === null && now - lastExecutedTimeRef.current >= wait) {
      executeFunction();
      return;
    }

    // 1. Clear the existing timer
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // 2. Check if the maximum wait time has been exceeded, if so, execute immediately
    if (maxWait > 0 && now - lastExecutedTimeRef.current >= maxWait) {
      executeFunction();
      return;
    }

    // 3. Set a new debounce timer
    timeoutRef.current = setTimeout(executeFunction, wait);
  }) as DebouncedFunc<T>;
  debouncedFunction.cancel = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };
  debouncedFunction.disable = () => {
    isDisabledRef.current = true;
  };
  debouncedFunction.enable = () => {
    isDisabledRef.current = false;
  };
  debouncedFunction.isDisabled = () => isDisabledRef.current;
  return debouncedFunction;
}

export interface DebouncedFunc<T extends (...args: any[]) => unknown> {
  /**
   * - **EN:** The debounced function.
   * - **CN:** 防抖处理后的函数
   */
  (...args: Parameters<T>): ReturnType<T>;
  /**
   * - **EN:** Cancel any pending execution of the debounced function.
   * - **CN:** 取消防抖函数的任何待执行操作
   */
  cancel: () => void;
  /**
   * - **EN:** Disable the debounce functionality. Once disabled, subsequent calls to the function
   *   will have no effect until re-enabled.
   * - **CN:** 禁用此防抖函数，一旦被禁用，再次调用改函数将不会有任何效果，除非重新启用
   */
  disable: () => void;
  /**
   * - **EN:** Re-enable the debounce functionality after it has been disabled.
   * - **CN:** 重新启用此防抖函数
   */
  enable: () => void;
  /**
   * - **EN:** Check if the debounce functionality is currently disabled.
   * - **CN:** 检查此防抖函数当前是否被禁用
   */
  isDisabled(): boolean;
}

export default useDebounce;
