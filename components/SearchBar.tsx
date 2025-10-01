'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSearch } from '../hooks/useSearch';
import LoadingSpinner from './ui/LoadingSpinner';

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

export default function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { searchProfiles, results, loading, error } = useSearch();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.length >= 3) {
        searchProfiles(searchTerm);
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
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

  const handleResultClick = (profile: Profile) => {
    console.log('Profile selected:', profile);
    if (profile.creatorCoin?.address) {
      router.push(`/token/${profile.creatorCoin.address}`);
    }
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative flex items-center gap-2" ref={searchRef}>
      <span className="text-sm font-medium text-foreground">Search</span>
      <button
        onClick={handleSearchClick}
        className="flex items-center justify-center w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-all duration-200 shadow-lg hover:shadow-xl"
        aria-label="Search profiles"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-10 left-1/2 transform -translate-x-1/2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 animate-in fade-in slide-in-from-top-5">
          <div className="p-4 border-b border-gray-100">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search profiles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              autoComplete="off"
            />
          </div>

          {error && (
            <div className="p-3 bg-amber-50 border-b border-amber-200">
              <div className="flex items-center">
                <svg className="w-4 h-4 text-amber-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-amber-700">{error}</p>
              </div>
            </div>
          )}

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-6 text-center">
                <LoadingSpinner />
                <p className="mt-2 text-gray-500 text-sm">Searching &quot;{searchTerm}&quot;...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="p-2">
                {results.map((profile: Profile) => (
                  <div
                    key={profile.id}
                    onClick={() => handleResultClick(profile)}
                    className="flex items-center p-3 hover:bg-gray-50 cursor-pointer transition-colors duration-150 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm">
                      {profile.avatar?.small ? (
                        <img
                          src={profile.avatar.small}
                          alt={profile.profileId}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white text-lg font-medium">
                          {profile.profileId?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="ml-3 flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                          {profile.profileId}
                        </h3>
                        {profile.creatorCoin && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                            Coin
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        @{profile.profileId}
                      </p>
                      
                      {profile.creatorCoin?.address && (
                        <div className="mt-1 flex items-center">
                          <span className="text-xs text-gray-400 mr-1">📍</span>
                          <code className="text-xs text-gray-400 truncate font-mono bg-gray-100 px-1 rounded">
                            {profile.creatorCoin.address.slice(0, 8)}...{profile.creatorCoin.address.slice(-6)}
                          </code>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : searchTerm.length >= 3 && !loading && !error ? (
              <div className="p-6 text-center text-gray-500">
                <div className="text-gray-400 text-2xl mb-2">🔍</div>
                <p className="text-sm">Profile &quot;{searchTerm}&quot; not found</p>
                <p className="text-xs mt-1 text-gray-400">
                  Try different search terms
                </p>
              </div>
            ) : null}
          </div>

        </div>
      )}
    </div>
  );
}
