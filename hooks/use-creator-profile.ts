"use client";

import { useState, useEffect } from "react";
import { getProfileCoins } from "@zoralabs/coins-sdk";

export interface CreatorProfile {
  id?: string;
  handle?: string;
  avatar?: {
    previewImage?: {
      blurhash?: string;
      medium?: string;
      small?: string;
    };
  };
}

export function useCreatorProfile(creatorAddress: string | null) {
  const [creatorProfile, setCreatorProfile] = useState<CreatorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCreatorProfile = async (address: string) => {
    if (!address) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log("🔍 Obteniendo perfil del creador:", address);
      
      const response = await getProfileCoins({
        identifier: address,
        count: 1, // Solo necesitamos el perfil, no los tokens
        chainIds: [8453], // Base Mainnet
      });

      console.log("✅ Respuesta del perfil del creador:", response);

      if (response.data?.profile) {
        setCreatorProfile({
          id: response.data.profile.id,
          handle: response.data.profile.handle,
          avatar: response.data.profile.avatar
        });
        console.log("📊 Perfil del creador obtenido:", response.data.profile);
      } else {
        console.log("ℹ️ No se encontró perfil del creador");
        setCreatorProfile(null);
      }
    } catch (err) {
      console.error("❌ Error obteniendo perfil del creador:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
      setCreatorProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (creatorAddress) {
      fetchCreatorProfile(creatorAddress);
    } else {
      setCreatorProfile(null);
      setError(null);
    }
  }, [creatorAddress]);

  const refetch = () => {
    if (creatorAddress) {
      fetchCreatorProfile(creatorAddress);
    }
  };

  return {
    creatorProfile,
    isLoading,
    error,
    refetch,
    hasProfile: !!creatorProfile,
  };
}
