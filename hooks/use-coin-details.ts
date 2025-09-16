"use client";

import { useState, useEffect } from "react";
import { getCoin } from "@zoralabs/coins-sdk";

export interface CoinDetails {
  id?: string;
  name?: string;
  description?: string;
  address?: string;
  symbol?: string;
  totalSupply?: string;
  totalVolume?: string;
  volume24h?: string;
  marketCap?: string;
  marketCapDelta24h?: string;
  uniqueHolders?: number;
  createdAt?: string;
  creatorAddress?: string;
  tokenUri?: string;
  chainId?: number;
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
  owners?: string[];
  payoutRecipient?: string;
  creatorEarnings?: Array<{
    amount: {
      currencyAddress: string;
      amountRaw: string;
      amountDecimal: number;
    };
    amountUsd?: string;
  }>;
}

export function useCoinDetails(tokenAddress: string | null) {
  const [coinDetails, setCoinDetails] = useState<CoinDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCoinDetails = async (address: string) => {
    if (!address) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log("🔍 Obteniendo detalles del token:", address);
      
      const response = await getCoin({
        address: address,
        chain: 8453, // Base Mainnet
      });

      console.log("✅ Respuesta de getCoin:", response);

      if (response.data?.zora20Token) {
        setCoinDetails(response.data.zora20Token);
        console.log("📊 Detalles del token obtenidos:", response.data.zora20Token);
        console.log("🔍 Información de propietario:", {
          creatorAddress: response.data.zora20Token.creatorAddress,
          address: response.data.zora20Token.address,
          creatorEarnings: response.data.zora20Token.creatorEarnings,
          mediaContent: response.data.zora20Token.mediaContent
        });
      } else {
        console.log("ℹ️ No se encontraron detalles del token");
        setCoinDetails(null);
      }
    } catch (err) {
      console.error("❌ Error obteniendo detalles del token:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
      setCoinDetails(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (tokenAddress) {
      fetchCoinDetails(tokenAddress);
    } else {
      setCoinDetails(null);
      setError(null);
    }
  }, [tokenAddress]);

  const refetch = () => {
    if (tokenAddress) {
      fetchCoinDetails(tokenAddress);
    }
  };

  return {
    coinDetails,
    isLoading,
    error,
    refetch,
    hasDetails: !!coinDetails,
  };
}
