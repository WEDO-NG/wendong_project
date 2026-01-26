/* eslint-disable @typescript-eslint/no-explicit-any */
import { BannerItem, NavItem, NewsItem, SeascapeItem } from '@wendong/business-core/types';
import prisma from '../infra/db';

export class HomeService {
  /**
   * 获取 Banner 列表
   */
  static async getBanners(): Promise<BannerItem[]> {
    const banners = await (prisma as any).banner.findMany({
      where: { isActive: true },
      orderBy: { order: 'desc' },
    });
    return (banners as any[]).map((b) => ({
      id: String(b.id),
      title: b.title,
      imageUrl: b.imageUrl,
      linkUrl: b.linkUrl || '',
    }));
  }

  /**
   * 获取导航列表
   */
  static async getNavs(): Promise<NavItem[]> {
    const navs = await (prisma as any).navigation.findMany({
      orderBy: { order: 'desc' },
    });
    return navs.map((n: any) => ({
      id: String(n.id),
      title: n.title,
      iconUrl: `https://cdn-icons-png.flaticon.com/512/2910/${n.icon}`, // 拼接完整 URL
      linkUrl: n.linkUrl,
    }));
  }

  /**
   * 获取海景房推荐
   */
  static async getSeascapes(): Promise<SeascapeItem[]> {
    const seascapes = await prisma.seascape.findMany();
    return seascapes.map((s: any) => ({
      id: String(s.id),
      title: s.title,
      description: s.description || '', // 处理 null
      price: Number(s.price), // Decimal 转 number
      coverUrl: s.imageUrl,
    }));
  }

  /**
   * 获取新闻资讯
   */
  static async getNews(): Promise<NewsItem[]> {
    const news = await prisma.news.findMany({
      orderBy: { publishDate: 'desc' },
      take: 10, // 限制返回 10 条
    });
    return news.map((n: any) => ({
      id: String(n.id),
      title: n.title,
      summary: n.summary || '', // 处理 null
      publishDate: n.publishDate.toISOString().split('T')[0], // 格式化日期 YYYY-MM-DD
      source: n.source || '',
    }));
  }
}
