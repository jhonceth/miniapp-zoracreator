"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useUpdateCoinURI } from "@/hooks/use-update-coin-uri";
import { 
  X, 
  Edit, 
  AlertTriangle, 
  CheckCircle, 
  ExternalLink,
  RefreshCw
} from "lucide-react";

interface UpdateURIModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokenAddress: string;
  currentURI?: string;
  onSuccess?: () => void;
}

export function UpdateURIModal({ 
  isOpen, 
  onClose, 
  tokenAddress, 
  currentURI,
  onSuccess 
}: UpdateURIModalProps) {
  const [newURI, setNewURI] = useState("");
  const { updateURI, isUpdating, error, success, hash, reset } = useUpdateCoinURI();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newURI.trim()) {
      return;
    }

    await updateURI({
      coin: tokenAddress as `0x${string}`,
      newURI: newURI.trim(),
    });
  };

  const handleClose = () => {
    setNewURI("");
    reset();
    onClose();
  };

  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess();
    }
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white shadow-2xl border-2 border-gray-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Edit className="w-5 h-5 text-purple-600" />
              Actualizar URI
            </CardTitle>
            <Button variant="outline" size="sm" onClick={handleClose} className="h-8 w-8 p-0">
              <X className="w-4 h-4" />
            </Button>
          </div>
          <CardDescription className="text-sm">
            Actualiza la URI de metadata del token
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Current URI */}
          {currentURI && (
            <div className="space-y-1">
              <Label className="text-xs font-medium text-gray-600">URI Actual:</Label>
              <div className="p-2 bg-gray-50 rounded text-xs font-mono break-all border">
                {currentURI}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="newURI" className="text-sm font-medium">Nueva URI *</Label>
              <Input
                id="newURI"
                value={newURI}
                onChange={(e) => setNewURI(e.target.value)}
                placeholder="ipfs://bafkreihz5knnvvsvmaxlpw3kout23te6yboquyvvs72wzfulgrkwj7r7dm"
                disabled={isUpdating}
                className="font-mono text-sm h-10"
              />
              <p className="text-xs text-gray-500">
                Debe comenzar con &quot;ipfs://&quot; o &quot;https://&quot;
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
                    <p>¡URI actualizada exitosamente!</p>
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
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isUpdating}
                className="flex-1 h-10"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={!newURI.trim() || isUpdating}
                className="flex-1 h-10 bg-purple-600 hover:bg-purple-700"
              >
                {isUpdating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  <>
                    <Edit className="w-4 h-4 mr-2" />
                    Actualizar
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
