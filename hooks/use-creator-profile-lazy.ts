import { useState, useEffect, useCallback } from 'react';
import { getProfile, getProfileCoins } from "@zoralabs/coins-sdk";

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
    totalVolume?: string;
    volume24h?: string;
  };
  createdCoins?: {
    count: number;
    edges: Array<{
      node: {
        id: string;
        name: string;
        description: string;
        address: string;
        symbol: string;
        totalSupply: string;
        totalVolume: string;
        volume24h: string;
        createdAt?: string;
        creatorAddress?: string;
        poolCurrencyToken?: {
          address?: string;
          name?: string;
          decimals?: number;
        };
        tokenPrice?: {
          priceInUsdc?: string;
          currencyAddress: string;
          priceInPoolToken: string;
        };
        marketCap: string;
        marketCapDelta24h: string;
        chainId: number;
        tokenUri?: string;
        platformReferrerAddress?: string;
        payoutRecipientAddress?: string;
        creatorProfile?: {
          id: string;
          handle: string;
          avatar?: {
            previewImage: {
              blurhash?: string;
              medium: string;
              small: string;
            };
          };
          socialAccounts: {
            instagram?: {
              username?: string;
              displayName?: string;
              id?: string;
            };
            tiktok?: {
              username?: string;
              displayName?: string;
              id?: string;
            };
            twitter?: {
              username?: string;
              displayName?: string;
              id?: string;
            };
            farcaster?: {
              username?: string;
              displayName?: string;
              id?: string;
            };
          };
        };
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
        uniqueHolders?: number;
      };
    }>;
    pageInfo?: {
      hasNextPage?: boolean;
      endCursor?: string;
    };
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
      console.log('🔍 Creator address type:', typeof creatorAddress);
      console.log('🔍 Creator address length:', creatorAddress.length);
      
      // Usar ambas APIs de Zora para obtener datos completos
      const [profileResponse, coinsResponse] = await Promise.all([
        getProfile({
          identifier: creatorAddress,
        }),
        getProfileCoins({
          identifier: creatorAddress,
          count: 50, // Obtener más tokens por página
          chainIds: [8453], // Solo Base Mainnet por ahora
        })
      ]);
      
      // Combinar datos de ambas APIs
      const profileData: CreatorProfile | undefined = profileResponse?.data?.profile;
      const createdCoinsData = coinsResponse?.data?.profile?.createdCoins;
      
      // Debug: Log the full response to see what fields are available
      console.log('🔍 Profile API Response:', JSON.stringify(profileResponse, null, 2));
      console.log('🔍 Coins API Response:', JSON.stringify(coinsResponse, null, 2));
      console.log('🔍 Profile Data:', JSON.stringify(profileData, null, 2));
      console.log('🔍 Created Coins Data:', JSON.stringify(createdCoinsData, null, 2));
      
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
          console.log("- Total Volume:", (profileData.creatorCoin as any)?.totalVolume);
          console.log("- Volume 24h:", (profileData.creatorCoin as any)?.volume24h);
          console.log("- Full Creator Coin Object:", JSON.stringify(profileData.creatorCoin, null, 2));
        } else {
          console.log("❌ No Creator Coin found in profile data");
        }
        
        // Combinar datos del perfil con los tokens creados
        const combinedProfile = {
          ...profileData,
          createdCoins: createdCoinsData
        };
        
        console.log("Combined Profile with Created Coins:");
        console.log("- Created Coins Count:", createdCoinsData?.count || 0);
        console.log("- Created Coins Edges Length:", createdCoinsData?.edges?.length || 0);
        if (createdCoinsData?.edges && createdCoinsData.edges.length > 0) {
          console.log("- First Coin:", JSON.stringify(createdCoinsData.edges[0], null, 2));
        }

        // Guardar en caché
        profileCache.set(creatorAddress, combinedProfile);
        setProfile(combinedProfile);
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
