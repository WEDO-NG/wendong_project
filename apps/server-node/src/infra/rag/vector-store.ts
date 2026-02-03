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

    await fs.mkdir(VectorStoreService.DB_PATH, { recursive: true });

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
    const docsPath = path.join(projectRoot, 'doc');
    const readmePath = path.join(projectRoot, 'README.md');

    const docFiles = await glob('**/*.md', { cwd: docsPath });
    const files: { filePath: string; source: string; category: string }[] = [
      ...docFiles.map((f) => ({
        filePath: path.join(docsPath, f),
        source: `doc/${f}`,
        category: 'doc',
      })),
      { filePath: readmePath, source: 'README.md', category: 'readme' },
    ];

    const chunks: { text: string; source: string; category: string }[] = [];

    for (const file of files) {
      try {
        const content = await fs.readFile(file.filePath, 'utf-8');
        const paragraphs = content.split('\n\n').filter((p) => p.trim().length > 0);

        for (const p of paragraphs) {
          if (p.length < 20) continue;

          if (p.length > 800) {
            const subChunks = p.match(/.{1,800}/g) || [];
            subChunks.forEach((sub) => {
              chunks.push({ text: sub, source: file.source, category: file.category });
            });
          } else {
            chunks.push({ text: p, source: file.source, category: file.category });
          }
        }
      } catch (e) {
        console.warn(`[VectorStoreService] Failed to read ${file.filePath}:`, e);
      }
    }

    return chunks;
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
