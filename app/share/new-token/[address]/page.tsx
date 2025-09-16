import { Metadata } from "next";
import { env } from "@/lib/env";
import { getCoin } from "@zoralabs/coins-sdk";

const appUrl = env.NEXT_PUBLIC_URL;

export async function generateMetadata({ params }: { params: Promise<{ address: string }> }): Promise<Metadata> {
  const { address } = await params;

  let tokenData = null;
  try {
    const response = await getCoin({ address: address, chain: 8453 }); // Base Mainnet
    tokenData = response.data?.zora20Token;
  } catch (error) {
    console.log("Could not fetch token data for metadata:", error);
  }

  const imageUrl = new URL(`${appUrl}/api/og/new-token/${address}`);
  const tokenName = tokenData?.name || `Token ${address.slice(0, 6)}...${address.slice(-4)}`;
  const tokenSymbol = tokenData?.symbol ? ` ($${tokenData.symbol})` : "";
  const tokenDescription = `Just created "${tokenName}"${tokenSymbol} on Zbase Creator platform`;

  const frame = {
    version: "next",
    imageUrl: imageUrl.toString(),
    button: {
      title: "View New Token",
      action: {
        type: "launch_frame",
        name: "View New Token",
        url: `${appUrl}/token/${address}`,
        splashImageUrl: imageUrl.toString(),
        splashBackgroundColor: "#10B981",
      },
    },
  };

  return {
    title: `New Token Created: ${tokenName}${tokenSymbol} - Zbase Creator`,
    description: tokenDescription,
    openGraph: {
      title: `New Token Created: ${tokenName}${tokenSymbol} - Zbase Creator`,
      description: tokenDescription,
      images: [{ url: imageUrl.toString() }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `New Token Created: ${tokenName}${tokenSymbol} - Zbase Creator`,
      description: tokenDescription,
      images: [imageUrl.toString()],
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}

export default async function NewTokenSharePage({ params }: { params: Promise<{ address: string }> }) {
  const { address } = await params;
  let tokenData = null;
  try {
    const response = await getCoin({ address: address, chain: 8453 });
    tokenData = response.data?.zora20Token;
  } catch (error) {
    console.log("Could not fetch token data:", error);
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full text-center">
        <div className="mb-6">
          {/* Celebration Header */}
          <div className="text-4xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">New Token Created!</h1>
          
          {/* Token Logo */}
          <div className="w-20 h-20 mx-auto mb-4 rounded-xl overflow-hidden border-4 border-green-200 shadow-lg">
            {tokenData?.mediaContent?.previewImage?.medium ? (
              <img 
                src={tokenData.mediaContent.previewImage.medium} 
                alt={tokenData.name || "Token"} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {tokenData?.name?.charAt(0) || "T"}
                </span>
              </div>
            )}
          </div>
          
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {tokenData?.name || "Unknown Token"}
          </h2>
          {tokenData?.symbol && (
            <p className="text-lg text-green-600 font-semibold mb-4">
              ${tokenData.symbol}
            </p>
          )}
        </div>

        {/* Token Details */}
        <div className="space-y-4 mb-6">
          {tokenData?.createdAt && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Created</p>
              <p className="text-sm font-semibold text-gray-900">
                {formatDate(tokenData.createdAt)}
              </p>
            </div>
          )}
          
          {tokenData?.creatorAddress && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Creator</p>
              <p className="text-sm font-semibold text-gray-900 font-mono">
                {tokenData.creatorAddress.slice(0, 6)}...{tokenData.creatorAddress.slice(-4)}
              </p>
            </div>
          )}
        </div>

        <div className="bg-gray-100 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-500 mb-1">Token Address</p>
          <p className="font-mono text-sm break-all">{address}</p>
        </div>

        <div className="space-y-3">
          <a 
            href={`/token/${address}`} 
            className="block w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200"
          >
            View Token Details
          </a>
          <a 
            href={`https://basescan.org/address/${address}`} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="block w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-200"
          >
            View on BaseScan
          </a>
        </div>

        <div className="mt-6 text-xs text-gray-500">
          <p>🎉 Share this link to celebrate your new token creation!</p>
        </div>
      </div>
    </div>
  );
}
