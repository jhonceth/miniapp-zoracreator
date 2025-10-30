import { Metadata } from "next";
import { env } from "@/lib/env";

const appUrl = env.NEXT_PUBLIC_URL;

export async function generateMetadata({ searchParams }: { searchParams: { date?: string } }): Promise<Metadata> {
  const imageUrl = new URL(`${appUrl}/api/og/top-gainers`);
  
  // Agregar fecha a la URL para evitar cache
  if (searchParams.date) {
    imageUrl.searchParams.set('date', searchParams.date);
  }
  
  const title = "Top 5 Gainers - ZCreate";
  const description = "Check out the top 5 gainers on ZCreate platform";

  const frame = {
    version: "next",
    imageUrl: imageUrl.toString(),
    button: {
      title: "View Top Gainers",
      action: {
        type: "launch_frame",
        name: "View Top Gainers",
        url: `${appUrl}/`,
        splashImageUrl: imageUrl.toString(),
        splashBackgroundColor: "#3B82F6",
      },
    },
  };

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: imageUrl.toString() }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl.toString()],
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}

export default async function TopGainersSharePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full text-center">
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto mb-4 rounded-xl overflow-hidden border-2 border-blue-200">
            <img 
              src="/icon.png" 
              alt="ZCreate" 
              className="w-full h-full object-cover" 
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Top 5 Gainers
          </h1>
          <p className="text-lg text-blue-600 font-semibold mb-2">
            ZCreate Platform
          </p>
          <p className="text-gray-600 mb-4">
            Discover the top performing tokens with the highest gains on ZCreate
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Platform</p>
            <p className="text-sm font-semibold text-gray-900">
              ZCreate
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Network</p>
            <p className="text-sm font-semibold text-gray-900">
              Base
            </p>
          </div>
        </div>

        <div className="bg-gray-100 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-500 mb-1">Category</p>
          <p className="font-semibold text-gray-900">Top Gainers</p>
        </div>

        <div className="space-y-3">
          <a 
            href="/" 
            className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
          >
            View Top Gainers
          </a>
          <a 
            href="https://zora.co" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="block w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-200"
          >
            Visit Zora Protocol
          </a>
        </div>

        <div className="mt-6 text-xs text-gray-500">
          <p>Share this link to showcase the top gainers on Farcaster!</p>
        </div>
      </div>
    </div>
  );
}
