// axone-app/src/lib/kv.ts
// Utilise @upstash/redis avec Redis.fromEnv() qui lit automatiquement
// KV_REST_API_URL et KV_REST_API_TOKEN (variables injectées par Vercel/Upstash)
import { Redis } from '@upstash/redis';

let redisClient: Redis | null = null;

function getRedis(): Redis {
  if (!redisClient) {
    redisClient = Redis.fromEnv();
  }
  return redisClient;
}

export function getKv() {
  return getRedis();
}

export const kv = {
  get: async <T>(key: string): Promise<T | null> => {
    return getRedis().get<T>(key);
  },
  set: async (key: string, value: any): Promise<void> => {
    await getRedis().set(key, value);
  },
  lrange: async <T>(key: string, start: number, stop: number): Promise<T[]> => {
    return getRedis().lrange<T>(key, start, stop);
  },
};
