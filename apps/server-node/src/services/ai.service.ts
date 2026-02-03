/* eslint-disable @typescript-eslint/no-explicit-any */
import OpenAI from 'openai';
import prisma from '../infra/db';
import { PromptManager } from '../utils/prompt-manager';

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
   * 发送消息并获取流式响应
   * 当前默认版本：Vector Search RAG
   * - System Prompt 使用“向量检索 TopK 文档片段”构建，减少 Token、提升相关性
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

    const systemPrompt = await PromptManager.buildSystemPrompt(message);

    const historyMessages = session.messages.map((m: any) => ({
      role: m.role as 'user' | 'assistant' | 'system',
      content: m.content,
    }));

    // 限制历史记录长度，防止 Token 溢出 (取最近 10 条)
    const recentHistory = historyMessages.slice(-10);

    // 4. 检查每日限制 (100 次)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const count = await (prisma as any).chatMessage.count({
      where: {
        sessionId: session.id,
        role: 'user',
        createdAt: { gte: today },
      },
    });

    if (count >= 100) {
      throw new Error('请求次数已达上限 ');
    }

    // 5. 调用 LLM
    const stream = await client.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { role: 'system', content: systemPrompt },
        ...recentHistory,
        { role: 'user', content: message },
      ],
      stream: true,
    });

    // 6. 处理流式响应
    let fullResponse = '';
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullResponse += content;
        onStream(content);
      }
    }

    // 7. 保存 AI 响应
    await (prisma as any).chatMessage.create({
      data: {
        role: 'assistant',
        content: fullResponse,
        sessionId: session.id,
      },
    });

    // 8. 更新会话标题 (如果是第一条消息)
    if (session.messages.length === 0) {
      await (prisma as any).chatSession.update({
        where: { id: session.id },
        data: { title: message.slice(0, 20) },
      });
    }

    return { sessionUuid: session.uuid };
  }

  /**
   * 获取会话历史记录
   */
  static async getHistory(uuid: string) {
    const session = await (prisma as any).chatSession.findUnique({
      where: { uuid },
      include: {
        messages: {
          where: { isDeleted: false },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!session) return [];

    return session.messages.map((m: any) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      createdAt: m.createdAt,
    }));
  }

  /**
   * 删除消息 (软删除)
   * 如果是用户消息，需要连带删除 AI 的回复（假设 AI 回复紧跟在用户消息之后）
   */
  static async deleteMessage(id: number) {
    // 1. 查找当前消息
    const message = await (prisma as any).chatMessage.findUnique({
      where: { id },
    });

    if (!message) return;

    // 2. 软删除当前消息
    await (prisma as any).chatMessage.update({
      where: { id },
      data: { isDeleted: true },
    });

    // 3. 如果是用户消息，尝试删除紧随其后的 AI 回复
    if (message.role === 'user') {
      const nextMessage = await (prisma as any).chatMessage.findFirst({
        where: {
          sessionId: message.sessionId,
          id: { gt: message.id }, // ID 大于当前消息
          isDeleted: false,
        },
        orderBy: { id: 'asc' }, // 取第一条
      });

      // 只有当下一条消息是 AI 回复时才删除
      if (nextMessage && nextMessage.role === 'assistant') {
        await (prisma as any).chatMessage.update({
          where: { id: nextMessage.id },
          data: { isDeleted: true },
        });
      }
    }
  }
}
