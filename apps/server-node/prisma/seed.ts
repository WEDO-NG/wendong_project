/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const mockBanners = [
  {
    title: '年度理财报告',
    imageUrl: 'https://picsum.photos/id/20/800/400.webp',
    linkUrl: '/report/2023',
    order: 10,
  },
  {
    title: '春季投资指南',
    imageUrl: 'https://picsum.photos/id/24/800/400.webp',
    linkUrl: '/guide/spring',
    order: 9,
  },
  {
    title: '养老金融新政解读',
    imageUrl: 'https://picsum.photos/id/26/800/400.webp',
    linkUrl: '/news/pension',
    order: 8,
  },
  {
    title: '科技创新基金首发',
    imageUrl: 'https://picsum.photos/id/28/800/400.webp',
    linkUrl: '/fund/tech-new',
    order: 7,
  },
  {
    title: '全球资产配置策略',
    imageUrl: 'https://picsum.photos/id/36/800/400.webp',
    linkUrl: '/strategy/global',
    order: 6,
  },
  {
    title: '新手理财训练营',
    imageUrl: 'https://picsum.photos/id/42/800/400.webp',
    linkUrl: '/education/bootcamp',
    order: 5,
  },
  {
    title: 'ESG 投资白皮书',
    imageUrl: 'https://picsum.photos/id/48/800/400.webp',
    linkUrl: '/report/esg',
    order: 4,
  },
  {
    title: '黄金市场投资机会',
    imageUrl: 'https://picsum.photos/id/56/800/400.webp',
    linkUrl: '/market/gold',
    order: 3,
  },
  {
    title: '量化交易策略分享',
    imageUrl: 'https://picsum.photos/id/60/800/400.webp',
    linkUrl: '/strategy/quant',
    order: 2,
  },
  {
    title: '家庭财富规划沙龙',
    imageUrl: 'https://picsum.photos/id/66/800/400.webp',
    linkUrl: '/event/family-wealth',
    order: 1,
  },
];

const mockNavs = [
  {
    title: '基金排行',
    icon: '2910312.png',
    linkUrl: '/fund/rank',
    order: 10,
  },
  {
    title: '新发基金',
    icon: '2910286.png',
    linkUrl: '/fund/new',
    order: 9,
  },
  {
    title: '稳健理财',
    icon: '2910292.png',
    linkUrl: '/fund/steady',
    order: 8,
  },
  {
    title: '高端理财',
    icon: '2910204.png',
    linkUrl: '/fund/vip',
    order: 7,
  },
  {
    title: '指数投资',
    icon: '2910305.png',
    linkUrl: '/fund/index',
    order: 6,
  },
  {
    title: '定投专区',
    icon: '2910166.png',
    linkUrl: '/fund/sip',
    order: 5,
  },
  {
    title: '现金宝',
    icon: '2910156.png',
    linkUrl: '/fund/cash',
    order: 4,
  },
  {
    title: '理财日历',
    icon: '2910274.png',
    linkUrl: '/tool/calendar',
    order: 3,
  },
  {
    title: '资产诊断',
    icon: '2910332.png',
    linkUrl: '/tool/diagnosis',
    order: 2,
  },
  {
    title: '投资学堂',
    icon: '2910178.png',
    linkUrl: '/education',
    order: 1,
  },
];

const mockSeascapes = [
  {
    title: '科技成长混合',
    imageUrl: 'https://picsum.photos/id/48/400/300.webp',
    description: '聚焦前沿科技，布局未成熟领域',
    price: 1000.0,
    tags: '混合基,高风险',
  },
  {
    title: '消费升级精选',
    imageUrl: 'https://picsum.photos/id/60/400/300.webp',
    description: '捕捉消费复苏机遇，精选龙头企业',
    price: 800.0,
    tags: '股票型,中高风险',
  },
  {
    title: '医疗健康优选',
    imageUrl: 'https://picsum.photos/id/76/400/300.webp',
    description: '关注人口老龄化趋势，布局医疗赛道',
    price: 1200.0,
    tags: '行业主题,长期投资',
  },
  {
    title: '新能源产业',
    imageUrl: 'https://picsum.photos/id/88/400/300.webp',
    description: '碳中和背景下的绿色能源投资机会',
    price: 1500.0,
    tags: '热门赛道,波动大',
  },
  {
    title: '高端制造动力',
    imageUrl: 'https://picsum.photos/id/96/400/300.webp',
    description: '助力中国制造2025，投资硬核科技',
    price: 950.0,
    tags: '政策支持,成长性强',
  },
  {
    title: '红利低波策略',
    imageUrl: 'https://picsum.photos/id/106/400/300.webp',
    description: '防御性投资首选，追求稳健收益',
    price: 500.0,
    tags: '稳健,分红',
  },
  {
    title: '沪深300增强',
    imageUrl: 'https://picsum.photos/id/116/400/300.webp',
    description: '紧跟核心指数，力争超额收益',
    price: 600.0,
    tags: '指数增强,宽基',
  },
  {
    title: '港股通精选',
    imageUrl: 'https://picsum.photos/id/126/400/300.webp',
    description: '挖掘低估值港股，分享互联互通红利',
    price: 1100.0,
    tags: 'QDII,港股',
  },
  {
    title: '债券增强收益',
    imageUrl: 'https://picsum.photos/id/136/400/300.webp',
    description: '债券打底，转债增强，攻守兼备',
    price: 300.0,
    tags: '债券型,低风险',
  },
  {
    title: '货币市场基金',
    imageUrl: 'https://picsum.photos/id/146/400/300.webp',
    description: '闲钱理财好帮手，灵活存取',
    price: 100.0,
    tags: '货币型,零钱通',
  },
];

const mockNews = [
  {
    title: '市场周报：A股震荡上行，科技板块领涨',
    summary: '本周A股市场整体呈现震荡上行态势，其中人工智能、半导体等科技板块表现亮眼...',
    publishDate: new Date('2023-12-24'),
    source: '金融时报',
  },
  {
    title: '央行降准0.25个百分点，释放长期资金',
    summary: '中国人民银行决定下调金融机构存款准备金率0.25个百分点，预计释放长期资金约5000亿元...',
    publishDate: new Date('2023-12-23'),
    source: '央行官网',
  },
  {
    title: '美联储暗示明年可能降息3次',
    summary: '美联储在最新的议息会议上维持利率不变，点阵图显示多数官员预计2024年将有至少3次降息...',
    publishDate: new Date('2023-12-22'),
    source: '华尔街日报',
  },
  {
    title: '新能源汽车销量创新高，渗透率突破40%',
    summary: '据乘联会数据，11月新能源乘用车零售销量再创新高，市场渗透率首次突破40%大关...',
    publishDate: new Date('2023-12-21'),
    source: '汽车之家',
  },
  {
    title: '公募基金费率改革第二阶段启动',
    summary: '证监会发布关于高质量建设北京证券交易所的意见，公募基金费率改革进入深水区...',
    publishDate: new Date('2023-12-20'),
    source: '证监会发布',
  },
  {
    title: '黄金价格突破2100美元关口',
    summary: '受地缘政治避险情绪和降息预期影响，国际金价盘中一度突破2100美元/盎司，创历史新高...',
    publishDate: new Date('2023-12-19'),
    source: 'Kitco News',
  },
  {
    title: '北向资金连续3日净流入',
    summary: '随着人民币汇率企稳回升，外资流出压力减缓，北向资金本周连续3个交易日呈现净流入状态...',
    publishDate: new Date('2023-12-18'),
    source: '东方财富网',
  },
  {
    title: '个人养老金制度实施一周年回顾',
    summary: '个人养老金制度启动实施一周年以来，开户人数已超过4000万，产品体系日益丰富...',
    publishDate: new Date('2023-12-17'),
    source: '人力资源社会保障部',
  },
  {
    title: '科技巨头纷纷布局生成式AI应用',
    summary: '随着ChatGPT的爆火，国内外科技巨头加速在生成式AI领域的布局，相关应用加速落地...',
    publishDate: new Date('2023-12-16'),
    source: '36氪',
  },
  {
    title: '房地产市场政策持续优化',
    summary:
      '多地出台房地产优化政策，包括放松限购、降低首付比例等，旨在促进房地产市场平稳健康发展...',
    publishDate: new Date('2023-12-15'),
    source: '房产观察',
  },
];

async function main() {
  console.log('Start seeding ...');

  // 1. Seed Banners
  for (const banner of mockBanners) {
    await prisma.banner.create({ data: banner });
  }

  // 2. Seed Navs
  for (const nav of mockNavs) {
    await prisma.navigation.create({ data: nav });
  }

  // 3. Seed Seascapes
  for (const seascape of mockSeascapes) {
    await prisma.seascape.create({ data: seascape });
  }

  // 4. Seed News
  for (const news of mockNews) {
    await prisma.news.create({ data: news });
  }

  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
