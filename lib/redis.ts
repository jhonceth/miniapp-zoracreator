import { createClient } from "redis";
import { env } from "process";

if (!env.REDIS_URL) {
  console.warn(
    "REDIS_URL environment variable is not defined, please add to enable caching.",
  );
}

export const redis = env.REDIS_URL ? createClient({
  url: env.REDIS_URL,
}) : null;

// Conectar Redis si está disponible
if (redis) {
  redis.connect().catch(console.error);
}
