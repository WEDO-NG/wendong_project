import * as lancedb from '@lancedb/lancedb';
import path from 'path';
import fs from 'fs/promises';
import { glob } from 'glob';
import { EmbeddingService } from './embedding';

interface DocumentRecord {
  id: string;
  text: string;
  vector: number[];
  source: string;
  category: string;
  [key: string]: unknown;
}

export class VectorStoreService {
  private static instance: VectorStoreService;
  private db: lancedb.Connection | null = null;
  private table: lancedb.Table | null = null;
  private indexingPromise: Promise<void> | null = null;

  private static DB_PATH = path.resolve(__dirname, '../../..', 'data/vector-store');
  private static TABLE_NAME = 'documents';

  private constructor() {}

  public static getInstance(): VectorStoreService {
    if (!VectorStoreService.instance) {
      VectorStoreService.instance = new VectorStoreService();
    }
    return VectorStoreService.instance;
  }

  private async init() {
    if (this.db && this.table) return;

    // Ensure data directory exists
    const dataDir = path.dirname(VectorStoreService.DB_PATH);
    await fs.mkdir(dataDir, { recursive: true });

    console.log(`[VectorStoreService] DB Path: ${VectorStoreService.DB_PATH}`);

    this.db = await lancedb.connect(VectorStoreService.DB_PATH);

    const tableNames = await this.db.tableNames();
    if (tableNames.includes(VectorStoreService.TABLE_NAME)) {
      this.table = await this.db.openTable(VectorStoreService.TABLE_NAME);
    } else {
      console.log('[VectorStoreService] Table not found, waiting for initial data.');
    }
  }

  private async resolveProjectRoot(): Promise<string> {
    const candidates = [
      process.env.PROJECT_ROOT,
      process.cwd(),
      path.resolve(__dirname, '../../..'),
      path.resolve(__dirname, '../../../..'),
    ].filter(Boolean) as string[];

    for (const candidate of candidates) {
      try {
        await fs.access(path.join(candidate, 'README.md'));
        await fs.access(path.join(candidate, 'doc'));
        return candidate;
      } catch {
        continue;
      }
    }

    return candidates[0] || process.cwd();
  }

  private async buildDocChunks(
    projectRoot: string
  ): Promise<{ text: string; source: string; category: string }[]> {
    console.log(`[VectorStoreService] Scanning files in ${projectRoot}...`);
    // 兼容 Docker 环境和本地 Monorepo 环境的路径
    const patterns = [
      // 文档
      'doc/**/*.md',
      'README.md',
      // 源代码 (Monorepo 结构)
      'apps/*/src/**/*.{ts,tsx}',
      'packages/*/src/**/*.{ts,tsx}',
      // 源代码 (Docker 扁平结构 - server-node 源码在 ./src, packages 在 ./packages)
      'src/**/*.{ts,tsx}',
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
      '**/*.d.ts',
    ];

    const files = await glob(patterns, {
      cwd: projectRoot,
      ignore: ignorePatterns,
      nodir: true,
    });

    console.log(`[VectorStoreService] Found ${files.length} files to index.`);

    const chunks: { text: string; source: string; category: string }[] = [];

    for (const relPath of files) {
      const filePath = path.join(projectRoot, relPath);
      const category = this.getCategory(relPath);

      try {
        const content = await fs.readFile(filePath, 'utf-8');
        if (!content.trim()) continue;

        if (category === 'code' || category === 'config') {
          const codeChunks = this.chunkCode(content, relPath, category);
          chunks.push(...codeChunks);
        } else {
          const docChunks = this.chunkMarkdown(content, relPath, category);
          chunks.push(...docChunks);
        }
      } catch (e) {
        console.warn(`[VectorStoreService] Failed to read ${relPath}:`, e);
      }
    }

    return chunks;
  }

  private getCategory(filePath: string): string {
    if (filePath.endsWith('.md')) return 'doc';
    if (filePath.endsWith('.json') || filePath.endsWith('.yml') || filePath.endsWith('.yaml'))
      return 'config';
    return 'code';
  }

  private chunkCode(content: string, source: string, category: string) {
    const CHUNK_SIZE = 1500;
    const OVERLAP = 300;
    const chunks: { text: string; source: string; category: string }[] = [];

    const fileHeader = `File: ${source}\n\`\`\`${this.getFileExtension(source)}\n`;
    // eslint-disable-next-line no-useless-escape
    const fileFooter = '\n\`\`\`';

    let start = 0;
    while (start < content.length) {
      const end = Math.min(start + CHUNK_SIZE, content.length);
      const chunkContent = content.slice(start, end);
      const fullText = `${fileHeader}${chunkContent}${fileFooter}`;

      chunks.push({ text: fullText, source, category });

      if (end >= content.length) break;
      start += CHUNK_SIZE - OVERLAP;
    }
    return chunks;
  }

  private chunkMarkdown(content: string, source: string, category: string) {
    const chunks: { text: string; source: string; category: string }[] = [];
    const paragraphs = content.split('\n\n').filter((p) => p.trim().length > 0);

    for (const p of paragraphs) {
      if (p.length < 20) continue;

      if (p.length > 1000) {
        const subChunks = p.match(/.{1,1000}/g) || [];
        subChunks.forEach((sub) => {
          chunks.push({ text: `Source: ${source}\n\n${sub}`, source, category });
        });
      } else {
        chunks.push({ text: `Source: ${source}\n\n${p}`, source, category });
      }
    }
    return chunks;
  }

  private getFileExtension(filePath: string): string {
    const ext = path.extname(filePath).substring(1);
    if (ext === 'ts' || ext === 'tsx') return 'typescript';
    if (ext === 'js' || ext === 'jsx') return 'javascript';
    return ext;
  }

  public async ensureIndexed(options?: { force?: boolean }) {
    const force = !!options?.force;
    await this.init();

    if (this.table && !force) return;

    if (this.indexingPromise) {
      await this.indexingPromise;
      return;
    }

    this.indexingPromise = (async () => {
      if (force) {
        await this.clear();
      }

      await this.init();
      if (this.table) return;

      const projectRoot = await this.resolveProjectRoot();
      const chunks = await this.buildDocChunks(projectRoot);

      if (chunks.length === 0) {
        console.warn('[VectorStoreService] No document chunks found. Skip indexing.');
        return;
      }

      console.log(`[VectorStoreService] Indexing ${chunks.length} chunks...`);
      await this.addDocuments(chunks);
      console.log('[VectorStoreService] Indexing completed.');
    })().finally(() => {
      this.indexingPromise = null;
    });

    await this.indexingPromise;
  }

  public async addDocuments(documents: { text: string; source: string; category: string }[]) {
    await this.init();
    const embeddingService = EmbeddingService.getInstance();

    console.log(`[VectorStoreService] Processing ${documents.length} documents...`);

    const records: DocumentRecord[] = [];

    for (const doc of documents) {
      try {
        const vector = await embeddingService.getEmbedding(doc.text);
        records.push({
          id: `${doc.source}-${Math.random().toString(36).substr(2, 9)}`,
          text: doc.text,
          vector,
          source: doc.source,
          category: doc.category,
        });
      } catch (error) {
        console.error(`[VectorStoreService] Failed to embed document from ${doc.source}:`, error);
      }
    }

    if (records.length === 0) return;

    if (!this.table) {
      this.table = await this.db!.createTable(VectorStoreService.TABLE_NAME, records);
    } else {
      await this.table.add(records);
    }

    console.log(`[VectorStoreService] Added ${records.length} records to vector store.`);
  }

  public async search(query: string, limit: number = 3): Promise<DocumentRecord[]> {
    await this.init();

    if (!this.table) {
      console.warn('[VectorStoreService] Table does not exist. Returning empty results.');
      return [];
    }

    const embeddingService = EmbeddingService.getInstance();
    const queryVector = await embeddingService.getEmbedding(query);

    const results = await this.table.vectorSearch(queryVector).limit(limit).toArray();
    return results as DocumentRecord[];
  }

  public async clear() {
    await this.init();
    if (this.table) {
      try {
        await this.db!.dropTable(VectorStoreService.TABLE_NAME);
        this.table = null;
        console.log('[VectorStoreService] Table dropped.');
      } catch (e) {
        console.warn('[VectorStoreService] Failed to drop table:', e);
      }
    }
  }
}
