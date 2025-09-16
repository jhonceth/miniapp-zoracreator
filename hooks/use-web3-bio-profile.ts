"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";

export interface Web3BioProfile {
  address: string;
  identity: string;
  platform: string;
  displayName: string;
  avatar: string | null;
  description: string | null;
  status: string | null;
  createdAt: string | null;
  email: string | null;
  location: string | null;
  header: string | null;
  contenthash: string | null;
  links: {
    farcaster?: {
      link: string;
      handle: string;
      sources: string[];
    };
    twitter?: {
      link: string;
      handle: string;
      sources: string[];
    };
    [key: string]: any;
  };
  social: {
    uid: number | null;
    follower: number;
    following: number;
  };
}

export interface Web3BioResponse {
  farcaster?: Web3BioProfile;
  ethereum?: Web3BioProfile;
  ens?: Web3BioProfile;
  primary?: Web3BioProfile;
}

export function useWeb3BioProfile(address: string | undefined) {
  const [profile, setProfile] = useState<Web3BioResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async (walletAddress: string) => {
    if (!walletAddress) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log("🔍 Obteniendo perfil de web3.bio para:", walletAddress);
      
      const response = await fetch(`https://api.web3.bio/profile/${walletAddress}`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data: Web3BioProfile[] = await response.json();
      console.log("✅ Respuesta de web3.bio:", data);

      // Organizar los perfiles por plataforma
      const organizedProfiles: Web3BioResponse = {};
      
      data.forEach((profile) => {
        switch (profile.platform) {
          case "farcaster":
            organizedProfiles.farcaster = profile;
            break;
          case "ethereum":
            organizedProfiles.ethereum = profile;
            break;
          case "ens":
            organizedProfiles.ens = profile;
            break;
        }
      });

      // Determinar el perfil primario (prioridad: farcaster > ens > ethereum)
      // Si no hay avatar, usar icon.png
      if (organizedProfiles.farcaster) {
        organizedProfiles.primary = organizedProfiles.farcaster;
        // Si el avatar de Farcaster es null, usar icon.png
        if (!organizedProfiles.primary.avatar) {
          organizedProfiles.primary.avatar = '/icon.png';
        }
      } else if (organizedProfiles.ens) {
        organizedProfiles.primary = organizedProfiles.ens;
        // Si el avatar de ENS es null, usar icon.png
        if (!organizedProfiles.primary.avatar) {
          organizedProfiles.primary.avatar = '/icon.png';
        }
      } else if (organizedProfiles.ethereum) {
        organizedProfiles.primary = organizedProfiles.ethereum;
        // Para Ethereum, siempre usar icon.png ya que no tiene avatar
        organizedProfiles.primary.avatar = '/icon.png';
      }

      setProfile(organizedProfiles);
      console.log("📊 Perfiles organizados:", organizedProfiles);

    } catch (err) {
      console.error("❌ Error obteniendo perfil de web3.bio:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (address) {
      fetchProfile(address);
    } else {
      setProfile(null);
      setError(null);
    }
  }, [address]);

  const refetch = () => {
    if (address) {
      fetchProfile(address);
    }
  };

  return {
    profile,
    isLoading,
    error,
    refetch,
    hasProfile: !!profile?.primary,
  };
}
