"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Zap, User, Rocket } from "lucide-react";
import { useAccount } from "wagmi";

export function BottomNavigation() {
  const pathname = usePathname();
  const { isConnected } = useAccount();

  const navItems = [
    {
      href: "/",
      icon: Home,
      label: "Home",
      active: pathname === "/"
    },
    {
      href: "/my-coins",
      icon: User,
      label: "My Coins",
      active: pathname === "/my-coins"
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 shadow-lg bg-gradient-to-r from-purple-50 to-blue-50 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="max-w-4xl mx-auto px-4 py-2">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 py-2 px-4 rounded-lg transition-colors duration-200 ${
                  item.active
                    ? "text-purple-600 bg-purple-50"
                    : "text-gray-600 hover:text-purple-600 hover:bg-purple-50"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
          
          {/* Launch Button */}
          <Link
            href="/launch"
            className={`flex flex-col items-center gap-1 py-2 px-4 rounded-lg transition-colors duration-200 ${
              pathname === "/launch"
                ? "text-purple-600 bg-purple-50"
                : "text-gray-600 hover:text-purple-600 hover:bg-purple-50"
            }`}
          >
            <div className="w-5 h-5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Rocket className="w-3 h-3 text-white" />
            </div>
            <span className="text-xs font-medium">Launch</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
