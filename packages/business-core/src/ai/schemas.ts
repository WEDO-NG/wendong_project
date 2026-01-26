import { z } from 'zod';

/**
 * AI Chat 接口请求校验 Schema
 * 这是一个业务规则 (Business Rule)，所以放在 business-core 中
 */
export const AIChatSchema = z.object({
  message: z.string({ required_error: 'Message is required' } as any).min(1, 'Message cannot be empty'),
  sessionUuid: z.string().optional(),
});

// 导出类型，方便前端使用
export type AIChatPayload = z.infer<typeof AIChatSchema>;
