"use client";

import { useState, useEffect } from "react";
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

  console.log("🔍 TokenProfile - Address recibida:", address);

  const fetchCoinData = async () => {
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
  };

  useEffect(() => {
    fetchCoinData();
  }, [address]);

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

  const shareToken = async () => {
    const base = typeof window !== 'undefined' ? window.location.origin : ''
    const url = `${base}/token/${address}?v=${Date.now()}`
    const intent = `https://warpcast.com/~/compose?text=${encodeURIComponent(`Check out the performance of this ZoraCoin "${coin?.name || 'Token'}" Check stats here 📊`)}&embeds[]=${encodeURIComponent(url)}`
    
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
        {/* Token Banner */}
        <Card className="overflow-hidden border-0 shadow-xl relative mb-6">
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {coin.mediaContent?.previewImage?.medium ? (
                    <img 
                      src={coin.mediaContent.previewImage.medium} 
                      alt={`${coin.name} logo`}
                      className="w-20 h-20 rounded-xl object-cover border-4 border-white/20 shadow-lg"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-white/20 rounded-xl flex items-center justify-center border-4 border-white/20 shadow-lg">
                      <span className="text-white text-2xl font-bold">
                        {coin.symbol?.charAt(0) || coin.name?.charAt(0) || "T"}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <h1 className="text-3xl font-bold">{coin.name}</h1>
                  <p className="text-xl text-white/80 font-medium">{coin.symbol}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-md border border-white/30">
                      <img src="/base.png" alt="Base Mainnet" className="w-4 h-4" />
                      <span className="text-white text-xs font-medium">Mainnet</span>
                    </div>
                    <Badge className="bg-green-500/20 text-green-100 border-green-500/30">
                      LIVE
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Financial Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">PRICE</div>
              <div className="text-2xl font-semibold text-gray-900">
                {coin.tokenPrice?.priceInUsdc ? 
                  new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 6,
                  }).format(parseFloat(coin.tokenPrice.priceInUsdc)) : "N/A"}
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">MARKET CAP</div>
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
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">VOLUME 24H</div>
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
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">TOTAL SUPPLY</div>
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
        </div>

        {/* Performance Changes */}
        <div className="flex gap-2 mb-6">
          <div className="flex-1 bg-gray-50 p-3 rounded-lg text-center">
            <div className="text-sm text-gray-500 mb-1">24H</div>
            <div className={`text-base font-semibold ${
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
                })() : "0.00%"}
            </div>
          </div>
          
          <div className="flex-1 bg-gray-50 p-3 rounded-lg text-center">
            <div className="text-sm text-gray-500 mb-1">HOLDERS</div>
            <div className="text-base font-semibold text-gray-900">
              {coin.uniqueHolders || "N/A"}
            </div>
          </div>
          
          <div className="flex-1 bg-gray-50 p-3 rounded-lg text-center">
            <div className="text-sm text-gray-500 mb-1">CREATED</div>
            <div className="text-base font-semibold text-gray-900">
              {coin.createdAt ? 
                new Date(coin.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                }) : "N/A"}
            </div>
          </div>
        </div>

        {/* Token Details - Compact Layout */}
        <div className="space-y-4 mb-6">
          {/* Contract Address */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-600 flex items-center gap-2 min-w-fit">
              <FileText className="w-4 h-4" />
              Contract
            </label>
            <p className="font-mono text-sm bg-gray-50 p-3 rounded-lg flex-1">
              {address.slice(0, 6)}...{address.slice(-4)}
            </p>
            <Button
              variant="outline"
              size="sm"
              asChild
              className="w-10 h-10 p-1"
            >
              <a
                href={`https://basescan.org/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center"
              >
                <img src="/bscan.png" alt="BaseScan" className="w-6 h-6 object-contain" />
              </a>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(address, "address")}
              className="w-10 h-10 p-1"
            >
              {copiedField === "address" ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <Copy className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Network */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-600 flex items-center gap-2 min-w-fit">
              <Network className="w-4 h-4" />
              Network
            </label>
            <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg flex-1">
              <img src="/base.png" alt="Base Mainnet" className="w-4 h-4" />
              <p className="font-mono text-sm text-gray-900">
                Base Mainnet
              </p>
            </div>
          </div>
        </div>

        {/* External Links */}
        <div className="flex gap-2 mb-6">
          <a
            href={`https://dexscreener.com/base/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            title="DexScreener"
          >
            <img src="/dexs.ico" alt="DexScreener" className="w-6 h-6" />
          </a>
          <a
            href={`https://basescan.org/address/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            title="BaseScan"
          >
            <img src="/bscan.png" alt="BaseScan" className="w-6 h-6" />
          </a>
          <a
            href={`${env.NEXT_PUBLIC_ZBASE_ANALYTICS_URL}/token/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            title="ZBase Analytics"
          >
            <img src="/icom.png" alt="ZBase Analytics" className="w-6 h-6" />
          </a>
        </div>

        {/* Description */}
        {coin.description && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="text-sm font-semibold mb-2 text-gray-900">Description</h3>
            <p className="text-sm text-gray-600">{coin.description}</p>
          </div>
        )}

            {/* Trading Section */}
            <TradingCoins 
              tokenAddress={address}
              tokenSymbol={coin.symbol}
              tokenName={coin.name}
              tokenDecimals={coin.decimals}
              tokenPrice={coin.tokenPrice?.priceInUsdc ? parseFloat(coin.tokenPrice.priceInUsdc) : 0.01}
              className="mb-6"
            />

        {/* Admin Section */}
        {isAdmin && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2 text-gray-900">
              <Settings className="w-4 h-4" />
              Admin Only
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              These functions are available only for the token creator
            </p>
            <div className="flex gap-3">
              <Button 
                onClick={() => setIsUpdateURIModalOpen(true)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Update URI
              </Button>
              <Button 
                onClick={() => setIsUpdatePayoutModalOpen(true)}
                variant="outline"
                className="flex items-center gap-2"
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
