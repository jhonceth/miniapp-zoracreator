"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ImageUpload } from "./ImageUpload";
import { RealTokenDisplay } from "./RealTokenDisplay";
import { useDeployment } from "@/hooks/use-deployment";
import { useNetworkInfo } from "@/hooks/use-network-info";
import { useAccount, useSwitchChain, useConnect } from "wagmi";
import { AlertTriangle, Rocket, ExternalLink, CheckCircle, Zap, Network, Shield, DollarSign, Info, ChevronDown, ChevronRight, Monitor, Wallet } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { TokenFormData } from "@/types/launch";
import { validateImageFile, validateWalletAddress, IMAGE_VALIDATION_CONFIG } from "@/lib/image-validation";

export function LaunchForm() {
  const { address, isConnected } = useAccount();
  const { switchChain } = useSwitchChain();
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const { networkInfo, mounted } = useNetworkInfo();
  const {
    deployToken,
    resetDeployment,
    isPreparingDeployment,
    isUploadingImage,
    isCreatingMetadata,
    isDeployingContract,
    isPending,
    isConfirming,
    isConfirmed,
    transactionHash,
    createdToken,
    error,
    progress,
    currentChain,
    isSupportedChain,
    isDeploying,
  } = useDeployment();

  const [formData, setFormData] = useState<TokenFormData>({
    name: "",
    symbol: "",
    description: "",
    image: null,
    currency: "ZORA",
    initialPurchase: "0",
    payoutRecipient: "",
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  // Función para cambiar de red
  const handleNetworkChange = async (chainId: number) => {
    try {
      await switchChain({ chainId });
    } catch (error) {
      console.error("Error switching network:", error);
    }
  };


  // Determinar la moneda basada en la red actual
  const getCurrencyForChain = (chainId: number) => {
    if (chainId === 84532) { // Base Sepolia
      return "ETH"
    } else if (chainId === 8453) { // Base Mainnet
      return "ZORA"
    }
    return "ZORA" // Default
  }

  // Actualizar moneda cuando cambie la red
  useEffect(() => {
    if (mounted && networkInfo.chainId) {
      const newCurrency = getCurrencyForChain(networkInfo.chainId)
      setFormData(prev => ({
        ...prev,
        currency: newCurrency
      }))
    }
  }, [mounted, networkInfo.chainId])

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.name || !formData.name.trim()) {
      errors.name = "Token name is required"
    } else if (formData.name.length > 50) {
      errors.name = "Name must be maximum 50 characters"
    }

    if (!formData.symbol || !formData.symbol.trim()) {
      errors.symbol = "Token symbol is required"
    } else if (formData.symbol.length > 10) {
      errors.symbol = "Symbol must be maximum 10 characters"
    }

    if (!formData.description || !formData.description.trim()) {
      errors.description = "Description is required"
    } else if (formData.description.length > 500) {
      errors.description = "Description must be maximum 500 characters"
    }

    // Usar validación centralizada para imagen
    const imageValidation = validateImageFile(formData.image)
    if (!imageValidation.isValid) {
      errors.image = imageValidation.error || "Invalid image"
    }

    // Usar validación centralizada para dirección de wallet
    const addressValidation = validateWalletAddress(formData.payoutRecipient)
    if (!addressValidation.isValid) {
      errors.payoutRecipient = addressValidation.error || "Invalid address"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleInputChange = (field: keyof TokenFormData, value: string | File | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    if (!isConnected) {
      setValidationErrors({ general: "Por favor conecta tu wallet primero" })
      return
    }

    if (!isSupportedChain) {
      setValidationErrors({ general: "Por favor cambia a Base Mainnet o Base Sepolia" })
      return
    }

    // Use connected address as default payout recipient
    const finalFormData: TokenFormData = {
      ...formData,
      payoutRecipient: formData.payoutRecipient || address || "",
    }

    try {
      await deployToken(finalFormData)
    } catch (err) {
      console.error("Error en envío del formulario:", err)
      // No establecer errores aquí para evitar loops infinitos
      // El hook useDeployment ya maneja los errores
    }
  }

  const handleRetry = async (e: React.MouseEvent) => {
    e.preventDefault()
    
    // Limpiar errores antes de reintentar
    setValidationErrors({})
    
    // Resetear el estado de deployment para permitir reintentar
    resetDeployment()
    
    // Llamar al mismo handleSubmit pero sin el preventDefault
    if (!validateForm()) {
      return
    }

    if (!isConnected) {
      setValidationErrors({ general: "Por favor conecta tu wallet primero" })
      return
    }

    if (!isSupportedChain) {
      setValidationErrors({ general: "Por favor cambia a Base Mainnet o Base Sepolia" })
      return
    }

    // Use connected address as default payout recipient
    const finalFormData: TokenFormData = {
      ...formData,
      payoutRecipient: formData.payoutRecipient || address || "",
    }

    try {
      await deployToken(finalFormData)
    } catch (err) {
      console.error("Error en reintento del formulario:", err)
      // No establecer errores aquí para evitar loops infinitos
      // El hook useDeployment ya maneja los errores
    }
  }

  const handleReset = () => {
    resetDeployment()
    setFormData({
      name: "",
      symbol: "",
      description: "",
      image: null,
      currency: "ZORA",
      initialPurchase: "0",
      payoutRecipient: "",
    })
    setValidationErrors({})
  }

  // Show success state
  if (isConfirmed && createdToken) {
    return (
      <RealTokenDisplay 
        token={createdToken} 
        onCreateAnother={handleReset}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Wallet Connection Status */}
      {!isConnected && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
              <Wallet className="h-5 w-5" />
              Conectar Wallet de Farcaster
            </CardTitle>
            <CardDescription className="text-orange-700 dark:text-orange-300">
              Conecta tu wallet de Farcaster para poder crear tokens en Base
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {connectors.map((connector) => (
                <Button
                  key={connector.uid}
                  onClick={() => connect({ connector })}
                  disabled={isConnecting}
                  className="w-full"
                  variant="outline"
                >
                  {isConnecting ? "Conectando..." : `Conectar con ${connector.name}`}
                </Button>
              ))}
            </div>
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-4">
              Usa la wallet integrada de Farcaster para la mejor experiencia
            </p>
          </CardContent>
        </Card>
      )}


      {/* Inline status removed in favor of button text updates */}

      {/* Error Display */}
      {(error || validationErrors.general) && (
        <Alert variant={error?.includes("cancelled") ? "default" : "destructive"}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error?.includes("cancelled") ? (
              <>
                <strong>🚫 Transaction Cancelled</strong>
                <br />
                <p className="mt-2">
                  You cancelled the transaction signature in your wallet. No token has been created. You can try creating the token again when you&apos;re ready.
                </p>
                <div className="mt-4">
                  <Button 
                    onClick={handleRetry} 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                    size="sm"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                </div>
              </>
            ) : (
              <>
                <strong>Error:</strong> {error || validationErrors.general}
                <br />
                <br />
                <strong>Possible solutions:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Make sure you&apos;re on Base Mainnet (8453) or Base Sepolia (84532)</li>
                  <li>Ensure you have enough ETH for gas fees</li>
                  <li>Try with a different token symbol</li>
                  <li>Verify that the image is valid ({IMAGE_VALIDATION_CONFIG.ALLOWED_TYPES.map(type => type.split('/')[1].toUpperCase()).join(', ')})</li>
                  <li>Make sure the file is {IMAGE_VALIDATION_CONFIG.UI_INFO.MAX_SIZE_MB}MB or less</li>
                </ul>
              </>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">Z</span>
              </div>
              <span className="text-sm text-secondary">Deploy in Zora Ecosystem</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleNetworkChange(networkInfo.chainId === 8453 ? 84532 : 8453)}
                className="flex items-center gap-2 px-3 py-1"
              >
                <Monitor className="h-4 w-4" />
                {networkInfo.icon}
                <span className="font-medium">{networkInfo.name}</span>
              </Button>
              <Badge variant="default" className={`${networkInfo.chainId === 8453 ? 'bg-purple-600' : 'bg-orange-600'}`}>
                {networkInfo.chainId === 8453 ? 'PRODUCTION' : 'DEV TESTNET'}
              </Badge>
            </div>
          </CardTitle>
          <CardDescription>
            Complete all fields to create your token on the blockchain.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="flex gap-3">
              <div className="w-3/5">
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="name"
                  maxLength={50}
                  disabled={isDeploying}
                  className="text-sm"
                />
                {validationErrors.name && (
                  <p className="text-sm text-red-600 mt-1">{validationErrors.name}</p>
                )}
              </div>

              <div className="w-2/5">
                <Input
                  id="symbol"
                  value={formData.symbol}
                  onChange={(e) => handleInputChange("symbol", e.target.value.toUpperCase())}
                  placeholder="ticker"
                  maxLength={10}
                  disabled={isDeploying}
                  className="text-sm"
                />
                {validationErrors.symbol && (
                  <p className="text-sm text-red-600 mt-1">{validationErrors.symbol}</p>
                )}
              </div>
            </div>

            {/* Description and Image Upload */}
            <div className="flex gap-3">
              <div className="flex-1">
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="description"
                  rows={1}
                  maxLength={500}
                  disabled={isDeploying}
                  className="text-sm"
                />
                {validationErrors.description && (
                  <p className="text-sm text-red-600 mt-1">{validationErrors.description}</p>
                )}
              </div>
              
              <div className="w-32">
                <ImageUpload
                  onImageSelect={(file) => handleInputChange("image", file)}
                  error={validationErrors.image}
                />
              </div>
            </div>

            {/* Advanced Options */}
            <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                  <span className="flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Advanced Options
                  </span>
                  {isAdvancedOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 mt-4">
                {/* Currency Selection */}
                <div className="space-y-2">
                  <Label htmlFor="currency">Backing Currency *</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => handleInputChange("currency", value)}
                    disabled={isDeploying || networkInfo.chainId === 84532}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ZORA">ZORA Token (Recommended)</SelectItem>
                      <SelectItem value="ETH">ETH (Ethereum)</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {networkInfo.chainId === 84532 
                        ? "Base Sepolia only allows ETH as backing currency"
                        : formData.currency === "ZORA" 
                          ? "ZORA is the default currency on Base Mainnet and offers better liquidity"
                          : "ETH is widely accepted but may have higher fees"
                      }
                    </p>
                    {networkInfo.chainId === 84532 && (
                      <a 
                        href="https://console.optimism.io/faucet" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 underline"
                      >
                        Get free ETH →
                      </a>
                    )}
                  </div>
                </div>

                {/* Payout Recipient */}
                <div className="space-y-2">
                  <Label htmlFor="payoutRecipient">Payout Address (optional)</Label>
                  <Input
                    id="payoutRecipient"
                    value={formData.payoutRecipient}
                    onChange={(e) => handleInputChange("payoutRecipient", e.target.value)}
                    placeholder={address || "0x..."}
                    disabled={isDeploying}
                  />
                  <p className="text-xs text-muted-foreground">
                    Address that will receive creator rewards. If left empty, your connected address will be used.
                  </p>
                  {validationErrors.payoutRecipient && (
                    <p className="text-sm text-red-600">{validationErrors.payoutRecipient}</p>
                  )}
                </div>

              </CollapsibleContent>
            </Collapsible>


            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-accent-blue to-accent-blue/80 hover:from-accent-blue/90 hover:to-accent-blue/70 text-primary"
              disabled={!isConnected || isDeploying || !isSupportedChain}
              size="lg"
            >
              {isDeploying ? (
                isPreparingDeployment ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Initializing deployment...
                  </>
                ) : isUploadingImage ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Preparing image data...
                  </>
                ) : isCreatingMetadata ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating metadata & uploading to IPFS...
                  </>
                ) : isDeployingContract ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deploying smart contract...
                  </>
                ) : isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Waiting for wallet signature...
                  </>
                ) : isConfirming ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Confirming transaction...
                  </>
                ) : isConfirmed ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Token created successfully!
                  </>
                ) : (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing transaction...
                  </>
                )
              ) : !isConnected ? (
                <>
                  <Wallet className="h-4 w-4 mr-2" />
                  Connect Your Wallet First
                </>
              ) : !isSupportedChain ? (
                <>
                  <Network className="h-4 w-4 mr-2" />
                  Switch to Base Network
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Launch Your Coin
                </>
              )}
            </Button>

            {/* Progress Bar */}
            {isDeploying && progress > 0 && (
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm text-secondary">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-card-dark rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-accent-blue to-accent-blue/80 h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {!isConnected && (
              <p className="text-center text-sm text-accent-blue">
                🔗 Conecta tu wallet de Farcaster para continuar
              </p>
            )}

            {isConnected && !isSupportedChain && (
              <p className="text-center text-sm text-price-negative">
                ⚠️ Por favor cambia a Base Mainnet (8453) o Base Sepolia (84532)
              </p>
            )}

            {isConnected && isSupportedChain && (
              <p className="text-center text-sm text-price-positive">
                ✅ Ready to create your token
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}