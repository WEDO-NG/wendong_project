import dayjs from 'dayjs';

interface ResponseData<T> {
  code: number;
  message: string;
  data: T;
  timestamp: string;
}

export class ResponseUtil {
  static success<T>(data: T, message = 'Success'): ResponseData<T> {
    return {
      code: 0,
      message,
      data,
      timestamp: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    };
  }

  static error(message = 'Internal Server Error', code = 500): ResponseData<null> {
    return {
      code,
      message,
      data: null,
      timestamp: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    };
  }
}
