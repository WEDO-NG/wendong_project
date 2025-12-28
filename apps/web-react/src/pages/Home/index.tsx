import React, { useEffect, useState } from 'react';
import type { HomeData } from '@wendong/business-core/types';
import { HomeService } from '@wendong/business-core';

import SeascapeSection from './components/SeascapeSection';
import NavSection from './components/NavSection';
import BannerSection from './components/BannerSection';
import NewsSection from './components/NewsSection';
import WaterfallSection from './components/WaterfallSection';

const HomePage: React.FC = () => {
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await HomeService.getHomeDashboard();
      setData(res);
      setLoading(false);
    } catch (error) {
      console.error('Fetch home data failed:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div style={{ paddingBottom: 60, background: '#fff', minHeight: '100vh' }}>
      {/* 1. 海景图  */}
      <SeascapeSection data={data?.seascapes || []} loading={loading} />

      {/* 2. 导航栏 */}
      <NavSection data={data?.navs || []} loading={loading} />

      {/* 3. 轮播图 */}
      <BannerSection data={data?.banners || []} loading={loading} />

      {/* 4. 资讯 */}
      <NewsSection data={data?.news || []} loading={loading} />

      {/* 5. 瀑布流 (追加组件，本地资源) */}
      <WaterfallSection />
    </div>
  );
};

export default HomePage;
