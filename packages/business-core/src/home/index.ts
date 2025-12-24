import { mockBanners, mockNavs, mockNews, mockSeascapes } from './mocks';
import { BannerItem, NavItem, NewsItem, SeascapeItem } from './types';

// 模拟异步请求延迟
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class HomeService {
  /**
   * 获取首页 Banner 数据
   */
  static async getBanners(): Promise<BannerItem[]> {
    await delay(300); // 模拟网络延迟
    return mockBanners;
  }

  /**
   * 获取首页导航数据
   */
  static async getNavs(): Promise<NavItem[]> {
    await delay(200);
    return mockNavs;
  }

  /**
   * 获取海景推荐数据
   */
  static async getSeascapes(): Promise<SeascapeItem[]> {
    await delay(400);
    return mockSeascapes;
  }

  /**
   * 获取最新资讯
   */
  static async getNews(): Promise<NewsItem[]> {
    await delay(300);
    return mockNews;
  }

  /**
   * 获取首页所有聚合数据
   */
  static async getHomeDashboard() {
    await delay(500);
    return {
      banners: mockBanners,
      navs: mockNavs,
      seascapes: mockSeascapes,
      news: mockNews,
    };
  }
}

export * from './types';
