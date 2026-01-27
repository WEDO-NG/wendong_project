# 性能优化实战记录 (Performance Optimization)

## 1. 背景与现状（Baseline）

在 Phase 1 部署上线后，进行了首次 Performance 分析，发现 LCP (Largest Contentful Paint) 高达 **7.29秒**，严重影响用户体验。

**核心瓶颈分析：**
1.  **服务器带宽限制**：阿里云 ECS 带宽仅为 **3Mbps**（约 375KB/s）。
2.  **资源体积过大**：瀑布流图片单张体积高达 **652KB**，加载一张图需要近 2秒。
3.  **加载策略不当**：首屏渲染被非首屏的大图资源抢占了带宽。

---

## 2. 优化方案与落地

### 动作 1：资源体积压缩
- **措施**：使用工具对本地 `assets` 图片进行有损压缩。
- **目标**：单张图片 < 200KB。
- **收益**：理论下载时间 2s -> 0.5s。

### 动作 2：加载策略优化 (Lazy Loading)
- **修正**：`WaterfallSection` 位于页面底部，不在首屏。
- **策略**：放弃 `eager`，全量使用 `loading="lazy"`。

### 动作 3：解决布局抖动与高度塌陷 (Skeleton)
- **问题**：LCP 依然高，因为 API 返回前高度为 0，导致底部组件“窜”入首屏触发加载。
- **解决方案**：
  1.  **骨架屏**：模拟真实高度，防止抖动。
  2.  **条件渲染**：`!loading && <WaterfallSection />`，确保首屏加载完再渲染底部组件。

### 动作 4：Webpack 构建策略优化 (LCP -> 2s)
1.  **Content Hash**：长效缓存。
2.  **SplitChunks**：拆分 `vendors.js`。
3.  **MiniCssExtractPlugin**：提取 CSS。
4.  **Asset Modules**：小图转 Base64。
5.  **Mode 区分**：开发/生产配置分离。

### 动作 5：服务端传输层优化 (Nginx) (LCP -> 1.3s)
1.  **Gzip**：开启文本压缩 (减少 70% 体积)。
2.  **HTTP/2**：多路复用，解决队头阻塞。
3.  **Cache-Control**：静态资源 1 年缓存。

### 动作 6：组件级按需加载 (Code Splitting)
使用 `React.lazy` + `Suspense` 对 `WaterfallSection` 进行动态导入，减小首屏 JS 体积。

### 动作 7：终极优化 (Bundle Splitting & Lazy Routing)
- **路由懒加载**：`ListPage` / `ProfilePage` 懒加载。
- **精细化分包**：拆解 `vendors.js` 为 `react-vendor`, `antd-vendor`, `libs-vendor`。

---

## 3. 最终成果

- **LCP**：7.29s -> **1.2s** (提升 84.7%，有缓存时 800ms)。
- **体验**：无布局抖动，丝般顺滑。

> **总结**：好的架构和优化策略，完全可以弥补硬件资源的不足。
