"use client";

import { useState } from "react";
import Image from "next/image";
import { useUser } from "@/contexts/user-context";
import { useAccount } from "wagmi";
import { useWeb3BioProfile } from "@/hooks/use-web3-bio-profile";
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
  Globe
} from "lucide-react";
import Link from "next/link";

interface UserMenuProps {
  className?: string;
}

export function UserMenu({ className = "" }: UserMenuProps) {
  const { user, signOut } = useUser();
  const { address, isConnected } = useAccount();
  const { profile: web3BioProfile } = useWeb3BioProfile(address);
  const [isOpen, setIsOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Debug logging
  console.log("🔍 UserMenu Debug:", {
    user: user?.data,
    isLoading: user?.isLoading,
    error: user?.error,
    isConnected,
    address,
    web3BioProfile
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

  // No mostrar el menú si no hay usuario autenticado
  if (!user?.data) {
    return null;
  }

  // Usar datos del contexto de Farcaster como base
  const userData = user.data;
  
  // Usar datos de web3.bio si están disponibles
  const farcasterProfile = web3BioProfile?.farcaster;
  const ensProfile = web3BioProfile?.ens;
  const ethereumProfile = web3BioProfile?.ethereum;

  // Priorizar datos según la lógica: Farcaster > ENS > Ethereum
  const displayName = farcasterProfile?.displayName || 
                     ensProfile?.displayName || 
                     ethereumProfile?.displayName || 
                     userData.display_name || 
                     userData.username || 
                     `Usuario ${userData.fid}`;

  const username = farcasterProfile?.identity || 
                  ensProfile?.identity || 
                  ethereumProfile?.identity || 
                  userData.username || 
                  `user${userData.fid}`;

  const avatarUrl = farcasterProfile?.avatar || 
                   ensProfile?.avatar || 
                   ethereumProfile?.avatar || 
                   userData.pfp_url || 
                   '/icon.png';

  return (
    <div className={`relative ${className}`}>
      {/* Avatar Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
      >
        <div className="relative">
          <Image
            src={avatarUrl}
            alt="Profile"
            className="w-10 h-10 rounded-full border-2 border-purple-200 shadow-md"
            width={40}
            height={40}
            onError={(e) => {
              // Fallback a icon.png si la imagen falla
              e.currentTarget.src = '/icon.png';
            }}
          />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
            <CheckCircle className="w-2 h-2 text-white" />
          </div>
        </div>
        <ChevronDown 
          className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu Content */}
          <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-20 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <Image
                  src={avatarUrl}
                  alt="Profile"
                  className="w-12 h-12 rounded-full border-2 border-purple-200 shadow-md"
                  width={48}
                  height={48}
                  onError={(e) => {
                    e.currentTarget.src = '/icon.png';
                  }}
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{displayName}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-xs">
                      @{username}
                    </Badge>
                    {farcasterProfile && (
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                        <Zap className="w-2 h-2 mr-1" />
                        Farcaster
                      </Badge>
                    )}
                    {ensProfile && (
                      <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                        <Globe className="w-2 h-2 mr-1" />
                        ENS
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* User Info */}
            <div className="p-4 space-y-4">
              {/* FID */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-gray-700">FID</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-gray-900">{userData.fid}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(userData.fid.toString(), "fid")}
                    className="h-6 w-6 p-0"
                  >
                    {copiedField === "fid" ? (
                      <CheckCircle className="h-3 w-3 text-green-600" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Wallet Address */}
              {isConnected && address && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">Wallet Connected</span>
                    <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                      <CheckCircle className="w-2 h-2 mr-1" />
                      Connected
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="text-xs font-mono text-gray-900 break-all">
                        {formatAddress(address)}
                      </p>
                      <p className="text-xs text-gray-500">Base Network</p>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(address, "wallet")}
                        className="h-6 w-6 p-0"
                      >
                        {copiedField === "wallet" ? (
                          <CheckCircle className="h-3 w-3 text-green-600" />
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
                <div className="text-center py-3 bg-gray-50 rounded-lg">
                  <Wallet className="w-6 h-6 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">No wallet connected</p>
              <p className="text-xs text-gray-500">Connect your wallet to create tokens</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="border-t border-gray-200 p-4 space-y-2">
              <Link href="/profile">
                <Button
                  variant="outline"
                  className="w-full flex items-center gap-2 text-purple-600 border-purple-200 hover:bg-purple-50"
                >
                  <Zap className="w-4 h-4" />
                  View My Complete Profile
                </Button>
              </Link>
              
              <Button
                variant="outline"
                onClick={signOut}
                className="w-full flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
