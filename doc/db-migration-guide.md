# 数据库迁移指南 (Data Migration Guide)

本文档记录了从静态 Mock 数据迁移到 MySQL 数据库的完整过程，供后续参考。

---

## 一、迁移背景

为了支持数据的持久化存储和动态更新，我们需要将原本硬编码在 `src/services/mock.data.ts` 中的静态数据迁移到 MySQL 数据库中。

涉及的数据模块包括：
1.  **Banner (轮播图)**
2.  **Navigation (导航菜单)**
3.  **Seascape (海景房/理财产品推荐)**
4.  **News (新闻资讯)**

---

## 二、迁移步骤

### 1. 数据库建模 (Schema Design)

在 `apps/server-node/prisma/schema.prisma` 中新增了以下模型：

```prisma
// 1. 轮播图
model Banner {
  id        Int      @id @default(autoincrement())
  title     String   @db.VarChar(100)
  imageUrl  String   @db.VarChar(255)
  linkUrl   String?  @db.VarChar(255)
  order     Int      @default(0)
  isActive  Boolean  @default(true)
  // ...
}

// 2. 导航菜单
model Navigation {
  id        Int      @id @default(autoincrement())
  title     String   @db.VarChar(50)
  icon      String   @db.VarChar(50)
  linkUrl   String   @db.VarChar(255)
  order     Int      @default(0)
  // ...
}

// 3. 海景房推荐
model Seascape {
  id          Int      @id @default(autoincrement())
  title       String   @db.VarChar(100)
  price       Decimal  @db.Decimal(10, 2)
  // ...
}

// 4. 新闻资讯
model News {
  id          Int      @id @default(autoincrement())
  title       String   @db.VarChar(200)
  publishDate DateTime @default(now())
  // ...
}
```

### 2. 执行数据库迁移

运行以下命令应用 Schema 变更：

```bash
pnpm --filter server-node db:migrate --name add_home_models
```

### 3. 数据填充 (Seeding)

为了保证开发环境有数据可用，编写了 `apps/server-node/prisma/seed.ts` 脚本，将原有的 Mock 数据批量写入数据库。

执行命令：
```bash
pnpm --filter server-node exec ts-node prisma/seed.ts
```

### 4. 服务层重构

修改 `apps/server-node/src/services/home.service.ts`，将静态数据读取改为 Prisma 查询。

**关键变更点**：
-   **类型转换**：数据库中的 `Decimal` 类型需转为 `number` 给前端。
-   **字段映射**：处理 `null` 值，确保返回给前端的字段不为 `null`（如 `summary || ''`）。
-   **日期格式化**：将 `Date` 对象转为 `YYYY-MM-DD` 字符串。

---

## 三、常用操作

### 1. 查看/管理数据
使用 Prisma Studio 可视化管理数据：
```bash
pnpm --filter server-node db:studio
```

### 2. 重置数据库
如果需要清空数据并重新填充：
```bash
# 1. 慎用！这会清空所有数据
pnpm --filter server-node prisma migrate reset

# 2. 重新运行 seed
pnpm --filter server-node exec ts-node prisma/seed.ts
```
