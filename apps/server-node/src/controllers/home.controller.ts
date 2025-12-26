import { Request, Response } from 'express';
import { HomeService } from '../services/home.service';
import { ResponseUtil } from '../utils/response';

export class HomeController {
  /**
   * 获取首页数据
   */
  static async getHomeData(req: Request, res: Response) {
    try {
      // 1. 参数校验 (如果有参数的话)
      // const { someParam } = req.query;
      // 2. 调用 Service 层
      const data = await HomeService.getDashboard();
      // 3. 统一封装返回结果
      res.json(ResponseUtil.success(data));
    } catch (error) {
      console.error('HomeController error:', error);
      res.status(500).json(ResponseUtil.error('Failed to fetch home data'));
    }
  }
}
