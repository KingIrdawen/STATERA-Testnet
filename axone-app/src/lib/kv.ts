// axone-app/src/lib/kv.ts
import { createClient } from "@vercel/kv";

// Créer le client KV — accepte les noms Vercel natifs ou Upstash marketplace
function createKvClient() {
  const url =
    process.env.strategies_KV_REST_API_URL ||
    process.env.KV_REST_API_URL;
  const token =
    process.env.strategies_KV_REST_API_TOKEN ||
    process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    throw new Error(
      'Vercel KV credentials not configured. Please set KV_REST_API_URL and KV_REST_API_TOKEN (or strategies_KV_REST_API_URL / strategies_KV_REST_API_TOKEN)'
    );
  }

  return createClient({ url, token });
}

// Lazy initialization pour éviter les erreurs au build time
let kvClient: ReturnType<typeof createClient> | null = null;

export function getKv(): ReturnType<typeof createClient> {
  if (!kvClient) {
    kvClient = createKvClient();
  }
  return kvClient;
}

// Export pour compatibilité
export const kv = {
  get: async <T>(key: string): Promise<T | null> => {
    return getKv().get<T>(key);
  },
  set: async (key: string, value: any): Promise<void> => {
    return getKv().set(key, value);
  },
  lrange: async <T>(key: string, start: number, stop: number): Promise<T[]> => {
    return getKv().lrange<T>(key, start, stop);
  },
};

