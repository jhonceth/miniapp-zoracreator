"use client";

import { useState } from "react";
import { useUnifiedWallet } from "@/hooks/use-unified-wallet";
import { useProfileCoins } from "@/hooks/use-profile-coins";
import { UserMenu } from "@/components/UserMenu";
import { BottomNavigation } from "@/components/BottomNavigation";
import { ZoraProfileDisplay } from "@/components/ZoraProfileDisplay";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  RefreshCw,
  Loader2,
  Wallet,
  Zap,
  Hash,
  CheckCircle,
  Copy,
  ExternalLink,
  ImageIcon,
  DollarSign,
  Activity,
  Users,
  TrendingUp,
  Calendar,
} from "lucide-react";

export default function ProfilePage() {
  const { address: userAddress, isConnected, isLoading: walletLoading, addressSource } = useUnifiedWallet();
  const { createdCoins, profileData, isLoading, error, refetch } = useProfileCoins();
  const coinsCount = createdCoins.length;

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const formatNumber = (value: string | number | undefined) => {
    if (value === undefined || value === null) return "N/A";
    const num = parseFloat(value.toString());
    if (isNaN(num)) return "N/A";
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(2);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

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

  const openInExplorer = (address: string) => {
    window.open(`https://basescan.org/token/${address}`, '_blank');
  };


  return (
    <div className="bg-gradient-to-br from-[#0A0F1C] to-[#101A2D] text-primary min-h-screen pb-20">
      {/* Top Navigation Bar */}
      <div className="max-w-4xl mx-auto mb-4 sm:mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/">
              <Button variant="outline" size="sm" className="h-8 px-2 sm:px-3 border-accent-blue/20 bg-card-dark text-primary hover:bg-accent-blue/5">
                <ArrowLeft className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Back</span>
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-accent-blue to-accent-blue/80 rounded-lg flex items-center justify-center">
                <Zap className="w-3 h-3 sm:w-5 sm:h-5 text-primary" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-primary">
                My Profile
              </span>
            </div>
          </div>
          
          {/* User Menu */}
          <UserMenu />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 space-y-6">
        {/* Zora Profile */}
        <ZoraProfileDisplay />

        {/* Loading State */}
        {isLoading && (
          <Card className="bg-card-dark border-card-dark">
            <CardContent className="py-6 sm:py-8">
              <div className="text-center">
                <RefreshCw className="w-6 h-6 sm:w-8 sm:h-8 text-accent-blue mx-auto mb-3 sm:mb-4 animate-spin" />
                <p className="text-sm sm:text-base text-secondary">Loading tokens...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card className="border-price-negative/20 bg-price-negative/10">
            <CardContent className="py-6 sm:py-8">
              <div className="text-center">
                <p className="text-sm sm:text-base text-price-negative mb-4">Error loading tokens: {error}</p>
                <Button onClick={refetch} variant="outline" className="border-price-negative/20 text-price-negative hover:bg-price-negative/5 h-8 sm:h-10">
                  <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  <span className="text-xs sm:text-sm">Retry</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Tokens State */}
        {!isLoading && !error && coinsCount === 0 && (
          <Card className="bg-card-dark border-card-dark">
            <CardContent className="py-8 sm:py-12">
              <div className="text-center">
                <Zap className="w-12 h-12 sm:w-16 sm:h-16 text-secondary mx-auto mb-3 sm:mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-primary mb-2">You haven&apos;t created any tokens</h3>
                <p className="text-sm sm:text-base text-secondary mb-4 sm:mb-6">It looks like you haven&apos;t created any Zora tokens yet. Time to get started!</p>
                <Link href="/launch">
                  <Button className="bg-gradient-to-r from-accent-blue to-accent-blue/80 hover:from-accent-blue/90 hover:to-accent-blue/70 text-white h-8 sm:h-10">
                    <Zap className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    <span className="text-xs sm:text-sm">Create my first token</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Created Tokens List */}
        {!isLoading && !error && coinsCount > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-semibold text-primary">Created Tokens</h2>
              <Badge className="bg-accent-blue/20 text-accent-blue border-accent-blue/30 text-xs">
                {coinsCount} token{coinsCount !== 1 ? 's' : ''}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {createdCoins.map((coin, index) => {
                console.log(`🔍 Token ${index + 1} (${coin.name || 'Unnamed'}):`, {
                  hasMediaContent: !!coin.mediaContent,
                  hasPreviewImage: !!coin.mediaContent?.previewImage,
                  hasMedium: !!coin.mediaContent?.previewImage?.medium,
                  hasSmall: !!coin.mediaContent?.previewImage?.small,
                  mediumUrl: coin.mediaContent?.previewImage?.medium,
                  smallUrl: coin.mediaContent?.previewImage?.small,
                  originalUri: coin.mediaContent?.originalUri,
                  mimeType: coin.mediaContent?.mimeType
                });

                return (
                  <Link key={coin.id || index} href={`/token/${coin.address}?from=/profile`}>
                    <Card className="bg-card-dark border-card-dark hover:shadow-lg transition-shadow duration-200 cursor-pointer hover:scale-[1.01] sm:hover:scale-[1.02] transition-transform hover:bg-card-dark/80 hover:border-accent-blue/30">
                    <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                          {/* Token Image */}
                          <div className="relative flex-shrink-0">
                            {coin.mediaContent?.previewImage?.medium ? (
                              <Image
                                src={coin.mediaContent.previewImage.medium}
                                alt={coin.name || "Token"}
                                className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg border border-card-dark object-cover"
                                width={48}
                                height={48}
                              />
                            ) : coin.mediaContent?.previewImage?.small ? (
                              <Image
                                src={coin.mediaContent.previewImage.small}
                                alt={coin.name || "Token"}
                                className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg border border-card-dark object-cover"
                                width={48}
                                height={48}
                              />
                            ) : (
                              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg border border-card-dark bg-gradient-to-r from-accent-blue/60 to-accent-blue/40 flex items-center justify-center">
                                  <ImageIcon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                              </div>
                            )}
                          </div>

                          {/* Token Info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-primary text-sm sm:text-base truncate">
                              {coin.name || "Unnamed"}
                            </h3>
                            <p className="text-xs sm:text-sm text-secondary">${coin.symbol || "N/A"}</p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(coin.address || "", `token-${index}`);
                            }}
                            className="h-7 w-7 sm:h-8 sm:w-8 p-0 border-card-dark bg-white/90 hover:bg-white"
                          >
                            {copiedField === `token-${index}` ? (
                              <CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-price-positive" />
                            ) : (
                              <Copy className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              openInExplorer(coin.address || "");
                            }}
                            className="h-7 w-7 sm:h-8 sm:w-8 p-0 border-card-dark bg-white/90 hover:bg-white"
                          >
                            <ExternalLink className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 p-3 sm:p-6 grid grid-cols-2 gap-2 text-xs sm:text-sm">
                      <div className="flex items-center gap-1 text-primary">
                        <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-price-positive" />
                        <span>Market Cap: {formatNumber(coin.marketCap)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-primary">
                        <Users className="w-3 h-3 sm:w-4 sm:h-4 text-accent-blue" />
                        <span>Holders: {formatNumber(coin.uniqueHolders)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-primary">
                        <Activity className="w-3 h-3 sm:w-4 sm:h-4 text-accent-blue" />
                        <span>Volume 24h: {formatNumber(coin.volume24h)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-primary">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-accent-blue" />
                        <span>Created: {formatDate(coin.createdAt)}</span>
                      </div>
                    </CardContent>
                  </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
      
      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}