module.exports = {
  plugins: {
    'postcss-px-to-viewport': {
      viewportWidth: 375, // 设计稿宽度，通常是 375 或 750
      unitPrecision: 5, // 指定 `px` 转换为视窗单位值的小数位数
      viewportUnit: 'vw', // 指定需要转换成的视窗单位，建议使用 vw
      selectorBlackList: ['.ignore', '.hairlines'], // 指定不转换为视窗单位的类
      minPixelValue: 1, // 小于或等于`1px`不转换为视窗单位
      mediaQuery: false, // 允许在媒体查询中转换`px`
      exclude: [/node_modules/], // 忽略 node_modules 下的文件
    },
  },
};
