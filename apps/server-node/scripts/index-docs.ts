import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';
import { VectorStoreService } from '../src/infra/rag/vector-store';

/**
 * 文档索引脚本
 * 用法: npx ts-node scripts/index-docs.ts
 */
async function main() {
  console.log('Starting document indexing...');

  const vectorStore = VectorStoreService.getInstance();

  // 1. 清空旧数据 (可选，如果想增量更新则去掉)
  await vectorStore.clear();

  // 2. 扫描文档
  // __dirname 是 apps/server-node/scripts
  // 回退 3 层到项目根目录
  const projectRoot = path.resolve(__dirname, '../../../');
  const docsPath = path.join(projectRoot, 'doc');

  const files = await glob('**/*.md', { cwd: docsPath });
  const readmePath = path.join(projectRoot, 'README.md');
  files.push(readmePath); // 添加 README

  console.log(`Found ${files.length} documents.`);

  const chunks: { text: string; source: string; category: string }[] = [];

  for (const file of files) {
    const isReadme = file.endsWith('README.md');
    const filePath = isReadme ? file : path.join(docsPath, file);

    try {
      const content = await fs.readFile(filePath, 'utf-8');

      // 3. 简单切片策略 (按标题切分)
      // 这里做一个简单的切分：按 ## 标题切分，或者按固定长度
      // 为了演示，我们采用 "按双换行符切分段落，如果段落太长再截断"

      const paragraphs = content.split('\n\n').filter((p) => p.trim().length > 0);

      for (const p of paragraphs) {
        // 如果段落太短，可能是标题或无意义文本，跳过 (可选)
        if (p.length < 20) continue;

        // 如果段落太长，再切分 (LanceDB 也是有 Token 限制的，虽然我们是 Embedding)
        // Embedding 模型通常支持 512 token，约 1000 字符
        if (p.length > 800) {
          // 简单按长度切
          const subChunks = p.match(/.{1,800}/g) || [];
          subChunks.forEach((sub) => {
            chunks.push({
              text: sub,
              source: file,
              category: isReadme ? 'readme' : 'doc',
            });
          });
        } else {
          chunks.push({
            text: p,
            source: file,
            category: isReadme ? 'readme' : 'doc',
          });
        }
      }
    } catch (e) {
      console.error(`Failed to read ${filePath}:`, e);
    }
  }

  // 4. 批量存入向量库
  console.log(`Generated ${chunks.length} chunks. Indexing...`);
  await vectorStore.addDocuments(chunks);

  console.log('Indexing completed successfully!');
}

main().catch(console.error);
