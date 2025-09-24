import { useState, useEffect, useCallback } from 'react';
import { getProfile } from "@zoralabs/coins-sdk";

interface CreatorProfile {
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

interface UseCreatorProfileLazyReturn {
  profile: CreatorProfile | null;
  isLoading: boolean;
  error: string | null;
  loadProfile: () => void;
}

// Cache para almacenar perfiles
const profileCache = new Map<string, CreatorProfile>();

export function useCreatorProfileLazy(creatorAddress: string, shouldLoad: boolean = false): UseCreatorProfileLazyReturn {
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-load cuando shouldLoad es true
  useEffect(() => {
    if (shouldLoad && creatorAddress && !profile && !isLoading) {
      loadProfile();
    }
  }, [shouldLoad, creatorAddress, profile, isLoading]);

  const loadProfile = useCallback(async () => {
    if (!creatorAddress) return;

    // Verificar si ya está en caché
    const cachedProfile = profileCache.get(creatorAddress);
    if (cachedProfile) {
      setProfile(cachedProfile);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔍 Loading creator profile for:', creatorAddress);
      
      // Usar la API real de Zora
      const response = await getProfile({
        identifier: creatorAddress,
      });
      
      // TODO: fix profile graphql types
      const profileData: CreatorProfile | undefined = response?.data?.profile;
      
      if (profileData) {
        console.log("Profile Details:");
        console.log("- Handle:", profileData.handle);
        console.log("- Display Name:", profileData.displayName);
        console.log("- Bio:", profileData.bio);
        
        // Access profile image if available
        if (profileData.avatar?.medium) {
          console.log("- Profile Image:", profileData.avatar.medium);
        }
        
        // Access social links if available
        if (profileData?.linkedWallets && profileData?.linkedWallets?.edges?.length || 0 > 0) {
          console.log("Linked Wallets:");
          profileData?.linkedWallets?.edges?.forEach((link: any) => {
            console.log(`- ${link?.node?.walletType}: ${link?.node?.walletAddress}`);
          });
        }
        
        // Access Creator Coin if available
        if (profileData?.creatorCoin) {
          console.log("Creator Coin:");
          console.log("- Address:", profileData.creatorCoin.address);
          console.log("- Market Cap:", profileData.creatorCoin.marketCap);
          console.log("- 24h Market Cap Change:", profileData.creatorCoin.marketCapDelta24h);
        }

        // Guardar en caché
        profileCache.set(creatorAddress, profileData);
        setProfile(profileData);
      } else {
        console.log("Profile not found or user has not set up a profile");
        setError("Profile not found");
      }
      
    } catch (err) {
      console.error('❌ Error loading creator profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  }, [creatorAddress]);

  return {
    profile,
    isLoading,
    error,
    loadProfile
  };
}
