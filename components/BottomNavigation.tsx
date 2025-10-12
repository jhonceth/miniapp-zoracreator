"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, User, Rocket, Search, ArrowUp, ArrowDown, Circle, DollarSign, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useAccount } from "wagmi";
import { useSearch } from "../hooks/useSearch";
import { UnifiedSearchResult } from "../lib/services/searchService";

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
    // Limpiar timeout anterior
    let timeoutId: NodeJS.Timeout;
    
    if (searchTerm.length >= 3) {
      timeoutId = setTimeout(() => {
        searchProfiles(searchTerm);
      }, 500);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
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

  const handleResultClick = (result: UnifiedSearchResult) => {
    if (result.address) {
      router.push(`/token/${result.address}`);
    }
    setIsSearchOpen(false);
    setSearchTerm('');
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(1)}M`;
    if (volume >= 1e3) return `$${(volume / 1e3).toFixed(1)}K`;
    return `$${volume.toFixed(2)}`;
  };

  const formatChangePercent = (change: number) => {
    if (change > 0) return `+${change.toFixed(2)}%`;
    if (change < 0) return `${change.toFixed(2)}%`;
    return '0.00%';
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-price-positive';
    if (change < 0) return 'text-price-negative';
    return 'text-secondary';
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return TrendingUp;
    if (change < 0) return TrendingDown;
    return Minus;
  };

  return (
    <div ref={searchRef}>
      {/* Search Results - arriba del campo de búsqueda con separación mejorada */}
      {isSearchOpen && (results.length > 0 || loading || error) && (
        <div className="fixed bottom-36 left-1/2 transform -translate-x-1/2 w-[90%] max-w-4xl bg-card-dark rounded-2xl shadow-xl border border-card-dark z-[110] animate-in fade-in slide-in-from-bottom-5 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-6 text-center">
              <div className="w-6 h-6 border-2 border-accent-blue/20 border-t-accent-blue rounded-full animate-spin mx-auto"></div>
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
              {results.map((result: UnifiedSearchResult) => (
                <div
                  key={result.id}
                  onClick={() => handleResultClick(result)}
                    className="flex items-center px-3 py-2 hover:bg-card-dark/50 active:bg-card-dark/60 cursor-pointer transition-colors duration-150 border-b border-card-dark last:border-b-0"
                >
                  {/* Columna 1: Avatar centrado */}
                  <div className="flex items-center justify-center flex-shrink-0 w-12 h-12">
                    <div className="relative w-11 h-11 rounded-lg overflow-hidden border-2 border-card-dark shadow-sm">
                      {result.avatar ? (
                        <img
                          src={result.avatar}
                          alt={result.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-accent-blue/60 to-accent-blue/40 flex items-center justify-center text-primary text-lg font-medium">
                          {result.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Columna 2: Información del token */}
                  <div className="ml-3 flex-1 min-w-0 flex flex-col justify-center">
                    {/* Linea 1: Nombre + Tipo */}
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-primary truncate">
                        {result.name}
                      </h3>
                      <span className="text-xs bg-accent-blue/20 text-accent-blue px-2 py-0.5 rounded-full whitespace-nowrap">
                        {result.isProfile ? 'Profile' : 'Coin'}
                      </span>
                    </div>
                    
                    {/* Linea 2: Símbolo */}
                    {result.symbol && (
                      <div className="text-xs text-secondary font-medium">
                        {result.symbol}
                      </div>
                    )}
                    
                    {/* Linea 3: Contrato */}
                    {result.address && (
                      <span className="text-xs text-secondary font-mono">
                        {result.address.slice(0, 8)}...{result.address.slice(-6)}
                      </span>
                    )}
                  </div>

                  {/* Columna 3: Porcentaje centrado verticalmente */}
                  {result.change24h !== undefined && (
                    <div className="flex items-center justify-end flex-shrink-0 ml-3">
                      <div className={`flex items-center gap-1 ${getChangeColor(result.change24h)}`}>
                        {(() => {
                          const IconComponent = getChangeIcon(result.change24h);
                          return (
                            <IconComponent className={`w-4 h-4 ${getChangeColor(result.change24h)}`} />
                          );
                        })()}
                        {false && result.change24h > 0 && (
                          <svg className={`w-4 h-4 ${getChangeColor(result.change24h)}`} viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20 8 L12 16 L8 12 L4 16" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                        {false && result.change24h < 0 && (
                          <svg className={`w-4 h-4 ${getChangeColor(result.change24h)}`} viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20 16 L12 8 L8 12 L4 8" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinejoin="round"/>
                          </svg>
                        )}
                        <span className="text-sm font-semibold">
                          {formatChangePercent(result.change24h)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : searchTerm.length >= 3 ? (
            <div className="p-6 text-center text-secondary">
              <div className="text-secondary text-2xl mb-2">🔍</div>
              <p className="text-sm">No results found for &quot;{searchTerm}&quot;</p>
              <p className="text-xs mt-1 text-secondary">
                Try searching for coins or profiles
              </p>
            </div>
          ) : null}
        </div>
      )}

      {/* Search Field - Opens above bottom navigation */}
      {isSearchOpen && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 w-[90%] max-w-4xl bg-card-dark rounded-2xl shadow-xl border border-card-dark z-[100] animate-in fade-in slide-in-from-bottom-5">
          <div className="p-5 border-b border-card-dark">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search coins or profiles..."
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
        <div className="max-w-4xl mx-auto px-4 py-1">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                  className={`flex flex-col items-center gap-1 py-1 px-4 rounded-lg transition-colors duration-200 ${
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