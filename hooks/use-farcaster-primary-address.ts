"use client";

import { useState, useEffect } from "react";
import { useFarcasterContext } from "./use-farcaster-context";

export interface PrimaryAddress {
  fid: number;
  protocol: 'ethereum' | 'solana';
  address: string;
}

export function useFarcasterPrimaryAddress() {
  const { user, isLoading: contextLoading } = useFarcasterContext();
  const [primaryAddress, setPrimaryAddress] = useState<PrimaryAddress | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrimaryAddress = async () => {
      if (!user?.fid || contextLoading) return;

      try {
        setIsLoading(true);
        setError(null);

        console.log("🔍 Fetching primary address for FID:", user.fid);

        // Obtener la dirección primaria de Ethereum
        const response = await fetch(
          `https://api.farcaster.xyz/fc/primary-address?fid=${user.fid}&protocol=ethereum`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch primary address: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.result?.address) {
          setPrimaryAddress(data.result.address);
          console.log("✅ Primary address loaded:", data.result.address);
        } else {
          throw new Error("No primary address found");
        }
      } catch (err) {
        console.error("❌ Error fetching primary address:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch primary address");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrimaryAddress();
  }, [user?.fid, contextLoading]);

  return {
    primaryAddress,
    isLoading: isLoading || contextLoading,
    error,
    fid: user?.fid,
  };
}



