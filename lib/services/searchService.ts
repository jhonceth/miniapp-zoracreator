// Versión simplificada basada en el código que trabaja
export interface UnifiedSearchResult {
  type: 'coin' | 'profile';
  id: string;
  name: string;
  symbol: string;
  address: string;
  avatar: string | null;
  volume24h: number;
  totalVolume: number;
  change24h: number;
  isProfile: boolean;
  resultType: 'Solo Coin' | 'Profile Coin';
}

const ZORA_API_URL = "https://api.zora.co/universal/graphql";

const UNIFIED_SEARCH_QUERY = `
query UnifiedSearch($searchText: String!) {
  coinResults: globalSearch(text: $searchText, entityType: COIN) {
    edges {
      node {
        __typename
        ... on GlobalSearchCoinResult {
          token {
            address
            name
            symbol
            ... on IGraphQLZora20Token {
              totalVolume
              volume24h
              address
              creatorAddress
              marketCap
              marketCapDelta24h
              totalSupply
            }
            tokenPrice {
              priceInUsdc
            }
            mediaContent {
              previewImage {
                small
              }
            }
          }
        }
      }
    }
  }
  profileResults: profileSearchV2(text: $searchText, first: 3) {
    edges {
      node {
        id
        displayName: profileId
        username: profileId
        avatar {
          ... on GraphQLMediaImage {
            small
            medium
          }
        }
        ... on GraphQLAccountProfile {
          creatorCoin {
            address
            name
            symbol
            ... on IGraphQLZora20Token {
              totalVolume
              volume24h
              address
              creatorAddress
              marketCap
              marketCapDelta24h
              totalSupply
            }
          }
        }
      }
    }
  }
}`;

// Función de cálculo que funciona correctamente
function calculatePercentageChange(marketCap: number, marketCapDelta24h: number): number {
  if (marketCap === 0 || marketCapDelta24h === 0) {
    return 0;
  }

  // Porcentaje = (marketCapDelta24h / (marketCap - marketCapDelta24h)) * 100
  const previousMarketCap = marketCap - marketCapDelta24h;

  if (previousMarketCap === 0) {
    return 0;
  }

  return (marketCapDelta24h / previousMarketCap) * 100;
}

export class SearchService {
  static async unifiedSearch(searchText: string): Promise<UnifiedSearchResult[]> {
    try {
      console.log('🔍 Searching for:', searchText);
      
      // Usar la API route local para mayor confiabilidad en Vercel
      const baseUrl = typeof window !== 'undefined' ? '' : process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
      
      const response = await fetch(`${baseUrl}/api/search?q=${encodeURIComponent(searchText)}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.error('Search API error:', response.status, response.statusText);
        
        // Mensajes específicos según el error HTTP
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait and try again.');
        } else if (response.status === 503) {
          throw new Error('Service temporarily unavailable. Please try again later.');
        } else if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        } else {
          throw new Error(`API request failed: ${response.status}`);
        }
      }

      const data = await response.json();
      console.log('📊 Search API response:', data);

      const results: UnifiedSearchResult[] = [];

      // Verificar si hay error en la respuesta
      if (data.error) {
        throw new Error(data.error);
      }

      // Procesar tokens de la respuesta unificada
      const tokens = data.tokens || [];
      
      for (const token of tokens) {
        if (token && token.address) {
          // Usar el porcentaje ya calculado por la API
          const change24h = token.change24h || 0;

          // Determinar si es profile o coin
          const isProfile = token.type === 'profile';
          
          results.push({
            type: isProfile ? 'profile' : 'coin',
            id: `token-${token.address}`,
            name: token.name || 'Unknown Token',
            symbol: token.symbol || token.name || 'UNKNOWN',
            address: token.address,
            avatar: token.image || null,
            volume24h: token.volume24h || 0,
            totalVolume: token.totalVolume || 0,
            change24h,
            isProfile,
            resultType: isProfile ? 'Profile Coin' : 'Solo Coin',
          });
        }
      }


      // Ordenar por volumen primero, luego por coincidencia de nombre (coincidencias al final)
      const sortedResults = results.sort((a, b) => {
        const aVolume = a.volume24h || 0;
        const bVolume = b.volume24h || 0;
        
        // Primero ordenar por volumen
        if (aVolume > 0 && bVolume === 0) return -1;
        if (aVolume === 0 && bVolume > 0) return 1;
        if (aVolume > 0 && bVolume > 0) return bVolume - aVolume;
        
        // Luego por coincidencia: coincidencias al final
        const aMatch = a.name?.toLowerCase().includes(searchText.toLowerCase()) || false;
        const bMatch = b.name?.toLowerCase().includes(searchText.toLowerCase()) || false;
        
        // Coincidencias al final (return 1 para que aparezcan después)
        if (aMatch && !bMatch) return 1;
        if (!aMatch && bMatch) return -1;
        
        // Si ambos coinciden o ninguno coincide, ordenar alfabéticamente
        return a.name.localeCompare(b.name);
      });

      console.log('✅ Final results:', sortedResults.length, 'tokens processed');
      console.log('📊 Sample results:', sortedResults.slice(0, 2).map(r => ({
        name: r.name,
        volume24h: r.volume24h,
        change24h: r.change24h.toFixed(2) + '%',
        resultType: r.resultType
      })));

      return sortedResults;
    } catch (error) {
      console.error('🔍 SearchService error:', error);
      
      // Detectar errores específicos de Vercel/red
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to search service');
      } else if (error instanceof Error && error.message.includes('Connection')) {
        throw new Error('Connection error: Please check your internet and try again');
      } else if (error instanceof Error) {
        // Si el error ya tiene un mensaje específico, úsalo
        throw error;
      } else {
        throw new Error('Unknown search error occurred');
      }
    }
  }
}
