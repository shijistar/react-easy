获取一个**可变的 ref 对象**，并自动与最新值保持同步。与只保留初始值的 `useRef(value)` 不同，`useRefValue` 会在每次渲染时覆盖 `ref.current`，使 ref 始终反映当前状态。

## 适用场景

- 实现 `useRefFunction` 等稳定回调模式。
- 在 `setTimeout`、`setInterval` 或事件监听中读取最新 state/props，而无需重新订阅。
- 在 `useEffect` 中使用某个变量值，而无需将其加入依赖数组。
- 在 `useEffect` 中排除某个依赖项

## 核心特性

- **自动同步** —— 每次渲染都会将 `ref.current` 更新为最新值。
- **引用稳定** —— ref 对象本身永不变化，可安全用于依赖数组。
- **类型安全** —— 泛型签名保留包装值的类型。

## 示例代码

```tsx
import { useRefValue } from '@tiny-codes/react-easy';

export function Demo(props) {
  const { enabled } = props;
  const enabledRef = useRefValue(enabled);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (enabledRef.current) {
      console.log(count);
    }
  }, [count]);

  const capture = () => setCount(count + 1);

  return <button onClick={capture}>捕获 {count}</button>;
}
```
