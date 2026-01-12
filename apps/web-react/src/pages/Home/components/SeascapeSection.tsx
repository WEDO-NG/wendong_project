import React from 'react';
import { SeascapeItem } from '@wendong/business-core/types';
import { Card } from 'antd';

interface SeascapeSectionProps {
  data: SeascapeItem[];
  loading?: boolean;
}

const SeascapeSection: React.FC<SeascapeSectionProps> = ({ data, loading }) => {
  return (
    <div style={{ marginBottom: 24, marginTop: 24, padding: 12 }}>
      <div
        style={{
          display: 'flex',
          overflowX: 'auto',
          gap: 12,
          scrollbarWidth: 'none', // Firefox
          justifyContent: 'center',
        }}
      >
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} loading style={{ minWidth: 200, flexShrink: 0 }} />
            ))
          : data.map((item) => (
              <div
                key={item.id}
                style={{
                  minWidth: 200,
                  flexShrink: 0,
                  overflow: 'hidden',
                  background: '#fff',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                }}
              >
                <img
                  src={item.coverUrl}
                  alt={item.title}
                  style={{ width: '100%', height: 120, objectFit: 'cover' }}
                  loading="lazy"
                />
              </div>
            ))}
      </div>
    </div>
  );
};

export default SeascapeSection;
