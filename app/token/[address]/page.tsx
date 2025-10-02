import { TokenProfile } from "@/components/TokenProfile"
import type { Metadata } from "next"
import { APP_URL } from "@/lib/constants"

interface TokenPageProps {
  params: Promise<{
    address: string
  }>
}

export default async function TokenPage({ params }: TokenPageProps) {
  const { address } = await params
  return <TokenProfile address={address} />
}

export async function generateMetadata({ params }: TokenPageProps): Promise<Metadata> {
  const { address } = await params
  const timestamp = Date.now()
  const canonicalUrl = `${APP_URL}/token/${address}?v=${timestamp}`
  const ogImageUrl = `${APP_URL}/api/og/token/${address}?v=${timestamp}`

  const miniapp = {
    version: "1",
    imageUrl: ogImageUrl,
    button: {
      title: "View Coin",
      action: {
        type: "launch_miniapp",
        url: canonicalUrl,
        name: "Zcreate coin",
        splashImageUrl: `${APP_URL}/icon.png`,
        splashBackgroundColor: "#0B0F1A",
      },
    },
  }

  return {
    title: `Token ${address} | ZCreate Analytics`,
    openGraph: {
      images: [{ url: ogImageUrl, width: 1200, height: 800 }],
    },
    other: {
      "fc:miniapp": JSON.stringify(miniapp),
      // Backward compatibility
      "fc:frame": JSON.stringify({ ...miniapp, button: { ...miniapp.button, action: { ...miniapp.button.action, type: "launch_frame" } } }),
    },
  }
}