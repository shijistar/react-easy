import type { Dispatch, SetStateAction } from 'react';
import { useState } from 'react';

export interface UsePropStateOptions<T> {
  /**
   * - **EN:** The value used while the prop is `undefined`. It is also the initial state, so a
   *   component can support the `controlled/uncontrolled` pattern (open + defaultOpen) while the
   *   change detection still watches the raw prop.
   * - **CN:** prop 为 `undefined` 时使用的值。它同时也是初始状态，因此组件可以支持 `受控/非受控模式`（例如 open +
   *   defaultOpen），而变化检测仍然针对原始 prop。
   */
  fallback?: T;
  /**
   * - **EN:** Custom equality check used to detect whether the prop has changed. Defaults to
   *   `Object.is`. Pass a shallow/deep comparator when the prop is an object/array that is
   *   re-created on every render, otherwise the internal state would be reset on every render (and
   *   could even loop forever).
   * - **CN:** 判断 prop 是否变化的自定义相等函数，默认使用 `Object.is`。当 prop 是每次渲染都会新建的
   *   对象/数组时，请传入浅比较或深比较，否则每次渲染都会重置内部状态（甚至造成死循环）。
   */
  isEqual?: (prev: T, next: T) => boolean;
  /**
   * - **EN:** Whether the prop is allowed to drive the internal state. While `false` the prop is
   *   still tracked (so a later change is still detected), but its value is not written into
   *   state.
   * - **CN:** 是否允许 prop 驱动内部状态。为 `false` 时仍会记录 prop 的变化（以便之后能检测到变化）， 但不会把 prop 的值写入 state。
   *
   * @default true
   */
  enabled?: boolean;
}

/**
 * - **EN:** A `useState` that stays in sync with a prop. It is the drop-in replacement for the
 *   `useState(prop)` + `useEffect(() => setState(prop), [prop])` anti-pattern: the adjustment
 *   happens during render, so there is no extra render pass with a stale value, and no
 *   `react-hooks/set-state-in-effect` (React Compiler) violation.
 * - **CN:** 与 prop 保持同步的 `useState`，用于替代 `useState(prop)` + `useEffect(() => setState(prop), [prop])`
 *   反模式：同步在渲染期间完成，因此不会先用旧值多渲染一帧， 也不会触发 `react-hooks/set-state-in-effect`（React Compiler）报错。
 *
 * @example
 *   // Controlled/uncontrolled: `open` wins when provided, otherwise `false` is used as the default.
 *   const [open, setOpen] = usePropState<boolean>(openInProps, {
 *     fallback: false,
 *     enabled: openInProps !== undefined,
 *   });
 *
 * @param value The prop driving the state | 驱动状态的 prop
 * @param options Configuration options | 配置选项
 *
 * @returns `[state, setState]`, the same shape as `useState` | 与 `useState` 相同的 `[state, setState]`
 */
const usePropState = <T>(
  value: T | undefined,
  options: UsePropStateOptions<T> = {},
): [T, Dispatch<SetStateAction<T>>] => {
  const { fallback, isEqual, enabled = true } = options;
  const resolve = (next: T | undefined): T => (next === undefined ? (fallback as T) : next);

  // Use the lazy initializer so a function prop is stored as-is, instead of being called as an initializer.
  const [state, setState] = useState<T>(() => resolve(value));
  // The raw prop is tracked, so that a transition such as `undefined` -> `false` is still detected.
  const [prevValue, setPrevValue] = useState<T | undefined>(() => value);

  const changed = isEqual ? !isEqual(prevValue as T, value as T) : !Object.is(prevValue, value);

  // Adjust the state during render instead of inside an effect.
  // https://react.dev/reference/react/useState#storing-information-from-previous-renders
  if (changed) {
    setPrevValue(value);
    if (enabled) {
      setState(resolve(value));
    }
  }

  return [state, setState];
};

export default usePropState;
