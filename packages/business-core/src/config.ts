export const ENV_CONFIGS = {
  dev: {
    baseUrl: 'http://localhost:3001/api',
  },
  test: {
    baseUrl: 'http://test-api.wendong.com/api', // 示例测试环境地址
  },
  prod: {
    baseUrl: 'https://api.wendong.com/api', // 示例生产环境地址
  },
};

export type EnvType = keyof typeof ENV_CONFIGS;

// 当前环境标识
let currentEnv: EnvType = 'dev';

/**
 * 设置当前环境
 * @param env 'dev' | 'test' | 'prod'
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
