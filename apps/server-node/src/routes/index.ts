import { Router } from 'express';
import aiRoutes from './ai.routes';
import homeRoutes from './home.routes';

const router = Router();

// 路由只负责定义路径和方法，将请求分发给 Controller
router.get('/', (req, res) => {
  res.send('Welcome to server-node API');
});

// AI 模块路由
router.use('/ai', aiRoutes);

// Home 模块路由
router.use('/home', homeRoutes);

export default router;
