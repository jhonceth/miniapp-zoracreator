"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMiniApp } from "@/contexts/miniapp-context";
import { useUser } from "@/contexts/user-context";
import { useAccount, useConnect, useSwitchChain } from "wagmi";
import { Wallet, Zap, ExternalLink, Smartphone, Monitor } from "lucide-react";
import { base, baseSepolia } from "viem/chains";

interface WalletConnectionProps {
  onConnectionSuccess?: () => void;
}

export function WalletConnection({ onConnectionSuccess }: WalletConnectionProps) {
  const { context, isMiniAppReady } = useMiniApp();
  const { user, signIn, isLoading: userLoading } = useUser();
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const { switchChain } = useSwitchChain();

  const [isConnectingWallet, setIsConnectingWallet] = useState(false);
  
  // Detectar si estamos en contexto de Farcaster
  const isInFarcaster = !!context;
  const contextLoading = !isMiniAppReady;

  const handleFarcasterSignIn = async () => {
    try {
      await signIn();
      onConnectionSuccess?.();
    } catch (error) {
      console.error("Error signing in with Farcaster:", error);
    }
  };

  const handleNormalWalletConnect = async (connector: any) => {
    try {
      setIsConnectingWallet(true);
      await connect({ connector });
      
      // Cambiar automáticamente a Base Sepolia para testing
      await switchChain({ chainId: baseSepolia.id });
      
      onConnectionSuccess?.();
    } catch (error) {
      console.error("Error connecting wallet:", error);
    } finally {
      setIsConnectingWallet(false);
    }
  };

  if (contextLoading) {
    return (
      <Card className="border-gray-200 bg-gray-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
            <span className="ml-2 text-sm text-gray-600">Detectando contexto...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Indicador de contexto */}
      <div className="flex items-center justify-center gap-2">
        {isInFarcaster ? (
          <>
            <Smartphone className="h-4 w-4 text-purple-600" />
            <Badge className="bg-purple-100 text-purple-800">
              <Zap className="w-3 h-3 mr-1" />
              Farcaster Context
            </Badge>
          </>
        ) : (
          <>
            <Monitor className="h-4 w-4 text-blue-600" />
            <Badge className="bg-blue-100 text-blue-800">
              <ExternalLink className="w-3 h-3 mr-1" />
              Web Browser
            </Badge>
          </>
        )}
      </div>

      {/* Conexión para Farcaster */}
      {isInFarcaster && (
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <Zap className="h-5 w-5" />
              Farcaster Wallet
            </CardTitle>
            <CardDescription className="text-purple-700">
              Conecta usando tu wallet integrada de Farcaster
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!user?.data ? (
              <Button
                onClick={handleFarcasterSignIn}
                disabled={userLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {userLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Conectando...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Conectar con Farcaster
                  </>
                )}
              </Button>
            ) : (
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-green-800">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Conectado como {user.data.username}</span>
                </div>
                <p className="text-xs text-purple-600">
                  Wallet: {user.data.custody_address?.slice(0, 6)}...{user.data.custody_address?.slice(-4)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Conexión para navegador normal */}
      {!isInFarcaster && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Wallet className="h-5 w-5" />
              Wallet Externa
            </CardTitle>
            <CardDescription className="text-blue-700">
              Conecta usando MetaMask, WalletConnect u otra wallet externa
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isConnected ? (
              <div className="space-y-2">
                {connectors.map((connector) => (
                  <Button
                    key={connector.uid}
                    onClick={() => handleNormalWalletConnect(connector)}
                    disabled={isConnectingWallet || isConnecting}
                    className="w-full"
                    variant="outline"
                  >
                    {isConnectingWallet || isConnecting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2" />
                        Conectando...
                      </>
                    ) : (
                      <>
                        <Wallet className="w-4 h-4 mr-2" />
                        Conectar con {connector.name}
                      </>
                    )}
                  </Button>
                ))}
                <p className="text-xs text-blue-600 mt-2">
                  Se cambiará automáticamente a Base Sepolia para testing
                </p>
              </div>
            ) : (
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-green-800">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Wallet Conectada</span>
                </div>
                <p className="text-xs text-blue-600">
                  Dirección: {address?.slice(0, 6)}...{address?.slice(-4)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Información adicional */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          {isInFarcaster 
            ? "Usando la experiencia optimizada para Farcaster" 
            : "Usando la experiencia web estándar"
          }
        </p>
      </div>
    </div>
  );
}