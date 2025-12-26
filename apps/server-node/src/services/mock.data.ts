import { BannerItem, NavItem, NewsItem, SeascapeItem } from '@wendong/business-core/types';

export const mockBanners: BannerItem[] = [
  {
    id: '1',
    title: '年度理财报告',
    imageUrl:
      'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=1000',
    linkUrl: '/report/2023',
  },
  {
    id: '2',
    title: '春季投资指南',
    imageUrl:
      'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=1000',
    linkUrl: '/guide/spring',
  },
];

export const mockNavs: NavItem[] = [
  {
    id: '1',
    title: '基金排行',
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2910/2910312.png',
    linkUrl: '/fund/rank',
  },
  {
    id: '2',
    title: '新发基金',
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2910/2910286.png',
    linkUrl: '/fund/new',
  },
  {
    id: '3',
    title: '稳健理财',
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2910/2910292.png',
    linkUrl: '/fund/steady',
  },
  {
    id: '4',
    title: '高端理财',
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2910/2910204.png',
    linkUrl: '/fund/vip',
  },
];

export const mockSeascapes: SeascapeItem[] = [
  {
    id: '1',
    title: '科技成长混合',
    coverUrl: 'https://picsum.photos/id/48/400/300',
    description: '聚焦前沿科技，布局未成熟领域',
  },
];

export const mockNews: NewsItem[] = [
  {
    id: '1',
    title: '市场周报：A股震荡上行，科技板块领涨',
    summary: '本周A股市场整体呈现震荡上行态势，其中人工智能、半导体等科技板块表现亮眼...',
    publishDate: '2023-12-24',
    source: '金融时报',
  },
];
