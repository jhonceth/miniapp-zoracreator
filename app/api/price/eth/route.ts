import { NextRequest, NextResponse } from 'next/server';

interface PriceResponse {
  price: number;
  source: string;
  timestamp: string;
}

const PRICE_APIS = [
  {
    name: 'CoinGecko',
    url: 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd',
    parser: (data: any) => data?.ethereum?.usd
  },
  {
    name: 'DiaData',
    url: 'https://api.diadata.org/v1/assetQuotation/Ethereum/0x0000000000000000000000000000000000000000',
    parser: (data: any) => data?.Price
  },
  {
    name: 'Binance',
    url: 'https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT',
    parser: (data: any) => parseFloat(data?.price)
  },
  {
    name: 'CryptoCompare',
    url: 'https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD',
    parser: (data: any) => data?.USD
  }
];

async function fetchPriceFromAPI(api: typeof PRICE_APIS[0]): Promise<number | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(api.url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ZBase-Creator/1.0)',
        'Accept': 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const price = api.parser(data);

    if (typeof price === 'number' && price > 0 && price < 100000) {
      return price;
    }

    return null;
  } catch (error) {
    console.error(`Error fetching price from ${api.name}:`, error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Try each API in order until one succeeds
    for (const api of PRICE_APIS) {
      const price = await fetchPriceFromAPI(api);
      
      if (price !== null) {
        const response: PriceResponse = {
          price,
          source: api.name,
          timestamp: new Date().toISOString()
        };

        return NextResponse.json(response, {
          headers: {
            'Cache-Control': 'public, max-age=60', // Cache for 1 minute
          },
        });
      }
    }

    // If all APIs fail, return error
    return NextResponse.json(
      { error: 'All price APIs are currently unavailable' },
      { status: 503 }
    );

  } catch (error) {
    console.error('Error in price API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
