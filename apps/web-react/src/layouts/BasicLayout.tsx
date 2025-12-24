import React from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { HomeOutlined, UnorderedListOutlined, UserOutlined } from '@ant-design/icons';

const TabBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { key: '/', icon: <HomeOutlined />, label: '首页' },
    { key: '/list', icon: <UnorderedListOutlined />, label: '列表' },
    { key: '/profile', icon: <UserOutlined />, label: '我的' },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '50px',
        display: 'flex',
        backgroundColor: '#fff',
        borderTop: '1px solid #eee',
        boxShadow: '0 -1px 4px rgba(0,0,0,0.05)',
        zIndex: 1000,
      }}
    >
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.key;
        return (
          <div
            key={tab.key}
            onClick={() => navigate(tab.key)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: isActive ? '#1677ff' : '#999',
            }}
          >
            <div style={{ fontSize: '20px', marginBottom: '2px' }}>{tab.icon}</div>
            <div style={{ fontSize: '10px' }}>{tab.label}</div>
          </div>
        );
      })}
    </div>
  );
};

const BasicLayout: React.FC = () => {
  return (
    <div style={{ paddingBottom: '50px', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Outlet />
      <TabBar />
    </div>
  );
};

export default BasicLayout;
