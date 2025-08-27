import Redis from 'ioredis';

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
};

export const redisClient = new Redis(redisConfig);

redisClient.on('connect', () => {
  console.log('✅ Redis conectado exitosamente');
});

redisClient.on('error', (err) => {
  console.error('❌ Error de Redis:', err);
});
