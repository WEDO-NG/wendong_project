# 部署与上线指南 (Deployment Guide)

## 1. 部署架构概览

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

## 2. 服务器环境准备

- **OS**: Ubuntu 22.04 LTS / CentOS 7.9
- **Node.js**: v18+ (nvm)
- **pnpm**: `npm i -g pnpm`
- **Nginx**: 反向代理
- **PM2**: 进程守护
- **MySQL**: 数据库
- **Redis**: 缓存

## 3. 生产环境构建步骤

### 前端构建
1. 构建：
   ```bash
   pnpm --filter web-react build
   ```
2. 上传 `apps/web-react/dist` 到服务器 (如 `/var/www/wendong-project/html`)。

### 后端部署
1. 拉取代码。
2. 安装生产依赖：`pnpm install --prod`
3. 生成 Prisma Client：`pnpm --filter server-node prisma generate`
4. 启动服务：
   ```bash
   cd apps/server-node
   pm2 start dist/server.js --name server-node
   ```

## 4. Nginx 配置示例

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
## 5. 安全最佳实践 (Security Best Practices)

### 5.1 环境变量安全 (.env)

`.env` 文件包含数据库密码、API Key 等敏感信息，**绝对不能** 提交到版本控制系统（Git）。

**生产环境管理策略：**

1.  **手动创建**：
    在服务器部署目录下手动创建 `.env` 文件，并设置严格权限：
    ```bash
    # 在服务器上
    cd /var/www/wendong-project/apps/server-node
    touch .env
    # 编辑并填入生产环境配置
    nano .env
    # 设置权限仅当前用户可读写 (600)
    chmod 600 .env
    ```

2.  **环境变量注入 (推荐)**：
    如果是容器化部署 (Docker/K8s) 或使用 CI/CD，推荐通过平台的环境变量功能注入，而不是依赖文件。

    *   **Docker Compose**:
        ```yaml
        # docker-compose.prod.yml
        services:
          server-node:
            environment:
              - DATABASE_URL=${DATABASE_URL}
              - AI_API_KEY=${AI_API_KEY}
        ```
    *   **PM2**:
        可以在 `ecosystem.config.js` 中配置，但**注意不要提交该文件到公开仓库**，或者使用 `--env` 参数。

### 5.2 最小权限原则

- 数据库用户：不要使用 `root`，创建专用的 `wendong_app` 用户，仅授予必要的库权限。
- 服务进程：不要以 `root` 身份运行 Node.js 进程，使用专用用户 (如 `www-data` 或 `node`)。
