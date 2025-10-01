import { useState, useCallback } from 'react';
import { SearchService } from '../lib/services/searchService';

export const useSearch = () => {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchProfiles = useCallback(async (searchText: string, first: number = 10, retryCount: number = 0) => {
    if (!searchText || searchText.length < 3) {
      setResults([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await SearchService.searchProfiles(searchText, first);
      
      if (response.success) {
        // Filtrar solo perfiles que tienen creatorCoin.address
        const filteredResults = response.data
          .map((edge: any) => edge.node)
          .filter((profile: any) => profile?.creatorCoin?.address);
        
        setResults(filteredResults);
        
        // Si no hay resultados después del filtro, mostrar mensaje amigable
        if (filteredResults.length === 0) {
          setError('No profiles with tokens found');
        }
      } else {
        // Verificar si es un error de rate limit
        if (response.error && response.error.includes('Ratelimit exceeded')) {
          const retryAfter = response.error.match(/after (\d+\.?\d*) seconds/);
          const delay = retryAfter ? parseFloat(retryAfter[1]) * 1000 : 3000; // 3 segundos por defecto
          
          if (retryCount < 2) { // Máximo 2 reintentos
            console.log(`Rate limit exceeded, retrying in ${delay}ms... (attempt ${retryCount + 1})`);
            setTimeout(() => {
              searchProfiles(searchText, first, retryCount + 1);
            }, delay);
            return;
          } else {
            setError('Rate limit exceeded. Please try again in a few moments.');
          }
        } else {
          setError(response.error);
        }
        setResults([]);
      }
    } catch (err) {
      // Manejar errores de red de forma más amigable
      if (err instanceof Error && err.message.includes('503')) {
        setError('Service temporarily unavailable. Please try again later.');
      } else if (err instanceof Error && err.message.includes('Failed to fetch')) {
        setError('Connection error. Please check your internet and try again.');
      } else if (err instanceof Error && err.message.includes('Ratelimit exceeded')) {
        const retryAfter = err.message.match(/after (\d+\.?\d*) seconds/);
        const delay = retryAfter ? parseFloat(retryAfter[1]) * 1000 : 3000;
        
        if (retryCount < 2) {
          console.log(`Rate limit exceeded, retrying in ${delay}ms... (attempt ${retryCount + 1})`);
          setTimeout(() => {
            searchProfiles(searchText, first, retryCount + 1);
          }, delay);
          return;
        } else {
          setError('Rate limit exceeded. Please try again in a few moments.');
        }
      } else {
        setError('Error searching profiles. Please try again.');
      }
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    searchProfiles,
    results,
    loading,
    error
  };
};
