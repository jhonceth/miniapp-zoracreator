"use client";

import { useUser } from "@/contexts/user-context";
import { useAccount } from "wagmi";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Rocket, Zap, Shield, CheckCircle, Wallet, Share2 } from "lucide-react";
import { UserMenu } from "@/components/UserMenu";
import { BottomNavigation } from "@/components/BottomNavigation";
import { FeatureCarousel } from "@/components/FeatureCarousel";
import { WalletConnection } from "@/components/WalletConnection";

export default function Home() {
  const { user, isLoading, error, signIn } = useUser();
  const { isConnected } = useAccount();

  const shareApp = async () => {
    const base = typeof window !== 'undefined' ? window.location.origin : ''
    const url = base
    const text = `Create your ZoraCoin directly from Farcaster with this amazing app! 🚀\n\n${url}`
    const intent = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}&embeds[]=${encodeURIComponent(url)}`
    
    // Intento con Mini App composeCast si está disponible
    try {
      // dynamic import to avoid SSR issues
      import("@farcaster/miniapp-sdk").then(({ sdk }) => {
        if (sdk?.actions?.composeCast) {
          sdk.actions.composeCast({
            text: text,
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

  return (
    <div className="bg-white text-black h-screen flex flex-col">
      {/* Top Navigation Bar */}
      <div className="w-full flex justify-between items-center px-4 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Image
            src="/icon.png"
            alt="Zora Creator Logo"
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg"
            width={48}
            height={48}
          />
        </div>
        
        {/* User Menu */}
        <UserMenu />
      </div>

      {/* Main Content - Flexible */}
      <div className="flex-1 flex flex-col justify-center max-w-4xl mx-auto px-4 w-full">
        {/* Header */}
        <div className="text-center space-y-2 py-4">
          <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Zbase Creator
          </h1>
          <p className="text-sm sm:text-lg text-muted-foreground">
            Launch tokens on Base using the Zora Protocol
          </p>
          
          {/* Status Badges */}
          <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
            <Badge className="bg-purple-100 text-purple-800 text-xs">
              <Zap className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
              Farcaster
            </Badge>
            <Badge className="bg-blue-100 text-blue-800 text-xs">
              <Shield className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
              Zora Protocol
            </Badge>
            <Badge className="bg-green-100 text-green-800 text-xs">
              <CheckCircle className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
              Base Network
            </Badge>
          </div>
          
          {/* Share Button */}
          <div className="flex justify-center pt-2">
            <Button
              onClick={shareApp}
              variant="outline"
              className="flex items-center gap-2 px-4 py-2 bg-white border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
            >
              <img src="/farcaster.png" alt="Farcaster" className="w-4 h-4" />
              <Share2 className="w-4 h-4" />
              <span className="text-sm font-medium">Share App</span>
            </Button>
          </div>
        </div>

        {/* Main Action */}
        <div className="text-center space-y-4 py-4">
          {!user?.data && !isConnected ? (
            <div className="space-y-4">
              <p className="text-sm sm:text-base text-muted-foreground">
                Connect your wallet to create tokens
              </p>
              <WalletConnection />
            </div>
          ) : (
            <div className="space-y-4">
              <Link href="/launch">
                <Button 
                  className="px-12 py-4 text-lg sm:text-xl bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 hover:from-pink-600 hover:via-purple-700 hover:to-blue-700 shadow-xl hover:shadow-2xl transition-all duration-200 font-bold relative overflow-hidden group"
                  disabled={!isConnected}
                >
                  {/* Efecto de luz animada en el borde */}
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-300 via-purple-400 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg blur-sm -z-10"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 rounded-lg -z-10"></div>
                  
                  {/* Contenido del botón */}
                  <div className="relative z-10 flex items-center">
                    <img src="/icozora.png" alt="Zora" className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                    <Rocket className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                    <span>{isConnected ? "Launch Coin" : "Connect Wallet First"}</span>
                  </div>
                </Button>
              </Link>
              
              {/* Status Info */}
              <div className="flex justify-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-green-800">Authenticated</span>
                </div>
                <div className="flex items-center gap-1">
                  <Wallet className={`w-4 h-4 ${isConnected ? 'text-green-600' : 'text-gray-400'}`} />
                  <span className={isConnected ? 'text-green-800' : 'text-gray-600'}>
                    {isConnected ? "Wallet Connected" : "Wallet Disconnected"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Interactive Feature Carousel */}
        <div className="py-4">
          <FeatureCarousel />
        </div>
      </div>
      
      {/* Bottom Navigation */}
      <div className="flex-shrink-0">
        <BottomNavigation />
      </div>
    </div>
  );
}
