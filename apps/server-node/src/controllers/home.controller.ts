import { Request, Response } from 'express';
import { HomeService } from '../services/home.service';
import { ResponseUtil } from '../utils/response';

export class HomeController {
  /**
   * 获取 Banners
   */
  static async getBanners(req: Request, res: Response) {
    try {
      const data = await HomeService.getBanners();
      res.json(ResponseUtil.success(data));
    } catch (error) {
      console.error('getBanners error:', error);
    }
  }

  /**
   * 获取 Navs
   */
  static async getNavs(req: Request, res: Response) {
    try {
      const data = await HomeService.getNavs();
      res.json(ResponseUtil.success(data));
    } catch (error) {
      console.error('getNavs error:', error);
    }
  }

  /**
   * 获取 Seascapes
   */
  static async getSeascapes(req: Request, res: Response) {
    try {
      const data = await HomeService.getSeascapes();
      res.json(ResponseUtil.success(data));
    } catch (error) {
      console.error('getSeascapes error:', error);
    }
  }

  /**
   * 获取 News
   */
  static async getNews(req: Request, res: Response) {
    try {
      const data = await HomeService.getNews();
      res.json(ResponseUtil.success(data));
    } catch (error) {
      console.error('getNews error:', error);
    }
  }
}
