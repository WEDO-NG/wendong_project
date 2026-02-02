# Stage 1: Build
FROM node:18-alpine AS builder

# 安装 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# 复制源代码
COPY . .

# 安装依赖
RUN pnpm install --frozen-lockfile

# 构建依赖包 (确保构建顺序)
RUN pnpm --filter @wendong/business-core build
RUN pnpm --filter @wendong/adapters build
# utils 和 web-ui 目前没有 build 脚本 (源码引用)，如果有需要再加
# RUN pnpm --filter @wendong/utils build
# RUN pnpm --filter @wendong/web-ui build

# 构建前端应用
RUN pnpm --filter web-react build

# Stage 2: Nginx Serve
FROM nginx:alpine

# 复制构建产物到 Nginx 目录
COPY --from=builder /app/apps/web-react/dist /usr/share/nginx/html

# 复制自定义 Nginx 配置 (注意：上下文是项目根目录)
COPY docker/nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
