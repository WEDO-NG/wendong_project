import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import BasicLayout from './layouts/BasicLayout';
import HomePage from './pages/Home';
import ListPage from './pages/List';
import ProfilePage from './pages/Profile';
import './styles/global.css';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<BasicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="list" element={<ListPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
