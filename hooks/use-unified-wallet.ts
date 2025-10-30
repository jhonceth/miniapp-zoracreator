"use client";

import { useFarcasterPrimaryAddress } from "./use-farcaster-primary-address";
import { useAccount } from "wagmi";

export function useUnifiedWallet() {
  const { primaryAddress, isLoading: addressLoading, error: addressError } = useFarcasterPrimaryAddress();
  const { address: wagmiAddress, isConnected: wagmiConnected } = useAccount();

  // Priorizar la dirección primaria de Farcaster sobre Wagmi
  const address = primaryAddress?.address || wagmiAddress;
  const isConnected = !!(primaryAddress?.address || wagmiConnected);
  const isLoading = addressLoading;

  // Determinar la fuente de la dirección
  const addressSource = primaryAddress?.address ? 'farcaster' : 'wagmi';

  return {
    address,
    isConnected,
    isLoading,
    error: addressError,
    addressSource,
    primaryAddress: primaryAddress?.address,
    wagmiAddress,
    wagmiConnected
  };
}



