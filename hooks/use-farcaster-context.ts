"use client";

import { useState, useEffect } from "react";
import { sdk } from "@farcaster/miniapp-sdk";

export interface FarcasterUser {
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
  bio?: string;
  location?: {
    placeId: string;
    description: string;
  };
}

export interface FarcasterContext {
  user: FarcasterUser;
  location?: {
    type: 'cast_embed' | 'cast_share' | 'notification' | 'launcher' | 'channel' | 'open_miniapp';
    cast?: {
      author: FarcasterUser;
      hash: string;
      parentHash?: string;
      parentFid?: number;
      timestamp?: number;
      mentions?: FarcasterUser[];
      text: string;
      embeds?: string[];
      channelKey?: string;
    };
    notification?: {
      notificationId: string;
      title: string;
      body: string;
    };
    channel?: {
      key: string;
      name: string;
      imageUrl?: string;
    };
    referrerDomain?: string;
  };
  client: {
    platformType?: 'web' | 'mobile';
    clientFid: number;
    added: boolean;
    safeAreaInsets?: {
      top: number;
      bottom: number;
      left: number;
      right: number;
    };
    notificationDetails?: {
      url: string;
      token: string;
    };
  };
  features?: {
    haptics: boolean;
    cameraAndMicrophoneAccess?: boolean;
  };
}

export function useFarcasterContext() {
  const [context, setContext] = useState<FarcasterContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadContext = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Obtener el contexto del SDK de Farcaster
        const farcasterContext = await sdk.context;
        
        if (!farcasterContext) {
          throw new Error("No Farcaster context available");
        }

        console.log("🔍 Farcaster Context loaded:", farcasterContext);
        
        setContext(farcasterContext as FarcasterContext);
      } catch (err) {
        console.error("❌ Error loading Farcaster context:", err);
        setError(err instanceof Error ? err.message : "Failed to load context");
      } finally {
        setIsLoading(false);
      }
    };

    loadContext();
  }, []);

  return {
    context,
    isLoading,
    error,
    user: context?.user,
    location: context?.location,
    client: context?.client,
    features: context?.features,
  };
}



