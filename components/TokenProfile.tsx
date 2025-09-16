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
} from "lucide-react";
import { UpdateURIModal } from "@/components/UpdateURIModal";
import { UpdatePayoutRecipientModal } from "@/components/UpdatePayoutRecipientModal";

interface TokenProfileProps {
  address: string;
}

export function TokenProfile({ address }: TokenProfileProps) {
  const { address: userAddress, isConnected } = useAccount();
  const router = useRouter();
  const [coin, setCoin] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [backUrl, setBackUrl] = useState("/profile"); // Default fallback

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
    const intent = `https://warpcast.com/~/compose?text=${encodeURIComponent(`Zora Creator Coin "${coin?.name || 'Token'}" Check stats here 📊`)}&embeds[]=${encodeURIComponent(url)}`
    
    // Intento con Mini App composeCast si está disponible
    try {
      // dynamic import to avoid SSR issues
      import("@farcaster/miniapp-sdk").then(({ sdk }) => {
        if (sdk?.actions?.composeCast) {
          sdk.actions.composeCast({
            text: `Zora Creator Coin "${coin?.name || 'Token'}" Check stats here 📊`,
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-white rounded-2xl shadow-xl p-8">
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8">
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
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
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black border-b border-gray-800">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => router.back()}
              className="p-3 hover:bg-gray-800 rounded-lg bg-gray-900 border border-gray-700 transition-all duration-200 hover:scale-105"
              title="Go back"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            
            <div className="flex items-center gap-2">
              <img 
                src="/icon.png" 
                alt="ZBase Analytics" 
                className="w-8 h-8 object-contain"
              />
              <h1 className="text-lg font-bold">ZBase Analytics</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={shareToken}
                className="p-2 hover:bg-gray-800 rounded-lg"
                title="Share on Farcaster"
              >
                <Share2 className="h-4 w-4" />
              </button>
              <button
                onClick={refetch}
                disabled={isLoading}
                className="p-2 hover:bg-gray-800 rounded-lg disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 pb-20">
        {/* Token Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center border-2 border-purple-500">
              {coin.mediaContent?.previewImage?.medium ? (
                <img
                  src={coin.mediaContent.previewImage.medium}
                  alt={coin.name}
                  className="w-18 h-18 rounded-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-white">
                  {coin.symbol?.charAt(0) || coin.name?.charAt(0) || "T"}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{coin.name}</h1>
              <button
                onClick={() => copyToClipboard(address, 'contract address')}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                title="Copy contract address"
              >
                <Copy className="h-5 w-5 text-gray-400 hover:text-gray-300" />
              </button>
            </div>
          </div>
          
          <div className="text-sm text-gray-400 mb-6">
            Base &gt; Uniswap v4
          </div>
        </div>

        {/* Financial Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-gray-900 p-4 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-xs text-gray-400 mb-1">PRICE</div>
              <div className="text-2xl font-semibold">
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
          
          <div className="bg-gray-900 p-4 rounded-lg">
            <div className="text-xs text-gray-400 mb-1">MARKET CAP</div>
            <div className="text-lg font-semibold">
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
          
          <div className="bg-gray-900 p-4 rounded-lg">
            <div className="text-xs text-gray-400 mb-1">VOLUME 24H</div>
            <div className="text-lg font-semibold">
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
          
          <div className="bg-gray-900 p-4 rounded-lg">
            <div className="text-xs text-gray-400 mb-1">TOTAL SUPPLY</div>
            <div className="text-lg font-semibold">
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
          <div className="flex-1 bg-gray-900 p-3 rounded-lg text-center">
            <div className="text-sm text-gray-400 mb-1">24H</div>
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
                  return percentageChange >= 0 ? "text-green-400" : "text-red-400"
                })() : "text-gray-400"
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
          
          <div className="flex-1 bg-gray-900 p-3 rounded-lg text-center">
            <div className="text-sm text-gray-400 mb-1">HOLDERS</div>
            <div className="text-base font-semibold">
              {coin.uniqueHolders || "N/A"}
            </div>
          </div>
          
          <div className="flex-1 bg-gray-900 p-3 rounded-lg text-center">
            <div className="text-sm text-gray-400 mb-1">CREATED</div>
            <div className="text-base font-semibold">
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

        {/* External Links */}
        <div className="flex gap-2 mb-6">
          <a
            href={`https://dexscreener.com/base/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <img src="/dexs.ico" alt="DexScreener" className="w-4 h-4" />
            <span className="text-sm">DexScreener</span>
          </a>
          <a
            href={`https://basescan.org/address/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <img src="/bscan.png" alt="BaseScan" className="w-4 h-4" />
            <span className="text-sm">BaseScan</span>
          </a>
          <a
            href={`${env.NEXT_PUBLIC_ZBASE_ANALYTICS_URL}/token/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <img src="/icom.png" alt="ZBase Analytics" className="w-4 h-4" />
            <span className="text-sm">ZBase Analytics</span>
          </a>
        </div>

        {/* Description */}
        {coin.description && (
          <div className="bg-gray-900 p-4 rounded-lg mb-6">
            <h3 className="text-sm font-semibold mb-2">Description</h3>
            <p className="text-sm text-gray-300">{coin.description}</p>
          </div>
        )}

        {/* Admin Section */}
        {isAdmin && (
          <div className="bg-gray-900 p-4 rounded-lg mb-6">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Admin Only
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              These functions are available only for the token creator
            </p>
            <div className="flex gap-3">
              <UpdateURIModal tokenAddress={address} />
              <UpdatePayoutRecipientModal tokenAddress={address} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
