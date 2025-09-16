"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { getCoin } from "@zoralabs/coins-sdk";
import { UserMenu } from "@/components/UserMenu";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  RefreshCw,
  Wallet,
  Zap,
  Hash,
  CheckCircle,
  Copy,
  ExternalLink,
  ImageIcon,
  DollarSign,
  Activity,
  Users,
  Calendar,
  Settings,
  Link as LinkIcon,
  User,
  Share2,
} from "lucide-react";
import { UpdateURIModal } from "@/components/UpdateURIModal";
import { UpdatePayoutRecipientModal } from "@/components/UpdatePayoutRecipientModal";

interface TokenPageProps {
  address: string;
}

export default function TokenPage({ address }: TokenPageProps) {
  const { address: userAddress, isConnected } = useAccount();
  const router = useRouter();
  const [coin, setCoin] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [backUrl, setBackUrl] = useState("/profile"); // Default fallback

  console.log("🔍 TokenPage - Address recibida:", address);

  // Detectar desde dónde vino el usuario
  useEffect(() => {
    const detectSourcePage = () => {
      // Verificar si hay parámetro de URL
      const urlParams = new URLSearchParams(window.location.search);
      const from = urlParams.get('from');
      
      if (from) {
        console.log("📍 Detectado parámetro 'from':", from);
        setBackUrl(from);
        return;
      }

      // Verificar el referrer
      const referrer = document.referrer;
      console.log("📍 Referrer detectado:", referrer);
      
      if (referrer) {
        const referrerUrl = new URL(referrer);
        const referrerPath = referrerUrl.pathname;
        
        if (referrerPath.includes('/my-coins')) {
          console.log("📍 Vino desde /my-coins");
          setBackUrl("/my-coins");
        } else if (referrerPath.includes('/profile')) {
          console.log("📍 Vino desde /profile");
          setBackUrl("/profile");
        } else if (referrerPath.includes('/')) {
          console.log("📍 Vino desde página principal");
          setBackUrl("/");
        }
      }
    };

    detectSourcePage();
  }, []);

  useEffect(() => {
    const fetchCoinDetails = async () => {
      if (!address) return;

      setIsLoading(true);
      setError(null);

      try {
        console.log("🔍 Obteniendo detalles del token:", address);
        
        const response = await getCoin({
          address: address,
          chain: 8453, // Base Mainnet
        });

        console.log("✅ Respuesta de getCoin:", response);

        if (response.data?.zora20Token) {
          setCoin(response.data.zora20Token);
          console.log("📊 Detalles del token obtenidos:", response.data.zora20Token);
        } else {
          console.log("ℹ️ No se encontraron detalles del token");
          setError("Token no encontrado");
        }
      } catch (err) {
        console.error("❌ Error obteniendo detalles del token:", err);
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoinDetails();
  }, [address]);

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const formatNumber = (value: string | number | undefined) => {
    if (value === undefined || value === null) return "N/A";
    const num = parseFloat(value.toString());
    if (isNaN(num)) return "N/A";
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(2);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("es", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showUpdateURIModal, setShowUpdateURIModal] = useState(false);
  const [showUpdatePayoutModal, setShowUpdatePayoutModal] = useState(false);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error("Error copying to clipboard:", error);
    }
  };

  const openInExplorer = (address: string) => {
    window.open(`https://basescan.org/token/${address}`, '_blank');
  };

  const refetch = () => {
    if (address) {
      window.location.reload();
    }
  };

  const shareToken = async () => {
    const shareUrl = `${window.location.origin}/share/token/${address}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${coin?.name || 'Token'} - Zbase Creator`,
          text: `Check out this token created on Zbase Creator!`,
          url: shareUrl,
        });
      } catch (error) {
        console.log('Error sharing:', error);
        // Fallback to copying URL
        copyToClipboard(shareUrl, 'share');
      }
    } else {
      // Fallback to copying URL
      copyToClipboard(shareUrl, 'share');
    }
  };

  const isAdmin = userAddress && coin?.creatorAddress && 
    userAddress.toLowerCase() === coin.creatorAddress.toLowerCase();

  if (!isConnected) {
    return (
      <div className="bg-white text-black min-h-screen p-4">
        <div className="max-w-4xl mx-auto text-center py-12">
          <Wallet className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Wallet Disconnected</h2>
          <p className="text-gray-600 mb-6">
            Connect your wallet to view token details
          </p>
          <Link href="/">
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white text-black min-h-screen pb-20">
      {/* Top Navigation Bar */}
      <div className="max-w-4xl mx-auto mb-4 sm:mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href={backUrl}>
              <Button variant="outline" size="sm" className="h-8 px-2 sm:px-3">
                <ArrowLeft className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Back</span>
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Zap className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Token Details
              </span>
            </div>
          </div>
          
          {/* User Menu */}
          <UserMenu />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 space-y-6">
        {/* Loading State */}
        {isLoading && (
          <Card>
            <CardContent className="py-6 sm:py-8">
              <div className="text-center">
                <RefreshCw className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 mx-auto mb-3 sm:mb-4 animate-spin" />
                <p className="text-sm sm:text-base text-gray-600">Cargando detalles del token...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="py-6 sm:py-8">
              <div className="text-center">
                <p className="text-sm sm:text-base text-red-600 mb-4">Error cargando detalles: {error}</p>
                <Button onClick={refetch} variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 h-8 sm:h-10">
                  <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  <span className="text-xs sm:text-sm">Reintentar</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Token Details */}
        {!isLoading && !error && coin && (
          <>
            {/* Token Header - Compacto para móvil */}
            <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
              <CardHeader className="p-3 sm:p-6">
                <div className="flex items-center gap-3 sm:gap-4">
                  {/* Token Image */}
                  <div className="relative flex-shrink-0">
                    {coin.mediaContent?.previewImage?.medium ? (
                      <Image
                        src={coin.mediaContent.previewImage.medium}
                        alt={coin.name || "Token"}
                        className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg border-2 border-purple-200 shadow-lg object-cover"
                        width={64}
                        height={64}
                      />
                    ) : (
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg border-2 border-purple-200 shadow-lg bg-gradient-to-r from-purple-400 to-blue-400 flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                      </div>
                    )}
                    <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                      <CheckCircle className="w-1.5 h-1.5 sm:w-2 sm:h-2 text-white" />
                    </div>
                  </div>

                  {/* Token Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                      <h1 className="text-lg sm:text-xl font-bold text-purple-900 truncate">
                        {coin.name || "Sin nombre"}
                      </h1>
                      <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-xs">
                        ${coin.symbol || "N/A"}
                      </Badge>
                    </div>
                    
                    {/* Contract Address */}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-mono text-gray-500">
                        {formatAddress(coin.address || "")}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(coin.address || "", "contract")}
                        className="h-5 w-5 p-0 flex-shrink-0"
                      >
                        {copiedField === "contract" ? (
                          <CheckCircle className="h-2.5 w-2.5 text-green-600" />
                        ) : (
                          <Copy className="h-2.5 w-2.5" />
                        )}
                      </Button>
                    </div>
                    
                    <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">
                      {coin.description || "Sin descripción"}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    {/* Share Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={shareToken}
                      className="h-8 w-8 sm:h-10 sm:w-auto p-0 sm:px-3 flex-shrink-0"
                      title="Share Token"
                    >
                      <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline ml-2 text-xs sm:text-sm">Share</span>
                    </Button>
                    
                    {/* Refresh Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={refetch}
                      disabled={isLoading}
                      className="h-8 w-8 sm:h-10 sm:w-auto p-0 sm:px-3 flex-shrink-0"
                    >
                      <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${isLoading ? 'animate-spin' : ''}`} />
                      <span className="hidden sm:inline ml-2 text-xs sm:text-sm">Actualizar</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Token Stats - Compacto para móvil */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
              <Card>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                    <span className="text-xs sm:text-sm text-gray-600">Cap. Mercado</span>
                  </div>
                  <p className="text-sm sm:text-lg font-bold text-gray-900 mt-1">
                    ${formatNumber(coin.marketCap)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Users className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                    <span className="text-xs sm:text-sm text-gray-600">Holders</span>
                  </div>
                  <p className="text-sm sm:text-lg font-bold text-gray-900 mt-1">
                    {coin.uniqueHolders || 0}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Activity className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
                    <span className="text-xs sm:text-sm text-gray-600">Volumen 24h</span>
                  </div>
                  <p className="text-sm sm:text-lg font-bold text-gray-900 mt-1">
                    ${formatNumber(coin.volume24h)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600" />
                    <span className="text-xs sm:text-sm text-gray-600">Creado</span>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-gray-900 mt-1">
                    {formatDate(coin.createdAt)}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Token Details - Compacto para móvil */}
            <Card>
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <Hash className="w-4 h-4 sm:w-5 sm:h-5" />
                  Token Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0">
                <div className="flex items-center justify-between">
                  {/* Network */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500">Network</label>
                    <div className="flex items-center">
                      <Image
                        src="/base.png"
                        alt="Base Mainnet"
                        className="w-4 h-4"
                        width={16}
                        height={16}
                        title="Base Mainnet"
                      />
                    </div>
                  </div>

                  {/* Total Supply */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500">Total Supply</label>
                    <p className="text-xs text-gray-900">
                      {formatNumber(coin.totalSupply)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Admin Section - Compacto para móvil */}
            {isAdmin && (
              <Card className="border-orange-200 bg-orange-50">
                <CardHeader className="p-3 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-orange-800 text-sm sm:text-base">
                    <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                    Admin Only
                  </CardTitle>
                  <CardDescription className="text-orange-700 text-xs sm:text-sm">
                    These functions are available only for the token creator
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-3 sm:p-6 pt-0">
                  <div className="flex flex-row gap-2">
                    <Button 
                      variant="outline" 
                      className="border-orange-200 text-orange-700 hover:bg-orange-100 h-8 sm:h-10 text-xs sm:text-sm"
                      onClick={() => setShowUpdateURIModal(true)}
                    >
                      <LinkIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      Update URI
                    </Button>
                    <Button 
                      variant="outline" 
                      className="border-orange-200 text-orange-700 hover:bg-orange-100 h-8 sm:h-10 text-xs sm:text-sm"
                      onClick={() => setShowUpdatePayoutModal(true)}
                    >
                      <User className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      Change Recipient
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Modals */}
            <UpdateURIModal
              isOpen={showUpdateURIModal}
              tokenAddress={coin.address}
              currentURI={coin.tokenUri}
              onClose={() => setShowUpdateURIModal(false)}
              onSuccess={() => {
                setShowUpdateURIModal(false);
                refetch();
              }}
            />

            <UpdatePayoutRecipientModal
              isOpen={showUpdatePayoutModal}
              tokenAddress={coin.address}
              currentRecipient={coin.payoutRecipientAddress}
              onClose={() => setShowUpdatePayoutModal(false)}
              onSuccess={() => {
                setShowUpdatePayoutModal(false);
                refetch();
              }}
            />
          </>
        )}
      </div>
      
      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}