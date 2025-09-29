"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { getCoin } from "@zoralabs/coins-sdk";
import { UserMenu } from "@/components/UserMenu";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import { env } from "@/lib/env";
import {
  ArrowLeft,
  RefreshCw,
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
  Calendar,
  Settings,
  Link as LinkIcon,
  User,
  Share2,
  Network,
  FileText,
  Edit,
} from "lucide-react";
import { UpdateURIModal } from "@/components/UpdateURIModal";
import { UpdatePayoutRecipientModal } from "@/components/UpdatePayoutRecipientModal";
import TradingCoins from "@/components/TradingCoins";
import TimeSeriesChart from "@/components/TimeSeriesChart";
import CandlestickChart from "@/components/CandlestickChart";
import { useCreatorProfileLazy } from "@/hooks/use-creator-profile-lazy";

interface TokenProfileProps {
  address: string;
}

export function TokenProfile({ address }: TokenProfileProps) {
  const { address: userAddress, isConnected } = useAccount();
  const router = useRouter();
  const [coin, setCoin] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isUpdateURIModalOpen, setIsUpdateURIModalOpen] = useState(false);
  const [isUpdatePayoutModalOpen, setIsUpdatePayoutModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'stats' | 'creator'>('stats');
  const [activeChartTab, setActiveChartTab] = useState<'timeseries' | 'candlestick'>('timeseries');
  const [selectedPeriod, setSelectedPeriod] = useState<'1W' | '1M' | '3M' | '1Y' | 'ALL' | 'daily' | 'weekly' | 'monthly'>('1M');
  
  // Estados para datos de gráficos
  const [seriesData, setSeriesData] = useState<any[]>([]);
  const [isLoadingSeries, setIsLoadingSeries] = useState(false);
  const [seriesError, setSeriesError] = useState<string | null>(null);
  const [rawSeriesResponse, setRawSeriesResponse] = useState<any>(null);
  
  const [apiData, setApiData] = useState<any[]>([]);
  const [isLoadingApi, setIsLoadingApi] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [rawApiResponse, setRawApiResponse] = useState<any>(null);

  // Lazy loading para el perfil del creador
  const { profile: creatorProfile, isLoading: isLoadingCreator, error: creatorError, loadProfile: loadCreatorProfile } = useCreatorProfileLazy(coin?.creatorAddress || '', activeTab === 'creator');

  console.log("🔍 TokenProfile - Address recibida:", address);

  const fetchCoinData = useCallback(async () => {
    if (!address) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("🔍 Fetching coin data for address:", address);
      const response = await getCoin({ address: address, chain: 8453 });
      console.log("📊 Coin data response:", response);
      
      if (response.data?.zora20Token) {
        setCoin(response.data.zora20Token);
        console.log("✅ Coin data loaded successfully:", response.data.zora20Token);
      } else {
        setError("Token not found");
        console.log("❌ No token data found in response");
      }
    } catch (err) {
      console.error("❌ Error fetching coin data:", err);
      setError("Failed to load token data");
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchCoinData();
  }, [address, fetchCoinData]);

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(type);
      setTimeout(() => setCopiedField(null), 2000);
      console.log(`✅ ${type} copied to clipboard`);
    } catch (err) {
      console.error(`❌ Failed to copy ${type}:`, err);
    }
  };

  const refetch = () => {
    fetchCoinData();
  };

  // Función para cargar datos de la API (igual que en example)
  const loadDataFromAPI = useCallback(async () => {
    try {
      setIsLoadingSeries(true);
      setIsLoadingApi(true);
      setSeriesError(null);
      setApiError(null);
      setRawSeriesResponse(null);
      setRawApiResponse(null);
      
      console.log('🔍 Obteniendo datos de la API para:', address);
      
      // Mapear timeframes a parámetros de la API
      const timeframeMap = {
        '1W': '1W',
        '1M': '1M',
        '3M': '3M',
        '1Y': '1Y',
        'ALL': 'ALL',
        'daily': '1W',    // Legacy: daily -> 1W
        'weekly': '1M',   // Legacy: weekly -> 1M  
        'monthly': '3M'   // Legacy: monthly -> 3M
      };
      
      const timeframe = timeframeMap[selectedPeriod] || '1M';
      
      // Cargar datos para TimeSeries usando el sistema modular
      const seriesResponse = await fetch(`/api/charts/data?contractAddress=${address}&network=base&timeframe=${timeframe}&chartType=line`);
      const seriesData = await seriesResponse.json();
      
      // Cargar datos para Candlestick usando el sistema modular
      const candlestickResponse = await fetch(`/api/charts/data?contractAddress=${address}&network=base&timeframe=${timeframe}&chartType=candlestick`);
      const candlestickData = await candlestickResponse.json();
      
      if (seriesData.success && seriesData.chartData) {
        setSeriesData(seriesData.chartData);
        setRawSeriesResponse(seriesData);
        console.log('✅ TimeSeries data loaded:', seriesData.chartData.length, 'points');
      } else {
        setSeriesError(seriesData.error || 'Unable to load price chart data. This token may be too new or have limited trading activity.');
        console.error('❌ TimeSeries error:', seriesData.error);
      }
      
      if (candlestickData.success && candlestickData.chartData) {
        setApiData(candlestickData.chartData);
        setRawApiResponse(candlestickData);
        console.log('✅ Candlestick data loaded:', candlestickData.chartData.length, 'points');
      } else {
        setApiError(candlestickData.error || 'Unable to load candlestick chart data. This token may be too new or have limited trading activity.');
        console.error('❌ Candlestick error:', candlestickData.error);
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unable to load chart data. Please check your connection and try again.';
      setSeriesError(errorMessage);
      setApiError(errorMessage);
      console.error('❌ Error loading chart data:', error);
    } finally {
      setIsLoadingSeries(false);
      setIsLoadingApi(false);
    }
  }, [address, selectedPeriod]);

  // Cargar datos de gráficos automáticamente cuando cambie la dirección
  useEffect(() => {
    if (address) {
      loadDataFromAPI();
    }
  }, [address, selectedPeriod, loadDataFromAPI]);

  const shareToken = async () => {
    const base = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${base}/token/${address}?v=${Date.now()}`;
    const intent = `https://warpcast.com/~/compose?text=${encodeURIComponent(`Check out the performance of this ZoraCoin "${coin?.name || 'Token'}" Check stats here 📊`)}&embeds[]=${encodeURIComponent(url)}`;
    
    // Intento con Mini App composeCast si está disponible
    try {
      // dynamic import to avoid SSR issues
      import("@farcaster/miniapp-sdk").then(({ sdk }) => {
        if (sdk?.actions?.composeCast) {
          sdk.actions.composeCast({
            text: `Check out the performance of this ZoraCoin "${coin?.name || 'Token'}" Check stats here 📊`,
            embeds: [url],
          })
        } else {
          window.open(intent, '_blank')
        }
      }).catch(() => {
        window.open(intent, '_blank')
      })
    } catch {
      window.open(intent, '_blank')
    }
  };

  const isAdmin = userAddress && coin?.creatorAddress && 
    userAddress.toLowerCase() === coin.creatorAddress.toLowerCase();

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-gray-50 rounded-2xl shadow-xl p-8">
              <Wallet className="w-16 h-16 text-purple-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Wallet Not Connected</h2>
              <p className="text-gray-600 mb-6">
                Please connect your wallet to view token details.
              </p>
              <Button 
                onClick={() => router.push('/')}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                Go Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-50 rounded-2xl shadow-xl p-8">
              <div className="flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-purple-600 animate-spin" />
                <span className="ml-2 text-lg font-medium text-gray-700">Loading token data...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !coin) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-50 rounded-2xl shadow-xl p-8 text-center">
              <div className="text-red-500 mb-4">
                <Activity className="w-16 h-16 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Error Loading Token</h2>
                <p className="text-gray-600 mb-6">{error || "Token not found"}</p>
              </div>
              <div className="space-y-3">
                <Button 
                  onClick={refetch}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => router.push('/my-coins')}
                  className="w-full"
                >
                  Back to My Coins
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => router.back()}
              className="p-3 hover:bg-gray-100 rounded-lg bg-gray-50 border border-gray-200 transition-all duration-200 hover:scale-105"
              title="Go back"
            >
              <ArrowLeft className="h-6 w-6 text-gray-700" />
            </button>
            
            <div className="flex items-center gap-2">
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={shareToken}
                className="p-2 hover:bg-gray-100 rounded-lg flex items-center gap-2"
                title="Share on Farcaster"
              >
                <img src="/farcaster.png" alt="Farcaster" className="w-4 h-4" />
                <Share2 className="h-4 w-4 text-gray-700" />
              </button>
              <button
                onClick={refetch}
                disabled={isLoading}
                className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw className={`h-4 w-4 text-gray-700 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 pb-20">
        {/* Token Header - CoinMarketCap Style */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm mb-4 overflow-hidden">
          {/* Token Info Header */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  {coin.mediaContent?.previewImage?.medium ? (
                    <img 
                      src={coin.mediaContent.previewImage.medium} 
                      alt={`${coin.name} logo`}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-lg font-bold">
                        {coin.symbol?.charAt(0) || coin.name?.charAt(0) || "T"}
                      </span>
                    </div>
                  )}
                </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-gray-900 truncate">{coin.name}</h1>
                  <span className="text-sm font-medium text-gray-500">({coin.symbol})</span>
                    </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md">
                    <img src="/base.png" alt="Base" className="w-3 h-3" />
                    <span className="text-xs text-gray-600">Base</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(address, "address")}
                    className="p-1 hover:bg-gray-200 rounded-md transition-colors"
                    title="Copy contract address"
                  >
                    {copiedField === "address" ? (
                      <CheckCircle className="h-3 w-3 text-green-600" />
                    ) : (
                      <Copy className="h-3 w-3 text-gray-500" />
                    )}
                  </button>
                  <a
                    href={`https://dexscreener.com/base/${address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 hover:bg-gray-200 rounded-md transition-colors"
                    title="DexScreener"
                  >
                    <img src="/dexs.ico" alt="DexScreener" className="w-3 h-3" />
                  </a>
                  <a
                    href={`https://basescan.org/address/${address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 hover:bg-gray-200 rounded-md transition-colors"
                    title="BaseScan"
                  >
                    <img src="/bscan.png" alt="BaseScan" className="w-3 h-3" />
                  </a>
                  <a
                    href={`${env.NEXT_PUBLIC_ZBASE_ANALYTICS_URL}/token/${address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 hover:bg-gray-200 rounded-md transition-colors"
                    title="ZBase Analytics"
                  >
                    <img src="/icom.png" alt="ZBase Analytics" className="w-3 h-3" />
                  </a>
                  <a
                    href={`https://zora.co/coin/base:${address}?referrer=${env.NEXT_PUBLIC_PLATFORM_REFERRER_ADDRESS}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 hover:bg-gray-200 rounded-md transition-colors"
                    title="Zora"
                  >
                    <img src="/icozora.png" alt="Zora" className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Price Section */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                {coin.tokenPrice?.priceInUsdc ? 
                  new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 6,
                    }).format(parseFloat(coin.tokenPrice.priceInUsdc)) : "$0.00"}
              </div>
                <div className={`text-sm font-medium ${
              coin.marketCapDelta24h && coin.marketCap ? 
                (() => {
                  const currentMarketCap = parseFloat(coin.marketCap) || 0
                  const change24h = parseFloat(coin.marketCapDelta24h) || 0
                  const marketCap24hAgo = currentMarketCap - change24h
                  let percentageChange = 0
                  if (marketCap24hAgo > 0) {
                    percentageChange = (change24h / marketCap24hAgo) * 100
                  }
                  return percentageChange >= 0 ? "text-green-600" : "text-red-600"
                })() : "text-gray-500"
            }`}>
              {coin.marketCapDelta24h && coin.marketCap ? 
                (() => {
                  const currentMarketCap = parseFloat(coin.marketCap) || 0
                  const change24h = parseFloat(coin.marketCapDelta24h) || 0
                  const marketCap24hAgo = currentMarketCap - change24h
                  let percentageChange = 0
                  if (marketCap24hAgo > 0) {
                    percentageChange = (change24h / marketCap24hAgo) * 100
                  }
                  return `${percentageChange >= 0 ? "+" : ""}${percentageChange.toFixed(2)}%`
                    })() : "0.00%"} (24h)
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Market Cap</div>
            <div className="text-lg font-semibold text-gray-900">
              {coin.marketCap ? 
                (() => {
                  const cap = parseFloat(coin.marketCap) || 0
                  if (cap >= 1e9) return `$${(cap / 1e9).toFixed(1)}B`
                  else if (cap >= 1e6) return `$${(cap / 1e6).toFixed(1)}M`
                  else if (cap >= 1e3) return `$${(cap / 1e3).toFixed(1)}K`
                  else return `$${cap.toFixed(2)}`
                })() : "N/A"}
            </div>
              </div>
            </div>
          </div>
          
          {/* About Section */}
          {coin.description && (
            <div className="px-4 pb-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500 font-medium mb-2">About {coin.name}</div>
                <p className="text-xs text-gray-600 leading-relaxed">{coin.description}</p>
              </div>
            </div>
          )}

          </div>
          
        {/* Stats Tabs */}
        <div className="bg-white border border-gray-200 rounded-xl mb-4 overflow-hidden">
          {/* Tab Headers */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('stats')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'stats'
                  ? 'bg-green-50 text-green-700 border-b-2 border-green-500'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              Stats
            </button>
            <button
              onClick={() => setActiveTab('creator')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'creator'
                  ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              Creator
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-4">
            {activeTab === 'stats' && (
              <div className="space-y-6">
                {/* Estadísticas básicas */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">Volume 24h</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {coin.volume24h ? 
                        (() => {
                          const vol = parseFloat(coin.volume24h) || 0
                          if (vol >= 1e9) return `$${(vol / 1e9).toFixed(1)}B`
                          else if (vol >= 1e6) return `$${(vol / 1e6).toFixed(1)}M`
                          else if (vol >= 1e3) return `$${(vol / 1e3).toFixed(1)}K`
                          else return `$${vol.toFixed(2)}`
                        })() : "N/A"}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">Total Supply</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {coin.totalSupply ? 
                        (() => {
                          const supply = parseFloat(coin.totalSupply) || 0
                          if (supply >= 1e9) return `${(supply / 1e9).toFixed(1)}B`
                          else if (supply >= 1e6) return `${(supply / 1e6).toFixed(1)}M`
                          else if (supply >= 1e3) return `${(supply / 1e3).toFixed(1)}K`
                          else return supply.toLocaleString()
                        })() : "N/A"}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">Holders</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {coin.uniqueHolders || "N/A"}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">Created</div>
                    <div className="text-lg font-semibold text-gray-900">
              {coin.createdAt ? 
                new Date(coin.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                          day: "numeric"
                }) : "N/A"}
            </div>
          </div>
        </div>

                {/* Gráficos de precios */}
                <div className="mt-6 mb-8">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        Price Charts
                      </CardTitle>
                      <CardDescription>
                        Historical price data and trading volume
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {/* Pestañas de gráficos */}
                      <div className="flex space-x-1 mb-4">
                        <button
                          onClick={() => setActiveChartTab('timeseries')}
                          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                            activeChartTab === 'timeseries'
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Time Series
                        </button>
                        <button
                          onClick={() => setActiveChartTab('candlestick')}
                          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                            activeChartTab === 'candlestick'
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Candlestick
                        </button>
                      </div>

                      {/* Contenido de gráficos */}
                      {activeChartTab === 'timeseries' && (
                        <>
                          {seriesData.length > 0 ? (
                            <TimeSeriesChart
                              data={seriesData}
                              contractAddress={address}
                              selectedPeriod={selectedPeriod}
                              onPeriodChange={(period) => {
                                setSelectedPeriod(period);
                                // Recargar automáticamente al cambiar el período
                                setTimeout(() => loadDataFromAPI(), 100);
                              }}
                              onFetchData={() => loadDataFromAPI()}
                              isLoading={isLoadingSeries}
                              error={seriesError}
                              rawResponse={rawSeriesResponse}
                              height={400}
                            />
                          ) : (
                            <div className="text-center py-8">
                              <div className="text-sm text-gray-500">
                                {isLoadingSeries ? 'Loading chart data...' : 
                                 seriesError ? seriesError : 
                                 'No chart data available for this token.'}
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {activeChartTab === 'candlestick' && (
                        <>
                          {apiData.length > 0 ? (
                            <CandlestickChart
                              data={apiData}
                              contractAddress={address}
                              selectedPeriod={selectedPeriod}
                              onPeriodChange={(period) => {
                                setSelectedPeriod(period);
                                // Recargar automáticamente al cambiar el período
                                setTimeout(() => loadDataFromAPI(), 100);
                              }}
                              onFetchData={() => loadDataFromAPI()}
                              isLoading={isLoadingApi}
                              error={apiError}
                              rawResponse={rawApiResponse}
                              height={400}
                            />
                          ) : (
                            <div className="text-center py-8">
                              <div className="text-sm text-gray-500">
                                {isLoadingApi ? 'Loading chart data...' : 
                                 apiError ? apiError : 
                                 'No chart data available for this token.'}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </CardContent>
                  </Card>
                </div>

              </div>
            )}

            {activeTab === 'creator' && (
              <div className="space-y-4">
                {isLoadingCreator && (
                  <div className="flex items-center justify-center gap-2 py-8">
                    <RefreshCw className="w-5 h-5 animate-spin text-gray-500" />
                    <span className="text-sm text-gray-500">Loading creator profile...</span>
                  </div>
                )}

                {creatorError && (
                  <div className="text-center py-8">
                    <div className="text-sm text-red-600 mb-2">
                      Error loading profile: {creatorError}
                    </div>
                    <button
                      onClick={loadCreatorProfile}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      Try Again
                    </button>
                  </div>
                )}

                {creatorProfile && (
                  <div className="space-y-4">
                    {/* Header con avatar y nombre */}
                    <div className="text-center">
                      {creatorProfile.avatar?.medium && (
                        <button
                          onClick={() => {
                            if (creatorProfile.creatorCoin?.address) {
                              router.push(`/token/${creatorProfile.creatorCoin.address}?from=/my-coins`);
                            }
                          }}
                          className="block w-20 h-20 mx-auto mb-3 hover:opacity-80 transition-opacity cursor-pointer"
                          disabled={!creatorProfile.creatorCoin?.address}
                        >
                          <img 
                            src={creatorProfile.avatar.medium} 
                            alt="Creator avatar" 
                            className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                          />
                        </button>
                      )}
                      
                      <div className="text-lg font-semibold text-gray-900 mb-1">
                        {creatorProfile.displayName || creatorProfile.username || 'Unknown Creator'}
                      </div>
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <div className="text-sm text-gray-500">
                          @{creatorProfile.handle || creatorProfile.username || 'unknown'}
                        </div>
                        
                        {/* Creator Coin Address Button */}
                        {creatorProfile.creatorCoin?.address && (
                          <button
                            onClick={() => copyToClipboard(creatorProfile.creatorCoin?.address || '', 'creator-coin-address')}
                            className="p-1 bg-blue-50 hover:bg-blue-100 rounded transition-colors group"
                            title="Copy Creator Coin address"
                          >
                            {copiedField === 'creator-coin-address' ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4 text-blue-600 group-hover:text-blue-700" />
                            )}
                          </button>
                        )}
          </div>

                      {creatorProfile.bio && (
                        <div className="text-sm text-gray-600 mb-3 px-2">
                          {creatorProfile.bio}
            </div>
                      )}
        </div>

                    {/* Social Links */}
                    <div className="flex justify-center gap-3">
                      {creatorProfile.socialAccounts?.twitter && (
          <a
                          href={`https://twitter.com/${creatorProfile.socialAccounts.twitter.username}`}
            target="_blank"
            rel="noopener noreferrer"
                          className="flex items-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
          >
                          <img src="/x.png" alt="Twitter" className="w-4 h-4" />
                          <span className="text-xs font-medium">Twitter</span>
          </a>
                      )}
                      
                      {creatorProfile.socialAccounts?.farcaster && (
          <a
                          href={`https://warpcast.com/${creatorProfile.socialAccounts.farcaster.username}`}
            target="_blank"
            rel="noopener noreferrer"
                          className="flex items-center gap-1 px-3 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
          >
                          <img src="/farcaster.png" alt="Farcaster" className="w-4 h-4" />
                          <span className="text-xs font-medium">Farcaster</span>
          </a>
                      )}

                      {/* Zora Profile Link */}
          <a
                        href={`https://zora.co/${creatorProfile.handle || creatorProfile.username}`}
            target="_blank"
            rel="noopener noreferrer"
                        className="flex items-center gap-1 px-3 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
                        <img src="/icozora.png" alt="Zora" className="w-4 h-4" />
                        <span className="text-xs font-medium">Zora</span>
          </a>
        </div>

                    {/* Creator Coin Info */}
                    {creatorProfile.creatorCoin && (
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-3">
                        <div className="text-sm font-semibold text-gray-900 mb-2">Creator Coin</div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="text-center">
                            <div className="text-xs text-gray-500 mb-1">Market Cap</div>
                            <div className="text-sm font-semibold text-gray-900">
                              {creatorProfile.creatorCoin.marketCap ? 
                                (() => {
                                  const cap = parseFloat(creatorProfile.creatorCoin.marketCap) || 0
                                  if (cap >= 1e9) return `$${(cap / 1e9).toFixed(1)}B`
                                  else if (cap >= 1e6) return `$${(cap / 1e6).toFixed(1)}M`
                                  else if (cap >= 1e3) return `$${(cap / 1e3).toFixed(1)}K`
                                  else return `$${cap.toFixed(2)}`
                                })() : "N/A"
                              }
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-gray-500 mb-1">24h Change</div>
                            <div className={`text-sm font-semibold ${
                              creatorProfile.creatorCoin.marketCapDelta24h && parseFloat(creatorProfile.creatorCoin.marketCapDelta24h) >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {creatorProfile.creatorCoin.marketCapDelta24h ? 
                                `${parseFloat(creatorProfile.creatorCoin.marketCapDelta24h) >= 0 ? '+' : ''}${parseFloat(creatorProfile.creatorCoin.marketCapDelta24h).toFixed(2)}%` : 
                                "N/A"
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Wallet Info */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-sm font-semibold text-gray-900 mb-2">Wallet Information</div>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          {coin.creatorAddress ? 
                            `${coin.creatorAddress.slice(0, 6)}...${coin.creatorAddress.slice(-4)}` : 
                            "Unknown"
                          }
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => copyToClipboard(coin.creatorAddress || '', 'creator-wallet')}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                            title="Copy wallet address"
                          >
                            {copiedField === 'creator-wallet' ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4 text-gray-500" />
                            )}
                          </button>
                          <a
                            href={`https://basescan.org/address/${coin.creatorAddress}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                            title="View on BaseScan"
                          >
                            <ExternalLink className="h-4 w-4 text-gray-500" />
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Creation Date */}
                    <div className="text-center">
                      <div className="text-xs text-gray-500">
                        Token created on {coin.createdAt ? 
                          new Date(coin.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric"
                          }) : "Unknown date"
                        }
                      </div>
                    </div>
          </div>
        )}

                {!creatorProfile && !isLoadingCreator && !creatorError && (
                  <div className="text-center py-8">
                    <div className="text-sm text-gray-500">
                      No creator profile available
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>




            {/* Trading Section */}
            <TradingCoins 
              tokenAddress={address}
              tokenSymbol={coin.symbol}
              tokenName={coin.name}
              tokenDecimals={coin.decimals}
              tokenPrice={coin.tokenPrice?.priceInUsdc ? parseFloat(coin.tokenPrice.priceInUsdc) : 0.01}
              className="mb-6"
            />

        {/* Admin Section - CoinMarketCap Style */}
        {isAdmin && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Admin Controls
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              These functions are available only for the token creator
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={() => setIsUpdateURIModalOpen(true)}
                variant="outline"
                className="flex items-center gap-2 justify-center"
              >
                <Edit className="h-4 w-4" />
                Update URI
              </Button>
              <Button 
                onClick={() => setIsUpdatePayoutModalOpen(true)}
                variant="outline"
                className="flex items-center gap-2 justify-center"
              >
                <Edit className="h-4 w-4" />
                Update Payout
              </Button>
            </div>
            
            <UpdateURIModal 
              isOpen={isUpdateURIModalOpen}
              onClose={() => setIsUpdateURIModalOpen(false)}
              tokenAddress={address} 
            />
            <UpdatePayoutRecipientModal 
              isOpen={isUpdatePayoutModalOpen}
              onClose={() => setIsUpdatePayoutModalOpen(false)}
              tokenAddress={address} 
            />
          </div>
        )}
      </div>
      
      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
