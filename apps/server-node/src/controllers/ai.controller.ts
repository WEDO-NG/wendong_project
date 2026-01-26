import { Request, Response } from 'express';
import { AIService } from '../services/ai.service';
import { asyncHandler } from '../utils/error';

export class AIController {
  /**
   * 流式对话接口
   * POST /api/ai/chat
   * Body: { message: string, sessionUuid?: string }
   */
  static chat = asyncHandler(async (req: Request, res: Response) => {
    const { message, sessionUuid } = req.body;

    // 设置 SSE 响应头
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    try {
      const result = await AIService.chatStream(message, sessionUuid, (content) => {
        // SSE 格式: data: <content>\n\n
        // 使用 JSON 封装以处理换行符等特殊字符
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      });

      // 发送会话 ID (作为最后一条元数据)
      res.write(`data: ${JSON.stringify({ type: 'meta', sessionUuid: result.sessionUuid })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    } catch (error) {
      console.error('AI Chat Error:', error);
      // 如果流还没断开，发送错误信息
      if (!res.writableEnded) {
        res.write(`data: ${JSON.stringify({ error: 'Internal Server Error' })}\n\n`);
        res.end();
      }
    }
  });
}
