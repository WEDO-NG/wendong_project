# 代码规范与 Lint 配置指南

本文档详细说明了本项目的代码规范配置及其实现原理，旨在帮助团队成员理解并遵守统一的代码风格。

## 1. 为什么需要统一规范？

- **统一风格**：消除不同开发者之间的代码风格差异（如缩进、分号、引号等）。
- **提前发现错误**：通过静态分析在运行前发现潜在的逻辑错误（如未使用的变量、Hooks 依赖丢失等）。
- **提升可维护性**：一致的代码风格使代码阅读更顺畅，Code Review 更高效。

## 2. 规范选型

本项目采用 **根目录统一管理** 的策略，所有子项目共享一套配置。

| 工具         | 作用                    | 配置文件       | 核心规则                              |
| ------------ | ----------------------- | -------------- | ------------------------------------- |
| **ESLint**   | 代码质量检查 (Quality)  | `.eslintrc.js` | TS Recommended, React Hooks, Prettier |
| **Prettier** | 代码格式化 (Formatting) | `.prettierrc`  | 单引号, 2空格缩进, 结尾分号           |

---

## 3. 详细配置说明

### 3.1 Prettier 格式化规则

配置文件：`.prettierrc`

```json
{
  "semi": true, // 语句末尾添加分号
  "tabWidth": 2, // 缩进使用 2 个空格
  "printWidth": 100, // 单行最大长度 100 字符
  "singleQuote": true, // 使用单引号
  "trailingComma": "es5", // 对象/数组末尾添加逗号（ES5标准）
  "jsxSingleQuote": false, // JSX 属性使用双引号
  "endOfLine": "auto" // 自动适配换行符
}
```

### 3.2 ESLint 校验规则

配置文件：`.eslintrc.js`

我们使用了 `typescript-eslint` 和 `eslint-plugin-react` 等插件，并继承了它们的推荐配置。

#### 核心插件栈

- `@typescript-eslint/eslint-plugin`: TypeScript 专属规则
- `eslint-plugin-react`: React 最佳实践
- `eslint-plugin-react-hooks`: 强制 Hooks 规则（非常重要！）
- `eslint-plugin-prettier`: 将 Prettier 格式问题作为 ESLint 错误抛出

#### 特殊规则覆盖

```javascript
rules: {
  // React 17+ 不再需要引入 React 即可使用 JSX
  'react/react-in-jsx-scope': 'off',

  // 允许推导类型，不强制每个函数都显式声明返回类型
  '@typescript-eslint/explicit-module-boundary-types': 'off',

  // 允许使用 any，但给予警告（逐步迁移老代码时有用）
  '@typescript-eslint/no-explicit-any': 'warn',

  // 任何 Prettier 格式错误都视为 ESLint Error，强制修复
  'prettier/prettier': 'error',
}
```

---

## 4. 如何使用

### 4.1 常用命令

| 命令                     | 说明                             |
| ------------------------ | -------------------------------- |
| `pnpm lint`              | 检查整个项目的代码规范           |
| `npx eslint . --fix`     | 自动修复所有可修复的 ESLint 错误 |
| `npx prettier --write .` | 格式化整个项目的所有文件         |

### 4.2 编辑器集成 (VSCode 推荐)

为了获得最佳开发体验，请安装以下 VSCode 插件：

1. **ESLint** (dbaeumer.vscode-eslint)
2. **Prettier** (esbenp.prettier-vscode)

并在 VSCode 设置中开启自动保存格式化：

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

---

## 5. 自动化保障

为了防止不规范的代码被提交到仓库，我们配置了 **Git Hooks**。

- 当你执行 `git commit` 时，**Lint-staged** 会自动运行。
- 它只检查你本次修改（暂存区）的文件。
- 如果存在无法自动修复的错误，提交将被拦截。

详见：[Git 工作流与提交规范指南](./git-workflow.md)
