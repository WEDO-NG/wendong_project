import path from 'path';

/**
 * 嵌入服务 (单例)
 * 负责加载本地 Embedding 模型并转换文本为向量
 */
export class EmbeddingService {
  private static instance: EmbeddingService;
  private extractor: any = null;

  // 使用轻量级模型，体积小速度快，适合 CPU 运行
  private static MODEL_NAME = 'Xenova/all-MiniLM-L6-v2';

  private constructor() {}

  public static getInstance(): EmbeddingService {
    if (!EmbeddingService.instance) {
      EmbeddingService.instance = new EmbeddingService();
    }
    return EmbeddingService.instance;
  }

  /**
   * 初始化模型
   */
  private async init() {
    if (!this.extractor) {
      console.log(`[EmbeddingService] Loading model ${EmbeddingService.MODEL_NAME}...`);
      // 动态导入 ESM 模块 (使用 eval 绕过 TS 编译转换)
      const transformers = await (eval('import("@xenova/transformers")') as Promise<any>);
      const { pipeline, env } = transformers;
      env.localModelPath = path.resolve(__dirname, '../../..', 'models');
      env.allowRemoteModels = false;
      this.extractor = await pipeline('feature-extraction', EmbeddingService.MODEL_NAME);
      console.log('[EmbeddingService] Model loaded successfully.');
    }
  }

  /**
   * 获取文本向量
   * @param text 输入文本
   * @returns 384维向量数组
   */
  public async getEmbedding(text: string): Promise<number[]> {
    await this.init();

    if (!this.extractor) {
      throw new Error('Embedding model failed to initialize');
    }

    // 清洗文本：去除多余空白
    const cleanText = text.replace(/\n/g, ' ').trim();

    // 生成向量
    // pooling: 'mean' 表示取所有 token 的平均值作为句向量
    // normalize: true 表示归一化，方便计算余弦相似度
    const output = await this.extractor(cleanText, { pooling: 'mean', normalize: true });

    // output.data 是一个 Float32Array，我们需要转换为普通数组
    return Array.from(output.data);
  }
}
