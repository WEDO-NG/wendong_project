import React, { useState } from 'react';
import { List as AntList, Avatar } from 'antd';

const mockList = Array.from({ length: 10 }).map((_, i) => ({
  id: i,
  title: `前端工程化文章 ${i + 1}`,
  description: '这是一段关于前端工程化的描述内容...',
  avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=' + i,
}));

const ListPage: React.FC = () => {
  const [data] = useState(mockList);

  return (
    <div style={{ padding: '0 16px' }}>
      <h2 style={{ fontSize: '20px', padding: '16px 0', borderBottom: '1px solid #eee' }}>
        文章列表
      </h2>
      <AntList
        itemLayout="horizontal"
        dataSource={data}
        renderItem={(item) => (
          <AntList.Item>
            <AntList.Item.Meta
              avatar={<Avatar src={item.avatar} />}
              title={<a href="#">{item.title}</a>}
              description={item.description}
            />
          </AntList.Item>
        )}
      />
    </div>
  );
};

export default ListPage;
