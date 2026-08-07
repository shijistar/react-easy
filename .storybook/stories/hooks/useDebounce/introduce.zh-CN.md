对回调执行防抖处理，提供两种互补触发机制：经典尾沿防抖（等待周期内无新调用后执行）和 `maxWait` 上限（持续调用时也强制执行）。返回的函数额外暴露 `cancel`、`disable`、`enable`、`isDisabled` 以便运行时控制。

## 适用场景

- 搜索即输入场景，避免每次按键都触发请求。
- 窗口 `resize` / `scroll` 事件、表单校验或自动保存等需要抑制高频触发流的场景。
- 任何"用户停顿后才执行（尾沿）"或"按固定间隔保证执行（maxWait）"的慢操作。

## 核心特性

- **双触发机制** —— 经典防抖之外，`maxWait` 可强制兜底执行，长时间高频调用也能持续推进。
- **立即执行** —— `leading: true` 时，一次触发流的首次调用立即执行。
- **运行时控制** —— `cancel()` 丢弃待执行调用，`disable()` / `enable()` 开关防抖，`isDisabled()` 查询状态。
- **依赖驱动重建** —— `deps` 变化时重新创建防抖函数，行为类似 `useCallback`。

## 示例代码

```tsx
import { useEffect, useState } from 'react';
import { useDebounce } from '@tiny-codes/react-easy';

export function SearchBox() {
  const [query, setQuery] = useState('');
  const [applied, setApplied] = useState('');

  const debouncedApply = useDebounce((value: string) => setApplied(value), [wait, leading, maxWait], {
    wait: 300,
    leading: false,
    maxWait: 1000,
  });

  useEffect(() => {
    debouncedApply(query);
  }, [query, debouncedApply]);

  return <input value={query} onChange={(e) => setQuery(e.target.value)} />;
}
```

## 使用注意

- `wait: 0`（默认）表示不防抖，调用立即执行。
- 返回函数通过 ref 持有最新回调，因此 `fn` 无需在渲染间保持稳定引用。
- `disable()` 不同于 `cancel()`：cancel 只清除待执行定时器，disable 则让后续调用全部失效，直到 `enable()`。
- `maxWait` 以最近一次实际执行为基准，仅在 `maxWait > 0` 时生效。
