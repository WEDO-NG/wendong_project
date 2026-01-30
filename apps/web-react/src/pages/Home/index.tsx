import React, { useEffect, useState, Suspense } from 'react';
import { Skeleton } from 'antd';
import type { HomeData } from '@wendong/business-core';
import { HomeService } from '@wendong/adapters';

import SeascapeSection from './components/SeascapeSection';
import NavSection from './components/NavSection';
import BannerSection from './components/BannerSection';
import NewsSection from './components/NewsSection';

// 性能优化：组件级懒加载 (Code Splitting)
// 将非首屏的瀑布流组件拆分为独立的 Chunk，减少首屏 JS 体积
const WaterfallSection = React.lazy(() => import('./components/WaterfallSection'));

const HomePage: React.FC = () => {
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  // 性能优化：延迟渲染非关键组件，减少首屏主线程阻塞
  const [showLowPriority, setShowLowPriority] = useState(false);

  const fetchData = async () => {
    try {
      const res = await HomeService.getHomeDashboard();
      setData(res);
      setLoading(false);
      console.log('HomePage data:', data);
      // 核心优化：让 Banner (LCP) 先渲染，100ms 后再渲染导航、新闻等
      // 这能有效打断 Long Task，降低 Total Blocking Time
      setTimeout(() => setShowLowPriority(true), 100);
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
      {/* 1. 海景图 */}
      {loading ? (
        <div style={{ padding: 16 }}>
          {/* 使用骨架屏模拟真实组件高度，防止高度塌陷 */}
          <Skeleton.Image active style={{ width: '100%', height: 240 }} />
        </div>
      ) : (
        <SeascapeSection data={data?.seascapes || []} loading={loading} />
      )}

      {/* 2. 导航栏 */}
      {/* 性能优化：降低非 LCP 区域优先级，减少首屏 DOM 节点 */}
      {!loading && showLowPriority && <NavSection data={data?.navs || []} loading={loading} />}

      {/* 3. 轮播图 (LCP 候选区域) */}
      {loading ? (
        <div style={{ padding: '0 16px' }}>
          <Skeleton.Button active block style={{ height: 160, borderRadius: 8 }} />
        </div>
      ) : (
        <BannerSection data={data?.banners || []} loading={loading} />
      )}

      {/* 4. 资讯 */}
      {!loading && showLowPriority && <NewsSection data={data?.news || []} loading={loading} />}

      {/* 5. 瀑布流 (追加组件，本地资源) */}
      {/* 性能优化：仅当首屏数据加载完成且低优先级任务允许时才渲染 */}
      {!loading && showLowPriority && (
        <Suspense fallback={null}>
          <WaterfallSection />
        </Suspense>
      )}
    </div>
  );
};

export default HomePage;
