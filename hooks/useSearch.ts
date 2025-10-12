import { useState, useCallback, useRef } from 'react';
import { SearchService } from '../lib/services/searchService';
import { UnifiedSearchResult } from '../lib/services/searchService';

export const useSearch = () => {
  const [results, setResults] = useState<UnifiedSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchProfiles = useCallback(async (searchText: string, retryCount: number = 0) => {
    if (!searchText || searchText.length < 3) {
      setResults([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await SearchService.unifiedSearch(searchText);
      
      console.log('🔍 useSearch received data:', response.length);
      
      // Debug específico para "Base is for everyone"
      const baseToken = response.find(r => r.name?.includes('Base is for everyone'));
      if (baseToken) {
        console.log('🎯 BASE IS FOR EVERYONE found in useSearch:');
        console.log('  change24h:', baseToken.change24h);
        console.log('  volume24h:', baseToken.volume24h);
        console.log('  totalVolume:', baseToken.totalVolume);
        console.log('  Complete:', JSON.stringify(baseToken, null, 2));
      }
      
      setResults(response);
      
      // Si no hay resultados, mostrar mensaje amigable
      if (response.length === 0) {
        setError(`No results found for "${searchText}"`);
      }
      
    } catch (err) {
      console.error('Search error:', err);
      
      // Detectar errores de rate limit
      const isRateLimit = err instanceof Error && (
        err.message.includes('rate') || 
        err.message.includes('429') || 
        err.message.includes('Too Many Requests') ||
        err.message.includes('Connection error') ||
        err.message.includes('503') ||
        err.message.includes('Service temporarily unavailable')
      );
      
      if (isRateLimit && retryCount < 2) {
        console.log(`🔄 Rate limit detected, retrying in 3 seconds (attempt ${retryCount + 1}/2)`);
        
        // No mostrar error inmediatamente para rate limits
        setError(null);
        
        // Esperar 3 segundos y reintentar
        setTimeout(() => {
          searchProfiles(searchText, retryCount + 1);
        }, 3000);
        
        return; // No hacer setLoading(false) aquí porque va a reintentar
      } else {
        // Después de 2 reintentos o error diferente a rate limit
        if (isRateLimit) {
          setError('Internal search error. Please try again.');
        } else if (err instanceof Error && err.message.includes('Failed to fetch')) {
          setError('Connection error. Please check your internet and try again.');
        } else {
          setError('Search failed. Please try again.');
        }
        
        setResults([]);
      }
    } finally {
      // Solo hacer setLoading(false) si es la primera vez o no es rate limit
      if (retryCount === 0) {
        setLoading(false);
      }
    }
  }, []);

  return {
    results,
    loading,
    error,
    searchProfiles,
  };
};
