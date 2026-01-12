import { BannerItem, NavItem, NewsItem, SeascapeItem } from '@wendong/business-core/types';
import { mockBanners, mockNavs, mockNews, mockSeascapes } from './mock.data';

export class HomeService {
  /**
   * 获取 Banner 列表
   */
  static async getBanners(): Promise<BannerItem[]> {
    return mockBanners;
  }

  /**
   * 获取导航列表
   */
  static async getNavs(): Promise<NavItem[]> {
    return mockNavs;
  }

  /**
   * 获取海景房推荐
   */
  static async getSeascapes(): Promise<SeascapeItem[]> {
    return mockSeascapes;
  }

  /**
   * 获取新闻资讯
   */
  static async getNews(): Promise<NewsItem[]> {
    return mockNews;
  }
}
