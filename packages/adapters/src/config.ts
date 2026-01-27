export const ENV_CONFIGS = {
  dev: {
    baseUrl: 'http://localhost:3001/api',
  },
  sit: {
    baseUrl: '/api', // 测试环境通常使用相对路径，由 Nginx 转发
  },
  prod: {
    baseUrl: '/api', // 生产环境使用相对路径
  },
};

export type EnvType = keyof typeof ENV_CONFIGS;

// 默认环境
let currentEnv: EnvType = 'dev';

/**
 * 自动识别当前环境（浏览器端）
 * 策略：基于当前域名判断
 */
const detectEnv = (): EnvType => {
  if (typeof window === 'undefined') return 'dev';

  const hostname = window.location.hostname;

  // 1. 本地开发环境
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'dev';
  }

  // 2. 测试环境 (SIT) - 端口 1212 或域名包含 'sit'/'test'
  // 适配场景：
  // - IP 访问：http://39.97.54.94:1212
  // - 域名访问：http://sit.wendong.com
  if (window.location.port === '1212' || hostname.includes('sit') || hostname.includes('test')) {
    return 'sit';
  }

  // 3. 生产环境 (PROD) - 其他所有情况
  // 适配场景：
  // - IP 访问：http://39.97.54.94:1215
  // - 域名访问：http://www.wendong.com
  return 'prod';
};

// 初始化时自动检测
currentEnv = detectEnv();

/**
 * 设置当前环境 (支持手动覆盖)
 * @param env 'dev' | 'sit' | 'prod'
 */
export const setCurrentEnv = (env: EnvType) => {
  if (ENV_CONFIGS[env]) {
    currentEnv = env;
  } else {
    console.warn(`[Config] Environment '${env}' not found, keeping '${currentEnv}'.`);
  }
};

/**
 * 获取当前环境的 Base URL
 */
export const getBaseUrl = (): string => {
  return ENV_CONFIGS[currentEnv].baseUrl;
};

/**
 * 获取当前环境标识
 */
export const getEnv = (): EnvType => {
  return currentEnv;
};
