"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { getProfileCoins } from "@zoralabs/coins-sdk";

export interface CreatedCoin {
  id?: string;
  name?: string;
  symbol?: string;
  description?: string;
  address?: string;
  chainId?: number;
  totalSupply?: string;
  totalVolume?: string;
  volume24h?: string;
  marketCap?: string;
  marketCapDelta24h?: string;
  uniqueHolders?: number;
  createdAt?: string;
  creatorAddress?: string;
  tokenUri?: string;
  mediaContent?: {
    mimeType?: string;
    originalUri?: string;
    previewImage?: {
      small?: string;
      medium?: string;
      blurhash?: string;
    };
  };
  uniswapV4PoolKey?: {
    token0Address?: string;
    token1Address?: string;
    fee?: number;
    tickSpacing?: number;
    hookAddress?: string;
  };
  uniswapV3PoolAddress?: string;
}

export interface ProfileData {
  id?: string;
  handle?: string;
  avatar?: {
    previewImage?: {
      blurhash?: string;
      medium?: string;
      small?: string;
    };
  };
  createdCoins?: {
    count?: number;
    edges?: Array<{
      node?: CreatedCoin;
    }>;
    pageInfo?: {
      hasNextPage?: boolean;
      endCursor?: string;
    };
  };
}

export function useProfileCoins() {
  const { address, isConnected } = useAccount();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [createdCoins, setCreatedCoins] = useState<CreatedCoin[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfileCoins = async (walletAddress: string) => {
    if (!walletAddress) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log("🔍 Obteniendo tokens creados para:", walletAddress);
      
      const response = await getProfileCoins({
        identifier: walletAddress,
        count: 50, // Obtener más tokens por página
        chainIds: [8453], // Solo Base Mainnet por ahora
      });

      console.log("✅ Respuesta de getProfileCoins:", response);

      if (response.data?.profile) {
        setProfileData(response.data.profile);
        
        const coins = response.data.profile.createdCoins?.edges?.map(edge => edge.node).filter(Boolean) || [];
        setCreatedCoins(coins);
        
        console.log(`📊 Encontrados ${coins.length} tokens creados`);
        console.log("🔍 Detalles de tokens:", coins.map(coin => ({
          name: coin.name,
          symbol: coin.symbol,
          address: coin.address,
          creatorAddress: coin.creatorAddress,
          mediaContent: coin.mediaContent
        })));
      } else {
        console.log("ℹ️ No se encontraron datos de perfil");
        console.log("🔍 Respuesta completa:", JSON.stringify(response, null, 2));
        setProfileData(null);
        setCreatedCoins([]);
      }
    } catch (err) {
      console.error("❌ Error obteniendo tokens creados:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
      setProfileData(null);
      setCreatedCoins([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && address) {
      fetchProfileCoins(address);
    } else {
      setProfileData(null);
      setCreatedCoins([]);
      setError(null);
    }
  }, [isConnected, address]);

  const refetch = () => {
    if (address) {
      fetchProfileCoins(address);
    }
  };

  return {
    profileData,
    createdCoins,
    isLoading,
    error,
    refetch,
    hasCoins: createdCoins.length > 0,
    coinsCount: createdCoins.length,
  };
}
