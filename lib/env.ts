import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

// https://env.t3.gg/docs/nextjs
export const env = createEnv({
  server: {
    NEYNAR_API_KEY: z.string().min(1).optional().default("dev_key"),
    JWT_SECRET: z.string().min(1).optional().default("dev_jwt_secret"),
    REDIS_URL: z.string().min(1).optional().default("redis://localhost:6379"),
    REDIS_TOKEN: z.string().min(1).optional().default("dev_token"),
    ETHERSCAN_API_KEY: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_URL: z.string().min(1).optional().default("http://localhost:3000"),
    NEXT_PUBLIC_APP_ENV: z
      .enum(["development", "production"])
      .optional()
      .default("development"),
    NEXT_PUBLIC_FARCASTER_HEADER: z.string().min(1).optional().default("dev_header"),
    NEXT_PUBLIC_FARCASTER_PAYLOAD: z.string().min(1).optional().default("dev_payload"),
    NEXT_PUBLIC_FARCASTER_SIGNATURE: z.string().min(1).optional().default("dev_signature"),
    NEXT_PUBLIC_ZBASE_ANALYTICS_URL: z.string().min(1).optional().default("https://app.zbase.fun"),
    NEXT_PUBLIC_PLATFORM_REFERRER_ADDRESS: z.string().min(1).optional().default("0x0000000000000000000000000000000000000000"),
  },
  // For Next.js >= 13.4.4, you only need to destructure client variables:
  experimental__runtimeEnv: {
    NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
    NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
    NEXT_PUBLIC_FARCASTER_HEADER: process.env.NEXT_PUBLIC_FARCASTER_HEADER,
    NEXT_PUBLIC_FARCASTER_PAYLOAD: process.env.NEXT_PUBLIC_FARCASTER_PAYLOAD,
    NEXT_PUBLIC_FARCASTER_SIGNATURE: process.env.NEXT_PUBLIC_FARCASTER_SIGNATURE,
    NEXT_PUBLIC_ZBASE_ANALYTICS_URL: process.env.NEXT_PUBLIC_ZBASE_ANALYTICS_URL,
    NEXT_PUBLIC_PLATFORM_REFERRER_ADDRESS: process.env.NEXT_PUBLIC_PLATFORM_REFERRER_ADDRESS,
  },
});
