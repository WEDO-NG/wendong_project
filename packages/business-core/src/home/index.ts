import { HttpUtil } from '../utils/http';
import type { HomeData } from './types';

export class HomeService {
  /**
   * 获取首页聚合数据
   * 现在的职责：调用 API，不负责生产数据
   */
  static async getHomeDashboard(): Promise<HomeData> {
    return HttpUtil.get<HomeData>('/home');
  }
}
