// axone-app/src/lib/kv.ts
import { createClient } from "@vercel/kv";

// Créer le client KV seulement si les variables d'environnement sont disponibles
function createKvClient() {
  const url = process.env.strategies_KV_REST_API_URL;
  const token = process.env.strategies_KV_REST_API_TOKEN;
  
  if (!url || !token) {
    throw new Error('Vercel KV credentials not configured. Please set strategies_KV_REST_API_URL and strategies_KV_REST_API_TOKEN');
  }
  
  return createClient({
    url,
    token,
  });
}

// Lazy initialization pour éviter les erreurs au build time
let kvClient: ReturnType<typeof createClient> | null = null;

export function getKv() {
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
};

