import { Router } from 'express';
import { HomeController } from '../controllers/home.controller';
import { asyncHandler } from '../utils/error';
import aiRoutes from './ai.routes';

const router = Router();

// 路由只负责定义路径和方法，将请求分发给 Controller
router.get('/', (req, res) => {
  res.send('Welcome to server-node API');
});

// AI 模块路由
router.use('/ai', aiRoutes);

// 模块化接口 (使用 asyncHandler 包裹)
router.get('/home/banners', asyncHandler(HomeController.getBanners));
router.get('/home/navs', asyncHandler(HomeController.getNavs));
router.get('/home/seascapes', asyncHandler(HomeController.getSeascapes));
router.get('/home/news', asyncHandler(HomeController.getNews));

export default router;
