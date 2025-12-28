import { HomeData } from '@wendong/business-core/types';
import { mockBanners, mockNavs, mockNews, mockSeascapes } from './mock.data';

export class HomeService {
  /**
   * 获取首页仪表盘数据
   * 目前返回 server 端本地 mock 数据
   * 未来替换为 DB/Redis 查询
   */
  static async getDashboard(): Promise<HomeData> {
    return {
      banners: mockBanners,
      navs: mockNavs,
      seascapes: mockSeascapes,
      news: mockNews,
    };
  }
}
