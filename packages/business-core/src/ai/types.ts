// AI 模块的类型定义

/**
 * 聊天消息角色
 */
export type ChatRole = 'user' | 'assistant' | 'system';

/**
 * 聊天消息结构
 */
export interface ChatMessage {
  id?: number | string;
  role: ChatRole;
  content: string;
  createdAt?: string | Date;
}

/**
 * SSE 响应数据结构
 */
export interface AIChatStreamChunk {
  content?: string; // 增量内容
  error?: string; // 错误信息
  type?: 'meta'; // 元数据类型
  sessionUuid?: string; // 会话 ID
}
