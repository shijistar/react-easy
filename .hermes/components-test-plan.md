# React-Easy Components Unit Test Plan

## Overview
为 `@tiny-codes/react-easy` 的 `src/components/` 目录添加单元测试，目标覆盖率 100%（全局阈值），每个逻辑分支至少一个测试用例。

## Test Environment
- 框架: Vitest v4 + @testing-library/react + jsdom
- 配置: vitest.config.ts (已配置 coverage.globalThreshold=100)
- 模式: 纯单元测试（mock 外部依赖） + 集成测试（mock 关键 UI 库）

## Phase A: Low-Cost Rendering Components ✅

| Component | File | Tests | Status |
|-----------|------|-------|--------|
| BreakLines | test/components/BreakLines.test.tsx | 8 ✅ | 100% coverage |
| Loading | test/components/Loading.test.tsx | 6 ✅ | 100% coverage |
| PulseAnimation | test/components/PulseAnimation.test.tsx | 7 ✅ | 100% coverage |
| FormItemControl | test/components/FormItemControl.test.tsx | 3 ✅ | 100% coverage |
| createIconfont | test/components/createIconfont.test.tsx | 6 ✅ | 100% coverage |
| DeleteConfirmAction | test/components/DeleteConfirmAction.test.tsx | 6 ✅ | 100% coverage |
| ConfigProvider | test/components/ConfigProvider.test.tsx | 11 ✅ | 100% coverage |
| EllipsisTypography (leaves) | test/components/EllipsisTypography.test.tsx | 33 ✅ | **100% S/B/F/L** |
| withEllipsisTypography | test/components/withEllipsisTypography.test.tsx | 9 ✅ | 100% S, 97% B |
| Iconfont (barrel) | src/components/Iconfont/index.tsx | c8 ignore | - |
| Barrel exports | test/components/barrel.test.tsx | 13 ✅ | - |

**Key implementation notes:**
- @see `test/components/barrel.test.tsx` - Uses `vi.mock` for 10 components to validate barrel exports
- @see `test/components/EllipsisTypography.test.tsx` - 33 tests **using real HOC**, not mocked. Replaced mock approach (from Phase A) after circular dependencies were resolved (Phase B barrel-import fix). Covers all 4 leaf components (EllipsisText/Paragraph/Title/Link) with `text`, `children`, and type-specific props (copyable, `level`, `href`, `code`, `strong`, `disabled`, mark/underline/delete/italic, etc.)
- Style files (BreakLines/style, Loading/style, Pulse/style, ConfigProvider/style) covered via component rendering
- withEllipsisTypography: 9 tests, 1 branch missed (see below)

## Phase B: Medium-Cost Interactive Components ✅ 已实现（部分需补充）

| Component | File | Tests | Coverage | Status |
|-----------|------|-------|----------|--------|
| withEllipsisTypography | test/components/withEllipsisTypography.test.tsx | 9 ✅ | 100% S, 97% B | ⚠️ 1 branch missed |
| OverflowTags | test/components/OverflowTags.test.tsx | 15 ✅ | 100% | ✅ |
| ColumnSetting | test/components/ColumnSetting.test.tsx | 11 ✅ | 66% S, 55% B | ⚠️ 需补充 |
| ContextMenu | test/components/ContextMenu.test.tsx | 12 ✅ | 70% S, 47% B | ⚠️ 需补充 |

### withEllipsisTypography - 1 branch missed
The `isAuto` branch when `autoEllipsis` is `true` but `isAutoEllipsis` check differs from `isAutoTooltip`. The branch `autoEllipsis = isAuto . 'auto' . isAuto . '...'` logic has 3 branches: auto, false, custom object.

## Phase C: High-Cost Components (待评估)

| Component | Lines | Cost | Notes |
|-----------|-------|------|-------|
| **Lexical helpers** | 303 | 🔴 高 | 依赖 lexical 包 $ 函数，需 `createTestEditor` |
| **Lexical nodes (base)** | 203 | 🔴 高 | 抽象类扩展 DecoratorNode/ElementNode |
| **Lexical/nodes/DivNode** | 142 | 🔴 高 | Lexical 自定义节点 |
| **Lexical/nodes/CloseIcon** | 184 | 🔴 高 | Lexical 自定义装饰器节点 |
| **Lexical/nodes/ExtendTextNode** | 106 | 🔴 高 | Lexical 自定义文本节点 |
| FloatDrawer | 待定 | 🟡 中 | 复杂交互组件 |
| EditableText | 待定 | 🟡 中 | 编辑模式组件 |
| ModalAction | 815 | 🔴 高 | 巨大的组件 |
| VirtualTextViewer | 待定 | 🟡 中 | 虚拟滚动文本查看器 |

## ESLint Rule: no-barrel-imports ✅

新增 `no-restricted-imports` 规则，禁止从 barrel 文件直接导入：

```js
'no-restricted-imports': ['error', {
  paths: [
    // hooks barrel
    { name: '../../hooks', message: '...' },
    // components barrel
    { name: '../components', message: '...' },
    // utils barrel
    { name: '../../utils', message: '...' },
    // Lexical sub-barrel
    { name: '../Lexical', message: '...' },
    // ... multiple depth levels
  ],
}],
```

同时已修改 8 个源文件，将 barrel 引用改为直接文件引用，彻底阻断循环依赖：

| File | Before | After |
|------|--------|-------|
| withEllipsisTypography.tsx | `from '../../hooks'` | `from '../../hooks/useRefFunction'` |
| ColumnSetting/index.tsx | `from '../../hooks'` | `from '../../hooks/useRefFunction'` |
| ContextMenu/index.tsx | `from '../../hooks'` | `from '../../hooks/useRefFunction'` |
| VirtualTextViewer/index.tsx | `from '../../hooks'` | `from '../../hooks/useRefFunction'` |
| ModalAction/index.tsx | `from '../../hooks'` | `from '../../hooks/useRefValue'` |
| useSplitter.tsx | `from '../components'` | `from '../components/ConfigProvider'` |
| FloatDrawer/style/index.ts | `from '../../../utils'` | `from '../../../utils/color'` |
| Lexical/nodes/CloseIcon.tsx | `from '../../../utils'` | `from '../../../utils/string'` |

## Architecture Decision: Direct Import Pattern
- **Problem**: Barrel imports (`../../hooks`) create hidden circular dependencies — `withEllipsisTypography → hooks barrel → useSplitter → components barrel → EllipsisText → withEllipsisTypography 🔁`
- **Solution**: All components/hooks/utils internal imports must import directly from the specific file, not the barrel index
- **Enforcement**: ESLint `no-restricted-imports` with `paths` option (exact matching, not gitignore patterns)
- **ESLint version note**: `patterns` option uses `ignore` package (gitignore-style, prefix-matching). `paths` option uses exact match. Use `paths` for barrel restriction.

## Test Results (Full Run — components only)
```
Test Files  14 passed (14)
Tests  141 passed (141)
```

## Status: Deferred (User Confirmed)
The following are postponed to future sessions per user decision:

1. **Phase C: Lexical (helpers + nodes + base)** — 高成本（需 `createTestEditor` 及 Lexical 状态机模拟）
2. **ColumnSetting 补深交互** → 当前 66%/55%/69%/66%，需补齐 DropDown 选择/重置/持久化分支
3. **ContextMenu 补深交互** → 当前 70%/47%/62%/80%，需补齐交互分支
4. **其他未覆盖组件** → EditableText / FloatDrawer / ModalAction / VirtualTextViewer
