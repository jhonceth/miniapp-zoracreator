import ProfilePage from "@/components/pages/profile";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "My Profile",
    description: "My Profile",
  };
}

export default function Profile() {
  return <ProfilePage />;
}