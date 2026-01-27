# 架构设计文档 (Architecture Design)

## 1. 整体架构设计 (Clean Architecture)

本架构遵循 **依赖倒置原则**，核心业务逻辑不依赖于任何外部实现。

```
UI 层（React / Antd）
        ↓ (调用)
适配器层（Adapters） ← 基础设施（HTTP / Config）
        ↓ (依赖 / 实现)
业务核心层（Business Core - Pure Domain）
```

### 各层职责说明

- **业务核心层（business-core）**
  - **定位**：纯粹的领域层 (Pure Domain)
  - **职责**：定义业务实体 (Types)、业务规则 (Schemas) 和接口契约
  - **约束**：**零依赖**（不依赖 UI、不依赖 HTTP 库、不依赖具体环境）

- **适配器层（adapters）**
  - **定位**：基础设施与应用服务层
  - **职责**：
    - 实现 HTTP 请求封装 (HttpUtil)
    - 管理环境配置 (Config)
    - 组装业务逻辑与 API 调用 (Services)
  - **作用**：连接 UI 与 Core，处理副作用

- **UI 层 (apps/web-react)**
  - **职责**：纯粹的展示层
  - **约束**：只调用 Adapters 提供的服务，只使用 Business Core 定义的类型

---

## 2. Business Core 设计说明

### 2.1 定位
> **business-core 是项目中的“业务大脑”**

它包含：
- 业务模型（Domain Model）
- 业务规则（Rules）
- 业务流程（Flows）
- 业务状态约束（状态机思想）

其核心特征是：
- 不依赖 React、Antd 等 UI 框架
- 不依赖浏览器 / 小程序 / 鸿蒙 API
- 仅通过输入和输出描述业务行为

### 2.2 状态机思想
在复杂业务中，业务并不是简单的 if / else，而是 **状态在合法规则下不断演进的过程**。
当前阶段采用轻量状态机思想，不依赖第三方库，为未来引入完整状态机方案预留空间。

---

## 3. 设计原则 (Design Principles)

1.  **业务优先于技术实现**：先抽象业务模型，再选择技术方案。
2.  **业务逻辑与 UI 逻辑严格分离**：business-core 中不得出现 UI 代码。
3.  **状态只能通过规则流转**：禁止随意修改关键业务状态。
4.  **面向多端的架构前置设计**：adapters 用于隔离平台差异。
5.  **单一职责与清晰边界**：每个 package 只做一类事情。
6.  **可测试性优先**：核心业务逻辑应具备可测试性。
7.  **为演进保留空间**：避免过早引入复杂工具。

---

## 4. 数据流与类型规范

### 4.1 数据流向

1.  **UI 层 (apps/web-react)**
    *   **调用**：`@wendong/adapters` 暴露的 Services (如 `HomeService`, `AIService`)。
    *   **引用**：`@wendong/business-core` 暴露的 Types (如 `HomeData`, `ChatMessage`)。
    *   **原则**：不直接感知 API URL，不直接处理 HTTP 细节。
2.  **适配器层 (packages/adapters)**
    *   **实现**：`HttpUtil` (封装 fetch/axios)。
    *   **配置**：管理不同环境 (Dev/Sit/Prod) 的 BaseURL。
    *   **逻辑**：将 API 响应转换为 Core 定义的 Domain Model。
3.  **业务核心层 (packages/business-core)**
    *   **定义**：单一事实来源 (Single Source of Truth)。
    *   **内容**：Zod Schemas, TypeScript Interfaces。
4.  **服务层 (apps/server-node)**
    *   提供 RESTful API。
    *   引用 `business-core` 的 Types/Schemas 确保前后端契约一致。

### 4.2 类型定义规范

- 类型统一在 `business-core` 定义与导出。
- **服务端**、**适配器层**、**客户端** 均引用同一套类型定义。

### 4.3 HTTP 客户端规范

- **位置**：`@wendong/adapters/src/infrastructure/http.ts`。
- **职责**：统一处理 Token 注入、错误拦截、响应解包。
- **响应结构**：
  ```json
  { "code": 0, "message": "Success", "data": { ... }, "timestamp": "ISO8601" }
  ```
