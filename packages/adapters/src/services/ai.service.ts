import { HttpUtil } from '../infrastructure/http';
import type { AIChatPayload, ChatMessage } from '@wendong/business-core';

export class AIService {
  /**
   * 获取聊天历史记录
   * @param uuid 会话 UUID
   */
  static async getHistory(uuid: string): Promise<ChatMessage[]> {
    return HttpUtil.get<ChatMessage[]>(`/ai/history?uuid=${uuid}`);
  }

  /**
   * 发起流式聊天请求
   * @param payload 聊天负载 (message, sessionUuid)
   * @param signal AbortSignal 用于取消请求
   * @param endpoint API 端点，默认为 /ai/chat
   */
  static async chatStream(
    payload: AIChatPayload,
    signal?: AbortSignal,
    endpoint: string = '/ai/chat'
  ): Promise<Response> {
    return HttpUtil.stream(endpoint, payload, { signal });
  }

  /**
   * 删除消息
   * @param id 消息ID
   */
  static async deleteMessage(id: number): Promise<void> {
    return HttpUtil.post<void>(`/ai/message/${id}?_method=DELETE`, {});
  }
}
