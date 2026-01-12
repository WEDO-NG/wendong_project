export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  timestamp: string;
}

export class ResponseUtil {
  static success<T>(data: T, message: string = 'Success'): ApiResponse<T> {
    return {
      code: 0,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  static error(message: string = 'Internal Server Error', code: number = 500): ApiResponse<null> {
    return {
      code,
      message,
      data: null,
      timestamp: new Date().toISOString(),
    };
  }
}
