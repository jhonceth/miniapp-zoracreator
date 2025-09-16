"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useUpdatePayoutRecipient } from "@/hooks/use-update-payout-recipient";
import { 
  X, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle, 
  ExternalLink,
  RefreshCw,
  Copy
} from "lucide-react";

interface UpdatePayoutRecipientModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokenAddress: string;
  currentRecipient?: string;
  onSuccess?: () => void;
}

export function UpdatePayoutRecipientModal({ 
  isOpen, 
  onClose, 
  tokenAddress, 
  currentRecipient,
  onSuccess 
}: UpdatePayoutRecipientModalProps) {
  const [newRecipient, setNewRecipient] = useState("");
  const { updatePayoutRecipient, isUpdating, error, success, hash, reset } = useUpdatePayoutRecipient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newRecipient.trim()) {
      return;
    }

    await updatePayoutRecipient({
      coin: tokenAddress as `0x${string}`,
      newPayoutRecipient: newRecipient.trim() as `0x${string}`,
    });
  };

  const handleClose = () => {
    setNewRecipient("");
    reset();
    onClose();
  };

  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess();
    }
    handleClose();
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error("Error copying to clipboard:", error);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white shadow-2xl border-2 border-gray-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="w-5 h-5 text-purple-600" />
              Cambiar Receptor
            </CardTitle>
            <Button variant="outline" size="sm" onClick={handleClose} className="h-8 w-8 p-0">
              <X className="w-4 h-4" />
            </Button>
          </div>
          <CardDescription className="text-sm">
            Cambia la dirección que recibirá los pagos
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Current Recipient */}
          {currentRecipient && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Receptor Actual:</Label>
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-xs font-mono">
                  {formatAddress(currentRecipient)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(currentRecipient)}
                  className="h-6 w-6 p-0"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newRecipient">Nueva Dirección del Receptor *</Label>
              <Input
                id="newRecipient"
                value={newRecipient}
                onChange={(e) => setNewRecipient(e.target.value)}
                placeholder="0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
                disabled={isUpdating}
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-500">
                Debe ser una dirección Ethereum válida (0x...)
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Success Display */}
            {success && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <div className="space-y-2">
                    <p>¡Receptor de pagos actualizado exitosamente!</p>
                    {hash && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs">Transacción:</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`https://basescan.org/tx/${hash}`, '_blank')}
                          className="h-6 text-xs"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Ver en Basescan
                        </Button>
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isUpdating}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={!newRecipient.trim() || isUpdating}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                {isUpdating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  <>
                    <DollarSign className="w-4 h-4 mr-2" />
                    Cambiar Receptor
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
