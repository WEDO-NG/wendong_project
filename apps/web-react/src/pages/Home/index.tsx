import React, { useEffect, useState } from 'react';
import { Card } from 'antd';
import { BannerItem, HomeService } from '@wendong/business-core';
const { getBanners } = HomeService;

/**
 * 首页
 */
const HomePage: React.FC = () => {
  const [banners, setBanners] = useState<BannerItem[]>([]);

  // 获取banner列表
  const getBannerList = async () => {
    const banners = await getBanners();
    console.log('banners', banners);
    setBanners(banners);
  };

  useEffect(() => {
    getBannerList();
  }, []);

  return (
    <div style={{ padding: '16px' }}>
      <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>首页 Banner</h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '16px',
        }}
      >
        {banners.map((banner) => (
          <Card
            key={banner.id}
            hoverable
            cover={
              <img
                alt={banner.title}
                src={banner.imageUrl}
                style={{ height: 160, objectFit: 'cover' }}
              />
            }
            bodyStyle={{ padding: '12px' }}
          >
            <Card.Meta title={banner.title} description="点击查看详情" />
          </Card>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
