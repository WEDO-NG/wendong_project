import React, { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import BasicLayout from './layouts/BasicLayout';
import './styles/global.css';

// 路由懒加载优化
const HomePage = React.lazy(() => import('./pages/Home'));
const ListPage = React.lazy(() => import('./pages/List'));
const ProfilePage = React.lazy(() => import('./pages/Profile'));

const PageLoading = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <Spin size="large" />
  </div>
);

const App: React.FC = () => {
  return (
    <HashRouter>
      <Suspense fallback={<PageLoading />}>
        <Routes>
          <Route path="/" element={<BasicLayout />}>
            <Route index element={<HomePage />} />
            <Route path="list" element={<ListPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </HashRouter>
  );
};

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
