数学工具函数 `random` 提供密码学强度的随机数，包含两个重载：`random()` 生成 `[0, 1)` 之间的小数，`random(min, max)` 生成包含两端在内的均匀随机整数。它优先使用 `crypto.randomInt`/`getRandomValues`，并通过无偏的拒绝采样算法保证分布公平。其中无参形式 `random()` 是 `Math.random()` 的安全替代：`Math.random()` 加密不安全，且会被静态代码扫描报告为安全告警；改用 `random()` 可消除此类告警。

## 适用场景

- 需要非可预测的随机小数，用于概率判断或主题切换。
- 在某个范围内生成随机整数，例如随机选取数组下标或抽取号码。
- 希望比内置 `Math.random` 生成器更均匀、更安全的场景。
- 替换 `Math.random()` 调用，消除静态代码扫描中的安全告警。

## 核心特性

- **双重载** —— `random()` 生成 `[0, 1)` 小数，`random(min, max)` 生成包含两端的整数。
- **密码学安全** —— 优先使用 Node `crypto.randomInt` / `webcrypto`，并提供无偏的拒绝采样回退。
- **`Math.random()` 安全替代** —— 无参 `random()` 返回值域同为 `[0, 1)` 的浮点数，可直接替换 `Math.random()`，规避其加密不安全问题与静态扫描告警。
- **参数校验** —— min/max 非有限数或非整数时抛出 `TypeError`。
- **容错排序** —— 当 `min` 大于 `max` 时自动交换，始终保证范围合法。

## 示例代码

```ts
import { random } from '@tiny-codes/react-easy';

// [0, 1) 之间的小数
const ratio = random(); // 例如 0.5123

// [min, max] 包含两端的整数，例如掷骰子
const die = random(1, 6);

// min 大于 max 时自动交换
const safe = random(5, 1); // 等价于 random(1, 5)
```

## 使用注意

- 无参形式返回 `[0, 1)` 的小数；两参形式返回 `[min, max]`（两端包含）的整数。
- `min` 与 `max` 必须同时提供 —— 只传一个、传入非有限数或非整数都会抛出 `TypeError`。
- 当 `min` 大于 `max` 时会在计算前交换，因此不会抛出范围错误。
- 借助拒绝采样，整数范围保持均匀无偏差；对常规范围性能影响很小。
