// axone-app/src/lib/kv.ts
// Utilise @upstash/redis avec les variables KV_REST_API_URL / KV_REST_API_TOKEN
// injectées automatiquement par l'intégration Upstash via Vercel marketplace
import { Redis } from '@upstash/redis';

let redisClient: Redis | null = null;

function getRedis(): Redis {
  if (!redisClient) {
    const url = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;

    if (!url || !token) {
      throw new Error(
        'KV_REST_API_URL et KV_REST_API_TOKEN sont requis. Vérifie les variables d\'environnement Vercel.'
      );
    }

    redisClient = new Redis({ url, token });
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
