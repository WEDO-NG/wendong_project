import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';
import { VectorStoreService } from '../src/infra/rag/vector-store';

/**
 * 文档索引脚本
 * 用法: npx ts-node scripts/index-docs.ts
 *
 * 功能：扫描项目文档和源代码，切片并存入向量数据库，使 AI 能“阅读”代码。
 */
async function main() {
  console.log('Starting document and code indexing...');

  const vectorStore = VectorStoreService.getInstance();

  // 1. 清空旧数据 (重建索引)
  await vectorStore.clear();

  // 2. 扫描文件
  // __dirname 是 apps/server-node/scripts
  // 回退 3 层到项目根目录
  const projectRoot = path.resolve(__dirname, '../../../');
  console.log(`Project Root: ${projectRoot}`);

  const patterns = [
    // 文档
    'doc/**/*.md',
    'README.md',
    // 源代码 (Server & Client)
    'apps/*/src/**/*.{ts,tsx}',
    // 共享包代码
    'packages/*/src/**/*.{ts,tsx}',
    // 关键配置文件
    'apps/*/package.json',
    'packages/*/package.json',
    'package.json',
    'docker-compose*.yml',
  ];

  const ignorePatterns = [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/.next/**',
    '**/*.test.ts',
    '**/*.spec.ts',
    '**/__tests__/**',
    '**/*.d.ts', // 忽略类型定义文件，减少噪音
  ];

  console.log('Scanning files...');
  const files = await glob(patterns, {
    cwd: projectRoot,
    ignore: ignorePatterns,
    nodir: true,
  });

  console.log(`Found ${files.length} files to index.`);

  const chunks: { text: string; source: string; category: string }[] = [];

  for (const relPath of files) {
    const filePath = path.join(projectRoot, relPath);
    const category = getCategory(relPath);

    try {
      const content = await fs.readFile(filePath, 'utf-8');

      // 跳过空文件
      if (!content.trim()) continue;

      if (category === 'code' || category === 'config') {
        // 代码文件切片策略
        const codeChunks = chunkCode(content, relPath, category);
        chunks.push(...codeChunks);
      } else {
        // Markdown 文档切片策略
        const docChunks = chunkMarkdown(content, relPath, category);
        chunks.push(...docChunks);
      }
    } catch (e) {
      console.error(`Failed to read ${relPath}:`, e);
    }
  }

  // 4. 批量存入向量库
  if (chunks.length > 0) {
    console.log(`Generated ${chunks.length} chunks. Indexing...`);
    // 分批写入，防止一次性过大
    const BATCH_SIZE = 100;
    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE);
      console.log(
        `Writing batch ${i / BATCH_SIZE + 1}/${Math.ceil(chunks.length / BATCH_SIZE)}...`
      );
      await vectorStore.addDocuments(batch);
    }
    console.log('Indexing completed successfully!');
  } else {
    console.log('No chunks to index.');
  }
}

function getCategory(filePath: string): string {
  if (filePath.endsWith('.md')) return 'doc';
  if (filePath.endsWith('.json') || filePath.endsWith('.yml') || filePath.endsWith('.yaml'))
    return 'config';
  return 'code';
}

/**
 * 代码切片策略
 * 按固定字符数切分，并保留重叠上下文
 */
function chunkCode(content: string, source: string, category: string) {
  const CHUNK_SIZE = 1500; // 增加 chunk 大小以包含更多上下文
  const OVERLAP = 300;
  const chunks: { text: string; source: string; category: string }[] = [];

  // 添加文件头信息，帮助模型理解上下文
  const fileHeader = `File: ${source}\n\`\`\`${getFileExtension(source)}\n`;
  // eslint-disable-next-line no-useless-escape
  const fileFooter = '\n\`\`\`';

  let start = 0;
  while (start < content.length) {
    const end = Math.min(start + CHUNK_SIZE, content.length);
    const chunkContent = content.slice(start, end);

    // 组合成完整片段
    const fullText = `${fileHeader}${chunkContent}${fileFooter}`;

    chunks.push({
      text: fullText,
      source,
      category,
    });

    // 如果已经到末尾，停止
    if (end >= content.length) break;

    // 移动窗口，保留重叠
    start += CHUNK_SIZE - OVERLAP;
  }

  return chunks;
}

/**
 * Markdown 切片策略
 */
function chunkMarkdown(content: string, source: string, category: string) {
  const chunks: { text: string; source: string; category: string }[] = [];

  // 简单按段落切分
  const paragraphs = content.split('\n\n').filter((p) => p.trim().length > 0);

  for (const p of paragraphs) {
    if (p.length < 20) continue; // 跳过过短段落

    if (p.length > 1000) {
      // 长段落再次切分
      const subChunks = p.match(/.{1,1000}/g) || [];
      subChunks.forEach((sub) => {
        chunks.push({
          text: `Source: ${source}\n\n${sub}`,
          source,
          category,
        });
      });
    } else {
      chunks.push({
        text: `Source: ${source}\n\n${p}`,
        source,
        category,
      });
    }
  }
  return chunks;
}

function getFileExtension(filePath: string): string {
  const ext = path.extname(filePath).substring(1);
  if (ext === 'ts' || ext === 'tsx') return 'typescript';
  if (ext === 'js' || ext === 'jsx') return 'javascript';
  return ext;
}

main().catch(console.error);
