// axone-app/src/lib/kv.ts
// Utilise l'export automatique de @vercel/kv qui lit KV_REST_API_URL et KV_REST_API_TOKEN
import { kv as vercelKv } from "@vercel/kv";

export function getKv() {
  return vercelKv;
}

export const kv = {
  get: async <T>(key: string): Promise<T | null> => {
    return vercelKv.get<T>(key);
  },
  set: async (key: string, value: any): Promise<void> => {
    await vercelKv.set(key, value);
  },
  lrange: async <T>(key: string, start: number, stop: number): Promise<T[]> => {
    return vercelKv.lrange<T>(key, start, stop);
  },
};
