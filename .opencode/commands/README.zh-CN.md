# OpenCode Commands

这个目录保存的是 `@tiny-codes/react-easy` 项目的 OpenCode 自定义斜杠命令。

## 每个命令适合什么时候用

- `/build`

  - 当你修改了 `src/` 下的源码，并且想执行完整的组件库构建时使用。
  - 适合确认 `lib/` 和 `es/` 产物是否能正确生成。

- `/build-core`

  - 当你只想跑 Father 构建步骤时使用。
  - 适合快速验证源码构建，但暂时不需要额外的 sourcemap 修正说明。

- `/storybook`

  - 当你在本地开发或预览组件时使用。
  - 适合做组件行为、属性和文档展示的可视化检查。

- `/build-storybook`

  - 当你修改了 stories、文档或公开组件 props 后使用。
  - 适合检查静态 Storybook 文档站点能否正常构建。

- `/typecheck`

  - 当你修改了导出类型、泛型、hooks 或组件 props 后使用。
  - 适合尽早发现严格 TypeScript 配置下的类型回归问题。

- `/lint`

  - 大多数代码改动后都适合使用，尤其是公共 API 和 Storybook 相关改动。
  - 适合检查 ESLint 规则、import 顺序以及格式是否符合仓库约定。

- `/format`

  - 当你想按仓库的 Prettier 规则统一格式时使用。
  - 适合修改了多个文件之后，或提交前做整理。

- `/test`

  - 当仓库中已有 Jest 测试，或者你想确认当前是否存在可运行测试时使用。
  - 适合执行全量测试或指定文件测试。

- `/test-name`

  - 当你只想跑一个 Jest 文件或某个特定测试用例时使用。
  - 适合聚焦调试和缩短反馈时间。

- `/verify`
  - 适合作为有一定规模改动后的默认最终校验命令。
  - 适合一次性执行精简版验证流程，覆盖 typecheck、lint 和最相关的构建步骤。

## 推荐工作流

1. 开发过程中，优先使用 `/storybook`、`/typecheck` 或 `/test-name` 获取快速反馈。
2. 收尾前，根据需要运行 `/lint` 和 `/format`。
3. 最后使用 `/verify` 做一次紧凑的最终检查。
4. 如果改动影响了组件库产物，再额外运行 `/build`。
5. 如果改动影响了 stories 或文档，再额外运行 `/build-storybook`。

## 仓库说明

- `src/` 是源码目录。
- `lib/` 和 `es/` 是生成产物目录。
- Storybook 是组件的主要本地预览和文档环境。
- Jest 已安装，但仓库在某些阶段可能没有已提交的测试文件或 Jest 配置。
