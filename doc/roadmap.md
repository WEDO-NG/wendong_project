# 项目演进路线图 (Roadmap)

## Phase 1：最小落地目标 (MVP) - [已完成]

### 目标
验证 Monorepo 架构，搭建 React Web 项目骨架。

### 决策
- **React**: 函数组件 + Hooks
- **UI**: Ant Design
- **Build**: Webpack 5
- **Tooling**: Lodash, pnpm workspace

### 成果
- `apps/web-react` 可独立启动。
- 项目结构清晰，Business Core 初步建立。

---

## Phase 2：Node 服务端初始化 - [已完成]

### 目标
引入 Node.js 服务端，替换 Mock 数据，建立数据库连接。

### 决策
- **Framework**: Express 4.x + TypeScript
- **Database**: MySQL + Prisma ORM
- **Cache**: Redis

### 成果
- `apps/server-node` 建立。
- 前后端联通。
- 数据库与缓存基础设施就绪。

---

## Phase 3：AI 能力接入 & 架构重构 - [进行中]

> 详细指南：[Phase 3 AI 集成指南](./phase3-ai-integration.md)

### 核心里程碑
1.  **架构升级** (已完成)：
    - 抽离 `packages/adapters`，净化 `business-core`。
    - 确立 Clean Architecture。
2.  **AI 能力实现** (已完成)：
    - 接入 DeepSeek/OpenAI。
    - 实现 RAG (文档问答)。
    - 实现 SSE 流式响应。
    - Prompt 工程化。

### 待办任务
- [x] 架构重构：Adapters 层
- [x] 基础设施：AI SDK 集成
- [x] 数据库：ChatSession / ChatMessage
- [x] 服务端：SSE 接口
- [x] 客户端：ChatUI (Ant Design X)
- [ ] 优化：RAG 准确率提升
