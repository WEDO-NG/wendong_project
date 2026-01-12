import React from 'react';
import { NewsItem } from '@wendong/business-core/types';
import { List, Tag } from 'antd';

interface NewsSectionProps {
  data: NewsItem[];
  loading?: boolean;
}

const NewsSection: React.FC<NewsSectionProps> = ({ data, loading }) => {
  return (
    <div style={{ padding: '0 16px 16px' }}>
      <h3 style={{ marginBottom: 12 }}>最新资讯</h3>
      <List
        loading={loading}
        itemLayout="vertical"
        dataSource={data}
        renderItem={(item) => (
          <List.Item key={item.id} style={{ padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
            <List.Item.Meta
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span
                    style={{
                      fontSize: 15,
                      fontWeight: 500,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '70%',
                    }}
                  >
                    {item.title}
                  </span>
                  <span style={{ fontSize: 12, color: '#999' }}>{item.publishDate}</span>
                </div>
              }
              description={
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      color: '#666',
                      marginBottom: 8,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {item.summary}
                  </div>
                  <Tag color="blue" style={{ fontSize: 10, lineHeight: '18px' }}>
                    {item.source}
                  </Tag>
                </div>
              }
            />
          </List.Item>
        )}
      />
    </div>
  );
};

export default NewsSection;
