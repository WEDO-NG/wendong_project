import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';

export class DocumentLoader {
  // 定义文档根目录 (相对于 server-node 运行时，即项目根目录)
  // 注意：在 Monorepo 中，server-node 运行在 apps/server-node，但我们需要读取根目录的 doc
  // 假设 server-node 启动时 cwd 是项目根目录 (通过 pnpm --filter server-node dev)
  // 或者我们需要向上查找
  private static PROJECT_ROOT: string | null = null;
  private static DOCS_CACHE: { value: string; loadedAt: number } | null = null;
  private static CACHE_TTL_MS = 5 * 60 * 1000;

  private static async resolveProjectRoot(): Promise<string> {
    if (this.PROJECT_ROOT) return this.PROJECT_ROOT;

    const candidates = [
      process.env.PROJECT_ROOT,
      process.cwd(),
      path.resolve(__dirname, '../../../../'),
      path.resolve(__dirname, '../../../'),
    ].filter(Boolean) as string[];

    for (const candidate of candidates) {
      try {
        const readmePath = path.join(candidate, 'README.md');
        const docsPath = path.join(candidate, 'doc');
        await fs.access(readmePath);
        await fs.access(docsPath);
        this.PROJECT_ROOT = candidate;
        return candidate;
      } catch {
        continue;
      }
    }

    this.PROJECT_ROOT = candidates[0] || path.resolve(__dirname, '../../../../');
    return this.PROJECT_ROOT;
  }

  /**
   * 加载所有项目文档
   */
  static async loadProjectDocs(): Promise<string> {
    if (this.DOCS_CACHE && Date.now() - this.DOCS_CACHE.loadedAt < this.CACHE_TTL_MS) {
      return this.DOCS_CACHE.value;
    }

    try {
      const projectRoot = await this.resolveProjectRoot();
      const docsPath = path.join(projectRoot, 'doc');
      const readmePath = path.join(projectRoot, 'README.md');

      // 1. 读取 README.md
      const readmeContent = await this.readFile(readmePath);

      // 2. 读取 doc 目录下所有 .md 文件
      const docFiles = await glob('**/*.md', { cwd: docsPath });
      const docContents = await Promise.all(
        docFiles.map(async (file) => {
          const content = await this.readFile(path.join(docsPath, file));
          return `\n\n### Document: doc/${file}\n${content}`;
        })
      );

      // 3. 读取核心代码目录结构 (Tree)
      const codeStructure = await this.getProjectStructure(projectRoot);

      // 4. 拼接总上下文
      const value = `
# Project README
${readmeContent}

# Project Structure (Core Directories)
${codeStructure}

# Project Documents
${docContents.join('\n')}
      `;
      this.DOCS_CACHE = { value, loadedAt: Date.now() };
      return value;
    } catch (error) {
      console.error('Failed to load documents:', error);
      return ''; // 降级处理
    }
  }

  /**
   * 生成核心代码目录树
   */
  private static async getProjectStructure(projectRoot: string): Promise<string> {
    try {
      // 仅关注核心代码目录，排除 node_modules, dist, .git 等
      const patterns = [
        'apps/web-react/src/**/*.{ts,tsx}',
        'apps/server-node/src/**/*.ts',
        'packages/*/src/**/*.ts',
      ];

      const files = await glob(patterns, {
        cwd: projectRoot,
        ignore: ['**/node_modules/**', '**/dist/**', '**/*.test.ts', '**/*.spec.ts'],
      });

      // 转换为树状结构字符串 (简化版：直接列出文件路径)
      // 如果文件太多，可以只列出前 200 个或只列出目录结构
      // 这里为了节省 Token，我们只列出文件路径清单，不读取内容
      return files
        .slice(0, 300)
        .map((f) => `- ${f}`)
        .join('\n');
    } catch (error) {
      console.warn('Failed to load project structure:', error);
      return '';
    }
  }

  private static async readFile(filePath: string): Promise<string> {
    try {
      return await fs.readFile(filePath, 'utf-8');
    } catch (error) {
      console.warn(`File not found or unreadable: ${filePath}， ${error}`);
      return '';
    }
  }
}
