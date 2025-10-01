import { getRedis } from "./redis";

export async function getCache(key: string): Promise<any | null> {
  try {
    const redis = getRedis();
    if (!redis) return null;
    const cached = await redis.get(key);
    return cached ? JSON.parse(String(cached)) : null;
  } catch {
    return null;
  }
}

export async function setCache(key: string, value: any, ttlSeconds: number = 30): Promise<void> {
  try {
    const redis = getRedis();
    if (!redis) return;
    await redis.setEx(key, ttlSeconds, JSON.stringify(value));
  } catch {
    // si falla cache no rompe la app
  }
}