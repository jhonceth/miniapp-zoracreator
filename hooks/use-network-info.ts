import { useAccount, useChainId } from "wagmi";
import { useEffect, useState } from "react";

export interface NetworkInfo {
  chainId: number;
  name: string;
  icon: string;
  isTestnet: boolean;
}

export function useNetworkInfo() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getNetworkInfo = (chainId: number): NetworkInfo => {
    switch (chainId) {
      case 8453: // Base Mainnet
        return {
          chainId: 8453,
          name: "Base Mainnet",
          icon: "🔵",
          isTestnet: false,
        };
      case 84532: // Base Sepolia
        return {
          chainId: 84532,
          name: "Base Sepolia",
          icon: "🧪",
          isTestnet: true,
        };
      default:
        return {
          chainId: chainId,
          name: `Chain ${chainId}`,
          icon: "❓",
          isTestnet: false,
        };
    }
  };

  const networkInfo = mounted && isConnected ? getNetworkInfo(chainId) : {
    chainId: 0,
    name: "Unknown",
    icon: "❓",
    isTestnet: false,
  };

  return {
    networkInfo,
    mounted,
    isConnected,
  };
}
