与 prop 保持同步的 `useState`。它是 `useState(prop)` + `useEffect(() => setState(prop), [prop])` 反模式的直接替代：同步发生在**渲染期间**，因此不会先用旧值多渲染一帧，也不会触发 `react-hooks/set-state-in-effect`（React Compiler）报错。

## 适用场景

- 组件把 prop 镜像为本地 state，同时允许用户编辑该 state（行内编辑、筛选面板、草稿）。
- 受控/非受控组件：prop 可选，缺省时需要提供默认值。
- 任何「外部值真正变化时才采用，而期间的本地编辑要保留」的场景。

## 核心特性

- **渲染期同步** —— 在观察到新 prop 的同一次渲染中就完成修正，旧值不会被提交。
- **按原始 prop 判断变化** —— `undefined` → `false` 这类变化依然能被检测到；`fallback` 只决定 prop 为 `undefined` 时使用哪个值。
- **`enabled` 开关** —— 为 `false` 时仍持续记录 prop 变化，之后的变化依然能被捕获，但期间不写入 state。
- **`isEqual` 比较器** —— 避免 prop 是每次渲染都新建的对象时反复重置 state。
- **与 `useState` 形状一致** —— 返回 `[state, setState]`，迁移只需改一行。

## 示例代码

最简单用法 —— 直接获取 `title` 属性，完全不传 options：

```tsx
import { usePropState } from '@tiny-codes/react-easy';

export function TitleEditor({ title }: { title: string }) {
  // 当 title 变化时，draft 会自动更新
  const [draft, setDraft] = usePropState(title);

  return <input value={draft} onChange={(e) => setDraft(e.target.value)} />;
}
```

带 options —— 适用于可选的、每次渲染都会新建的对象 prop：

```tsx
import { useState } from 'react';
import { usePropState } from '@tiny-codes/react-easy';

interface Draft {
  title: string;
}

export function TitleEditor({ value }: { value?: Draft }) {
  // 受控/非受控：传入 prop 时以 prop 为准，否则使用 { title: '' } 作为默认值。
  const [draft, setDraft] = usePropState<Draft>(value, {
    fallback: { title: '' },
    enabled: value !== undefined,
    // 按内容比较：内容相同但引用不同的新对象不应重置本地编辑。
    isEqual: (prev, next) => prev.title === next.title,
  });

  return <input value={draft.title} onChange={(e) => setDraft({ title: e.target.value })} />;
}
```

## 使用说明

- **对象/数组类型的 prop 若在渲染中内联创建，必须传 `isEqual`。** 默认的 `Object.is` 会让它每次都「看起来变了」，导致 state 被反复重置（甚至死循环）。
- **`enabled` 不是一次性开关。** 为 `false` 时 prop 仍被记录，所以重新启用**不会**立刻同步当前的 prop 值，只有 prop 下次真正变化时才会写入 state。
- **`fallback` 不参与变化检测。** 把 prop 写成 `openInProps ?? false` 会抹掉 `undefined` → `false` 这个变化；默认值请交给 `fallback`。
- 返回的 setter 引用是稳定的，但 `eslint-plugin-react-hooks` 无法识别自定义 hook 的 setter，请把它写进 `useCallback` / `useEffect` 的依赖数组。
