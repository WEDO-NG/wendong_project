# RAG 优化实施记录：本地向量检索方案

> 记录于 Phase 3 阶段：优化 AI 问答准确度与性能。

## 1. 背景与目标

原有的 RAG (Retrieval-Augmented Generation) 实现采用"暴力全量加载"策略，即每次请求都读取所有项目文档拼接到 Prompt 中。这种方式存在以下问题：

1.  **Token 浪费**：Prompt 包含大量无关信息，消耗 API 额度。
2.  **上下文超限**：随着文档增多，极易超出 LLM 上下文窗口限制。
3.  **准确度下降**：过多的噪声信息干扰了模型对关键信息的提取 ("Lost in the Middle" 现象)。

**目标**：引入向量检索机制，实现"按需加载"，且要求方案**完全免费**、**轻量级**。

## 2. 技术选型 (Free Stack)

我们采用了一套完全基于本地运行、零成本的技术栈：

| 组件               | 选型                      | 理由                                                                             |
| ------------------ | ------------------------- | -------------------------------------------------------------------------------- |
| **Embedding 模型** | `Xenova/all-MiniLM-L6-v2` | 通过 `@xenova/transformers` 在 Node.js 本地运行，无需 OpenAI API，免费且速度快。 |
| **向量数据库**     | `@lancedb/lancedb`        | 嵌入式向量数据库，以文件形式存储 (Serverless)，无需 Docker 容器维护，极轻量。    |
| **检索策略**       | Semantic Search (Top K)   | 基于余弦相似度检索最相关的 3-5 个文档片段。                                      |

## 3. 实施步骤

### 3.1 引入依赖

在 `apps/server-node` 中安装核心库：

```bash
pnpm add @lancedb/lancedb @xenova/transformers
```

### 3.2 核心服务实现

1.  **EmbeddingService** (`src/services/embedding.service.ts`):
    - 单例模式，负责加载 ONNX 模型。
    - 提供 `getEmbedding(text)` 方法，将文本转换为 384 维向量。

2.  **VectorStoreService** (`src/services/vector-store.service.ts`):
    - 管理 LanceDB 连接与表操作。
    - 提供 `addDocuments()` 用于存入文档向量。
    - 提供 `search(query, limit)` 用于语义检索。

### 3.3 索引脚本

创建了 `scripts/index-docs.ts`，用于离线建立索引：

1.  扫描 `doc/` 目录下的所有 Markdown 文件。
2.  **扫描项目源代码 (`src/**/\*.{ts,tsx}`) 及关键配置文件 (`package.json`, `docker-compose.yml`)\*\*，赋予 AI 阅读代码的能力。
3.  按段落/标题/代码块进行文本切片 (Chunking)，并保留代码上下文重叠。
4.  调用 EmbeddingService 生成向量。
5.  存入 `data/vector-store` 目录。

### 3.4 业务集成

改造 `PromptManager` (`src/utils/prompt-manager.ts`)：

- **Before**: `loadProjectDocs()` 加载所有文档 -> 拼接 Prompt。
- **After**: `vectorStore.search(userQuery)` 检索 Top 3 片段 -> 仅拼接相关片段。
- **Fallback**: 如果检索结果为空或报错，自动降级回退到旧逻辑，保证高可用。

## 4. 使用指南

### 4.1 初始化索引

在部署或文档更新后，需运行一次索引脚本：

```bash
# 在 apps/server-node 目录下
npx ts-node scripts/index-docs.ts
```

_(注：为适配国内网络/离线环境，模型建议预下载并走本地加载，见下文)_

### 4.2 本地模型准备 (离线/国内网络推荐)

默认情况下，`@xenova/transformers` 会尝试从 HuggingFace 拉取模型文件；在国内网络环境下可能出现超时。

推荐做法：将模型文件预下载到 `apps/server-node/models/`，并在运行时禁用远程下载。

**模型目录约定：**

- `apps/server-node/models/Xenova/all-MiniLM-L6-v2/`（包含 tokenizer 与 onnx 权重文件）

**一次性下载示例（使用 HuggingFace 镜像）：**

```bash
BASE_URL="https://hf-mirror.com/Xenova/all-MiniLM-L6-v2/resolve/main"
mkdir -p apps/server-node/models/Xenova/all-MiniLM-L6-v2/onnx
cd apps/server-node/models/Xenova/all-MiniLM-L6-v2
curl -L -O $BASE_URL/config.json
curl -L -O $BASE_URL/tokenizer.json
curl -L -O $BASE_URL/tokenizer_config.json
curl -L -O $BASE_URL/special_tokens_map.json
curl -L -O $BASE_URL/vocab.txt
curl -L -o onnx/model.onnx $BASE_URL/onnx/model.onnx
curl -L -o onnx/model_quantized.onnx $BASE_URL/onnx/model_quantized.onnx
```

**重要说明：**

- 生产 Docker 镜像如果需要离线 Embedding，必须把 `models/` 一并打包进镜像（或挂载卷）。
- 同理，`data/vector-store/` 也是检索数据所在目录，需要持久化（建议挂载卷或写入镜像）。

### 4.3 验证效果

启动服务后，向 AI 提问具体的技术细节（如"项目架构是怎样的？"），观察日志输出：

```
[PromptManager] Hit 3 relevant docs via Vector Search.
```

这表明 RAG 检索已生效。

### 4.4 关于二进制依赖 (重要)

`@lancedb/lancedb` 会按平台加载对应的预编译二进制包。

- 本地开发（macOS Intel/ARM）通常可自动安装对应包。
- 生产环境如果使用 `node:alpine`（musl），可能需要确保安装了对应的 `@lancedb/lancedb-linux-x64-musl` 变体（由依赖链自动拉取或显式添加），否则运行时会出现找不到二进制模块的错误。

## 5. 模型基础镜像方案 (新实施规划)

### 5.1 方案背景

为解决模型文件（109MB）与代码分离管理的问题，避免 Git 仓库膨胀，同时支持阿里云 ACR 云端自动构建，引入"模型基础镜像"策略。

### 5.2 核心思路

**分离打包**：

- **代码镜像**：轻量级，仅包含业务代码，支持频繁更新
- **模型镜像**：重量级，仅包含 AI 模型文件，更新频率低

**构建流程**：

1. 模型镜像独立构建推送（一次性或模型更新时）
2. 代码镜像构建时从模型镜像复制模型文件
3. 支持阿里云 ACR 云端自动构建代码镜像

### 5.3 实施步骤规划

#### 步骤1：创建模型基础镜像

已创建专用 Dockerfile：

```dockerfile
# Dockerfile.models - 模型专用镜像
FROM alpine:latest
WORKDIR /data
COPY apps/server-node/models /data/models
RUN du -sh /data/models
```

#### 步骤2：构建并推送模型镜像

```bash
# 登录阿里云 ACR
docker login crpi-emqag2foql120pnh.cn-beijing.personal.cr.aliyuncs.com

# 构建模型镜像
docker build -f Dockerfile.models -t crpi-emqag2foql120pnh.cn-beijing.personal.cr.aliyuncs.com/wendong-registry/wendong-models:latest .

# 推送到镜像仓库
docker push crpi-emqag2foql120pnh.cn-beijing.personal.cr.aliyuncs.com/wendong-registry/wendong-models:latest
```

#### 步骤3：修改主 Dockerfile

修改 `apps/server-node/Dockerfile`：

```dockerfile
# 在 builder 阶段添加模型镜像引用
FROM crpi-emqag2foql120pnh.cn-beijing.personal.cr.aliyuncs.com/wendong-registry/wendong-models:latest as models

# 在需要模型的地方复制
COPY --from=models /data/models /prod/server-node/models
```

#### 步骤4：配置阿里云 ACR 自动构建

1. 在阿里云控制台创建代码源绑定（GitHub/GitLab）
2. 配置构建规则：
   - 触发条件：代码推送
   - 构建上下文：项目根目录
   - Dockerfile 路径：`apps/server-node/Dockerfile`
   - 镜像标签：`latest`

### 5.4 优势分析

| 优势             | 说明                                     |
| ---------------- | ---------------------------------------- |
| **Git 仓库轻量** | 模型文件不进入 Git，保持代码仓库小巧     |
| **构建速度快**   | 代码镜像构建无需处理大文件，云端构建更快 |
| **更新灵活**     | 代码和模型可独立更新，互不影响           |
| **成本优化**     | 模型镜像只需构建一次，重复使用           |
| **标准化**       | 符合云原生最佳实践，支持 CI/CD 集成      |

### 5.5 注意事项

1. **模型版本管理**：建议在模型镜像标签中包含版本信息
2. **多平台支持**：确保模型镜像支持目标平台（linux/amd64）
3. **网络优化**：使用阿里云内网地址加速镜像拉取
4. **安全考虑**：模型镜像可设为私有，避免泄露

### 5.6 后续扩展

- **多模型支持**：可扩展支持多个 Embedding 模型
- **缓存策略**：在构建节点缓存模型镜像，进一步提升速度
- **版本追踪**：建立模型版本与代码版本的映射关系

## 6. 后续优化方向

1.  **混合检索 (Hybrid Search)**: 结合关键词匹配 (BM25) 和向量检索，提升对专有名词的命中率。
2.  **元数据过滤**: 允许只在特定类别的文档（如 "API文档"）中搜索。
3.  **自动重索引**: 在 CI/CD 流程中集成索引更新步骤。

---

_记录时间：2026-02-02_
