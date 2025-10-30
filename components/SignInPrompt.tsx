"use client";

import { useState } from "react";
import { useUser } from "@/contexts/user-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Loader2 } from "lucide-react";

export function SignInPrompt() {
  const { signIn, isLoading, error } = useUser();
  const [localError, setLocalError] = useState<string | null>(null);

  // Use local error state if available, otherwise use context error
  const displayError = localError || error;

  const handleSignIn = async () => {
    setLocalError(null); // Clear any previous errors
    try {
      await signIn();
    } catch (err) {
      // This shouldn't happen since signIn handles errors internally
      console.error("Unexpected error:", err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[200px] p-4">
      <Card className="bg-card-dark border-card-dark max-w-md w-full">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-accent-blue/60 to-accent-blue/40 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-primary">Welcome to ZCreate</CardTitle>
          <CardDescription className="text-secondary">
            Sign in with Farcaster to create and manage your tokens
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleSignIn}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-accent-blue to-accent-blue/80 hover:from-accent-blue/90 hover:to-accent-blue/70 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Sign in with Farcaster
              </>
            )}
          </Button>
          
          {displayError && (
            <div className="p-3 bg-price-negative/10 border border-price-negative/20 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-price-negative rounded-full"></div>
                <span className="text-price-negative font-medium text-sm">Sign In Error</span>
              </div>
               <p className="text-price-negative text-sm mt-1">
                 {typeof displayError === 'string' ? displayError : displayError.message}
               </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocalError(null)}
                className="mt-2 text-xs"
              >
                Dismiss
              </Button>
            </div>
          )}
          
          <div className="text-xs text-secondary text-center">
                   You can browse tokens without signing in, but you&apos;ll need to sign in to create your own tokens.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
