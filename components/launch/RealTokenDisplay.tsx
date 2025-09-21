"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Copy, 
  ExternalLink, 
  CheckCircle, 
  Zap, 
  Network, 
  Share2, 
  Twitter, 
  Calendar,
  User,
  FileText,
  Globe
} from 'lucide-react'
import { useState } from "react"
import type { CreatedToken } from "@/types/launch"
import { formatAddress } from "@/lib/utils"

interface RealTokenDisplayProps {
  token: CreatedToken
  onCreateAnother: () => void
}

export function RealTokenDisplay({ token, onCreateAnother }: RealTokenDisplayProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const isMainnet = token.network?.includes("Mainnet") || token.network?.includes("8453")
  const isSepolia = token.network?.includes("Sepolia") || token.network?.includes("84532")

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (error) {
      console.error("Error copying to clipboard:", error)
    }
  }

  const shareOnTwitter = () => {
    const base = typeof window !== 'undefined' ? window.location.origin : ''
    const shareUrl = `${base}/share/new-token/${token.address}?v=${Date.now()}`
    const text = `🚀 Just created a new token!\n\n"${token.name}" ($${token.symbol}) on ${token.network || "Base"}\n\nCreated: ${new Date().toLocaleDateString()}\nCreator: ${token.creatorAddress?.slice(0, 6)}...${token.creatorAddress?.slice(-4) || "Unknown"}\n\nCheck it out: ${shareUrl}`
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  const shareOnFarcaster = () => {
    const base = typeof window !== 'undefined' ? window.location.origin : ''
    const url = `${base}/share/new-token/${token.address}?v=${Date.now()}`
    const intent = `https://warpcast.com/~/compose?text=${encodeURIComponent(`🚀 Just created a new Coin in Zora !\n\n"${token.name}" ( $${token.symbol} ) on Base Mainnet\n\n${url}`)}&embeds[]=${encodeURIComponent(url)}`
    
    // Intento con Mini App composeCast si está disponible
    try {
      // dynamic import to avoid SSR issues
      import("@farcaster/miniapp-sdk").then(({ sdk }) => {
        if (sdk?.actions?.composeCast) {
          sdk.actions.composeCast({
            text: `🚀 Just created a new Coin in Zora !\n\n"${token.name}" ( $${token.symbol} ) on Base Mainnet\n\n${url}`,
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
  }


  const getProfileUrl = () => {
    return `https://zbase.fun/token/${token.address}`
  }

  // Simplified display for Base Sepolia
  if (isSepolia) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Simple Token Card */}
        <Card className="overflow-hidden border-0 shadow-lg relative">
          {/* Check in top right corner */}
          <div className="absolute top-4 right-4 z-10">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                {token.imageUrl ? (
                  <img 
                    src={token.imageUrl} 
                    alt={`${token.name} logo`}
                    className="w-16 h-16 rounded-xl object-cover border-2 border-white/20 shadow-lg"
                  />
                ) : (
                  <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center border-2 border-white/20 shadow-lg">
                    <span className="text-white text-xl font-bold">{token.symbol.charAt(0)}</span>
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{token.name}</h1>
                <p className="text-lg text-white/80 font-medium">{token.symbol}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className="bg-orange-500/20 text-orange-100 border-orange-500/30">
                    Testnet
                  </Badge>
                  <Badge className="bg-green-500/20 text-green-100 border-green-500/30">
                    LIVE
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <CardContent className="p-6 space-y-4">
            {/* Contract Address */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Contract Address
              </label>
              <div className="flex items-center gap-2">
                <p className="font-mono text-sm bg-muted p-3 rounded-lg flex-1 break-all">
                  {formatAddress(token.address)}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(token.address, "address")}
                >
                  {copiedField === "address" ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Creator Address */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <User className="w-4 h-4" />
                Creator Address
              </label>
              <div className="flex items-center gap-2">
                <p className="font-mono text-sm bg-muted p-3 rounded-lg flex-1 break-all">
                  {formatAddress(token.creatorAddress || token.address)}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(token.creatorAddress || token.address, "creator")}
                >
                  {copiedField === "creator" ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Deployment Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Deployment Date
              </label>
              <p className="font-mono text-sm bg-muted p-3 rounded-lg">
                {new Date(token.createdAt || Date.now()).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>

            {/* Simple Actions - Mobile Optimized */}
            <div className="flex gap-2 pt-4">
              <Button asChild variant="outline" className="flex-1 h-12">
                <a
                  href={token.explorer || `https://sepolia.basescan.org/address/${token.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span className="text-sm font-medium">Explorer</span>
                </a>
              </Button>

              <Button 
                onClick={onCreateAnother}
                className="flex-1 h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <div className="flex items-center justify-center gap-2">
                  <Zap className="h-4 w-4" />
                  <span className="text-sm font-medium">Create Another</span>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Full display for Mainnet (existing code)
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Token Card - Main Display */}
      <Card className="overflow-hidden border-0 shadow-xl relative">
        {/* Check in top right corner */}
        <div className="absolute top-4 right-4 z-10">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                {token.imageUrl ? (
                  <img 
                    src={token.imageUrl} 
                    alt={`${token.name} logo`}
                    className="w-20 h-20 rounded-xl object-cover border-4 border-white/20 shadow-lg"
                  />
                ) : (
                  <div className="w-20 h-20 bg-white/20 rounded-xl flex items-center justify-center border-4 border-white/20 shadow-lg">
                    <span className="text-white text-2xl font-bold">{token.symbol.charAt(0)}</span>
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold">{token.name}</h1>
                <p className="text-xl text-white/80 font-medium">{token.symbol}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className="bg-white/20 text-white border-white/30">
                    {isMainnet ? "Production" : "Testnet"}
                  </Badge>
                  <Badge className="bg-green-500/20 text-green-100 border-green-500/30">
                    LIVE
                  </Badge>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white/80 text-sm">Deployed</p>
              <p className="text-white font-medium">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <CardContent className="p-6 space-y-6">
          {/* Token Details - Compact Layout */}
          <div className="space-y-4">
            {/* Contract Address */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 min-w-fit">
                <FileText className="w-4 h-4" />
                Contract
              </label>
              <p className="font-mono text-sm bg-muted p-3 rounded-lg flex-1">
                  {formatAddress(token.address)}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                asChild
                className="w-10 h-10 p-1"
              >
                <a
                  href={`https://basescan.org/address/${token.address}`}
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
                  onClick={() => copyToClipboard(token.address, "address")}
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
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 min-w-fit">
                <Network className="w-4 h-4" />
                Network
              </label>
              <div className="flex items-center gap-2 bg-muted p-3 rounded-lg flex-1">
                <img src="/base.png" alt="Base Mainnet" className="w-4 h-4" />
                <p className="font-mono text-sm">
                  {token.network || "Base Mainnet"}
                </p>
              </div>
            </div>

            {/* Transaction Hash */}
            {token.transactionHash && (
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 min-w-fit">
                  <Zap className="w-4 h-4" />
                  Hash TX
                </label>
                <p className="font-mono text-sm bg-muted p-3 rounded-lg flex-1">
                    {formatAddress(token.transactionHash)}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="w-10 h-10 p-1"
                  >
                    <a
                      href={`https://basescan.org/tx/${token.transactionHash}`}
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
                    onClick={() => copyToClipboard(token.transactionHash!, "hash")}
                    className="w-10 h-10 p-1"
                  >
                    {copiedField === "hash" ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <Copy className="h-5 w-5" />
                    )}
                  </Button>
              </div>
            )}
          </div>

          {/* Action Buttons - Improved Design */}
          <div className="space-y-4">
            {/* Share Buttons Row - Horizontal */}
            <div className="flex gap-3">
              {/* Share Image on Farcaster */}
              <Button 
                onClick={shareOnFarcaster}
                variant="outline" 
                className="flex-1 h-14 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 border-0 text-white"
              >
                <div className="flex items-center justify-center gap-3">
                  <img 
                    src="/farcaster.png" 
                    alt="Farcaster" 
                    className="w-5 h-5"
                    onError={(e) => {
                      console.log('Error loading farcaster.png:', e);
                      e.currentTarget.src = '/icon.png'; // fallback
                    }}
                  />
                  <span className="font-medium">Share</span>
                </div>
              </Button>

              {/* Share Image on X */}
            <Button 
              onClick={shareOnTwitter}
              variant="outline" 
                className="flex-1 h-14 bg-black hover:bg-gray-800 border-gray-600 text-white"
            >
                <div className="flex items-center justify-center gap-3">
                <img 
                  src="/x.png" 
                  alt="X (Twitter)" 
                  className="w-5 h-5"
                />
                  <span className="font-medium">Share</span>
              </div>
            </Button>
          </div>

            {/* Profile Button - Only for Mainnet */}
            {isMainnet && (
              <div className="flex justify-center">
                <Button asChild variant="outline" className="h-14 px-8 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 border-0 text-white">
                  <a
                    href={getProfileUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3"
                  >
                    <img src="/minicon.png" alt="Profile" className="w-5 h-5" />
                    <span className="font-medium">View Profile</span>
                  </a>
            </Button>
              </div>
            )}

          </div>
        </CardContent>
      </Card>

    </div>
  )
}