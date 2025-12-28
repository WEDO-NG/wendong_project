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

> 文档最后更新时间：2025-12-26
