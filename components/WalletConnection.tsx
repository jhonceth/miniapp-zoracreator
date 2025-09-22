"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, LogOut } from "lucide-react";

export function WalletConnection() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallet de Farcaster Conectada
          </CardTitle>
          <CardDescription>
            Tu wallet de Farcaster está conectada y lista para crear tokens
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm text-green-800 dark:text-green-200">
                <strong>Dirección:</strong> {address?.slice(0, 6)}...{address?.slice(-4)}
              </p>
            </div>
            <Button 
              onClick={() => disconnect()} 
              variant="outline" 
              className="w-full"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Desconectar Wallet
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Conectar Wallet de Farcaster
        </CardTitle>
        <CardDescription>
          Conecta tu wallet de Farcaster para poder crear tokens en Base
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {connectors.map((connector) => (
            <Button
              key={connector.uid}
              onClick={() => connect({ connector })}
              disabled={isPending}
              className="w-full"
              variant="outline"
            >
              {isPending ? "Conectando..." : `Conectar con ${connector.name}`}
            </Button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          Usa la wallet integrada de Farcaster para la mejor experiencia
        </p>
      </CardContent>
    </Card>
  );
}
