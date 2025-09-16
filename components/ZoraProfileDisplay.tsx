"use client";

import { useState } from "react";
import Image from "next/image";
import { useAccount } from "wagmi";
import { useZoraProfile } from "@/hooks/use-zora-profile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Zap,
  Coins,
  TrendingUp,
  TrendingDown,
  Minus
} from "lucide-react";

interface ZoraProfileDisplayProps {
  className?: string;
}

export function ZoraProfileDisplay({ className = "" }: ZoraProfileDisplayProps) {
  const { address: walletAddress, isConnected } = useAccount();
  const { profile, isLoading, error, refetch } = useZoraProfile(walletAddress);
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

  const formatNumber = (num: string | undefined) => {
    if (!num) return "N/A";
    const value = parseFloat(num);
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  };

  const formatMarketCapChange = (change: string | undefined) => {
    if (!change) return null;
    const value = parseFloat(change);
    if (value > 0) return { value: `+${value.toFixed(2)}%`, icon: TrendingUp, color: "text-green-600" };
    if (value < 0) return { value: `${value.toFixed(2)}%`, icon: TrendingDown, color: "text-red-600" };
    return { value: "0%", icon: Minus, color: "text-gray-600" };
  };

  if (!isConnected || !walletAddress) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Wallet Desconectada</h2>
          <p className="text-gray-600">Conecta tu wallet para ver tu perfil de Zora</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="py-8 text-center">
            <Loader2 className="w-8 h-8 text-purple-600 mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-bold mb-2">Cargando Perfil de Zora</h2>
            <p className="text-gray-600">Obteniendo información de tu perfil...</p>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-8 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={refetch} variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reintentar
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Profile Data */}
      {profile && (
        <div className="space-y-6">
          {/* Profile Header */}
          <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 sm:gap-4">
                  {/* Avatar */}
                  <div className="relative">
                    <Image
                      src={profile.avatar?.medium || '/icon.png'}
                      alt="Zora Profile"
                      className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 sm:border-4 border-purple-200 shadow-lg"
                      width={64}
                      height={64}
                      onError={(e) => {
                        e.currentTarget.src = '/icon.png';
                      }}
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 w-3 h-3 sm:w-5 sm:h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                      <CheckCircle className="w-1.5 h-1.5 sm:w-2 sm:h-2 text-white" />
                    </div>
                  </div>

                  {/* Profile Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                      <div className="flex items-center gap-2">
                        <h1 className="text-lg sm:text-xl font-bold text-purple-900 truncate">
                          {profile.displayName || profile.handle || "Usuario Zora"}
                        </h1>
                        {profile.handle && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(profile.handle!, "handle")}
                            className="h-6 w-6 p-0"
                          >
                            {copiedField === "handle" ? (
                              <CheckCircle className="h-3 w-3 text-green-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {profile.handle && (
                          <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-xs">
                            @{profile.handle}
                          </Badge>
                        )}
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                          <Zap className="w-2 h-2 mr-1" />
                          Zora
                        </Badge>
                      </div>
                    </div>
                    
                    {profile.bio && (
                      <p className="text-xs sm:text-sm text-gray-600 mt-2 line-clamp-2">
                        {profile.bio}
                      </p>
                    )}
                  </div>
                </div>

                {/* Refresh Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refetch}
                  disabled={isLoading}
                  className="h-8 w-8 sm:h-10 sm:w-auto p-0 sm:px-3 flex-shrink-0"
                >
                  <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline ml-2 text-xs sm:text-sm">Actualizar</span>
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Profile Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Basic Info */}
            <Card>
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <User className="w-4 h-4 sm:w-5 sm:h-5" />
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0 space-y-3">
                {profile.website && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                      <span className="text-xs sm:text-sm text-gray-600">Website</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(profile.website, '_blank')}
                      className="h-6 text-xs"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Visitar
                    </Button>
                  </div>
                )}

                {profile.publicWallet?.walletAddress && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                      <span className="text-xs sm:text-sm text-gray-600">Wallet Pública</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-mono text-gray-900">
                        {formatAddress(profile.publicWallet.walletAddress)}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(profile.publicWallet!.walletAddress!, "publicWallet")}
                        className="h-5 w-5 sm:h-6 sm:w-6 p-0"
                      >
                        {copiedField === "publicWallet" ? (
                          <CheckCircle className="h-2 w-2 sm:h-3 sm:w-3 text-green-600" />
                        ) : (
                          <Copy className="h-2 w-2 sm:h-3 sm:w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Creator Coin */}
            {profile.creatorCoin && (
              <Card>
                <CardHeader className="p-3 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                    <Coins className="w-4 h-4 sm:w-5 sm:h-5" />
                    Creator Coin
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-6 pt-0 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Coins className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600" />
                      <span className="text-xs sm:text-sm text-gray-600">Market Cap</span>
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-gray-900">
                      ${formatNumber(profile.creatorCoin.marketCap)}
                    </span>
                  </div>

                  {profile.creatorCoin.marketCapDelta24h && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                        <span className="text-xs sm:text-sm text-gray-600">24h Change</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {(() => {
                          const change = formatMarketCapChange(profile.creatorCoin.marketCapDelta24h);
                          if (change) {
                            const IconComponent = change.icon;
                            return (
                              <>
                                <IconComponent className={`w-3 h-3 sm:w-4 sm:h-4 ${change.color}`} />
                                <span className={`text-xs sm:text-sm font-bold ${change.color}`}>
                                  {change.value}
                                </span>
                              </>
                            );
                          }
                          return <span className="text-xs sm:text-sm text-gray-600">N/A</span>;
                        })()}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Hash className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
                      <span className="text-xs sm:text-sm text-gray-600">Address</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-mono text-gray-900">
                        {formatAddress(profile.creatorCoin.address!)}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(profile.creatorCoin!.address!, "creatorCoin")}
                        className="h-5 w-5 sm:h-6 sm:w-6 p-0"
                      >
                        {copiedField === "creatorCoin" ? (
                          <CheckCircle className="h-2 w-2 sm:h-3 sm:w-3 text-green-600" />
                        ) : (
                          <Copy className="h-2 w-2 sm:h-3 sm:w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Social Accounts */}
          {profile.socialAccounts && Object.keys(profile.socialAccounts).length > 0 && (
            <Card>
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
                  Cuentas Sociales
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0">
                <div className="flex flex-wrap gap-2">
                  {profile.socialAccounts.farcaster && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs"
                    >
                      <Zap className="w-3 h-3 mr-1" />
                      Farcaster: {profile.socialAccounts.farcaster.username}
                    </Button>
                  )}
                  {profile.socialAccounts.twitter && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs"
                    >
                      <Twitter className="w-3 h-3 mr-1" />
                      Twitter: {profile.socialAccounts.twitter.username}
                    </Button>
                  )}
                  {profile.socialAccounts.instagram && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs"
                    >
                      Instagram: {profile.socialAccounts.instagram.username}
                    </Button>
                  )}
                  {profile.socialAccounts.tiktok && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs"
                    >
                      TikTok: {profile.socialAccounts.tiktok.username}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Linked Wallets */}
          {profile.linkedWallets?.edges && profile.linkedWallets.edges.length > 0 && (
            <Card>
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
                  Wallets Conectadas
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0">
                <div className="space-y-2">
                  {profile.linkedWallets.edges.map((edge, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="text-xs font-mono text-gray-900 break-all">
                          {formatAddress(edge.node?.walletAddress || "")}
                        </p>
                        <p className="text-xs text-gray-500">{edge.node?.walletType}</p>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(edge.node?.walletAddress || "", `wallet-${index}`)}
                          className="h-6 w-6 p-0"
                        >
                          {copiedField === `wallet-${index}` ? (
                            <CheckCircle className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`https://basescan.org/address/${edge.node?.walletAddress}`, '_blank')}
                          className="h-6 w-6 p-0"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* No Profile */}
      {!isLoading && !error && !profile && (
        <Card>
          <CardContent className="py-8 text-center">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Sin Perfil de Zora</h2>
            <p className="text-gray-600">Esta wallet no tiene un perfil configurado en Zora</p>
            <p className="text-xs text-gray-500 mt-2">Visita zora.co para crear tu perfil</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
