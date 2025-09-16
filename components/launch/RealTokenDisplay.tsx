"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Copy, 
  ExternalLink, 
  CheckCircle, 
  Zap, 
  Network, 
  DollarSign, 
  Rocket, 
  Share2, 
  Download, 
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
    const text = `🚀 Just deployed "${token.name}" ($${token.symbol}) on ${token.network || "Base"}!\n\nContract: ${token.address}\n\nView on ZBase Analytics: https://zbase.fun/token/${token.address}`
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  const shareOnFarcaster = () => {
    const text = `🚀 Just deployed "${token.name}" ($${token.symbol}) on ${token.network || "Base"}!\n\nContract: ${token.address}\n\nView on ZBase Analytics: https://app.zbase.fun/token/${token.address}`
    const url = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  const downloadTokenCard = () => {
    // Create a canvas to generate the token card image
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = 1200
    canvas.height = 630

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 1200, 630)
    gradient.addColorStop(0, '#8b5cf6')
    gradient.addColorStop(0.5, '#ec4899')
    gradient.addColorStop(1, '#f59e0b')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 1200, 630)

    // Add subtle pattern overlay
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
    for (let i = 0; i < 1200; i += 40) {
      for (let j = 0; j < 630; j += 40) {
        ctx.fillRect(i, j, 2, 2)
      }
    }

    // Function to load and draw token image
    const loadAndDrawTokenImage = () => {
      return new Promise((resolve) => {
        if (token.imageUrl) {
          const img = new Image()
          img.crossOrigin = 'anonymous'
          img.onload = () => {
            // Draw token image in larger circle
            ctx.save()
            ctx.beginPath()
            ctx.arc(150, 150, 100, 0, 2 * Math.PI)
            ctx.clip()
            ctx.drawImage(img, 50, 50, 200, 200)
            ctx.restore()
            resolve(true)
          }
          img.onerror = () => {
            // Fallback to symbol if image fails
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
            ctx.beginPath()
            ctx.arc(150, 150, 100, 0, 2 * Math.PI)
            ctx.fill()
            
            ctx.fillStyle = 'white'
            ctx.font = 'bold 48px Arial'
            ctx.textAlign = 'center'
            ctx.fillText(token.symbol.charAt(0).toUpperCase(), 150, 165)
            resolve(false)
          }
          img.src = token.imageUrl
        } else {
          // No image, use symbol
          ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
          ctx.beginPath()
          ctx.arc(150, 150, 100, 0, 2 * Math.PI)
          ctx.fill()
          
          ctx.fillStyle = 'white'
          ctx.font = 'bold 48px Arial'
          ctx.textAlign = 'center'
          ctx.fillText(token.symbol.charAt(0).toUpperCase(), 150, 165)
          resolve(false)
        }
      })
    }

    // Function to generate simple QR code
    const generateSimpleQR = (text: string, x: number, y: number, size: number) => {
      // Simple QR-like pattern (in real implementation, you'd use a QR library)
      const cellSize = size / 25
      
      // Draw QR background
      ctx.fillStyle = 'white'
      ctx.fillRect(x, y, size, size)
      
      // Draw QR pattern (simplified)
      ctx.fillStyle = 'black'
      for (let i = 0; i < 25; i++) {
        for (let j = 0; j < 25; j++) {
          if ((i + j) % 3 === 0 || (i === 0 || i === 24 || j === 0 || j === 24)) {
            ctx.fillRect(x + i * cellSize, y + j * cellSize, cellSize, cellSize)
          }
        }
      }
      
      // Add URL text below QR
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
      ctx.font = '12px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('Scan to view', x + size/2, y + size + 20)
    }

    // Main drawing function
    const drawCard = async () => {
      // Load token image first
      await loadAndDrawTokenImage()

      // Add token name (much larger)
      ctx.fillStyle = 'white'
      ctx.textAlign = 'left'
      ctx.font = 'bold 96px Arial'
      ctx.fillText(token.name, 300, 120)
      
      // Add token symbol (larger)
      ctx.font = 'bold 48px Arial'
      ctx.fillText(token.symbol, 300, 180)
      
      // Add network badge
      ctx.fillStyle = isMainnet ? 'rgba(34, 197, 94, 0.9)' : 'rgba(249, 115, 22, 0.9)'
      ctx.fillRect(300, 200, 140, 35)
      ctx.fillStyle = 'white'
      ctx.font = 'bold 18px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(isMainnet ? 'MAINNET' : 'TESTNET', 370, 222)
      
      // Add contract info (full address)
      ctx.textAlign = 'left'
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
      ctx.font = '20px Arial'
      ctx.fillText(`Contract: ${token.address}`, 300, 260)
      
      // Add deployment date (in the middle)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
      ctx.font = 'bold 28px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(`Deployed: ${new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}`, 600, 400)

      // Add website at the bottom
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
      ctx.font = 'bold 32px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('zbase.fun', 600, 550)
      
      ctx.font = '20px Arial'
      ctx.fillText('Live Zora Coin Analytics', 600, 580)

      // Generate QR code
      const profileUrl = `https://zbase.fun/token/${token.address}`
      generateSimpleQR(profileUrl, 1000, 100, 150)

      // Download the image
      const link = document.createElement('a')
      link.download = `${token.symbol}-${token.name}-token-card.png`
      link.href = canvas.toDataURL('image/png', 1.0)
      link.click()
    }

    // Start drawing
    drawCard()
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

            {/* Simple Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4">
              <Button asChild variant="outline" className="h-auto p-4">
                <a
                  href={token.explorer || `https://sepolia.basescan.org/address/${token.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2"
                >
                  <ExternalLink className="h-5 w-5" />
                  <div className="text-center">
                    <div className="font-medium">View on Explorer</div>
                    <div className="text-xs text-muted-foreground">
                      Verify on blockchain
                    </div>
                  </div>
                </a>
              </Button>

              <Button 
                onClick={onCreateAnother}
                className="h-auto p-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <Rocket className="h-5 w-5" />
                <div className="text-center">
                  <div className="font-medium">Create Another Token</div>
                  <div className="text-xs text-white/80">
                    Deploy more tokens
                  </div>
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
          {/* Token Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Network className="w-4 h-4" />
                Network
              </label>
              <div className="flex items-center gap-2">
                <p className="font-mono text-sm bg-muted p-3 rounded-lg flex-1">
                  {token.network || "Base Mainnet"}
                </p>
                <Badge variant="outline">
                  {isMainnet ? "Production" : "Testnet"}
                </Badge>
              </div>
            </div>

            {token.transactionHash && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Transaction Hash
                </label>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-sm bg-muted p-3 rounded-lg flex-1 break-all">
                    {formatAddress(token.transactionHash)}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(token.transactionHash!, "hash")}
                  >
                    {copiedField === "hash" ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}

            {token.poolAddress && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Pool Address
                </label>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-sm bg-muted p-3 rounded-lg flex-1 break-all">
                    {formatAddress(token.poolAddress)}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(token.poolAddress!, "pool")}
                  >
                    {copiedField === "pool" ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* View on Explorer */}
            <Button asChild variant="outline" className="h-auto p-4">
              <a
                href={token.explorer || `https://basescan.org/address/${token.address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2"
              >
                <ExternalLink className="h-5 w-5" />
                <div className="text-center">
                  <div className="font-medium">View on Explorer</div>
                  <div className="text-xs text-muted-foreground">
                    Verify on blockchain
                  </div>
                </div>
              </a>
            </Button>

            {/* View Profile - Only for Mainnet */}
            {isMainnet && (
              <Button asChild variant="outline" className="h-auto p-4">
                <a
                  href={getProfileUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2"
                >
                  <Globe className="h-5 w-5" />
                  <div className="text-center">
                    <div className="font-medium">View Profile</div>
                    <div className="text-xs text-muted-foreground">
                      Token details page
                    </div>
                  </div>
                </a>
              </Button>
            )}

            {/* Share on Twitter */}
            <Button 
              onClick={shareOnTwitter}
              variant="outline" 
              className="h-auto p-4"
            >
              <div className="flex items-center gap-2">
                <img 
                  src="/x.png" 
                  alt="X (Twitter)" 
                  className="w-5 h-5"
                />
                <div className="text-center">
                  <div className="font-medium">Share on X</div>
                  <div className="text-xs text-muted-foreground">
                    Post to X.com
                  </div>
                </div>
              </div>
            </Button>

            {/* Share on Farcaster */}
            <Button 
              onClick={shareOnFarcaster}
              variant="outline" 
              className="h-auto p-4"
            >
              <div className="flex items-center gap-2">
                <img 
                  src="/farcaster.png" 
                  alt="Farcaster" 
                  className="w-5 h-5"
                />
                <div className="text-center">
                  <div className="font-medium">Share on Farcaster</div>
                  <div className="text-xs text-muted-foreground">
                    Post to Farcaster
                  </div>
                </div>
              </div>
            </Button>
          </div>

          {/* Additional Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Download Token Card */}
            <Button 
              onClick={downloadTokenCard}
              className="h-auto p-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <Download className="h-5 w-5" />
              <div className="text-center">
                <div className="font-medium">Download Token Card</div>
                <div className="text-xs text-white/80">
                  Save as image
                </div>
              </div>
            </Button>

            {/* Create Another Token */}
            <Button 
              onClick={onCreateAnother}
              variant="outline"
              className="h-auto p-4"
            >
              <Rocket className="h-5 w-5" />
              <div className="text-center">
                <div className="font-medium">Create Another Token</div>
                <div className="text-xs text-muted-foreground">
                  Deploy more tokens
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Important Notes */}
      <Alert className="border-blue-200 bg-blue-50">
        <DollarSign className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Important Information:</strong>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Your token has been permanently deployed on {token.network || "Base"}</li>
            <li>The contract address is unique and immutable</li>
            <li>You can add liquidity and enable trading</li>
            <li>Save this information for future reference</li>
                         {isMainnet && (
               <li>Your token profile is available at: <a href={getProfileUrl()} target="_blank" rel="noopener noreferrer" className="underline">ZBase Analytics</a></li>
             )}
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  )
}