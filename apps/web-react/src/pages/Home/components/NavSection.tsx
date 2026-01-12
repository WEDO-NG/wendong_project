import React from 'react';
import { NavItem } from '@wendong/business-core/types';
import { Avatar } from 'antd';

interface NavSectionProps {
  data: NavItem[];
  loading?: boolean;
}

const NavSection: React.FC<NavSectionProps> = ({ data, loading }) => {
  if (loading) return <div style={{ height: 80, background: '#f5f5f5', margin: 16 }} />;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 16,
        padding: '16px',
        background: '#fff',
        marginBottom: 16,
      }}
    >
      {data.map((item) => (
        <div
          key={item.id}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: 'pointer',
          }}
          onClick={() => console.log('Navigate to:', item.linkUrl)}
        >
          <Avatar src={item.iconUrl} size={48} style={{ marginBottom: 8 }} />
          <span style={{ fontSize: 12, color: '#333' }}>{item.title}</span>
        </div>
      ))}
    </div>
  );
};

export default NavSection;
