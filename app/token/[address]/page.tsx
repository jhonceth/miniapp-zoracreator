import TokenDetailsPage from "@/components/pages/token";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: { address: string } }): Promise<Metadata> {
  return {
    title: `Token Details - ${params.address.substring(0, 6)}...`,
    description: "Token Details",
  };
}

export default function TokenDetails({ params }: { params: { address: string } }) {
  return <TokenDetailsPage address={params.address} />;
}