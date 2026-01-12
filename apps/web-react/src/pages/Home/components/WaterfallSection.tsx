import React, { useMemo, useState } from 'react';
import { Skeleton } from 'antd';

// 使用 webpack 的 require.context 动态加载图片
// @ts-expect-error require.context is a webpack specific feature not available in standard TS types
const imagesContext = require.context('../../../assets/home', false, /\.(png|jpe?g|svg|webp)$/);
const imageUrls = imagesContext.keys().map((key: string) => imagesContext(key)) as string[];

// 封装带骨架屏的图片组件
const ImageWithSkeleton: React.FC<{ src: string; alt: string; loading?: 'lazy' | 'eager' }> = ({
  src,
  alt,
  loading = 'lazy',
}) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      style={{
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#f5f5f5',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        position: 'relative', // 确保骨架屏绝对定位时相对于此容器
        minHeight: 150, // 给一个最小高度，防止未加载时高度为0
      }}
    >
      {/* 骨架屏：未加载完成时显示 */}
      {!loaded && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Skeleton.Image active style={{ width: '100%', height: '100%', minHeight: 150 }} />
        </div>
      )}

      {/* 真实图片 */}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        style={{
          width: '100%',
          height: 'auto',
          display: 'block',
          opacity: loaded ? 1 : 0, // 加载完成后淡入
          transition: 'opacity 0.3s ease-in-out',
        }}
        // 性能优化：全量懒加载
        // 原因：瀑布流组件位于页面底部，完全处于首屏之外。
        // 此时应统一使用 lazy，避免抢占首屏资源（如 Banner、JS Bundle）的带宽。
        loading={loading}
        decoding="async"
      />
    </div>
  );
};

const WaterfallSection: React.FC = () => {
  const images = useMemo(() => imageUrls, []);

  // 将图片分配到左右两列，确保视觉顺序（左-右-左-右）符合 DOM 顺序
  const { leftImages, rightImages } = useMemo(() => {
    const left: string[] = [];
    const right: string[] = [];
    images.forEach((url, index) => {
      if (index % 2 === 0) {
        left.push(url);
      } else {
        right.push(url);
      }
    });
    return { leftImages: left, rightImages: right };
  }, [images]);

  const renderColumn = (colImages: string[], colIndex: number) => (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
      {colImages.map((url, index) => (
        <ImageWithSkeleton
          key={`${colIndex}-${index}`}
          src={url}
          alt={`gallery-${colIndex}-${index}`}
          loading="lazy"
        />
      ))}
    </div>
  );

  return (
    <div style={{ padding: '0 16px 16px' }}>
      <h3 style={{ marginBottom: 12 }}>瀑布流</h3>
      {/* 使用 Flex 布局替代 CSS Column，解决渲染顺序问题 */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: 12,
          alignItems: 'flex-start',
        }}
      >
        {renderColumn(leftImages, 0)}
        {renderColumn(rightImages, 1)}
      </div>
    </div>
  );
};

export default WaterfallSection;
