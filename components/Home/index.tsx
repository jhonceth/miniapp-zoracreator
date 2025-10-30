"use client";

import { useUser } from "@/contexts/user-context";
import { useAccount } from "wagmi";
import { useFarcasterContext } from "@/hooks/use-farcaster-context";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Rocket, Zap, Shield, CheckCircle, Wallet, Share2 } from "lucide-react";
import { UserMenu } from "@/components/UserMenu";
import { BottomNavigation } from "@/components/BottomNavigation";
import SearchBar from "@/components/SearchBar";
import { ZoraCoinsExplorer } from "@/components/zora-coins-explorer";
import { SignInPrompt } from "@/components/SignInPrompt";

export default function Home() {
  const { user, isLoading, error, signIn } = useUser();
  const { isConnected } = useAccount();
  const { context: farcasterContext, isLoading: farcasterLoading } = useFarcasterContext();

  const shareApp = async () => {
    const base = typeof window !== 'undefined' ? window.location.origin : ''
    const url = base
    const text = `Explore, share, create the best Zoracoin in base ${url}`
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
    <div className="bg-gradient-to-br from-[#0A0F1C] to-[#101A2D] text-primary h-screen flex flex-col">
      {/* Top Navigation Bar */}
      <div className="w-full flex justify-between items-center px-4 py-2 border-b border-card-dark bg-card-dark/50 backdrop-blur-sm flex-shrink-0 relative z-10" style={{zIndex: 10}}>
        <div className="flex items-center gap-2">
          <Image
            src="/icon.png"
            alt="ZCreate"
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg"
            width={40}
            height={40}
          />
          <span className="text-lg font-bold text-primary">ZCreate</span>
        </div>
        
        {/* Spacer */}
        <div className="flex-1"></div>
        
        {/* Share Button */}
        <button
          onClick={shareApp}
          className="p-2 hover:bg-card-dark/50 rounded-lg flex items-center gap-2 mr-2"
          title="Share on Farcaster"
        >
          <img src="/farcaster.png" alt="Farcaster" className="w-4 h-4" />
          <Share2 className="h-4 w-4 text-primary" />
        </button>
        
        {/* User Menu */}
        <div className="relative" style={{zIndex: 999999}}>
          <UserMenu />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto relative" style={{zIndex: 0}}>
        <ZoraCoinsExplorer />
      </div>
      
      {/* Bottom Navigation */}
      <div className="flex-shrink-0 relative" style={{zIndex: 0}}>
        <BottomNavigation />
      </div>
    </div>
  );
}
