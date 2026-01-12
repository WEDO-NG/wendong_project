export interface BannerItem {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
}

export interface NavItem {
  id: string;
  title: string;
  iconUrl: string;
  linkUrl: string;
}

export interface SeascapeItem {
  id: string;
  title: string;
  coverUrl: string;
  description?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  publishDate: string;
  source: string;
}

export interface HomeData {
  banners: BannerItem[];
  navs: NavItem[];
  seascapes: SeascapeItem[];
  news: NewsItem[];
}
