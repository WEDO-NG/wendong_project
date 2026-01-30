# 阿里云 ECS 部署操作手册 (Docker Compose 全栈版)

本文档旨在指导你如何在全新的阿里云 ECS 服务器上，使用 Docker Compose 一键部署 wendong_project 全栈应用（React + Node.js + MySQL + Redis）。

---

## 1. 服务器环境准备

### 1.1 购买/重置 ECS
- **操作系统**：推荐 `Ubuntu 22.04 LTS` (兼容性最好) 或 `CentOS 7.9`。
- **安全组规则**：在阿里云控制台 -> 网络与安全 -> 安全组，开放以下端口：
  - `22` (SSH)
  - `80` (HTTP - 前端入口)
  - `443` (HTTPS - 预留)

### 1.2 连接服务器
```bash
ssh root@<你的公网IP>
```

### 1.3 安装 Docker & Docker Compose

**Ubuntu 22.04:**
```bash
# 1. 更新 apt
apt-get update

# 2. 安装基础工具
apt-get install -y ca-certificates curl gnupg

# 3. 安装 Docker (使用阿里云镜像源加速安装)
curl -fsSL https://get.docker.com | bash -s docker --mirror Aliyun

# 4. 启动 Docker
systemctl enable docker
systemctl start docker
```

**CentOS 7.9:**
```bash
yum install -y yum-utils
yum-config-manager --add-repo http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
systemctl start docker
systemctl enable docker
```

### 1.4 配置 Docker 镜像加速 (国内服务器必须)
为了能拉取到 `node:18-alpine` 等镜像，必须配置加速器。

```bash
mkdir -p /etc/docker
tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": [
    "https://docker.m.daocloud.io",
    "https://huecker.io",
    "https://dockerhub.timeweb.cloud"
  ]
}
EOF
systemctl daemon-reload
systemctl restart docker
```

---

## 2. 代码部署

### 2.1 拉取代码
建议使用 HTTPS 方式或配置 SSH Key。

```bash
# 1. 进入工作目录
mkdir -p /var/www
cd /var/www

# 2. 克隆代码 (替换为你的仓库地址)
git clone https://github.com/your-username/wendong_project.git
cd wendong_project
```

### 2.2 配置环境变量 (关键安全步骤)

**手动创建 .env 文件**（不要提交到 Git）：

```bash
nano .env
```

粘贴以下内容（根据实际情况修改）：

```env
# MySQL 生产环境密码 (务必修改!)
MYSQL_PASSWORD=StrongPassword123!

# AI API Key (DeepSeek / OpenAI)
AI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Node 服务端口 (容器内部使用，无需修改)
PORT=3001
```
*按 `Ctrl+O` 保存，`Ctrl+X` 退出。*

---

## 3. 启动服务

### 3.1 一键构建并启动
使用生产环境编排文件 `docker-compose.prod.yml`：

```bash
# -f 指定生产配置文件
# -d 后台运行
# --build 强制重新构建镜像
docker compose -f docker-compose.prod.yml up -d --build
```

### 3.2 初始化数据库结构 (Prisma Migrate)

首次部署时，MySQL 数据库是空的，需要执行一次迁移，创建业务表（如 `Navigation`、`Banner` 等）。

如果你的 `server-node` 镜像里已包含 Prisma CLI（推荐），可以直接在容器内执行：

```bash
docker compose -f docker-compose.prod.yml exec -T server-node node_modules/.bin/prisma migrate deploy
```

如果容器内没有 Prisma CLI，也可以临时用 SQL 方式执行（以仓库内 migration.sql 为准）：

```bash
docker compose -f docker-compose.prod.yml exec -T mysql mysql -uroot -p\"${MYSQL_PASSWORD:-password}\" wendong_project < apps/server-node/prisma/migrations/*/migration.sql
```

### 3.2 验证服务状态

```bash
# 查看容器运行状态
docker compose -f docker-compose.prod.yml ps
```
你应该看到 4 个服务 (`mysql`, `redis`, `server-node`, `web-react`) 状态均为 `Up`。

### 3.3 访问测试
- **前端页面**：浏览器访问 `http://<你的公网IP>`
- **后端接口**：浏览器访问 `http://<你的公网IP>/api/health` (如果实现了该接口)

---

## 4. 日常维护命令

### 查看日志
```bash
# 查看所有日志
docker compose -f docker-compose.prod.yml logs -f

# 查看特定服务日志 (如后端报错)
docker compose -f docker-compose.prod.yml logs -f server-node
```

### 代码更新
当你本地代码更新并推送到 Git 后：

```bash
# 1. 拉取最新代码
git pull

# 2. 重新构建并重启 (Docker 会利用缓存，速度较快)
docker compose -f docker-compose.prod.yml up -d --build

# 3. 清理旧镜像 (可选，释放磁盘空间)
docker image prune -f
```

### 数据库备份
```bash
# 备份到宿主机当前目录
docker exec wendong_project-mysql-1 mysqldump -u root -p"$MYSQL_PASSWORD" wendong_project > backup_$(date +%F).sql
```

---

## 5. 故障排查 (Troubleshooting)

**Q1: 数据库连接失败 (Connection Refused)**
- 检查 `.env` 中的 `MYSQL_PASSWORD` 是否与 `docker-compose.prod.yml` 中的一致。
- 检查 `server-node` 日志：`docker compose -f docker-compose.prod.yml logs server-node`。

**Q2: 前端访问 404 或 502**
- 502 Bad Gateway: 说明 Nginx 启动了，但 `server-node` 没启动或挂了。检查后端日志。
- 404 Not Found: 检查 Nginx 配置是否正确代理了 `/api`。

**Q3: 镜像拉取超时 (Image Pull Backoff)**
- **现象**：`docker-compose build` 时卡在 `FROM node:18-alpine` 或报错 `i/o timeout`。
- **原因**：国内网络无法访问 Docker Hub，且加速器失效。
- **解决方案**：
  1.  **多试几次**：有时候是间歇性的。
  2.  **更换加速器**：尝试搜索最新的可用加速器地址。
  3.  **终极方案 (离线传输)**：
      - 本地构建 (注意平台)：`docker buildx build --platform linux/amd64 -t wendong-server:latest -f apps/server-node/Dockerfile .`
      - 导出：`docker save -o server.tar wendong-server:latest`
      - 上传：`scp server.tar root@<IP>:/root`
      - 服务器导入：`docker load -i server.tar`
      - 修改 `docker-compose.prod.yml` 中的 `build:` 为 `image: wendong-server:latest`。
