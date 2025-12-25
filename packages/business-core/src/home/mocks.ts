import { BannerItem, NavItem, NewsItem, SeascapeItem } from './types';

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
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2910/2910166.png',
    linkUrl: '/fund/stable',
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
    description: '聚焦前沿科技，布局未来赛道',
  },
  {
    id: '2',
    title: '消费升级精选',
    coverUrl: 'https://picsum.photos/id/60/400/300',
    description: '捕捉消费复苏机遇',
  },
];

export const mockNews: NewsItem[] = [
  {
    id: '1',
    title: '市场周报：A股震荡上行，科技板块领涨',
    summary: '本周A股市场整体呈现震荡上行态势，其中人工智能、半导体等科技板块表现亮眼...',
    publishDate: '2023-12-24',
    source: '市场研究部',
  },
  {
    id: '2',
    title: '美联储最新议息会议解读',
    summary: '美联储宣布维持基准利率不变，符合市场预期，暗示加息周期可能接近尾声...',
    publishDate: '2023-12-23',
    source: '宏观策略组',
  },
];
