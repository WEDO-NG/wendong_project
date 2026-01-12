import { Router } from 'express';
import { HomeController } from '../controllers/home.controller';

const router = Router();

// 路由只负责定义路径和方法，将请求分发给 Controller
router.get('/', (req, res) => {
  res.send('Welcome to server-node API');
});

// 模块化接口
router.get('/home/banners', HomeController.getBanners);
router.get('/home/navs', HomeController.getNavs);
router.get('/home/seascapes', HomeController.getSeascapes);
router.get('/home/news', HomeController.getNews);

export default router;
