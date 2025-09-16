import LaunchPage from "@/components/pages/launch";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Create Token",
    description: "Create Token",
  };
}

export default function Launch() {
  return <LaunchPage />;
}