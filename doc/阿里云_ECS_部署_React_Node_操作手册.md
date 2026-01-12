
# 阿里云 ECS 上部署 React + Node 服务操作手册

> 本文档面向 **没有部署经验的开发者**，用于指导在 **阿里云 ECS** 上完成 React 前端与 Node（Express）服务的完整部署流程。  
> 适用于当前项目阶段：**React + Node + Nginx + PM2**。

---

## 一、整体部署架构说明

```
浏览器
   │
   ▼
Nginx（80/443）
   │
   ├── React 静态资源
   └── /api → Node.js（Express）→ PM2
```

---

## 二、准备工作

### 2.1 购买 ECS 实例

- 云厂商：阿里云
- 推荐系统：Ubuntu 22.04 LTS
- 推荐配置：
  - CPU：2 核
  - 内存：4 GB
  - 硬盘：40 GB

### 2.2 安全组配置

需开放以下端口：

| 端口 | 用途 |
|----|----|
| 22 | SSH 远程连接 |
| 80 | HTTP |
| 443 | HTTPS（可选） |

> ⚠️ Node 服务端口（如 3000）不建议对公网暴露。

---

## 三、连接服务器

在本地终端（Terminal）执行以下命令：

```bash
ssh root@服务器公网ip
```

- 首次连接会提示 `Are you sure you want to continue connecting (yes/no/[fingerprint])?`，输入 `yes` 并回车。
- 随后输入您设置的服务器密码（输入时不会显示字符），按回车即可进入。

---

## 四、安装基础运行环境

## 先升级系统软件包

```bash
sudo apt update && apt upgrade -y // 更新系统
lsb_release -a // 确认系统版本，类似 Ubuntu 22.04 LTS
## 遇到紫色面板页面（Ubuntu 系统安装或更新软件时的标准提示界面），直接回车确认即可
```

### 4.1 安装 Node.js（推荐 nvm）

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install --lts
```

验证：

```bash
node -v
npm -v
```

---

### 4.2 安装 pnpm

```bash
npm install -g pnpm
```

---

### 4.3 安装 Nginx

```bash
sudo apt update
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx

systemctl status nginx // 确认 Nginx 是否启动成功
```
如果浏览器访问服务器公网 IP，能看到 Nginx 默认欢迎页，说明 Nginx 安装成功。
如果不能访问，请检查防火墙设置，确保 80 端口对外开放。
```

---

## 五、上传或拉取项目代码

### 方式一：Git 拉取（推荐）

```bash
git clone <your-repo-url>（https地址）
cd wendong_project

如果拉取失败，检查是否有防火墙或网络问题。
使用 GitHub 镜像代理或其他镜像站点加速拉取。
```

### 方式二：SCP 上传

```bash
scp -r ./wendong_project root@IP:/root/
```

---

## 六、安装依赖与构建（Monorepo 专属流程）

**注意：** 本项目是 Monorepo 架构，**严禁**进入 `apps/` 子目录单独安装依赖。必须在根目录统一操作。

### 6.1 安装所有依赖

在项目根目录执行：

```bash
pnpm install
```

### 6.2 构建前端 React 项目

在项目根目录执行：

```bash
pnpm --filter web-react build
```

生成目录为：`apps/web-react/dist/`

### 6.3 构建后端 Node 项目

由于服务端是 TypeScript 编写，必须先编译：

1. **生成 Prisma Client** (必须执行，否则报错)：
   ```bash
   pnpm --filter server-node exec prisma generate
   ```

2. **编译 TS 代码**：
   ```bash
   pnpm --filter server-node build
   ```

生成目录为：`apps/server-node/dist/`

---

## 七、启动 Node 服务 (PM2)

```bash
cd apps/server-node
// 启动服务
pm2 start dist/server.js --name wendong-node 
// 保存当前运行列表。
pm2 save
// 生成开机自启脚本。
pm2 startup
```

---

## 八、配置 Nginx 反向代理

编辑配置文件：

```bash
sudo vim /etc/nginx/sites-available/default
```

示例配置：

```nginx
server {
    listen 80;
    server_name your-domain-or-ip;

    location / {
        root /root/wendong_project/apps/web-react/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

重载配置：

```bash
sudo nginx -s reload
```

---

## 九、验证部署

- 访问：`http://你的公网IP`
- 能看到 React 页面
- 页面可正常请求 `/api` 接口

---

## 十、常见问题排查

### 10.1 SSH 连接失败 (Permission denied)

**现象**：
终端报错 `root@xx.xx.xx.xx: Permission denied (publickey).`

**原因**：
服务器当前仅允许 **SSH 密钥对** 登录，未开启密码登录，或者您在创建实例时选择了密钥对但未在本地指定密钥文件。

**解决方案**：

**方法 A：如果您有密钥文件 (.pem)**
1. 找到下载的 `.pem` 文件（例如 `my-key.pem`）。
2. 修改权限（必须操作）：`chmod 400 my-key.pem`
3. 指定密钥登录：
   ```bash
   ssh -i /path/to/my-key.pem root@39.97.54.94
   ```

**方法 B：如果您想用密码登录（推荐新手）**
1. 登录 [阿里云 ECS 控制台](https://ecs.console.aliyun.com)。
2. 找到您的实例，点击右侧 **“更多”** -> **“密码/密钥”** -> **“重置实例密码”**。
3. 设置一个新密码。
4. **重要**：在控制台点击 **“重启”** 实例（部分配置需重启生效）。
5. 重启完成后，再次尝试 `ssh root@39.97.54.94`。

### 10.2 页面 404

- 检查 `try_files`
- 检查静态资源路径

### 10.2 API 502

- Node 服务是否启动
- PM2 进程是否存在

```bash
pm2 list
pm2 logs
```

---

## 十一、后续可选优化（非当前阶段目标）

- HTTPS（Certbot + Let’s Encrypt）
- CI/CD 自动部署
- Docker 化部署
- 多环境支持（dev / prod）

---

## 十二、阶段总结

> 当前阶段目标不是高可用，而是 **完整跑通一条真实的线上链路**。  
> 当 React 页面能成功调用线上 Node API，即视为 Phase 3 完成。
