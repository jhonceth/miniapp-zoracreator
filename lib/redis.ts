import { createClient } from "redis";
import { env } from "@/lib/env";

let redis: ReturnType<typeof createClient> | null = null;

// Función para inicializar Redis de forma segura
function initializeRedis() {
  if (redis) return redis;
  
  if (!env.REDIS_URL) {
    console.warn(
      "REDIS_URL environment variable is not defined, please add to enable caching.",
    );
    return null;
  }

  try {
    redis = createClient({
      url: env.REDIS_URL,
      ...(env.REDIS_URL.startsWith('rediss://') && {
        socket: {
          tls: true,
          rejectUnauthorized: false
        }
      })
    });

    // Conectar Redis si está disponible
    redis.connect().catch((error) => {
      console.error('Redis connection error:', error);
    });

    return redis;
  } catch (error) {
    console.error('Failed to create Redis client:', error);
    return null;
  }
}

// Exportar función para obtener Redis de forma segura
export function getRedis() {
  return initializeRedis();
}

// Exportar la instancia (para compatibilidad)
export { redis };
