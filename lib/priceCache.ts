import { getRedis } from "./redis";

export async function getCachedPrice(key: string): Promise<any | null> {
  try {
    const redis = getRedis();
    if (!redis) return null;
    const cached = await redis.get(key);
    return cached ? JSON.parse(String(cached)) : null;
  } catch (error) {
    console.error("Error getting from Redis cache:", error);
    return null;
  }
}

export async function setCachedPrice(key: string, value: any, ttl: number) {
  try {
    const redis = getRedis();
    if (!redis) return;
    await redis.setEx(key, ttl, JSON.stringify(value));
  } catch (error) {
    console.error("Error setting to Redis cache:", error);
    // Si falla el cache, no rompe la app
  }
}

// Cache keys
export const CACHE_KEYS = {
  ETH_PRICE: 'price:eth',
  ZORA_PRICE: 'price:zora',
  TOKEN_INFO: (address: string) => `token:${address.toLowerCase()}`,
} as const;

// TTL en segundos
export const CACHE_TTL = {
  PRICES: 20, // 20 segundos para precios
  TOKEN_INFO: 30, // 30 segundos para información de tokens
} as const;
