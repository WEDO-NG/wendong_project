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

## 5. 后续优化方向

1.  **混合检索 (Hybrid Search)**: 结合关键词匹配 (BM25) 和向量检索，提升对专有名词的命中率。
2.  **元数据过滤**: 允许只在特定类别的文档（如 "API文档"）中搜索。
3.  **自动重索引**: 在 CI/CD 流程中集成索引更新步骤。

---

_记录时间：2026-02-02_
