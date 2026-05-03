// axone-app/src/lib/kv.ts
import { createClient } from "@vercel/kv";

// Créer le client KV — accepte tous les noms possibles selon l'intégration utilisée
function createKvClient() {
  const url =
    process.env.strategies_KV_REST_API_URL ||    // nom historique custom
    process.env.KV_REST_API_URL ||               // Vercel KV natif
    process.env.STORAGE_KV_REST_API_URL ||       // Upstash marketplace (préfixe STORAGE)
    process.env.UPSTASH_REDIS_REST_URL;          // Upstash direct

  const token =
    process.env.strategies_KV_REST_API_TOKEN ||  // nom historique custom
    process.env.KV_REST_API_TOKEN ||             // Vercel KV natif
    process.env.STORAGE_KV_REST_API_TOKEN ||     // Upstash marketplace (préfixe STORAGE)
    process.env.UPSTASH_REDIS_REST_TOKEN;        // Upstash direct

  if (!url || !token) {
    throw new Error(
      `Vercel KV credentials not configured. Tried: KV_REST_API_URL, STORAGE_KV_REST_API_URL, UPSTASH_REDIS_REST_URL. Please set one of these in your Vercel environment variables.`
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

