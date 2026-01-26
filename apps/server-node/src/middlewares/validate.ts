import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

/**
 * Zod 验证中间件
 * @param schema Zod Schema (z.object({...}))
 */
export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 验证 query, body, params
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // 格式化 Zod 错误信息
        const messages = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join('; ');
        res.status(400).json({
          code: 400,
          message: `Validation Error: ${messages}`,
        });
      } else {
        res.status(500).json({
          code: 500,
          message: 'Internal Server Error',
        });
      }
    }
  };
};
