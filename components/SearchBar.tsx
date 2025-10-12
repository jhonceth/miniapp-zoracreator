'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSearch } from '../hooks/useSearch';
import { UnifiedSearchResult } from '../lib/services/searchService';
import { ArrowUp, ArrowDown, Circle, User, DollarSign, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { searchProfiles, results, loading, error } = useSearch();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

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
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchClick = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleResultClick = (result: UnifiedSearchResult) => {
    console.log('Result selected:', result);
    if (result.address) {
      router.push(`/token/${result.address}`);
    }
    setIsOpen(false);
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
    <div className="relative flex items-center gap-2" ref={searchRef}>
      <span className="text-sm font-medium text-primary">Search</span>
      <button
        onClick={handleSearchClick}
        className="flex items-center justify-center w-8 h-8 bg-accent-blue hover:bg-accent-blue/80 text-primary rounded-full transition-all duration-200 shadow-lg hover:shadow-xl"
        aria-label="Search profiles"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-[95%] max-w-4xl bg-card-dark rounded-2xl shadow-xl border border-card-dark z-[100] animate-in fade-in slide-in-from-top-5 mt-3">
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

          {/* Results Container - Starts completely below input */}
          <div className="relative">

          {error && (
            <div className="p-3 bg-price-negative/10 border-b border-price-negative/20">
              <div className="flex items-center">
                <svg className="w-4 h-4 text-price-negative mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-price-negative">{error}</p>
              </div>
            </div>
          )}

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-6 text-center">
                <div className="w-6 h-6 border-2 border-accent-blue/20 border-t-accent-blue rounded-full animate-spin mx-auto"></div>
                <p className="mt-2 text-secondary text-sm">Searching &quot;{searchTerm}&quot;...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="p-2">
                {results.map((result: UnifiedSearchResult) => {
                  
                  return (
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
                      <div className="text-xs text-secondary font-mono">
                        {result.address.slice(0, 8)}...{result.address.slice(-6)}
                      </div>
                    )}
                  </div>

                  {/* Columna 3: Porcentaje centrado verticalmente */}
                  {result.change24h !== undefined && (
                    <div className="flex items-center justify-end flex-shrink-0 ml-3">
                      <div className={`flex items-center gap-1 ${getChangeColor(result.change24h)}`}>
                        {(() => {
                          const IconComponent = getChangeIcon(result.change24h);
                          const isPositive = result.change24h > 0;
                          const isNegative = result.change24h < 0;
                          const isNeutral = result.change24h === 0;
                          
                          return (
                            <>
                              <IconComponent className={`w-4 h-4 ${getChangeColor(result.change24h)}`} />
                              <span className="text-sm font-semibold">
                                {formatChangePercent(result.change24h)}
                              </span>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  )}
                  </div>
                  );
                })}
              </div>
            ) : searchTerm.length >= 3 && !loading && !error ? (
              <div className="p-6 text-center text-secondary">
                <div className="text-secondary text-2xl mb-2">🔍</div>
                <p className="text-sm">No results found for &quot;{searchTerm}&quot;</p>
                <p className="text-xs mt-1 text-secondary">
                  Try searching for coins or profiles
                </p>
              </div>
            ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
