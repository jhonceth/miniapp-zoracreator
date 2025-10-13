import { NextRequest, NextResponse } from 'next/server';

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
                medium
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

// Función de cálculo para porcentaje de cambio
function calculatePercentageChange(marketCap: number, marketCapDelta24h: number): number {
  if (marketCap === 0 || marketCapDelta24h === 0) {
    return 0;
  }

  const previousMarketCap = marketCap - marketCapDelta24h;

  if (previousMarketCap === 0) {
    return 0;
  }

  return (marketCapDelta24h / previousMarketCap) * 100;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 3) {
      return NextResponse.json({ tokens: [] });
    }

    console.log('🔍 API Search for:', query);

    const response = await fetch(ZORA_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "ZCreateApp/1.0",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        query: UNIFIED_SEARCH_QUERY,
        variables: { searchText: query },
      }),
    });

    if (!response.ok) {
      console.error('Zora API error:', response.status, response.statusText);
      
      if (response.status === 429) {
        return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
      } else if (response.status === 503) {
        return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
      } else {
        return NextResponse.json({ error: 'API request failed' }, { status: response.status });
      }
    }

    const data = await response.json();
    console.log('📊 Zora API response for', query, ':', data);

    const tokens: any[] = [];

    // Procesar coins
    if (data.data?.coinResults?.edges) {
      for (const edge of data.data.coinResults.edges) {
        const token = edge.node?.token;
        if (token && token.address) {
          const marketCap = Number.parseFloat(token.marketCap || "0");
          const marketCapDelta24h = Number.parseFloat(token.marketCapDelta24h || "0");
          const volume24h = Number.parseFloat(token.volume24h || "0");
          const totalVolume = Number.parseFloat(token.totalVolume || "0");
          const change24h = calculatePercentageChange(marketCap, marketCapDelta24h);

          tokens.push({
            type: 'coin',
            address: token.address,
            name: token.name || 'Unknown Coin',
            symbol: token.symbol || 'UNKNOWN',
            image: token.mediaContent?.previewImage?.small || null,
            volume24h,
            totalVolume,
            marketCap,
            marketCapDelta24h,
            change24h,
          });
        }
      }
    }

    // Procesar profiles
    if (data.data?.profileResults?.edges) {
      for (const edge of data.data.profileResults.edges) {
        const profile = edge.node;
        const creatorCoin = profile?.creatorCoin;

        if (creatorCoin && creatorCoin.address) {
          const marketCap = Number.parseFloat(creatorCoin.marketCap || "0");
          const marketCapDelta24h = Number.parseFloat(creatorCoin.marketCapDelta24h || "0");
          const volume24h = Number.parseFloat(creatorCoin.volume24h || "0");
          const totalVolume = Number.parseFloat(creatorCoin.totalVolume || "0");
          const change24h = calculatePercentageChange(marketCap, marketCapDelta24h);

          tokens.push({
            type: 'profile',
            address: creatorCoin.address,
            name: profile.displayName || profile.username || 'Unknown Profile',
            symbol: creatorCoin.symbol || 'UNKNOWN',
            image: profile.avatar?.small || profile.avatar?.medium || null,
            volume24h,
            totalVolume,
            marketCap,
            marketCapDelta24h,
            change24h,
          });
        }
      }
    }

    // Ordenar resultados por volumen y relevancia (coincidencias al final)
    const sortedTokens = tokens.sort((a, b) => {
      const aVolume = a.volume24h || 0;
      const bVolume = b.volume24h || 0;
      
      // Primero ordenar por volumen
      if (aVolume > 0 && bVolume === 0) return -1;
      if (aVolume === 0 && bVolume > 0) return 1;
      if (aVolume > 0 && bVolume > 0) return bVolume - aVolume;
      
      // Luego por coincidencia: coincidencias al final
      const aMatch = a.name?.toLowerCase().includes(query.toLowerCase()) || false;
      const bMatch = b.name?.toLowerCase().includes(query.toLowerCase()) || false;
      
      // Coincidencias al final (return 1 para que aparezcan después)
      if (aMatch && !bMatch) return 1;
      if (!aMatch && bMatch) return -1;
      
      // Si ambos coinciden o ninguno coincide, ordenar alfabéticamente
      return a.name.localeCompare(b.name);
    });

    return NextResponse.json({ tokens: sortedTokens });

  } catch (error) {
    console.error('🔍 Search API error:', error);
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return NextResponse.json({ error: 'Network error: Unable to connect to search service' }, { status: 500 });
    } else {
      return NextResponse.json({ error: 'Unknown search error occurred' }, { status: 500 });
    }
  }
}
