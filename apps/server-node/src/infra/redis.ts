import Redis from 'ioredis';

// 默认连接本地 Redis，如果连接失败需要捕获异常以免 crash
const redis = new Redis({
  port: 6379,
  host: '127.0.0.1',
  lazyConnect: true, // 延迟连接，避免启动时立即报错
});

redis.on('error', (err) => {
  console.error('Redis Client Error', err);
});

export default redis;
