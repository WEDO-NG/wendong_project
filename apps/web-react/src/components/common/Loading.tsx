import React from 'react';
import { Spin } from 'antd';

interface LoadingProps {
  tip?: string;
}

export const Loading: React.FC<LoadingProps> = ({ tip = 'Loading...' }) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '200px',
        width: '100%',
      }}
    >
      <Spin size="large" tip={tip} />
    </div>
  );
};
