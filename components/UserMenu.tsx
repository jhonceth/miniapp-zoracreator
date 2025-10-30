"use client";

import { useState } from "react";
import Image from "next/image";
import { useUser } from "@/contexts/user-context";
import { useAccount } from "wagmi";
import { useWeb3BioProfile } from "@/hooks/use-web3-bio-profile";
import { useFarcasterContext } from "@/hooks/use-farcaster-context";
import { useFarcasterPrimaryAddress } from "@/hooks/use-farcaster-primary-address";
import { SignInPrompt } from "@/components/SignInPrompt";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Copy, 
  ExternalLink, 
  User, 
  Hash, 
  Wallet, 
  CheckCircle,
  ChevronDown,
  LogOut,
  Zap,
  Globe,
} from "lucide-react";
import Link from "next/link";

interface UserMenuProps {
  className?: string;
}

export function UserMenu({ className = "" }: UserMenuProps) {
  const { user, signOut } = useUser();
  const { address, isConnected: isWagmiConnected } = useAccount();
  const { profile: web3BioProfile } = useWeb3BioProfile(address);
  
  // Farcaster SDK Context
  const { 
    context: farcasterContext, 
    isLoading: farcasterLoading, 
    error: farcasterError,
    user: farcasterUser,
    location: farcasterLocation,
    client: farcasterClient,
    features: farcasterFeatures
  } = useFarcasterContext();
  
  // Farcaster Primary Address
  const { 
    primaryAddress, 
    isLoading: addressLoading, 
    error: addressError,
    fid 
  } = useFarcasterPrimaryAddress();
  
  
  const [isOpen, setIsOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Debug logging
  console.log("🔍 UserMenu Debug:", {
    user: user?.data,
    isLoading: user?.isLoading,
    error: user?.error,
    isWagmiConnected,
    address,
    web3BioProfile,
    farcasterUser,
    primaryAddress
  });

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error("Error copying to clipboard:", error);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const openInExplorer = (address: string) => {
    window.open(`https://basescan.org/address/${address}`, '_blank');
  };

  // Mostrar el menú siempre, pero con diferentes opciones según el estado de conexión
  const isConnected = !!(user?.data || farcasterUser);

  // Priorizar datos del SDK de Farcaster sobre el contexto de usuario tradicional
  const userData = user?.data;
  
  // Usar datos de web3.bio si están disponibles
  const farcasterProfile = web3BioProfile?.farcaster;
  const ensProfile = web3BioProfile?.ens;
  const ethereumProfile = web3BioProfile?.ethereum;

  // Priorizar datos según la lógica: Farcaster SDK > Farcaster Profile > ENS > Ethereum > User Data
  const displayName = farcasterUser?.displayName ||
                     farcasterProfile?.displayName || 
                     ensProfile?.displayName || 
                     ethereumProfile?.displayName || 
                     userData?.display_name || 
                     userData?.username || 
                     `Usuario ${farcasterUser?.fid || userData?.fid}`;

  const username = farcasterUser?.username ||
                  farcasterProfile?.identity || 
                  ensProfile?.identity || 
                  ethereumProfile?.identity || 
                  userData?.username || 
                  `user${farcasterUser?.fid || userData?.fid}`;

  const avatarUrl = farcasterUser?.pfpUrl ||
                   farcasterProfile?.avatar || 
                   ensProfile?.avatar || 
                   ethereumProfile?.avatar || 
                   userData?.pfp_url || 
                   '/icon.png';

  // Usar FID del SDK de Farcaster si está disponible
  const userFid = farcasterUser?.fid || userData?.fid;

  return (
    <div className={`relative ${className}`}>
      {/* Avatar Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 p-1 rounded-full hover:bg-card-dark/50 transition-colors duration-200"
      >
        <div className="relative">
          <Image
            src={avatarUrl}
            alt="Profile"
            className="w-8 h-8 rounded-full border-2 border-accent-blue/20 shadow-md"
            width={32}
            height={32}
            onError={(e) => {
              // Fallback a icon.png si la imagen falla
              e.currentTarget.src = '/icon.png';
            }}
          />
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-price-positive rounded-full border-2 border-card-dark flex items-center justify-center">
            <CheckCircle className="w-1.5 h-1.5 text-primary" />
          </div>
        </div>
        <ChevronDown 
          className={`w-3 h-3 text-secondary transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-[999998]" style={{zIndex: 999998, position: 'fixed'}} 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu Content */}
          <div className="fixed right-4 top-20 w-80 bg-card-dark rounded-lg shadow-xl border-2 border-white z-[999999] overflow-hidden" style={{zIndex: 999999, position: 'fixed'}}>
            {/* Header */}
            <div className="bg-gradient-to-r from-accent-blue/10 to-accent-blue/5 p-4 border-b border-card-dark">
              <div className="flex items-center gap-3">
                <Image
                  src={avatarUrl}
                  alt="Profile"
                  className="w-12 h-12 rounded-full border-2 border-accent-blue/20 shadow-md"
                  width={48}
                  height={48}
                  onError={(e) => {
                    e.currentTarget.src = '/icon.png';
                  }}
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-primary">{displayName}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className="bg-accent-blue/20 text-accent-blue border-accent-blue/30 text-xs">
                      @{username}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* User Info */}
            <div className="p-4 space-y-4">
              {/* FID */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-accent-blue" />
                  <span className="text-sm font-medium text-secondary">FID</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-primary">{userFid}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(userFid?.toString() || "", "fid")}
                    className="h-6 w-6 p-0"
                  >
                    {copiedField === "fid" ? (
                      <CheckCircle className="h-3 w-3 text-price-positive" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>


              {/* Primary Address from Farcaster API */}
              {primaryAddress && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-accent-blue" />
                    <span className="text-sm font-medium text-secondary">Primary Address</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 bg-card-dark/50 rounded-lg">
                    <div className="flex-1">
                      <p className="text-xs font-mono text-primary break-all">
                        {formatAddress(primaryAddress.address)}
                      </p>
                      <p className="text-xs text-secondary">{primaryAddress.protocol.toUpperCase()}</p>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(primaryAddress.address, "primary-address")}
                        className="h-6 w-6 p-0"
                      >
                        {copiedField === "primary-address" ? (
                          <CheckCircle className="h-3 w-3 text-price-positive" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openInExplorer(primaryAddress.address)}
                        className="h-6 w-6 p-0"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Wallet Address */}
              {isConnected && address && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-accent-blue" />
                    <span className="text-sm font-medium text-secondary">Wallet Connected</span>
                    <Badge className="bg-price-positive/20 text-price-positive border-price-positive/30 text-xs">
                      <CheckCircle className="w-2 h-2 mr-1" />
                      Connected
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 bg-card-dark/50 rounded-lg">
                    <div className="flex-1">
                      <p className="text-xs font-mono text-primary break-all">
                        {formatAddress(address)}
                      </p>
                      <p className="text-xs text-secondary">Base Network</p>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(address, "wallet")}
                        className="h-6 w-6 p-0"
                      >
                        {copiedField === "wallet" ? (
                          <CheckCircle className="h-3 w-3 text-price-positive" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openInExplorer(address)}
                        className="h-6 w-6 p-0"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* No Wallet Connected */}
              {!isConnected && (
                <div className="text-center py-3 bg-card-dark/50 rounded-lg">
                  <Wallet className="w-6 h-6 text-secondary mx-auto mb-2" />
              <p className="text-sm text-secondary">No wallet connected</p>
              <p className="text-xs text-secondary">Connect your wallet to create tokens</p>
                </div>
              )}
            </div>


            {/* Actions */}
            <div className="border-t border-card-dark p-4 space-y-2">
              {isConnected ? (
                <>
                  <Link href="/profile">
                    <Button
                      variant="outline"
                      className="w-full flex items-center gap-2 text-accent-blue border-accent-blue/20 hover:bg-accent-blue/5"
                    >
                      <Zap className="w-4 h-4" />
                      View My Complete Profile
                    </Button>
                  </Link>
                  
                  <Button
                    variant="outline"
                    onClick={signOut}
                    className="w-full flex items-center gap-2 text-price-negative border-price-negative/20 hover:bg-price-negative/5"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <div className="space-y-2">
                  <SignInPrompt />
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
