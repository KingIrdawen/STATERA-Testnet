// axone-app/src/lib/serializers.ts
// Utilitaires simples pour convertir des valeurs non-JSON (bigint) en string.

export const toJSONSafe = <T extends Record<string, any>>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj, (_k, v) => (typeof v === "bigint" ? v.toString() : v)));
};

