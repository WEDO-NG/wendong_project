import { Router } from 'express';
import { z } from 'zod';
import { AIChatSchema } from '@wendong/business-core';
import { AIController } from '../controllers/ai.controller';
import { validate } from '../middlewares/validate';

const router = Router();

// 使用 business-core 中定义的业务规则 Schema
const chatSchema = z.object({
  body: AIChatSchema,
});

router.post('/chat', validate(chatSchema), AIController.chat);

export default router;

