import React from 'react';
import { BannerItem } from '@wendong/business-core/types';
import { Carousel } from 'antd';

interface BannerSectionProps {
  data: BannerItem[];
  loading?: boolean;
}

const BannerSection: React.FC<BannerSectionProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div
        style={{
          margin: '0 16px 16px',
          height: 160,
          background: '#f0f0f0',
          borderRadius: 8,
        }}
      />
    );
  }

  return (
    <div style={{ padding: '0 16px 16px' }}>
      <Carousel autoplay>
        {data.map((item) => (
          <div key={item.id}>
            <div
              style={{
                height: 160,
                color: '#fff',
                lineHeight: '160px',
                textAlign: 'center',
                background: '#364d79',
                borderRadius: 8,
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: '8px 16px',
                  background: 'rgba(0,0,0,0.3)',
                  textAlign: 'left',
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 500 }}>{item.title}</div>
              </div>
            </div>
          </div>
        ))}
      </Carousel>
    </div>
  );
};

export default BannerSection;
