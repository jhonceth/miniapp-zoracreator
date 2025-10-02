"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, User, Rocket, Search } from "lucide-react";
import { useAccount } from "wagmi";
import { useSearch } from "../hooks/useSearch";
import LoadingSpinner from "./ui/LoadingSpinner";

interface Profile {
  id: string;
  profileId: string;
  avatar?: {
    small?: string;
  };
  creatorCoin?: {
    address: string;
    chainId: number;
    name?: string;
    symbol?: string;
  };
}

export function BottomNavigation() {
  const pathname = usePathname();
  const { isConnected } = useAccount();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { searchProfiles, results, loading, error } = useSearch();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

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

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.length >= 3) {
        searchProfiles(searchTerm);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, searchProfiles]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
        setSearchTerm('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchClick = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleResultClick = (profile: Profile) => {
    if (profile.creatorCoin?.address) {
      router.push(`/token/${profile.creatorCoin.address}`);
    }
    setIsSearchOpen(false);
    setSearchTerm('');
  };

  return (
    <div ref={searchRef}>
      {/* Search Results - Above the search field */}
      {isSearchOpen && (results.length > 0 || loading || error) && (
        <div className="fixed bottom-32 left-1/2 transform -translate-x-1/2 w-[90%] max-w-4xl bg-card-dark rounded-2xl shadow-xl border border-card-dark z-[110] animate-in fade-in slide-in-from-bottom-5 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-6 text-center">
              <LoadingSpinner />
              <p className="mt-2 text-secondary text-sm">Searching &quot;{searchTerm}&quot;...</p>
            </div>
          ) : error ? (
            <div className="p-3 bg-price-negative/10 border-b border-price-negative/20">
              <div className="flex items-center">
                <svg className="w-4 h-4 text-price-negative mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-price-negative">{error}</p>
              </div>
            </div>
          ) : results.length > 0 ? (
            <div className="p-2">
              {results.map((profile: Profile) => (
                <div
                  key={profile.id}
                  onClick={() => handleResultClick(profile)}
                  className="flex items-center p-3 hover:bg-card-dark/50 cursor-pointer transition-colors duration-150 border-b border-card-dark last:border-b-0"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden border-2 border-card-dark shadow-sm">
                    {profile.avatar?.small ? (
                      <img
                        src={profile.avatar.small}
                        alt={profile.profileId}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-accent-blue/60 to-accent-blue/40 flex items-center justify-center text-primary text-lg font-medium">
                        {profile.profileId?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="ml-3 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-primary truncate">
                        {profile.profileId}
                      </h3>
                      {profile.creatorCoin && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-price-positive/20 text-price-positive">
                          <span className="w-2 h-2 bg-price-positive rounded-full mr-1"></span>
                          Coin
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-secondary truncate">
                      @{profile.profileId}
                    </p>
                    
                    {profile.creatorCoin?.address && (
                      <div className="mt-1 flex items-center">
                        <span className="text-xs text-secondary mr-1">📍</span>
                        <code className="text-xs text-secondary truncate font-mono bg-card-dark px-1 rounded">
                          {profile.creatorCoin.address.slice(0, 8)}...{profile.creatorCoin.address.slice(-6)}
                        </code>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : searchTerm.length >= 3 ? (
            <div className="p-6 text-center text-secondary">
              <div className="text-secondary text-2xl mb-2">🔍</div>
              <p className="text-sm">Profile &quot;{searchTerm}&quot; not found</p>
              <p className="text-xs mt-1 text-secondary">
                Try different search terms
              </p>
            </div>
          ) : null}
        </div>
      )}

      {/* Search Field - Opens above bottom navigation */}
      {isSearchOpen && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 w-[90%] max-w-4xl bg-card-dark rounded-2xl shadow-xl border border-card-dark z-[100] animate-in fade-in slide-in-from-bottom-5">
          <div className="p-4 border-b border-card-dark">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search profiles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-card-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent text-sm bg-card-dark text-primary placeholder:text-secondary"
              autoComplete="off"
            />
          </div>
          {!loading && !error && results.length === 0 && searchTerm.length < 3 && (
            <div className="p-4 text-center text-secondary">
              <p className="text-sm">Type to search profiles...</p>
            </div>
          )}
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-card-dark shadow-lg bg-card-dark/50 backdrop-blur supports-[backdrop-filter]:bg-card-dark/70">
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
                      ? "text-accent-blue bg-accent-blue/10"
                      : "text-primary hover:text-accent-blue hover:bg-accent-blue/5"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{item.label}</span>
                </Link>
              );
            })}
            
            {/* Search Button */}
            <button
              onClick={handleSearchClick}
              className={`flex flex-col items-center gap-1 py-2 px-4 rounded-lg transition-colors duration-200 ${
                isSearchOpen
                  ? "text-accent-blue bg-accent-blue/10"
                  : "text-primary hover:text-accent-blue hover:bg-accent-blue/5"
              }`}
            >
              <Search className="w-5 h-5" />
              <span className="text-xs font-medium">Search</span>
            </button>
            
            {/* Launch Button */}
            <Link
              href="/launch"
              className={`flex flex-col items-center gap-1 py-2 px-4 rounded-lg transition-colors duration-200 ${
                pathname === "/launch"
                  ? "text-accent-blue bg-accent-blue/10"
                  : "text-primary hover:text-accent-blue hover:bg-accent-blue/5"
              }`}
            >
              <div className="w-5 h-5 bg-gradient-to-r from-accent-blue to-accent-blue/80 rounded-lg flex items-center justify-center">
                <Rocket className="w-3 h-3 text-primary" />
              </div>
              <span className="text-xs font-medium">Launch</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}