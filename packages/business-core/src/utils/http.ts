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
      const response = await fetch(`${getBaseUrl()}${url}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      return HttpUtil.handleResponse<T>(response);
    } catch (error) {
      console.error('HttpUtil POST Request Error:', error);
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
}
