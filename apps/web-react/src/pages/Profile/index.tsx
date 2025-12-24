import React from 'react';
import { Avatar, Button, Card } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const mockUser = {
  name: '前端练习生',
  role: '高级前端工程师',
  stats: {
    posts: 42,
    following: 128,
    followers: 1024,
  },
};

const ProfilePage: React.FC = () => {
  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', paddingBottom: '60px' }}>
      <div
        style={{
          background: '#fff',
          padding: '32px 16px',
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column',
        }}
      >
        <Avatar size={80} icon={<UserOutlined />} style={{ marginBottom: '16px' }} />
        <h2 style={{ margin: 0, fontSize: '22px' }}>{mockUser.name}</h2>
        <p style={{ color: '#666', marginTop: '4px' }}>{mockUser.role}</p>
      </div>

      <div
        style={{
          padding: '16px',
          display: 'flex',
          justifyContent: 'space-around',
          background: '#fff',
          marginTop: '1px',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{mockUser.stats.posts}</div>
          <div style={{ color: '#999', fontSize: '12px' }}>文章</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{mockUser.stats.following}</div>
          <div style={{ color: '#999', fontSize: '12px' }}>关注</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{mockUser.stats.followers}</div>
          <div style={{ color: '#999', fontSize: '12px' }}>粉丝</div>
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        <Card title="我的服务" size="small">
          <p>浏览记录</p>
          <p>收藏文章</p>
          <p>设置</p>
        </Card>

        <Button type="primary" danger block style={{ marginTop: '24px' }}>
          退出登录
        </Button>
      </div>
    </div>
  );
};

export default ProfilePage;
