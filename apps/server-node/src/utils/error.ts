import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ResponseUtil } from './response';

/**
 * 异步函数包装器，用于捕获异步路由中的错误
 * 避免在每个 Controller 方法中重复写 try-catch
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 全局错误处理中间件
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[Global Error]:', err);

  // 默认错误信息
  let message = '服务器内部错误';
  let statusCode = 500;

  // 根据错误类型定制响应 (可扩展)
  if (err instanceof ZodError) {
    // Zod 校验错误
    const messages = err.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
    message = `Validation Error: ${messages}`;
    statusCode = 400;
  } else if (err.code === 'P2002') {
    // Prisma 唯一性约束冲突
    message = '数据已存在，请勿重复创建';
    statusCode = 409;
  } else if (err.code === 'P2025') {
    // Prisma 记录未找到
    message = '请求的资源不存在';
    statusCode = 404;
  } else if (err instanceof Error) {
    // 普通 Error 对象
    message = err.message;
  }

  // 统一返回 JSON 格式
  res.status(statusCode).json(ResponseUtil.error(message, statusCode));
};
