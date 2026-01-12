import { HttpUtil } from '../utils/http';
import type { BannerItem, HomeData, NavItem, NewsItem, SeascapeItem } from './types';

export class HomeService {
  /**
   * 获取首页聚合数据
   * 现在的职责：调用 API，不负责生产数据
   * 策略：并行请求各模块数据
   */
  static async getHomeDashboard(): Promise<HomeData> {
    const [banners, navs, seascapes, news] = await Promise.all([
      this.getBanners(),
      this.getNavs(),
      this.getSeascapes(),
      this.getNews(),
    ]);

    return {
      banners,
      navs,
      seascapes,
      news,
    };
  }

  /**
   * 获取 Banner 列表
   */
  static async getBanners(): Promise<BannerItem[]> {
    return HttpUtil.get<BannerItem[]>('/home/banners');
  }

  /**
   * 获取导航列表
   */
  static async getNavs(): Promise<NavItem[]> {
    return HttpUtil.get<NavItem[]>('/home/navs');
  }

  /**
   * 获取海景房推荐
   */
  static async getSeascapes(): Promise<SeascapeItem[]> {
    return HttpUtil.get<SeascapeItem[]>('/home/seascapes');
  }

  /**
   * 获取新闻资讯
   */
  static async getNews(): Promise<NewsItem[]> {
    return HttpUtil.get<NewsItem[]>('/home/news');
  }
}
