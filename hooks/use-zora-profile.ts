"use client";

import { useState, useEffect, useCallback } from "react";
import { getProfile } from "@zoralabs/coins-sdk";

export interface ZoraProfile {
  id?: string;
  handle?: string;
  displayName?: string;
  bio?: string;
  username?: string;
  website?: string;
  avatar?: {
    small?: string;
    medium?: string;
    blurhash?: string;
  };
  publicWallet?: {
    walletAddress?: string;
  };
  socialAccounts?: {
    instagram?: {
      username?: string;
      displayName?: string;
    };
    tiktok?: {
      username?: string;
      displayName?: string;
    };
    twitter?: {
      username?: string;
      displayName?: string;
    };
    farcaster?: {
      username?: string;
      displayName?: string;
    };
  };
  linkedWallets?: {
    edges?: Array<{
      node?: {
        walletType?: "PRIVY" | "EXTERNAL" | "SMART_WALLET";
        walletAddress?: string;
      };
    }>;
  };
  creatorCoin?: {
    address?: string;
    marketCap?: string;
    marketCapDelta24h?: string;
  };
}

export function useZoraProfile(walletAddress: string | undefined) {
  const [profile, setProfile] = useState<ZoraProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async (address: string) => {
    if (!address) return;

    setIsLoading(true);
    setError(null);
    setProfile(null);

    try {
      console.log("🔍 Obteniendo perfil de Zora para:", address);
      
      const response = await getProfile({
        identifier: address,
      });
      
      console.log("✅ Respuesta de Zora getProfile:", response);

      // TODO: fix profile graphql types
      const profileData: any = response?.data?.profile;
      
      if (profileData) {
        console.log("📊 Perfil de Zora encontrado:", {
          handle: profileData.handle,
          displayName: profileData.displayName,
          bio: profileData.bio,
          avatar: profileData.avatar?.medium,
          creatorCoin: profileData.creatorCoin?.address
        });
        
        setProfile(profileData);
      } else {
        console.log("⚠️ No se encontró perfil de Zora para esta dirección");
        setError("No se encontró perfil de Zora para esta dirección");
      }

    } catch (err) {
      console.error("❌ Error obteniendo perfil de Zora:", err);
      setError(err instanceof Error ? err.message : "Error desconocido al obtener el perfil de Zora");
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (walletAddress) {
      fetchProfile(walletAddress);
    } else {
      setProfile(null);
      setError(null);
    }
  }, [walletAddress, fetchProfile]);

  const refetch = () => {
    if (walletAddress) {
      fetchProfile(walletAddress);
    }
  };

  return {
    profile,
    isLoading,
    error,
    refetch,
    hasProfile: !!profile,
  };
}
