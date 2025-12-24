# 项目配置说明文档

## 1. 项目概览

本项目采用 Monorepo 架构，统一管理多个应用与包。

### 目录结构核心说明

```bash
wendong_project
├── apps/
│   └── web-react/          # React Web 应用
├── packages/
│   ├── business-core/      # 纯业务逻辑层（无 UI）
│   ├── web-ui/             # Web 端 UI 组件库
│   ├── adapters/           # 跨端适配层
│   └── utils/              # 通用工具库
├── configs/                # 统一配置文件
├── doc/                    # 项目文档
├── pnpm-workspace.yaml     # Workspace 配置
└── package.json            # 根依赖与脚本
```

## 2. 技术栈详情 (web-react)

- **核心框架**: React 18
- **语言**: TypeScript 5
- **UI 组件库**: Ant Design 5
- **构建工具**: Webpack 5
- **包管理**: pnpm
- **代码规范**: ESLint + Prettier

## 3. 常用命令

| 命令             | 说明                                   |
| ---------------- | -------------------------------------- |
| `pnpm install`   | 安装所有依赖                           |
| `pnpm start:web` | 启动 Web 端开发服务器 (localhost:3000) |
| `pnpm build:web` | 构建 Web 端生产代码                    |

## 4. 规范配置

本项目采用 **根目录统一管理** 的策略来配置代码规范。

- **ESLint**: 根目录 `.eslintrc.js` 定义了通用规则（TS + React + Prettier）。
- **Prettier**: 根目录 `.prettierrc` 定义了格式化规则。
- **继承机制**: 子项目默认继承根目录配置，无需重复配置。

## 5. 开发指南

### 新增页面

在 `apps/web-react/src/pages` 下新建目录。

### 新增公共组件

在 `apps/web-react/src/components` 下新建。

### 修改业务逻辑

优先在 `packages/business-core` 中修改，保持逻辑与 UI 分离。
