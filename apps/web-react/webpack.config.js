const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (env, argv) => {
  // 利用 Webpack 的 argv.mode 参数动态判断环境
  const isProd = argv.mode === 'production';

  return {
    mode: isProd ? 'production' : 'development',
    entry: './src/index.tsx',
    output: {
      path: path.resolve(__dirname, 'dist'),
      // 生产环境使用 contenthash，开发环境使用固定文件名（构建更快）
      filename: isProd ? '[name].[contenthash:8].js' : '[name].js',
      chunkFilename: isProd ? '[name].[contenthash:8].js' : '[name].js',
      clean: true,
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
      alias: {
        '@wendong/business-core': path.resolve(
          __dirname,
          '../../packages/business-core/src/index.ts'
        ),
      },
    },
    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          use: 'ts-loader',
          exclude: /node_modules/,
          include: [
            path.resolve(__dirname, 'src'),
            path.resolve(__dirname, '../../packages/business-core/src'),
            path.resolve(__dirname, '../../packages/adapters/src'),
          ],
        },
        {
          test: /\.css$/,
          use: [
            // 生产环境提取 CSS，开发环境使用 style-loader (支持热更新)
            isProd ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader',
            'postcss-loader',
          ],
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif|webp)$/i,
          type: 'asset',
          parser: {
            dataUrlCondition: {
              maxSize: 8 * 1024,
            },
          },
          generator: {
            filename: 'images/[name].[hash:8][ext]',
          },
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './public/index.html',
      }),
      // 仅在生产环境启用 CSS 提取
      ...(isProd
        ? [
            new MiniCssExtractPlugin({
              filename: 'css/[name].[contenthash:8].css',
            }),
          ]
        : []),
    ],
    optimization: {
      splitChunks: {
        chunks: 'all',
        maxInitialRequests: 20, // 允许更多并行请求，便于更细粒度的拆分
        maxAsyncRequests: 20,
        minSize: 20000, // 20kb 以上的模块才拆分
        cacheGroups: {
          default: false, // 禁用默认配置
          vendors: false, // 禁用默认 vendors
          // 1. React 核心库（长期缓存，变动频率低）
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom|react-router-dom)[\\/]/,
            name: 'react-vendor',
            chunks: 'all',
            priority: 40,
          },
          // 2. Ant Design (UI 库，体积大，单独拆分)
          antd: {
            test: /[\\/]node_modules[\\/](antd|@ant-design)[\\/]/,
            name: 'antd-vendor',
            chunks: 'all',
            priority: 30,
          },
          // 3. 其他第三方库
          libs: {
            test: /[\\/]node_modules[\\/]/,
            name: 'libs-vendor',
            chunks: 'all',
            priority: 20,
          },
          // 4. 业务公共代码（至少被2个 chunk 引用）
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
          },
        },
      },
    },
    devServer: {
      static: {
        directory: path.join(__dirname, 'public'),
      },
      compress: true,
      port: 3000,
      hot: true,
      historyApiFallback: true,
    },
  };
};
