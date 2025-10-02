"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useProfileCoins } from "@/hooks/use-profile-coins";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { BottomNavigation } from "@/components/BottomNavigation";
import { 
  Copy, 
  ExternalLink, 
  CheckCircle,
  RefreshCw,
  Loader2,
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  Zap,
  Grid3X3,
  List,
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  BarChart3
} from "lucide-react";

export default function MyCoinsPage() {
  const [referrer, setReferrer] = useState<string>("");

  useEffect(() => {
    fetch("/api/env/referrer")
      .then((res) => res.json())
      .then((data) => setReferrer(data.referrer || ""))
      .catch(() => setReferrer(""));
  }, []);
  const { address, isConnected } = useAccount();
  const { createdCoins: coins, isLoading, error, refetch } = useProfileCoins();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const tokensPerPage = 10;

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

  const openInDexScreener = (address: string) => {
    window.open(`https://dexscreener.com/base/${address}`, '_blank');
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatNumber = (num: number | string | undefined) => {
    if (num === undefined || num === null) return "0.00";
    const numVal = parseFloat(num.toString());
    if (isNaN(numVal)) return "0.00";
    if (numVal >= 1000000) return `${(numVal / 1000000).toFixed(1)}M`;
    if (numVal >= 1000) return `${(numVal / 1000).toFixed(1)}K`;
    return numVal.toFixed(2);
  };

  // Filtrar y ordenar tokens
  const filteredAndSortedCoins = coins ? (() => {
    let filtered = coins.filter(coin => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        coin.name?.toLowerCase().includes(searchLower) ||
        coin.symbol?.toLowerCase().includes(searchLower) ||
        coin.address?.toLowerCase().includes(searchLower)
      );
    });

    // Ordenar por fecha de creación
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  })() : [];

  // Paginación
  const totalPages = Math.ceil(filteredAndSortedCoins.length / tokensPerPage);
  const startIndex = (currentPage - 1) * tokensPerPage;
  const endIndex = startIndex + tokensPerPage;
  const paginatedCoins = filteredAndSortedCoins.slice(startIndex, endIndex);

  // Resetear página cuando cambie el filtro o ordenamiento
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleSortChange = (order: 'newest' | 'oldest') => {
    setSortOrder(order);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0F1C] to-[#101A2D] pb-20">
      {/* Header */}
      <div className="bg-card-dark border-b border-card-dark px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-primary">My Coins</h1>
              <p className="text-sm text-secondary">Tokens created by you</p>
            </div>
            <div className="flex items-center gap-2">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-card-dark rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={`h-8 w-8 p-0 ${viewMode === 'grid' ? 'bg-accent-blue shadow-sm' : ''}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={`h-8 w-8 p-0 ${viewMode === 'list' ? 'bg-accent-blue shadow-sm' : ''}`}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={refetch}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </div>

          {/* Search and Sort Controls */}
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary w-4 h-4" />
              <Input
                type="text"
                placeholder="Search by name, symbol or address..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-secondary" />
              <select
                value={sortOrder}
                onChange={(e) => handleSortChange(e.target.value as 'newest' | 'oldest')}
                className="px-3 py-2 border border-card-dark rounded-md text-sm bg-card-dark text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent"
              >
                <option value="newest">Most Recent</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-accent-blue" />
              <span className="text-secondary">Loading your coins...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-price-negative/10 border border-price-negative/20 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-price-negative rounded-full"></div>
              <span className="text-price-negative font-medium">Error</span>
            </div>
            <p className="text-price-negative text-sm mt-1">{error}</p>
          </div>
        )}

        {/* No Coins State */}
        {!isLoading && !error && (!coins || coins.length === 0) && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-card-dark rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-secondary" />
            </div>
            <h3 className="text-lg font-medium text-primary mb-2">No coins created</h3>
            <p className="text-secondary mb-4">
              {isConnected ? 
                `No tokens found for address ${address?.substring(0, 6)}...${address?.substring(address.length - 4)}` :
                "Connect your wallet to see your created tokens"
              }
            </p>
            <div className="space-y-2">
              <Link href="/launch">
                <Button className="bg-gradient-to-r from-accent-blue to-accent-blue/80 text-primary">
                  Create My First Token
                </Button>
              </Link>
              {isConnected && (
                <div className="text-xs text-secondary">
                  <p>Debug: Address = {address}</p>
                  <p>Debug: IsConnected = {isConnected.toString()}</p>
                  <p>Debug: Coins = {coins?.length || 0}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* No Search Results */}
        {!isLoading && !error && coins && coins.length > 0 && filteredAndSortedCoins.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-card-dark rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-secondary" />
            </div>
            <h3 className="text-lg font-medium text-primary mb-2">No results found</h3>
            <p className="text-secondary mb-4">
              No tokens match &quot;{searchTerm}&quot;
            </p>
            <Button
              variant="outline"
              onClick={() => handleSearchChange('')}
              className="text-accent-blue border-accent-blue/20 hover:bg-accent-blue/5"
            >
              Clear search
            </Button>
          </div>
        )}

        {/* Coins Grid */}
        {!isLoading && !error && coins && coins.length > 0 && (
          <>
            {/* Stats Summary */}
            <div className="bg-card-dark rounded-lg border border-card-dark p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-accent-blue" />
                  <span className="font-medium text-primary">Summary</span>
                  {searchTerm && (
                    <Badge className="bg-accent-blue/20 text-accent-blue border-accent-blue/30 text-xs">
                      Filtered: &quot;{searchTerm}&quot;
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-accent-blue/20 text-accent-blue border-accent-blue/30">
                    {filteredAndSortedCoins.length} of {coins.length} tokens
                  </Badge>
                  {totalPages > 1 && (
                    <Badge className="bg-card-dark text-secondary border-card-dark text-xs">
                      Page {currentPage} of {totalPages}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Coins List */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedCoins.map((coin) => (
                  <Card 
                    key={coin.address} 
                    className="hover:shadow-lg transition-shadow duration-200 cursor-pointer bg-card-dark border-card-dark hover:bg-card-dark/80 hover:scale-[1.02] hover:shadow-xl hover:border-accent-blue/30"
                    onClick={() => window.location.href = `/token/${coin.address}?from=/my-coins`}
                  >
                      <CardHeader className="p-4">
                        <div className="flex items-start gap-3">
                          {/* Token Avatar */}
                          <div className="relative">
                            {(() => {
                              // Access token image if available, ensuring a string for Next/Image
                              const preview: any = coin.mediaContent?.previewImage as any;
                              const tokenImage: string | undefined =
                                typeof preview === 'string'
                                  ? preview
                                  : (preview?.medium || preview?.small);

                              console.log(`🖼️ Token Image for ${coin.name}:`, tokenImage);

                              if (tokenImage) {
                                return (
                                  <Image
                                    src={tokenImage}
                                    alt={coin.name || 'Token'}
                                    className="w-12 h-12 rounded-full border-2 border-accent-blue/20 object-cover"
                                    width={48}
                                    height={48}
                                    onError={(e) => {
                                      console.log(`❌ Error loading token image for ${coin.name}, falling back to icon.png`);
                                      e.currentTarget.src = '/icon.png';
                                    }}
                                  />
                                );
                              } else {
                                console.log(`⚠️ No token image found for ${coin.name}, using fallback`);
                                return (
                                  <div className="w-12 h-12 rounded-full border-2 border-accent-blue/20 bg-gradient-to-r from-accent-blue/60 to-accent-blue/40 flex items-center justify-center">
                                    <Zap className="w-6 h-6 text-primary" />
                                  </div>
                                );
                              }
                            })()}
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-price-positive rounded-full border-2 border-card-dark flex items-center justify-center">
                              <CheckCircle className="w-2 h-2 text-primary" />
                            </div>
                          </div>

                          {/* Token Info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-primary truncate">
                              {coin.name || 'Sin nombre'}
                            </h3>
                            <p className="text-sm text-secondary truncate">
                              ${coin.symbol || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="p-4 pt-0">
                        {/* Stats */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3 text-price-positive" />
                              <span className="text-secondary">Market Cap</span>
                            </div>
                            <span className="font-medium text-primary">
                              ${formatNumber(coin.marketCap)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3 text-accent-blue" />
                              <span className="text-secondary">Holders</span>
                            </div>
                            <span className="font-medium text-primary">
                              {formatNumber(coin.uniqueHolders)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3 text-accent-blue" />
                              <span className="text-secondary">24h Volume</span>
                            </div>
                            <span className="font-medium text-primary">
                              ${formatNumber(coin.volume24h)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-secondary" />
                              <span className="text-secondary">Created</span>
                            </div>
                            <span className="font-medium text-primary">
                              {formatDate(coin.createdAt)}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-card-dark">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(coin.address || '', `token-${coin.address}`);
                              }}
                              className="h-6 w-6 p-0"
                            >
                              {copiedField === `token-${coin.address}` ? (
                                <CheckCircle className="h-3 w-3 text-price-positive" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                            <a
                              href={`https://basescan.org/address/${coin.address}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center justify-center h-6 w-6 rounded border border-card-dark bg-white/90 hover:bg-white"
                              title="View on BaseScan"
                            >
                              <Image src="/bscan.png" alt="BaseScan" width={14} height={14} className="rounded" />
                            </a>
                            <a
                              href={`https://dexscreener.com/base/${coin.address}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center justify-center h-6 w-6 rounded border border-accent-blue/20 bg-white/90 hover:bg-white"
                              title="View on DexScreener"
                            >
                              <Image src="/dexs.ico" alt="DexScreener" width={14} height={14} className="rounded-full" />
                            </a>
                            <a
                              href={`${`https://zora.co/coin/base:${coin.address}`}${referrer ? `?referrer=${encodeURIComponent(referrer)}` : ''}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center justify-center h-6 w-6 rounded border border-accent-blue/20 bg-white/90 hover:bg-white"
                              title="View on Zora"
                            >
                              <Image src="/icozora.png" alt="Zora" width={14} height={14} className="rounded" />
                            </a>
                            <a
                              href={`https://www.zbase.fun/token/${coin.address}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center justify-center h-6 w-6 rounded border border-accent-blue/20 bg-white/90 hover:bg-white"
                              title="View on ZBase Analytics"
                            >
                              <img src="/icom.png" alt="ZBase" className="w-3.5 h-3.5" />
                            </a>
                          </div>
                          <Badge className="bg-accent-blue/20 text-accent-blue border-accent-blue/30 text-xs">
                            View Details
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {paginatedCoins.map((coin) => (
                  <Card 
                    key={coin.address} 
                    className="hover:shadow-md transition-shadow duration-200 cursor-pointer bg-card-dark border-card-dark hover:bg-card-dark/80 hover:scale-[1.01] hover:shadow-xl hover:border-accent-blue/30"
                    onClick={() => window.location.href = `/token/${coin.address}?from=/my-coins`}
                  >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          {/* Token Avatar */}
                          <div className="relative flex-shrink-0">
                            {(() => {
                              const preview: any = coin.mediaContent?.previewImage as any;
                              const tokenImage: string | undefined =
                                typeof preview === 'string'
                                  ? preview
                                  : (preview?.medium || preview?.small);

                              if (tokenImage) {
                                return (
                                  <Image
                                    src={tokenImage}
                                    alt={coin.name || 'Token'}
                                    className="w-10 h-10 rounded-full border-2 border-accent-blue/20 object-cover"
                                    width={40}
                                    height={40}
                                    onError={(e) => {
                                      e.currentTarget.src = '/icon.png';
                                    }}
                                  />
                                );
                              } else {
                                return (
                                  <div className="w-10 h-10 rounded-full border-2 border-accent-blue/20 bg-gradient-to-r from-accent-blue/60 to-accent-blue/40 flex items-center justify-center">
                                    <Zap className="w-5 h-5 text-primary" />
                                  </div>
                                );
                              }
                            })()}
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-price-positive rounded-full border-2 border-card-dark flex items-center justify-center">
                              <CheckCircle className="w-1.5 h-1.5 text-primary" />
                            </div>
                          </div>

                          {/* Token Info with two-line layout */}
                          <div className="flex-1 min-w-0">
                            {/* First line: name left, ticker right */}
                            <div className="flex items-center justify-between gap-3">
                              <h3 className="font-semibold text-primary truncate">
                                {coin.name || 'Sin nombre'}
                              </h3>
                              <span className="text-sm text-secondary flex-shrink-0">${coin.symbol || 'N/A'}</span>
                            </div>
                            {/* Second line: link icons */}
                            <div className="mt-2 flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyToClipboard(coin.address || '', `token-${coin.address}`);
                                }}
                                className="h-6 w-6 p-0"
                                title="Copy Address"
                              >
                                {copiedField === `token-${coin.address}` ? (
                                  <CheckCircle className="h-3 w-3 text-price-positive" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </Button>
                              <a
                                href={`https://basescan.org/address/${coin.address}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center justify-center h-6 w-6 rounded border border-card-dark bg-white/90 hover:bg-white"
                                title="View on BaseScan"
                              >
                                <Image src="/bscan.png" alt="BaseScan" width={12} height={12} className="rounded" />
                              </a>
                              <a
                                href={`https://dexscreener.com/base/${coin.address}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center justify-center h-6 w-6 rounded border border-accent-blue/20 bg-white/90 hover:bg-white"
                                title="View on DexScreener"
                              >
                                <Image src="/dexs.ico" alt="DexScreener" width={12} height={12} className="rounded-full" />
                              </a>
                              <a
                                href={`${`https://zora.co/coin/base:${coin.address}`}${referrer ? `?referrer=${encodeURIComponent(referrer)}` : ''}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center justify-center h-6 w-6 rounded border border-accent-blue/20 bg-white/90 hover:bg-white"
                                title="View on Zora"
                              >
                                <Image src="/icozora.png" alt="Zora" width={12} height={12} className="rounded" />
                              </a>
                              <a
                                href={`https://www.zbase.fun/token/${coin.address}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center justify-center h-6 w-6 rounded border border-accent-blue/20 bg-white/90 hover:bg-white"
                                title="View on ZBase Analytics"
                              >
                                <img src="/icom.png" alt="ZBase" className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Previous</span>
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 p-0 ${currentPage === pageNum ? 'bg-accent-blue text-primary' : ''}`}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}