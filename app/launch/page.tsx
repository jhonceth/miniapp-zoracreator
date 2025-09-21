import LaunchPage from "@/components/pages/launch";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Launch Coin",
    description: "Launch Coin",
  };
}

export default function Launch() {
  return <LaunchPage />;
}