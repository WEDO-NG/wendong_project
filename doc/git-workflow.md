# Git 工作流与提交规范指南

本文档详细说明了本项目的 Git 提交规范配置及其背后的实现原理，旨在帮助团队成员理解并遵守统一的代码提交标准。

## 1. 为什么需要提交规范？

- **自动生成 Changelog**：规范的提交信息可以自动生成版本变更日志。
- **语义化版本管理**：基于提交类型自动决定版本号升级策略（Major/Minor/Patch）。
- **可读性与可维护性**：清晰的提交历史有助于快速定位问题和理解代码变更。

## 2. 提交信息格式 (Conventional Commits)

本项目遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范。

### 格式结构

```
<type>(<scope>): <subject>
```

### 常用 Type 说明

| Type         | 描述                               | 示例                                      |
| ------------ | ---------------------------------- | ----------------------------------------- |
| **feat**     | 新增功能 (feature)                 | `feat(user): add login page`              |
| **fix**      | 修复 bug                           | `fix(auth): fix token expiration issue`   |
| **docs**     | 文档变更                           | `docs: update readme`                     |
| **style**    | 代码格式修改 (不影响逻辑)          | `style: format code with prettier`        |
| **refactor** | 代码重构 (既无新功能也无 bug 修复) | `refactor(core): simplify state logic`    |
| **perf**     | 性能优化                           | `perf: improve list rendering speed`      |
| **test**     | 增加或修改测试                     | `test: add unit tests for user component` |
| **chore**    | 构建过程或辅助工具变动             | `chore: update dependencies`              |

---

## 3. 实现原理与配置

本项目使用了以下工具链来实现自动化校验：

### 3.1 工具概览

| 工具            | 作用                                    | 配置文件                |
| --------------- | --------------------------------------- | ----------------------- |
| **Husky**       | Git Hooks 管理工具，用于拦截 Git 命令   | `.husky/`               |
| **Commitlint**  | 提交信息格式校验工具                    | `commitlint.config.js`  |
| **Lint-staged** | 只对暂存区的文件运行 Lint，提高提交速度 | `lint-staged.config.js` |

### 3.2 实现步骤详解

#### 步骤 1: 安装依赖

```bash
pnpm add -D -w husky lint-staged @commitlint/{cli,config-conventional}
```

#### 步骤 2: 初始化 Husky

```bash
npx husky init
```

这会在根目录创建 `.husky` 文件夹，并修改 `package.json` 添加 `prepare` 脚本。

#### 步骤 3: 配置 Commitlint

创建 `commitlint.config.js`：

```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
};
```

并在 `.husky/commit-msg` 中添加校验命令：

```bash
npx --no -- commitlint --edit "$1"
```

> **作用**：当你执行 `git commit -m "..."` 时，Husky 会触发 `commit-msg` 钩子，调用 Commitlint 检查你的提交信息。如果不符合规范，提交将被拒绝。

#### 步骤 4: 配置 Lint-staged

创建 `lint-staged.config.js`：

```javascript
module.exports = {
  '*.{js,jsx,ts,tsx}': ['eslint --fix', 'prettier --write'],
  '*.{json,md,css,scss}': ['prettier --write'],
};
```

并在 `.husky/pre-commit` 中添加执行命令：

```bash
npx lint-staged
```

> **作用**：当你执行 `git commit` 时，Husky 会触发 `pre-commit` 钩子。Lint-staged 会自动找出你本次暂存（git add）的文件，并只对这些文件运行 ESLint 和 Prettier。这确保了提交到仓库的代码永远是符合规范的。

## 4. 常见问题

### Q: 提交时报错 `subject may not be empty`？

A: 你的提交信息格式不正确。请使用 `feat: add xxx` 的格式，注意冒号后面有一个空格。

### Q: 如何跳过检查（紧急情况）？

A: 可以使用 `git commit -m "..." --no-verify`，但**强烈不建议**这样做。

### Q: Lint 报错修复不了怎么办？

A: 请仔细阅读报错信息，手动修复代码逻辑错误。如果是格式问题，Lint-staged 会尝试自动修复。
