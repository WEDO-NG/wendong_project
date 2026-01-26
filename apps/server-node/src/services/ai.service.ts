import OpenAI from 'openai';
import prisma from '../infra/db';
import { HomeService } from './home.service';

// 初始化 OpenAI Client (复用 DeepSeek 配置)
const client = new OpenAI({
  apiKey: process.env.AI_API_KEY,
  baseURL: process.env.AI_BASE_URL,
});

const MODEL_NAME = process.env.AI_MODEL_NAME || 'deepseek-chat';

export class AIService {
  /**
   * 创建或获取会话
   */
  static async getOrCreateSession(uuid?: string) {
    if (uuid) {
      const session = await prisma.chatSession.findUnique({
        where: { uuid },
        include: { messages: true },
      });
      if (session) return session;
    }

    // 创建新会话
    return await prisma.chatSession.create({
      data: {
        title: 'New Conversation',
      },
      include: { messages: true },
    });
  }

  /**
   * 构建上下文 (Simple RAG)
   * 根据用户输入关键词，动态注入相关业务数据
   */
  private static async buildSystemContext(userMessage: string): Promise<string> {
    let contextData = '';
    const lowerMsg = userMessage.toLowerCase();

    // 策略 1: 如果问到 "新闻" 或 "资讯"，注入最新新闻
    if (lowerMsg.includes('新闻') || lowerMsg.includes('news') || lowerMsg.includes('资讯')) {
      const news = await HomeService.getNews();
      contextData += `\n[Context: Latest News]\n${news
        .map((n) => `- ${n.title} (${n.publishDate}): ${n.summary}`)
        .join('\n')}\n`;
    }

    // 策略 2: 如果问到 "海景" 或 "房"，注入推荐房源
    if (lowerMsg.includes('海景') || lowerMsg.includes('房') || lowerMsg.includes('seascape')) {
      const seascapes = await HomeService.getSeascapes();
      contextData += `\n[Context: Seascape Recommendations]\n${seascapes
        .map((s) => `- ${s.title}: ¥${s.price} (${s.description})`)
        .join('\n')}\n`;
    }

    const basePrompt = `You are a helpful assistant for the "Wendong Project". 
    You can answer questions about the project, news, and seascape recommendations.
    Use the provided context to answer accurately. If the answer is not in the context, use your general knowledge but mention that it's general info.
    Always reply in Chinese unless asked otherwise.`;

    return contextData ? `${basePrompt}\n\nRelevant Context Data:\n${contextData}` : basePrompt;
  }

  /**
   * 发送消息并获取流式响应
   * @param message 用户输入
   * @param sessionUuid 会话ID
   * @param onStream 流式回调
   */
  static async chatStream(
    message: string,
    sessionUuid: string | undefined,
    onStream: (content: string) => void
  ): Promise<{ sessionUuid: string }> {
    // 1. 获取会话上下文
    const session = await this.getOrCreateSession(sessionUuid);

    // 2. 保存用户消息
    await (prisma as any).chatMessage.create({
      data: {
        role: 'user',
        content: message,
        sessionId: session.id,
      },
    });

    // 3. 构建 Prompt (RAG)
    const systemPrompt = await this.buildSystemContext(message);
    const historyMessages = session.messages.map((m: any) => ({
      role: m.role as 'user' | 'assistant' | 'system',
      content: m.content,
    }));

    // 限制历史记录长度，防止 Token 溢出 (取最近 10 条)
    const recentHistory = historyMessages.slice(-10);

    // 4. 调用 LLM
    const stream = await client.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { role: 'system', content: systemPrompt },
        ...recentHistory,
        { role: 'user', content: message },
      ],
      stream: true,
    });

    // 5. 处理流式响应
    let fullResponse = '';
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullResponse += content;
        onStream(content);
      }
    }

    // 6. 保存 AI 响应
    await (prisma as any).chatMessage.create({
      data: {
        role: 'assistant',
        content: fullResponse,
        sessionId: session.id,
      },
    });

    // 7. 更新会话标题 (如果是第一条消息)
    if (session.messages.length === 0) {
      await (prisma as any).chatSession.update({
        where: { id: session.id },
        data: { title: message.slice(0, 20) },
      });
    }

    return { sessionUuid: session.uuid };
  }
}
