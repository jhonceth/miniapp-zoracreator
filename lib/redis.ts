import { Redis } from "@upstash/redis";
import { env } from "@/lib/env";

let redis: Redis | null = null;

// Función para inicializar Upstash Redis de forma segura
function initializeRedis() {
  if (redis) return redis;
  
  if (!env.REDIS_URL || !env.REDIS_TOKEN) {
    console.warn(
      "REDIS_URL and REDIS_TOKEN environment variables are required for Upstash Redis.",
    );
    return null;
  }

  try {
    redis = new Redis({
      url: env.REDIS_URL,
      token: env.REDIS_TOKEN,
    });

    console.log('✅ Upstash Redis initialized successfully');
    return redis;
  } catch (error) {
    console.error('Failed to create Upstash Redis client:', error);
    return null;
  }
}

// Exportar función para obtener Redis de forma segura
export function getRedis() {
  return initializeRedis();
}

// Exportar la instancia (para compatibilidad)
export { redis };
