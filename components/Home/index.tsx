"use client";

import { useUser } from "@/contexts/user-context";
import { useAccount } from "wagmi";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Rocket, Zap, Shield, CheckCircle, Wallet } from "lucide-react";
import { UserMenu } from "@/components/UserMenu";
import { BottomNavigation } from "@/components/BottomNavigation";
import { FeatureCarousel } from "@/components/FeatureCarousel";

export default function Home() {
  const { user, isLoading, error, signIn } = useUser();
  const { isConnected } = useAccount();

  return (
    <div className="bg-white text-black min-h-screen pb-20">
      {/* Top Navigation Bar */}
      <div className="max-w-4xl mx-auto flex justify-between items-center p-4 rounded-b-xl border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="flex items-center gap-2">
          <Image
            src="/icon.png"
            alt="Zora Creator Logo"
            className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg"
            width={32}
            height={32}
          />
          <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Zbase Creator
          </span>
        </div>
        
        {/* User Menu */}
        <UserMenu />
      </div>

      <div className="max-w-4xl mx-auto px-4 space-y-6">
        {/* Header */}
        <div className="text-center space-y-3 py-6 sm:py-8">
          <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Zbase Creator
          </h1>
          <p className="text-sm sm:text-lg text-muted-foreground">
            Create tokens on Base using the Zora Protocol
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
        </div>

        {/* Main Action */}
        <div className="text-center space-y-4">
          {!user?.data ? (
            <div className="space-y-4">
              <p className="text-sm sm:text-base text-muted-foreground">
                Sign in to create tokens
              </p>
              <Button
                onClick={signIn}
                disabled={isLoading}
                className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 min-h-[48px]"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Sign in with Farcaster</span>
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Link href="/launch">
                <Button 
                  className="w-full sm:w-auto px-8 py-4 text-lg sm:text-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-xl hover:shadow-2xl transition-all duration-200 font-bold"
                  disabled={!isConnected}
                >
                  <Rocket className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                  {isConnected ? "Create Token" : "Connect Wallet First"}
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
        <FeatureCarousel />
      </div>
      
      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
