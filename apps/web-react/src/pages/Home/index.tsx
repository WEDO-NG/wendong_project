import React, { useEffect, useState } from 'react';
import type { HomeData } from '@wendong/business-core/types';
import SeascapeSection from './components/SeascapeSection';
import NavSection from './components/NavSection';
import BannerSection from './components/BannerSection';
import NewsSection from './components/NewsSection';
import WaterfallSection from './components/WaterfallSection';

const HomePage: React.FC = () => {
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        // 使用真实 API 获取数据
        const response = await fetch('http://localhost:3001/api/home');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        // 解析统一响应结构
        const res = await response.json();

        if (!cancelled) {
          // 这里假设 res.code === 0 为成功，取出 res.data
          if (res.code === 0) {
            setData(res.data);
          } else {
            console.error('API Error:', res.message);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('Fetch home data failed:', error);
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
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
