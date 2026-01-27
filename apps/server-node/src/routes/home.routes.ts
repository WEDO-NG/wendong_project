import { Router } from 'express';
import { HomeController } from '../controllers/home.controller';
import { asyncHandler } from '../utils/error';

const router = Router();

router.get('/banners', asyncHandler(HomeController.getBanners));
router.get('/navs', asyncHandler(HomeController.getNavs));
router.get('/seascapes', asyncHandler(HomeController.getSeascapes));
router.get('/news', asyncHandler(HomeController.getNews));

export default router;
