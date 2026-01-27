import { Router } from 'express';
import { AIController } from '../controllers/ai.controller';

const router = Router();

router.post('/chat', AIController.chat);
router.get('/history', AIController.getHistory);
router.delete('/message/:id', AIController.deleteMessage);

export default router;
