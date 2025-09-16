import HomePage from "@/components/Home";
import { env } from "@/lib/env";
import { Metadata } from "next";

const appUrl = env.NEXT_PUBLIC_URL;

const frame = {
  version: "next",
  imageUrl: `${appUrl}/images/feed.png`,
  button: {
    title: "Crear Token",
    action: {
      type: "launch_frame",
      name: "Zora Token Creator",
      url: appUrl,
      splashImageUrl: `${appUrl}/images/splash.png`,
      splashBackgroundColor: "#ffffff",
    },
  },
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Zora Token Creator",
    openGraph: {
      title: "Zora Token Creator",
      description: "Crea tokens en Base usando el Protocolo Zora",
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}

export default function Home() {
  return <HomePage />;
}