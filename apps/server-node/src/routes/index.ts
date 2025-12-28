import { Router } from 'express';
import { HomeController } from '../controllers/home.controller';

const router = Router();

// 路由只负责定义路径和方法，将请求分发给 Controller
router.get('/', (req, res) => {
  res.send('Welcome to server-node API');
});

router.get('/home', HomeController.getHomeData);

export default router;
