# Server Node 开发指南

本文档旨在为 `apps/server-node` 提供技术栈说明、快速上手指南及开发规范。

---

## 一、技术栈概览

| 模块          | 选型             | 说明                       |
| ------------- | ---------------- | -------------------------- |
| **Runtime**   | Node.js (>=18)   | 建议使用 LTS 版本          |
| **Framework** | Express 4.x      | 轻量级 Web 框架            |
| **Language**  | TypeScript       | 强类型支持，与前端共享类型 |
| **ORM**       | Prisma           | 类型安全的数据库 ORM       |
| **Database**  | MySQL            | 关系型数据库               |
| **Cache**     | Redis (ioredis)  | 缓存与 Session 存储        |
| **Tools**     | nodemon, ts-node | 开发环境热重载             |

---

## 二、目录结构说明

```bash
apps/server-node
├── src/
│   ├── app.ts              # Express 实例配置（中间件、CORS等）
│   ├── server.ts           # 服务启动入口（监听端口）
│   │
│   ├── routes/             # 路由定义层
│   │   └── index.ts        # 路由聚合入口
│   │
│   ├── controllers/        # 控制层（处理请求参数，调用 Service）
│   │   # 建议按业务模块划分，如 user.controller.ts
│   │
│   ├── services/           # 业务逻辑层（复用 business-core 或处理纯后端逻辑）
│   │
│   ├── infra/              # 基础设施层
│   │   ├── db.ts           # Prisma Client 单例
│   │   └── redis.ts        # Redis Client 单例
│   │
│   └── types/              # 后端专用类型定义
│
├── prisma/
│   └── schema.prisma       # 数据库模型定义
│
├── dist/                   # 编译产物
├── .env                    # 环境变量（不提交到 git）
└── package.json
```

---

## 三、快速上手 (Quick Start)

### 1. 环境准备

确保本地已安装：

- Node.js >= 18
- pnpm
- MySQL (可选，暂未强依赖)
- Redis (可选，暂未强依赖)

### 2. 安装依赖

在项目根目录执行：

```bash
pnpm install
```

### 3. 配置环境变量

复制 `.env.example` (如有) 或手动创建 `apps/server-node/.env`：

> **安全警告**：`.env` 文件包含敏感信息（密码、API Key），已在 `.gitignore` 中配置忽略。**切勿**将此文件提交到 Git 仓库！在生产环境中，请参考部署指南进行安全配置。

```env
PORT=3001
DATABASE_URL="mysql://root:password@localhost:3306/wendong_project"
```

### 4. 启动开发服务

```bash
# 在根目录启动
pnpm --filter server-node dev

# 或者进入目录启动
cd apps/server-node
pnpm dev
```

服务默认运行在 `http://localhost:3001`。

- 健康检查: `GET /health`
- 首页数据: `GET /api/home`

---

## 四、开发规范

### 1. 路由与控制器 (Routes & Controllers)

- **路由**：只负责定义 URL 和 HTTP 方法，将请求分发给 Controller。
- **控制器**：负责解析 `req.body` / `req.query`，调用 Service 层获取数据，并统一返回 JSON 格式。

**示例：**

```typescript
// routes/user.ts
router.get('/:id', UserController.getUser);

// controllers/user.controller.ts
export class UserController {
  static async getUser(req: Request, res: Response) {
    const { id } = req.params;
    const user = await UserService.findById(id);
    res.json(user);
  }
}
```

### 2. 业务逻辑复用 (Business Core)

- 优先复用 `packages/business-core` 中的逻辑。
- Server 端作为 `business-core` 的**宿主环境**之一，负责提供真实的数据源（Database/Redis）。

### 3. 数据库操作 (Prisma)

- 修改 `prisma/schema.prisma` 后，必须执行：
  ```bash
  npx prisma generate
  ```
  以更新 TypeScript 类型定义。
- 数据库变更建议使用 Prisma Migrate（后续阶段引入）。

### 4. 错误处理

- 统一使用 `try-catch` 捕获 Controller 中的异常。
- 建议封装统一的 Error Middleware（待实现）。
- 接口异常时返回 HTTP 500 或 4xx，并附带 `{ error: "message" }`。

---

## 五、常用命令

| 命令                  | 说明                             |
| --------------------- | -------------------------------- |
| `pnpm dev`            | 启动开发服务器（带热重载）       |
| `pnpm build`          | 编译 TypeScript 代码到 dist 目录 |
| `pnpm start`          | 运行编译后的代码（生产模式）     |
| `npx prisma generate` | 根据 schema 生成 Prisma Client   |

---

## 六、数据库实践指南 (Database Practice)

本章节详细说明如何在项目中进行数据库开发。

### 1. 本地环境准备 (Docker 推荐)

为了保持开发环境整洁，推荐使用 Docker Compose 启动 MySQL 和 Redis。
> **提示**：使用 Docker 后，**不需要** 在本地宿主机安装 MySQL Server 或 Redis Server。

> **注意**：生产环境请务必使用强密码，并禁止将密码硬编码在文件中。

在项目根目录创建 `docker-compose.yml` (如果尚未创建)：

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    platform: linux/amd64 # Mac M1/M2 兼容性设置
    environment:
      MYSQL_ROOT_PASSWORD: password # 开发环境默认密码
      MYSQL_DATABASE: wendong_project
    ports:
      - "3306:3306" # 如遇端口冲突，可修改为 "3307:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    healthcheck: # 健康检查，确保数据库完全启动后再连接
      test: ["CMD", "mysqladmin" ,"ping", "-h", "localhost"]
      timeout: 20s
      retries: 10

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"

volumes:
  mysql_data:
```

启动数据库服务：
```bash
docker-compose up -d
# 建议等待 10-20 秒，确保 MySQL 完全完成初始化
```

### 2. Prisma 工作流

#### Step 0: 关键文件配置 (基础设施)
在进行业务开发前，需要先配置好 Prisma 的基础设施。

1. **配置数据源** (`prisma/schema.prisma`)：
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
// ... 后续追加模型定义
```

2. **初始化 Prisma Client 单例** (`src/infra/db.ts`)：
为了防止在开发环境热重载 (Hot Reload) 时产生过多的数据库连接，建议使用单例模式。

```typescript
// apps/server-node/src/infra/db.ts
import { PrismaClient } from '@prisma/client';

// 扩展全局对象类型，防止 TS 报错
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
```

#### Step 1: 定义数据模型
修改 `apps/server-node/prisma/schema.prisma`：

```prisma
// 示例：定义 User 模型
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  posts     Post[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  published Boolean  @default(false)
  authorId  Int
  author    User     @relation(fields: [authorId], references: [id])
}
```

#### Step 2: 数据库迁移 (Migration)
当 Schema 变更后，需要同步到数据库结构：

```bash
# 执行迁移并生成 Client (开发环境)
pnpm --filter server-node prisma migrate dev --name init_user_model
```
此命令会：
1. 更新数据库表结构
2. 在 `prisma/migrations` 生成 SQL 历史文件
3. 自动执行 `prisma generate` 更新 TypeScript 类型

#### Step 3: 在代码中使用
在 Service 层调用 Prisma Client：

```typescript
// src/services/user.service.ts
import prisma from '../infra/db';

export class UserService {
  static async createUser(email: string, name: string) {
    return prisma.user.create({
      data: { email, name }
    });
  }

  static async findAll() {
    return prisma.user.findMany({
      include: { posts: true } // 关联查询
    });
  }
}
```

#### Step 4: 可视化管理数据
Prisma 提供了内置的 GUI 工具：

```bash
pnpm --filter server-node prisma studio
```
访问 `http://localhost:5555` 即可直接管理数据库数据。

---

## 七、进阶：AI 能力接入准备 (AI Integration Readiness)

关于 **“接入 AI Token 是否需要先初始化数据库”**，取决于你的业务目标：

### 1. 场景 A：仅做连通性测试 (MVP)
**不需要数据库**。
如果只是为了验证 `OPENAI_API_KEY` 是否有效，或者跑通“用户发一句 -> AI 回一句”的单轮对话：
1.  在 `.env` 配置 `OPENAI_API_KEY`。
2.  在 `Controller` 中直接调用 LLM 接口返回结果。
3.  **缺点**：无法保存聊天记录，用户刷新页面后上下文丢失，无法实现连续对话。

### 2. 场景 B：构建完整的 AI 助手 (Product)
**强烈建议先初始化数据库**。
为了实现类似 ChatGPT 的体验，你需要存储：
-   **会话 (Conversation)**：区分不同的聊天窗口。
-   **消息 (Message)**：存储 User 和 Assistant 的历史记录，用于构建 `Context` 发送给 AI。
-   **Token 消耗 (Usage)**：如果通过 Token 计费，必须记录每次调用的消耗。

**推荐开发顺序**：
1.  **Phase 2.1**: 完成 MySQL + Prisma 初始化（搭建地基）。
2.  **Phase 2.2**: 设计 `Conversation` 和 `Message` 模型（定义结构）。
3.  **Phase 3.0**: 接入 AI SDK，实现带记忆的对话功能（上层应用）。

---

## 八、为什么选择 Prisma (Why Prisma)

经过本次数据库初始化与数据迁移的实战，我们可以深刻体会到 Prisma 相比传统 ORM（如 TypeORM, Sequelize）或原生 SQL 的显著优势：

### 1. 声明式建模 (Declarative Modeling)
在 `schema.prisma` 中定义数据结构，既直观又作为**单一事实来源 (Single Source of Truth)**。
-   **优势**：不需要写繁琐的 Migration SQL 或 Model Class，修改 Schema 后一条命令 (`prisma migrate`) 自动同步数据库。

### 2. 极致的类型安全 (Type Safety)
Prisma Client 是**根据 Schema 动态生成**的。
-   **实战体现**：在编写 `home.service.ts` 时，VS Code 能自动补全 `prisma.banner.findMany`，并且知道 `isActive` 是 boolean，`title` 是 string。如果字段名写错，编译阶段就会报错，而不是等到运行时才崩溃。

### 3. 开发体验 (DX)
-   **Prisma Studio**：内置的 GUI 工具 (`pnpm db:studio`) 让我们无需安装 Navicat 就能管理数据，这对 Docker 环境特别友好。
-   **自动补全**：查询 API 设计非常符合直觉（`findMany`, `create`, `where`, `orderBy`），几乎不需要查文档。

### 4. 维护性
-   **迁移历史**：每次 Schema 变更都会生成 SQL 文件（`prisma/migrations`），保证了团队协作时数据库结构的一致性。
-   **无缝集成 TypeScript**：不需要像 TypeORM 那样手动定义 Interface 和 Entity，Prisma 自动为你生成好了一切。

---

> 文档最后更新时间：2026-01-26
