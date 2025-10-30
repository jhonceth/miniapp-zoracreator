"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LaunchForm } from "@/components/launch/LaunchForm";
import { BottomNavigation } from "@/components/BottomNavigation";
import { UserMenu } from "@/components/UserMenu";
import { SignInPrompt } from "@/components/SignInPrompt";
import { useUser } from "@/contexts/user-context";
import { useFarcasterContext } from "@/hooks/use-farcaster-context";

export default function LaunchPage() {
  const { user, isLoading } = useUser();
  const { context: farcasterContext, isLoading: farcasterLoading } = useFarcasterContext();

  // Show sign-in prompt if user is in Farcaster context but not authenticated
  const needsSignIn = farcasterContext && !user?.data && !isLoading && !farcasterLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0F1C] to-[#101A2D] pb-20">
      <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6">
        {/* Header with User Menu */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="outline" size="sm" className="h-8 px-2 sm:px-3">
                <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Back</span>
              </Button>
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold text-primary">
              Launch Coin
            </h1>
          </div>
          
          {/* User Menu */}
          <UserMenu />
        </div>

        {/* Content */}
        {needsSignIn ? (
          <SignInPrompt />
        ) : (
          <div className="max-w-2xl mx-auto">
            <LaunchForm />
          </div>
        )}
      </div>
      
      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
