/* eslint-disable @typescript-eslint/no-explicit-any */
import { getBaseUrl } from '../config';

export interface HttpResponse<T = any> {
  code: number;
  message: string;
  data: T;
  timestamp: string;
}

export class HttpUtil {
  static async get<T>(url: string): Promise<T> {
    try {
      const response = await fetch(`${getBaseUrl()}${url}`);
      return HttpUtil.handleResponse<T>(response);
    } catch (error) {
      console.error('HttpUtil GET Request Error:', error);
      throw error;
    }
  }

  static async post<T>(url: string, data: any): Promise<T> {
    try {
      // 临时处理 DELETE 方法
      const isDelete = url.includes('_method=DELETE');
      const method = isDelete ? 'DELETE' : 'POST';
      const actualUrl = isDelete ? url.replace('?_method=DELETE', '') : url;

      const response = await fetch(`${getBaseUrl()}${actualUrl}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: isDelete ? undefined : JSON.stringify(data),
      });
      return HttpUtil.handleResponse<T>(response);
    } catch (error) {
      console.error('HttpUtil Request Error:', error);
      throw error;
    }
  }

  private static async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const res: HttpResponse<T> = await response.json();
    if (res.code !== 0) {
      throw new Error(res.message || 'API Error');
    }
    return res.data;
  }

  /**
   * 发起流式请求 (SSE)
   * 返回原始 Response 对象，以便调用方处理 ReadableStream
   */
  static async stream(
    url: string,
    data?: any,
    options?: { signal?: AbortSignal }
  ): Promise<Response> {
    // 组装完整 URL
    const fullUrl = `${getBaseUrl()}${url}`;

    // 使用原生 fetch 以获取 ReadableStream
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 如果有 Token，在这里添加
        // 'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data),
      signal: options?.signal,
    });

    if (!response.ok) {
      throw new Error(`Stream request failed: ${response.status} ${response.statusText}`);
    }

    return response;
  }
}
