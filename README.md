# wendong_project

> 一个基于 **Monorepo 架构** 的个人前端技术学习与实践项目。

---

## 一、项目背景与目标

**wendong_project** 是一个长期维护的个人项目，主要用于系统性学习和实践前端工程化与架构设计能力。

项目的核心目标包括：

- 学习并实践 **Monorepo** 项目管理方式
- 沉淀 **可复用的业务逻辑模型**（business-core）
- 探索 **业务逻辑与 UI 逻辑解耦** 的工程实践
- 为未来支持 **Web / 小程序 / 鸿蒙** 等多端形态提前做好架构准备
- 记录构建工具（Webpack）与性能优化的演进过程

该项目不仅关注“能跑”，更关注：

> **是否清晰、是否可扩展、是否经得起长期演进**

---

## 二、为什么选择 Monorepo

随着项目逐步演进，会同时存在以下内容：

- Web 前端应用（React）
- Node.js 服务端
- 公共业务逻辑
- 通用工具库
- 多端适配层（Web / 小程序 / 鸿蒙）

如果使用传统的多仓库模式，会面临：

- 代码重复
- 版本难以统一
- 业务逻辑无法复用

因此本项目选择 **Monorepo** 作为整体管理方案。

### Monorepo 的核心思想

> **一个仓库，多个相互关联但职责清晰的 package**

每个 package 都是独立的模块，但它们在同一个仓库中协同演进。

---

## 三、Monorepo 技术选型

| 项目          | 选型              |
| ------------- | ----------------- |
| 包管理器      | pnpm（workspace） |
| Monorepo 方案 | pnpm workspace    |
| Node 版本     | >= 18             |

选择 pnpm 的原因：

- 原生支持 workspace
- 依赖去重能力强，磁盘占用低
- 安装速度快，适合多 package 场景

---

## 四、整体架构设计

### 4.1 分层设计思想

```
UI 层（React / Antd）
        ↓
转换层（Adapters）
        ↓
业务逻辑层（business-core）
        ↓
基础设施 / 工具
```

### 4.2 各层职责说明

- **业务逻辑层（business-core）**
  - 只描述业务规则与流程
  - 不依赖 UI 框架或运行平台
  - 可被多端复用

- **转换层（adapters）**
  - 将业务逻辑适配到具体平台
  - 隔离 Web / 小程序 / 鸿蒙 的平台差异

- **UI 层**
  - 负责页面展示与用户交互
  - 不直接承载复杂业务规则

---

## 五、business-core 设计说明

### 5.1 business-core 是什么

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

### 5.2 状态机思想（设计层面）

在复杂业务中，业务并不是简单的 if / else，而是：

> **状态在合法规则下不断演进的过程**

在当前阶段：

- 采用轻量状态机思想
- 不依赖第三方状态机库
- 为未来引入完整状态机方案预留空间

---

## 六、设计原则（Design Principles）

本项目在设计与实现过程中，遵循以下核心原则：

### 6.1 业务优先于技术实现

- 先抽象业务模型，再选择技术方案
- 技术不反向塑造业务结构

---

### 6.2 业务逻辑与 UI 逻辑严格分离

- business-core 中不得出现 UI 代码
- UI 不直接承载复杂业务规则

---

### 6.3 状态只能通过规则流转

- 核心业务状态集中定义
- 禁止随意修改关键业务状态

---

### 6.4 面向多端的架构前置设计

- Web 并非唯一运行平台
- adapters 用于隔离平台差异

---

### 6.5 单一职责与清晰边界

- 每个 package 只做一类事情
- 边界清晰优先于技巧复杂度

---

### 6.6 可测试性优先

- 核心业务逻辑应具备可测试性
- 避免在业务层引入不可控副作用

---

### 6.7 为演进保留空间

- 初期方案允许简单，但结构必须正确
- 避免过早引入复杂工具

---

## 七、目录结构规划

```bash
wendong_project
├── apps/
│   ├── web-react/            # React Web 客户端
│   └── server-node/          # Node.js 服务端（后续）
│
├── packages/
│   ├── business-core/        # 业务逻辑核心
│   ├── ui-components/        # 可复用 UI 组件
│   └── utils/                # 通用工具库
│
├── configs/
│   ├── webpack/
│   └── eslint/
│
├── scripts/
├── pnpm-workspace.yaml
├── package.json
└── README.md
```

---

## 八、Phase 1：最小落地目标（MVP）

### 8.1 Phase 1 总体目标

- 初始化 Monorepo 仓库
- 确定 React 技术栈
- 搭建一个 **可运行的 React Web 项目**

Phase 1 的目标是验证技术链路与项目骨架，而非实现完整业务。

---

### 8.2 Phase 1 明确不做的事情

- 不接入小程序 / 鸿蒙
- 不实现完整 business-core 逻辑
- 不引入复杂状态机库
- 不做 Webpack 性能优化

---

### 8.3 React 技术栈决策（Phase 1 定版）

本项目在 Phase 1 阶段，对 React 技术栈做出如下明确决策：

#### React

- 使用 **较新但稳定** 的 React 主版本
- 采用函数组件 + Hooks
- 不使用实验性 API

**决策原因：**

- 社区成熟、长期维护
- 心智模型稳定
- 有利于后续多端与工程化演进

---

#### UI 组件库

- 选择 **Ant Design** 作为 UI 基础库

**决策原因：**

- 组件覆盖全面
- 社区成熟
- 企业级场景验证充分

---

#### 工具库

- 引入 **Lodash** 作为基础工具库

**决策原因：**

- 解决常见工具方法问题
- 避免重复造轮子

---

#### 构建工具

- 使用 **Webpack 5**

**决策原因：**

- 对构建流程有完全掌控能力
- 适合记录构建优化过程
- 更利于工程化能力沉淀

---

### 8.4 Phase 1 完成标准（验收条件）

Phase 1 完成时，应满足以下条件：

- pnpm workspace 正常工作
- apps/web-react 可独立启动
- React + Ant Design + Lodash 可正常使用
- 项目结构与文档描述一致

满足以上条件，即可进入 Phase 2。

---

## 九、Phase 2：Node 服务端初始化

### 9.1 Phase 2 目标

Phase 2 的目标是：

- 引入一个 **简单、稳定、可长期演进** 的 Node 服务端
- 用真实 API 替换当前前端中的 mock 数据
- 为后续接入 MySQL / Redis 打好基础
- 保持服务端架构不过度设计，但边界清晰

---

### 9.2 Node 技术栈决策（Phase 2 定版）

#### Node 框架

- 选择 **Express 4.x** 作为 HTTP 服务框架

**决策原因：**

- 市场验证时间长，社区成熟
- 心智模型简单，适合个人项目
- 不强绑定架构理念，易于后期重构或升级

---

#### 语言与类型系统

- 使用 **TypeScript** 作为服务端语言

**决策原因：**

- 提供明确的类型约束
- 有助于与 business-core / 前端共享类型定义
- 降低接口演进带来的维护成本

---

#### 数据库

- 使用 **MySQL** 作为主数据库

**决策原因：**

- 生态成熟、稳定可靠
- 云服务与本地环境支持良好

---

#### ORM / 数据访问层

- 使用 **Prisma** 作为 ORM

**决策原因：**

- Schema 驱动，模型清晰
- TypeScript 体验优秀
- 学习成本低，适合个人项目长期维护

---

#### 缓存层

- 使用 **Redis** 作为缓存组件
- 客户端库选择 **ioredis**

**决策原因：**

- 行业事实标准
- API 设计清晰
- 未来可平滑扩展集群能力

---

### 9.3 server-node 目录结构规划

```bash
apps/server-node
├── src/
│   ├── app.ts              # Express 实例与中间件注册
│   ├── server.ts           # 服务启动入口
│   │
│   ├── routes/             # 路由层（HTTP）
│   ├── controllers/        # 控制层（请求协调）
│   ├── services/           # 应用服务层（业务调用）
│   │
│   ├── infra/              # 基础设施
│   │   ├── db.ts           # Prisma 数据库连接
│   │   └── redis.ts        # Redis 连接封装
│   │
│   └── types/              # Node 层类型定义
│
├── prisma/
│   └── schema.prisma
│
├── package.json
├── tsconfig.json
└── README.md
```

---

### 9.4 Phase 2 初始化最小执行步骤（Checklist）

#### Step 1：创建 server-node 包

- 在 `apps/` 下创建 `server-node` 目录
- 初始化独立的 `package.json`
- 将其纳入 pnpm workspace 管理

---

#### Step 2：搭建 Express + TypeScript 基础结构

- 初始化 TypeScript 配置
- 创建最小 Express 应用
- 提供一个 `/health` 或 `/ping` 接口用于连通性验证

---

#### Step 3：前后端联通

- 前端通过真实 HTTP 请求访问 Node 接口
- 用真实接口替换至少一处 mock 数据

---

#### Step 4：数据库与缓存基础准备

> 详细指南请参考：[Server Node 开发指南 - 数据库实践](./doc/server-node-guide.md#六数据库实践指南-database-practice)

- 初始化 Prisma（不要求完整业务表）
- 建立 MySQL 连接配置 (推荐 Docker)
- 封装 Redis 连接（允许暂不使用）
- 跑通 `prisma migrate` 与 Client 生成

---

#### Step 5：阶段性收尾

- 保证 Node 服务可独立启动
- 保证前端可以正常调用接口
- 不引入任何超出当前需求的复杂抽象

---

## 十、Phase 3：AI 能力接入 (In Progress)

> **当前状态**：进行中
> **详细规划**：[Phase 3 AI 集成指南](./doc/phase3-ai-integration.md)

### 10.1 核心目标
在 Phase 2 建立的稳固后端基础上，引入 DeepSeek/OpenAI 能力，实现：
1.  **智能问答**：基于数据库内容的 RAG（检索增强生成）。
2.  **流式体验**：实现类似 ChatGPT 的打字机效果。
3.  **长期记忆**：利用 MySQL 存储对话历史。

### 10.2 待办任务 (Todo)
- [ ] **基础设施**：配置 DeepSeek API Key 与 SDK。
- [ ] **数据库**：新增 `ChatSession` 与 `ChatMessage` 表。
- [ ] **服务端**：实现 SSE 流式接口与上下文管理。
- [ ] **客户端**：开发 ChatUI 组件与打字机效果。

---

## 十一、部署与上线指南 (Deployment Guide)

### 10.1 部署架构概览

```
用户浏览器
   ↓ (HTTPS / 443)
Nginx (反向代理 / 静态资源服务器)
   ├── / (根路径) → 指向 apps/web-react/dist (静态文件)
   └── /api (接口) → 转发至 localhost:3001 (Node 服务)
         ↓
    PM2 (进程守护)
         ↓
    Node.js (Express Server)
```

### 10.2 服务器选购与环境准备

#### 1. 服务器配置推荐
- **CPU/内存**：2核 4G (最低 1核 2G，但跑数据库可能吃力)
- **操作系统**：Ubuntu 22.04 LTS 或 CentOS 7.9
- **带宽**：按需选择，初期 3-5M 足够

#### 2. 必要软件安装
- **Node.js** (v18+): 推荐使用 nvm 安装
- **pnpm**: `npm i -g pnpm`
- **Nginx**: 用于静态托管与反向代理
- **PM2**: `npm i -g pm2` (用于守护 Node 进程)
- **MySQL**: 数据库服务
- **Redis**: 缓存服务

### 10.3 生产环境构建步骤

#### 前端构建
1. 在本地或 CI/CD 环境执行：
   ```bash
   pnpm --filter web-react build
   ```
2. 将生成的 `apps/web-react/dist` 目录上传至服务器 (例如 `/var/www/wendong-project/html`)。

#### 后端部署
1. 推荐在服务器拉取 Git 代码。
2. 安装依赖：
   ```bash
   pnpm install --prod
   ```
3. 生成 Prisma Client：
   ```bash
   pnpm --filter server-node prisma generate
   ```
4. 启动服务：
   ```bash
   cd apps/server-node
   pm2 start dist/server.js --name server-node
   ```

### 10.4 Nginx 配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态资源
    location / {
        root /var/www/wendong-project/html;
        index index.html;
        try_files $uri $uri/ /index.html; # React Router 必须配置
    }

    # 后端接口反向代理
    location /api {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 十一、数据流与类型规范 (Data Flow & Type Definitions)

### 11.1 数据流向

1. UI 层 (apps/web-react)
   - 只调用 `@wendong/business-core` 暴露的 Service 方法
   - 不直接发起 fetch/axios；不关心 API URL
2. 业务核心层 (packages/business-core)
   - 作为 API 调用层 + 业务逻辑层
   - 封装统一 HttpUtil（fetch/axios 任一实现）
   - 定义 Domain Types，并在根导出供前后端共享
3. 服务层 (apps/server-node)
   - 提供 RESTful API
   - 控制器统一响应结构（code/message/data/timestamp）
   - 引用 business-core 的 Types，保证接口契约一致

### 11.2 类型定义规范

- 类型统一在 business-core 定义与导出，作为单一事实来源
- 服务端与客户端均从 `@wendong/business-core/types` 引用
- 避免在客户端/服务端重复定义同名 Interface

### 11.3 HTTP 客户端与响应规范

- 客户端：business-core 提供 `HttpUtil`，统一处理响应结构和错误
- 响应结构：
  ```json
  { "code": 0, "message": "Success", "data": { ... }, "timestamp": "ISO8601" }


  ```

## 十二、性能优化实战记录 (Performance Optimization)

### 12.1 背景与现状（Baseline）

在 Phase 1 部署上线后，进行了首次 Performance 分析，发现 LCP (Largest Contentful Paint) 高达 **7.29秒**，严重影响用户体验。

**核心瓶颈分析：**

1.  **服务器带宽限制**：阿里云 ECS 带宽仅为 **3Mbps**（约 375KB/s）。
2.  **资源体积过大**：瀑布流图片单张体积高达 **652KB**，加载一张图需要近 2秒（图片大小普遍在 400KB - 600KB 之间）。
3.  **加载策略不当**：首屏渲染被非首屏的大图资源抢占了带宽。

### 12.2 优化方案与落地

#### 动作 1：资源体积压缩（Resource Compression）

- **措施**：使用工具对本地 `assets` 图片进行有损压缩。
- **目标**：将单张图片体积控制在 **200KB** 以内（约为原来的 1/3）。
- **收益**：理论下载时间从 2秒/张 降低至 0.5秒/张。

#### 动作 2：加载策略优化（Loading Strategy）

- **问题**：原代码尝试对前4张图片使用 `eager` 加载。
- **修正**：经确认，`WaterfallSection` 组件位于页面底部（第 5 个 Section），**完全不在首屏可见范围内**。
- **策略调整**：
  - 放弃 `eager` 策略，**全量使用 `loading="lazy"`**。
  - 确保首屏带宽完全服务于 Banner、Nav 等核心资源。
  - 依赖浏览器的原生 Lazy Loading 机制，在用户滚动接近时自动下载。

#### 优化代码示例

```tsx
// apps/web-react/src/pages/Home/components/WaterfallSection.tsx

<img
  src={url}
  // 性能优化：全量懒加载
  // 原因：组件位于非首屏，避免抢占首屏资源（如 JS Bundle、Banner）的带宽
  loading="lazy"
  decoding="async"
/>
```

#### 动作 3：解决布局抖动（Layout Shift）与高度塌陷

- **问题复现**：在应用动作 2 后，LCP 依然维持在 **5.85s**，且 Performance 面板显示瀑布流图片在首屏加载阶段就被请求了。
- **原因分析**：
  - 首页顶部的 Seascape、Banner 等组件数据来自 API 异步获取。
  - 在数据返回前，这些组件高度为 0（高度塌陷）。
  - 导致位于页面底部的 `WaterfallSection` 直接“窜”入首屏视口，触发了浏览器的 Lazy Loading 阈值，导致不必要的资源下载。
- **解决方案**：引入 **骨架屏（Skeleton）** 与 **条件渲染（Conditional Rendering）**。
  - **骨架屏**：为首页前 4 个 Section 引入 Ant Design Skeleton，模拟真实内容高度，防止布局抖动。
  - **条件渲染（绝杀技）**：仅当首屏数据加载完成（`loading=false`）后，才渲染底部的 `WaterfallSection`。这从根本上杜绝了浏览器在首屏阶段感知到瀑布流组件的可能性。

```tsx
// apps/web-react/src/pages/Home/index.tsx

{/* 1. 海景图 (使用骨架屏自然撑开高度) */}
{loading ? (
  <div style={{ padding: 16 }}>
    <Skeleton.Image active style={{ width: '100%', height: 240 }} />
  </div>
) : (
  <SeascapeSection data={data?.seascapes || []} loading={loading} />
)}

{/* ... 其他 Section 的骨架屏 ... */}

{/* 5. 瀑布流 */}
{/* 性能优化：仅当首屏数据加载完成后才挂载，彻底阻断首屏请求 */}
{!loading && <WaterfallSection />}
```

#### 动作 4：Webpack 构建策略优化（Build Optimization） LCP2s左右

为了提升生产环境的加载性能与缓存效率，对 `webpack.config.js` 进行了以下 5 项核心优化：

- **开启 Content Hash（长效缓存）**
  - **优化**：生产环境文件名改为 `[name].[contenthash:8].js`。
  - **收益**：利用浏览器长效缓存，减少发版后的用户流量消耗。

- **代码分包 (Code Splitting)**
  - **优化**：配置 `optimization.splitChunks`，将 `node_modules` 拆分为独立的 `vendors.js`。
  - **收益**：避免“巨无霸” Bundle，提升首屏加载速度。

- **CSS 提取 (MiniCssExtractPlugin)**
  - **优化**：生产环境使用 `MiniCssExtractPlugin` 提取独立 CSS 文件。
  - **收益**：CSS 与 JS 并行下载，消除 FOUC（闪屏）。

- **图片资源优化 (Asset Modules)**
  - **优化**：配置 `type: 'asset'` 并设置 `maxSize: 8kb`。
  - **收益**：小图转 Base64 内联，减少 HTTP 请求数。

- **区分开发与生产环境 (Mode)**
  - **优化**：将 `module.exports` 改为函数形式，通过 `argv.mode` 自动获取命令行参数。
  - **收益**：
    - **零依赖**：无需 `cross-env` 即可跨平台识别环境。
    - **灵活性**：`webpack serve` 自动走 development 配置（构建快），`webpack build` 自动走 production 配置（体积小）。

```javascript
// apps/web-react/webpack.config.js
module.exports = (env, argv) => {
  const isProd = argv.mode === 'production';
  
  return {
    mode: isProd ? 'production' : 'development',
    output: {
      filename: isProd ? '[name].[contenthash:8].js' : 'bundle.js',
    },
    // ... 其他动态配置
  };
};
```

#### 动作 5：服务端传输层优化 (Nginx) LCP1.3S

除了前端代码与构建层面的优化，**服务端传输层** 的优化能以极低的成本换取巨大的性能收益。

- **开启 Gzip 压缩**
  - **原理**：在 Nginx 传输文本文件（HTML/JS/CSS）前进行实时压缩，通常可减少 70% 的传输体积。
  - **配置**：
    ```nginx
    # /etc/nginx/nginx.conf
    gzip on;
    gzip_min_length 1k;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript;
    ```

- **升级 HTTP/2**
  - **原理**：支持多路复用，彻底解决浏览器并发请求限制（通常 6 个）导致的队头阻塞。
  - **配置**：
    ```nginx
    # /etc/nginx/sites-enabled/default
    listen 443 ssl http2; # 需配合 HTTPS 使用
    ```

- **配置长期缓存 (Cache-Control)**
  - **原理**：为静态资源（JS/CSS/Img）设置超长过期时间，配合 Webpack Hash 文件名，实现“永不过期”的客户端缓存。
  - **配置**：
    ```nginx
    location ~* \.(js|css|png|jpg|jpeg|gif|ico)$ {
        expires 1y;
        add_header Cache-Control "public, no-transform";
    }
    ```

#### 动作 6：组件级按需加载 (Code Splitting) LCP提升不大忽略不计

- **问题**：虽然 Webpack 做了分包，但首页所有组件的代码（包括非首屏的瀑布流）依然在页面初始化时被全部加载。
- **优化**：使用 `React.lazy` + `Suspense` 对非首屏组件进行动态导入。
- **收益**：
  - **减小主包体积**：`WaterfallSection` 及其依赖逻辑被拆分为独立 Chunk。
  - **错峰加载**：配合 `!loading` 条件渲染，确保只有在首屏关键内容渲染完成后，才去下载瀑布流的代码。

```tsx
// apps/web-react/src/pages/Home/index.tsx

// 1. 使用 React.lazy 动态引入
const WaterfallSection = React.lazy(() => import('./components/WaterfallSection'));

// ...

// 2. 配合 Suspense 和条件渲染使用
{!loading && (
  <Suspense fallback={null}>
    <WaterfallSection />
  </Suspense>
)}
```

### 12.3 最终优化成果 (Result)

经过以上 4 轮优化动作，最终在 3Mbps 带宽的服务器上取得了显著的性能提升：

- **LCP (Largest Contentful Paint)**：从 **7.29s** 降低至 **1.2s**（提升 84.7%，开启缓存可达800ms）。
- **网络请求**：首屏阶段彻底阻断了非必要的图片资源请求，带宽利用率达到极致。
- **用户体验**：消除了布局抖动，骨架屏过渡自然，首屏加载如丝般顺滑。

> **总结**：好的架构和优化策略，完全可以弥补硬件资源的不足。

### 12.4 终极优化：资源分包与路由懒加载 (Bundle Splitting & Lazy Routing)

针对 Lighthouse 提示的 **"Reduce unused JavaScript"** (vendors.js 过大)，进行了以下优化：

- **路由懒加载 (Lazy Routing)**：对 `ListPage` 和 `ProfilePage` 实施 `React.lazy`，确保首屏只加载 `HomePage` 的代码。
- **精细化分包 (SplitChunks)**：将原本巨大的 `vendors.js` 拆解为：
    - `react-vendor.js`: 包含 React 核心库（长期缓存）。
    - `antd-vendor.js`: 包含 Ant Design 组件库。
    - `libs-vendor.js`: 其他依赖。
    - `common.js`: 业务公共代码。

**优化收益**：
- 首屏 JS 体积进一步减少。
- 提高了浏览器缓存利用率（React 版本升级不影响 Antd 缓存）。
- 真正的“按需加载”，访问列表页时才加载列表页的代码。

---

## 写在最后

该项目是一个 **长期演进型个人工程项目**。

> 用清晰的结构承载复杂的业务，用可演进的设计对抗未来的不确定性。

本文档会随着项目演进持续更新。
