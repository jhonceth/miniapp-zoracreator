import { Metadata } from "next";
import { env } from "@/lib/env";
import { getCoin } from "@zoralabs/coins-sdk";

const appUrl = env.NEXT_PUBLIC_URL;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ address: string }>;
}): Promise<Metadata> {
  const { address } = await params;

  // Try to get token data for better metadata
  let tokenData = null;
  try {
    const response = await getCoin({
      address: address,
      chain: 8453, // Base Mainnet
    });
    tokenData = response.data?.zora20Token;
  } catch (error) {
    console.log("Could not fetch token data for metadata:", error);
  }

  const imageUrl = new URL(`${appUrl}/api/og/token/${address}`);
  
  const tokenName = tokenData?.name || `Token ${address.slice(0, 6)}...${address.slice(-4)}`;
  const tokenSymbol = tokenData?.symbol ? ` ($${tokenData.symbol})` : "";
  const tokenDescription = tokenData?.description || "View this token created on Zbase Creator platform";

  const frame = {
    version: "next",
    imageUrl: imageUrl.toString(),
    button: {
      title: "View Token",
      action: {
        type: "launch_frame",
        name: "View Token",
        url: `${appUrl}/token/${address}`,
        splashImageUrl: imageUrl.toString(),
        splashBackgroundColor: "#667eea",
      },
    },
  };

  return {
    title: `${tokenName}${tokenSymbol} - Zbase Creator`,
    description: tokenDescription,
    openGraph: {
      title: `${tokenName}${tokenSymbol} - Zbase Creator`,
      description: tokenDescription,
      images: [{ url: imageUrl.toString() }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${tokenName}${tokenSymbol} - Zbase Creator`,
      description: tokenDescription,
      images: [imageUrl.toString()],
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}

export default async function TokenSharePage({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address } = await params;

  // Get token data for display
  let tokenData = null;
  try {
    const response = await getCoin({
      address: address,
      chain: 8453, // Base Mainnet
    });
    tokenData = response.data?.zora20Token;
  } catch (error) {
    console.log("Could not fetch token data:", error);
  }

  const formatNumber = (value: string | number | undefined) => {
    if (value === undefined || value === null) return "N/A";
    const num = parseFloat(value.toString());
    if (isNaN(num)) return "N/A";
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full text-center">
        <div className="mb-6">
          {/* Token image or logo */}
          <div className="w-20 h-20 mx-auto mb-4 rounded-xl overflow-hidden border-2 border-purple-200">
            {tokenData?.mediaContent?.previewImage?.medium ? (
              <img
                src={tokenData.mediaContent.previewImage.medium}
                alt={tokenData.name || "Token"}
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src="/icon.png"
                alt="Zbase Creator"
                className="w-full h-full object-cover"
              />
            )}
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {tokenData?.name || "Unknown Token"}
          </h1>
          
          {tokenData?.symbol && (
            <p className="text-lg text-purple-600 font-semibold mb-2">
              ${tokenData.symbol}
            </p>
          )}
          
          <p className="text-gray-600 mb-4">
            {tokenData?.description || "This token was created on Zbase Creator platform"}
          </p>
        </div>

        {/* Token stats */}
        {tokenData && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            {tokenData.marketCap && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Market Cap</p>
                <p className="text-sm font-semibold text-gray-900">
                  ${formatNumber(tokenData.marketCap)}
                </p>
              </div>
            )}
            {tokenData.uniqueHolders && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Holders</p>
                <p className="text-sm font-semibold text-gray-900">
                  {tokenData.uniqueHolders}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="bg-gray-100 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-500 mb-1">Token Address</p>
          <p className="font-mono text-sm break-all">{address}</p>
        </div>

        <div className="space-y-3">
          <a
            href={`/token/${address}`}
            className="block w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
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
          <p>Share this link to showcase your token on Farcaster!</p>
        </div>
      </div>
    </div>
  );
}
