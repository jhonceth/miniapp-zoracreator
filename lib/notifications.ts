import type { MiniAppNotificationDetails } from "@farcaster/miniapp-sdk";
import { getRedis } from "./redis";

const notificationServiceKey = "farcaster:miniapp";

function getUserNotificationDetailsKey(fid: number): string {
  return `${notificationServiceKey}:user:${fid}`;
}

export async function getUserNotificationDetails(
  fid: number
): Promise<MiniAppNotificationDetails | null> {
  const redis = getRedis();
  if (!redis) {
    return null;
  }

  const result = await redis.get(
    getUserNotificationDetailsKey(fid)
  );
  if (result) {
    try {
      return JSON.parse(result) as MiniAppNotificationDetails;
    } catch {
      return null;
    }
  }
  return null;
}

export async function setUserNotificationDetails(
  fid: number,
  notificationDetails: MiniAppNotificationDetails
): Promise<void> {
  const redis = getRedis();
  if (!redis) {
    return;
  }

  await redis.set(getUserNotificationDetailsKey(fid), JSON.stringify(notificationDetails));
}

export async function deleteUserNotificationDetails(
  fid: number
): Promise<void> {
  const redis = getRedis();
  if (!redis) {
    return;
  }

  await redis.del(getUserNotificationDetailsKey(fid));
}
