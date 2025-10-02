import { env } from "@/lib/env";

/**
 * Get the farcaster manifest for the frame, generate yours from Warpcast Mobile
 *  On your phone to Settings > Developer > Domains > insert website hostname > Generate domain manifest
 * @returns The farcaster manifest for the frame
 */
export async function getFarcasterManifest() {
  let frameName = "ZCreate";
  let noindex = false;
  const appUrl = env.NEXT_PUBLIC_URL;
  
  // Detectar si estamos en un túnel de desarrollo
  if (appUrl.includes("localhost")) {
    frameName += " Local";
    noindex = true;
  } else if (appUrl.includes("ngrok")) {
    frameName += " NGROK";
    noindex = true;
  } else if (appUrl.includes("trycloudflare.com")) {
    frameName += " Cloudflare Tunnel";
    noindex = true;
  } else if (appUrl.includes("https://dev.")) {
    frameName += " Dev";
    noindex = true;
  }
  return {
    accountAssociation: {
      header: env.NEXT_PUBLIC_FARCASTER_HEADER,
      payload: env.NEXT_PUBLIC_FARCASTER_PAYLOAD,
      signature: env.NEXT_PUBLIC_FARCASTER_SIGNATURE,
    },
  
    frame: {
      version: "1",
      name: frameName,
      iconUrl: `${appUrl}/images/icon.png`,
      homeUrl: appUrl,
      imageUrl: `${appUrl}/images/feed.png`,
      buttonTitle: `Launch ZCreate`,
      splashImageUrl: `${appUrl}/images/splash.png`,
      splashBackgroundColor: "#855DCD",
      webhookUrl: `${appUrl}/api/webhook`,
      // Metadata https://github.com/farcasterxyz/miniapps/discussions/191
      subtitle: "Launch or view your coin on Zora", // 30 characters, no emojis or special characters, short description under app name
      description: "Empowering creators: Use our mini-app to create and launch your own coin on Zora directly from Farcaster.", // 170 characters, no emojis or special characters, promotional message displayed on Mini App Page
      primaryCategory: "finance",
      tags: ["nft-zora", "zora", "zora-coin", "zora-protocol", "token"], // up to 5 tags, filtering/search tags
      tagline: "Starter kit for mini-apps", // 30 characters, marketing tagline should be punchy and descriptive
      ogTitle: `${frameName}`, // 30 characters, app name + short tag, Title case, no emojis
      ogDescription: "create coin on Zora directly from Farcaster", // 100 characters, summarize core benefits in 1-2 lines
      screenshotUrls: [
        // 1284 x 2778, visual previews of the app, max 3 screenshots
        `${appUrl}/images/feed.png`,
      ],
      heroImageUrl: `${appUrl}/images/builders.png`, // 1200 x 630px (1.91:1), promotional display image on top of the mini app store
      ogImageUrl: `${appUrl}/images/builders.png`, // 1200 x 630px (1.91:1), promotional image, same as app hero image
      noindex: noindex,
     },

    //  SECCIÓN BASE BUILDER AGREGADA
    baseBuilder: {
      allowedAddresses: ["0x5B436476E8D54575306eB34bC969D5e5A137B16b"]
    }
  };
}
