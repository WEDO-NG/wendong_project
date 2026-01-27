# wendong_project

> 一个基于 **Monorepo 架构** 的个人前端技术学习与实践项目。

本项目旨在探索前端工程化最佳实践，实现业务逻辑与 UI 的解耦，并逐步演进为支持多端（Web/小程序/鸿蒙）的全栈系统。

---

## 🌟 特性 (Features)

- **Monorepo 架构**: 使用 pnpm workspace 管理多包。
- **Clean Architecture**: 严格的分层设计 (`UI` -> `Adapters` -> `Core`)，业务逻辑纯净无依赖。
- **AI 集成**: 内置基于 RAG 的智能问答助手，支持流式响应 (SSE)。
- **全栈实践**: 包含 React 前端与 Express + Prisma + MySQL 后端。
- **工程化**: 完备的 ESLint/Prettier/TypeScript 配置，Webpack 深度优化。

---

## 🛠 技术栈 (Tech Stack)

| 领域 | 技术选型 | 说明 |
| --- | --- | --- |
| **包管理** | pnpm | Workspace 方案 |
| **前端** | React 18 | Hooks, Functional Components |
| **UI 库** | Ant Design | Ant Design X (AI Components) |
| **构建** | Webpack 5 | 深度性能优化 |
| **后端** | Express | TypeScript |
| **数据库** | MySQL | Prisma ORM |
| **缓存** | Redis | ioredis |
| **AI** | OpenAI SDK | 接入 DeepSeek 模型 |

---

## 📂 目录结构

```bash
wendong_project
├── apps/
│   ├── web-react/            # React Web 客户端
│   └── server-node/          # Node.js 服务端
│
├── packages/
│   ├── business-core/        # [纯净] 业务核心 (Types, Schemas)
│   ├── adapters/             # [适配层] HTTP, Services, Config
│   ├── ui-components/        # 可复用 UI 组件
│   └── utils/                # 通用工具库
│
├── doc/                      # 项目文档
└── README.md
```

---

## 🚀 快速开始 (Quick Start)

### 前置要求
- Node.js >= 18
- pnpm
- Docker (可选，用于启动 DB)

### 安装与启动

1.  **安装依赖**
    ```bash
    pnpm install
    ```

2.  **启动数据库 (Docker)**
    ```bash
    docker-compose up -d
    ```

3.  **生成 Prisma Client**
    ```bash
    pnpm --filter server-node prisma generate
    ```

4.  **启动开发环境**
    ```bash
    # 同时启动前后端
    pnpm dev
    
    # 或单独启动
    pnpm --filter web-react start
    pnpm --filter server-node dev
    ```

---

## 📚 文档索引 (Documentation)

### 核心文档
- **[架构设计](./doc/architecture.md)**: 分层设计、Business Core 说明、Clean Architecture 原则。
- **[演进路线](./doc/roadmap.md)**: 项目各阶段规划与进度 (Phase 1-3)。
- **[性能优化](./doc/performance.md)**: Webpack 与网络层面的深度优化记录。
- **[部署指南](./doc/deployment.md)**: 生产环境构建与 Nginx 配置。

### 开发指南
- **[项目搭建指南](./doc/project-setup.md)**: 从零搭建项目的详细步骤。
- **[Server Node 开发指南](./doc/server-node-guide.md)**: 服务端开发规范与最佳实践。
- **[数据库迁移指南](./doc/db-migration-guide.md)**: Prisma 数据库迁移操作手册。
- **[Git 工作流规范](./doc/git-workflow.md)**: 分支管理与提交规范。
- **[代码规范与 Lint](./doc/lint-workflow.md)**: ESLint/Prettier 配置说明。

### 业务与功能设计
- **[AI 集成指南](./doc/phase3-ai-integration.md)**: RAG 与流式对话实现细节。
- **[AI 提示词指南](./doc/ai-prompt-guide.md)**: Prompt Engineering 实践。
- **[前端聊天设计](./doc/frontend-chat-design.md)**: Chat UI 与逻辑设计文档。

### 其他/归档
- **[Business Core 说明](./doc/business-core-package-json.md)**: 早期 Business Core 包结构说明。
- **[阿里云 ECS 部署手册](./doc/阿里云_ECS_部署_React_Node_操作手册.md)**: 具体的阿里云环境部署实操记录。

---

## 📅 当前进度 (Status)

**Phase 3: AI 能力接入 & 架构重构 (进行中)**

- [x] **架构升级**: 完成 `adapters` 层抽离，实现 Clean Architecture。
- [x] **AI 接入**: 完成 DeepSeek 接入与 SSE 流式对话。
- [x] **UI 升级**: 集成 Ant Design X。
- [ ] **RAG 优化**: 提升文档检索准确度。

> 更多详情请查看 [Roadmap](./doc/roadmap.md)。
