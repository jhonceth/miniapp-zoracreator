"use client";

import { useState } from "react";
import Image from "next/image";
import { useUser } from "@/contexts/user-context";
import { useAccount } from "wagmi";
import { useWeb3BioProfile } from "@/hooks/use-web3-bio-profile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Copy, 
  ExternalLink, 
  User, 
  Hash, 
  Wallet, 
  CheckCircle,
  RefreshCw,
  Loader2,
  MapPin,
  Calendar,
  Users,
  MessageCircle,
  Twitter,
  Globe,
  Zap
} from "lucide-react";

interface EnhancedUserProfileProps {
  className?: string;
}

export function EnhancedUserProfile({ className = "" }: EnhancedUserProfileProps) {
  const { user } = useUser();
  const { address: walletAddress, isConnected } = useAccount();
  const { profile: web3BioProfile, isLoading: isLoadingBio, error: bioError, refetch } = useWeb3BioProfile(walletAddress);
  const [copiedField, setCopiedField] = useState<string | null>(null);

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

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatNumber = (num: number | undefined) => {
    if (num === undefined || num === null) return "N/A";
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // No mostrar si no hay usuario autenticado
  if (!user?.data) {
    return null;
  }

  // Usar solo datos del contexto de Farcaster (sin web3.bio)
  const farcasterData = user.data;
  
  // Usar solo datos de Farcaster del contexto
  const primaryDisplayName = farcasterData.display_name || 
                            farcasterData.username || 
                            `Usuario ${farcasterData.fid}`;

  const primaryUsername = farcasterData.username || 
                         `user${farcasterData.fid}`;

  const primaryAvatar = farcasterData.pfp_url || 
                       '/icon.png';

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Profile Header */}
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Avatar */}
              <div className="relative">
                <Image
                  src={primaryAvatar}
                  alt="Profile"
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 sm:border-4 border-purple-200 shadow-lg"
                  width={64}
                  height={64}
                  onError={(e) => {
                    e.currentTarget.src = '/default-avatar.png';
                  }}
                />
                <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 w-3 h-3 sm:w-5 sm:h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <CheckCircle className="w-1.5 h-1.5 sm:w-2 sm:h-2 text-white" />
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <h1 className="text-lg sm:text-xl font-bold text-purple-900 truncate">
                    {primaryDisplayName}
                  </h1>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-xs">
                          @{primaryUsername}
                        </Badge>
                      </div>
                    </div>
              </div>
            </div>

            {/* Refresh Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={refetch}
              disabled={isLoadingBio}
              className="h-8 w-8 sm:h-10 sm:w-auto p-0 sm:px-3 flex-shrink-0"
            >
              <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${isLoadingBio ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline ml-2 text-xs sm:text-sm">Actualizar</span>
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Basic Info - Solo FID */}
      <Card>
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
            <User className="w-4 h-4 sm:w-5 sm:h-5" />
            Información Básica
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Hash className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
              <span className="text-xs sm:text-sm text-gray-600">FID</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-mono text-gray-900">{farcasterData.fid}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(farcasterData.fid.toString(), "fid")}
                className="h-5 w-5 sm:h-6 sm:w-6 p-0"
              >
                {copiedField === "fid" ? (
                  <CheckCircle className="h-2 w-2 sm:h-3 sm:w-3 text-green-600" />
                ) : (
                  <Copy className="h-2 w-2 sm:h-3 sm:w-3" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wallet Info */}
      {isConnected && walletAddress && (
        <Card>
          <CardHeader className="p-3 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
              Wallet Conectada
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="text-xs font-mono text-gray-900 break-all">
                  {formatAddress(walletAddress)}
                </p>
                <p className="text-xs text-gray-500">Base Network</p>
              </div>
              <div className="flex items-center gap-1 ml-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(walletAddress, "wallet")}
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
                  onClick={() => window.open(`https://basescan.org/address/${walletAddress}`, '_blank')}
                  className="h-6 w-6 p-0"
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
}
