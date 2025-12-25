/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useMemo } from 'react';

// 使用 webpack 的 require.context 动态加载图片
// @ts-ignore
const imagesContext = require.context('../../../assets/home', false, /\.(png|jpe?g|svg|webp)$/);
const imageUrls = imagesContext.keys().map((key: string) => imagesContext(key)) as string[];

const WaterfallSection: React.FC = () => {
  // 简单的性能优化：使用 useMemo 缓存图片列表（虽然在这里它是静态的）
  const images = useMemo(() => imageUrls, []);

  return (
    <div style={{ padding: '0 16px 16px' }}>
      <h3 style={{ marginBottom: 12 }}>瀑布流</h3>
      {/* CSS Multi-column 布局实现简易瀑布流 */}
      <div
        style={{
          columnCount: 2, // 两列
          columnGap: 12, // 列间距
        }}
      >
        {images.map((url, index) => (
          <div
            key={index}
            style={{
              breakInside: 'avoid', // 防止元素被分割到两列
              marginBottom: 12, // 元素底部间距
              borderRadius: 8,
              overflow: 'hidden',
              backgroundColor: '#f5f5f5', // 图片加载前的背景色
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            }}
          >
            <img
              src={url}
              alt={`gallery-${index}`}
              style={{
                width: '100%', // 宽度撑满列宽
                height: 'auto', // 高度自适应，保持原比例
                display: 'block', // 消除 inline-block 带来的底部空隙
              }}
              // 性能优化：原生懒加载
              loading="lazy"
              // 性能优化：异步解码
              decoding="async"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default WaterfallSection;
