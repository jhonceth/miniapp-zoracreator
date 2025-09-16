"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LaunchForm } from "@/components/launch/LaunchForm";
import { BottomNavigation } from "@/components/BottomNavigation";

export default function LaunchPage() {
  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6">
        {/* Simple Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/">
            <Button variant="outline" size="sm" className="h-8 px-2 sm:px-3">
              <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Back</span>
            </Button>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Create Token
          </h1>
        </div>

        {/* Launch Form */}
        <div className="max-w-2xl mx-auto">
          <LaunchForm />
        </div>
      </div>
      
      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
