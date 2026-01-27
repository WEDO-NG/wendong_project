import { Request, Response } from 'express';
import { AIChatSchema } from '@wendong/business-core';
import { AIService } from '../services/ai.service';
import { asyncHandler } from '../utils/error';
import { ResponseUtil } from '../utils/response';

export class AIController {
  /**
   * 获取会话历史
   * GET /api/ai/history?uuid=xxx
   */
  static getHistory = asyncHandler(async (req: Request, res: Response) => {
    const { uuid } = req.query;
    if (!uuid || typeof uuid !== 'string') {
      res.status(400).json(ResponseUtil.error('UUID is required'));
      return;
    }

    const messages = await AIService.getHistory(uuid);
    res.json(ResponseUtil.success(messages));
  });

  /**
   * 流式对话接口
   * POST /api/ai/chat
   * Body: { message: string, sessionUuid?: string }
   */
  static chat = asyncHandler(async (req: Request, res: Response) => {
    // 显式校验参数 (Controller Layer Validation)
    // 如果校验失败，Zod 会抛出异常，被 globalErrorHandler 捕获
    const { message, sessionUuid } = AIChatSchema.parse(req.body);

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
        const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
        res.write(`data: ${JSON.stringify({ error: errorMessage })}\n\n`);
        res.end();
      }
    }
  });

  /**
   * 删除消息
   * DELETE /api/ai/message/:id
   */
  static deleteMessage = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
      res.status(400).json(ResponseUtil.error('Message ID is required'));
      return;
    }

    await AIService.deleteMessage(Number(id));
    res.json(ResponseUtil.success(null));
  });
}
