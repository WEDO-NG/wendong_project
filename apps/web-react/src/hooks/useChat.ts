import { useState, useRef, useCallback, useEffect } from 'react';
import { AIChatStreamChunk, ChatMessage, AIChatPayload } from '@wendong/business-core';
import { AIService } from '@wendong/adapters';
import { message as antdMessage } from 'antd';

interface UseChatOptions {
  apiEndpoint?: string;
  initialSessionUuid?: string;
}

export const useChat = (options: UseChatOptions = {}) => {
  const { apiEndpoint = '/ai/chat' } = options;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [sessionUuid, setSessionUuid] = useState<string | undefined>(options.initialSessionUuid);

  // 1. 初始化时从 localStorage 读取 Session ID
  useEffect(() => {
    if (!options.initialSessionUuid) {
      const cachedUuid = localStorage.getItem('chat_session_uuid');
      if (cachedUuid) {
        setSessionUuid(cachedUuid);
      }
    }
  }, [options.initialSessionUuid]);

  // 2. 当 Session ID 变化时，加载历史记录
  useEffect(() => {
    if (sessionUuid) {
      // 缓存 Session ID
      localStorage.setItem('chat_session_uuid', sessionUuid);

      // 加载历史
      const fetchHistory = async () => {
        try {
          const history = await AIService.getHistory(sessionUuid);
          setMessages(history);
        } catch (error) {
          console.error('Failed to load chat history:', error);
        }
      };

      fetchHistory();
    }
  }, [sessionUuid]);

  // 用于中断请求
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * 发送消息核心逻辑
   * 采用 SSE (Server-Sent Events) 流式获取响应
   *
   * 核心思路：
   * 1. 乐观更新：先在 UI 上显示用户消息和 AI 空消息
   * 2. 发起请求：使用 HttpUtil.stream 发起 POST 请求
   * 3. 流式读取：通过 response.body.getReader() 获取 ReadableStreamDefaultReader
   * 4. 增量解析：手动解析 "data: {...}" 格式的数据，处理粘包问题
   * 5. 实时更新：将解析出的 content 拼接到 AI 消息中
   */
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      // 1. 添加用户消息 (Optimistic UI)
      const userMsg: ChatMessage = {
        id: Date.now(),
        role: 'user',
        content,
        createdAt: new Date(),
      };

      // 2. 预占位 AI 消息 (Loading 状态)
      const assistantMsgId = Date.now() + 1;
      const assistantMsg: ChatMessage = {
        id: assistantMsgId,
        role: 'assistant',
        content: '', // 初始为空，等待流式填充
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setIsStreaming(true);

      // 3. 发起请求
      abortControllerRef.current = new AbortController();

      try {
        const payload: AIChatPayload = { message: content, sessionUuid };

        // 使用封装好的 HttpUtil.stream
        const response = await AIService.chatStream(
          payload,
          abortControllerRef.current.signal,
          apiEndpoint
        );

        if (!response.ok) {
          throw new Error(`Request failed: ${response.statusText}`);
        }

        if (!response.body) return;

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        // 4. 读取流 (ReadableStream)
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;

          // 处理多条 SSE 消息粘包的情况 (以 \n\n 分隔)
          // 场景：网络包可能包含 "data: {A}\n\ndata: {B}"，或者 "data: {C" (不完整)
          const lines = buffer.split('\n\n');
          // 保留最后一个可能不完整的片段，等待下一个 chunk 拼接
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const jsonStr = line.slice(6); // 去掉 'data: '
              if (jsonStr === '[DONE]') continue;

              try {
                const data: AIChatStreamChunk = JSON.parse(jsonStr);

                if (data.error) {
                  throw new Error(data.error);
                }

                if (data.type === 'meta' && data.sessionUuid) {
                  setSessionUuid(data.sessionUuid);
                  continue;
                }

                if (data.content) {
                  // 实时更新 AI 消息内容
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMsgId
                        ? { ...msg, content: msg.content + data.content }
                        : msg
                    )
                  );
                }
              } catch (e) {
                // 如果是手动抛出的业务错误，直接向上抛出，中断循环
                if ((e as Error).message.startsWith('Daily limit')) {
                  throw e;
                }
                console.warn('Failed to parse SSE chunk:', e);
              }
            }
          }
        }
      } catch (error) {
        if ((error as Error).name === 'AbortError') {
          console.log('Chat aborted by user');
        } else {
          console.error('Chat error:', error);

          // 1. 弹出错误提示
          const errorMessage = (error as Error).message || '请求失败，请重试';
          antdMessage.error(errorMessage);

          // 2. 移除那个“加载中”的空消息 (回滚 Optimistic UI)
          setMessages((prev) => prev.filter((msg) => msg.id !== assistantMsgId));
        }
      } finally {
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    [apiEndpoint, sessionUuid]
  );

  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  /**
   * 删除消息
   */
  const deleteMessage = useCallback(async (id: number) => {
    try {
      // 1. 乐观更新
      // 查找要删除的消息
      setMessages((prev) => {
        const msgIndex = prev.findIndex((m) => m.id === id);
        if (msgIndex === -1) return prev;

        const msg = prev[msgIndex];
        const newMessages = [...prev];

        // 标记删除当前消息
        newMessages.splice(msgIndex, 1);

        // 如果是用户消息，且下一条是 AI 回复，也一并删除
        if (msg.role === 'user') {
          // 注意：splice 后，msgIndex 指向了原先的下一条
          if (msgIndex < newMessages.length && newMessages[msgIndex].role === 'assistant') {
            newMessages.splice(msgIndex, 1);
          }
        }

        return newMessages;
      });
      // 2. 调用 API
      await AIService.deleteMessage(id);
    } catch (error) {
      console.error('Failed to delete message:', error);
      // 恢复? 暂时不处理，用户可以刷新
    }
  }, []);

  return {
    messages,
    isStreaming,
    sendMessage,
    abort,
    deleteMessage,
    sessionUuid,
  };
};
