import React from 'react';
import { Card } from 'antd';

const mockData = {
  title: '今日推荐',
  items: [
    { id: 1, title: 'React 18 新特性解析', author: 'Dan' },
    { id: 2, title: 'Webpack 5 性能优化指南', author: 'Sean' },
    { id: 3, title: 'Monorepo 最佳实践', author: 'Lerna' },
  ],
};

const HomePage: React.FC = () => {
  return (
    <div style={{ padding: '16px' }}>
      <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>{mockData.title}</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {mockData.items.map((item) => (
          <Card key={item.id} size="small">
            <h3 style={{ margin: 0, fontSize: '18px' }}>{item.title}</h3>
            <p style={{ margin: '8px 0 0', color: '#666' }}>作者: {item.author}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
