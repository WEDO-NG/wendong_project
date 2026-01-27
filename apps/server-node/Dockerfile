# Stage 1: Build
FROM node:18-alpine AS builder

# 安装 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# 复制所有源代码 (因为是 Monorepo，需要根目录上下文)
COPY . .

# 安装所有依赖
RUN pnpm install --frozen-lockfile

# 构建依赖包 (按照依赖顺序)
# business-core 是基础依赖
RUN pnpm --filter @wendong/business-core build
# adapters 依赖 business-core
RUN pnpm --filter @wendong/adapters build

# 构建 Server
RUN pnpm --filter server-node build

# 部署生产环境产物 (提取 server-node 及其生产依赖到独立目录)
# pnpm deploy 会自动处理 workspace 依赖替换和 node_modules 扁平化
RUN pnpm --filter server-node --prod deploy /prod/server-node

# Stage 2: Runner
FROM node:18-alpine AS runner

WORKDIR /app

# 从构建阶段复制部署好的产物
COPY --from=builder /prod/server-node .

# 暴露端口
EXPOSE 3001

# 启动服务
CMD ["node", "dist/server.js"]
