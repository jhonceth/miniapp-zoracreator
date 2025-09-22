import { NextRequest, NextResponse } from 'next/server';
import { getBalances } from '@/lib/etherscan';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get('userAddress');
    const tokenAddress = searchParams.get('tokenAddress');
    const chainId = parseInt(searchParams.get('chainId') || '8453');

    if (!userAddress || !tokenAddress) {
      return NextResponse.json(
        { error: 'userAddress and tokenAddress are required' },
        { status: 400 }
      );
    }

    const balances = await getBalances(userAddress, tokenAddress, chainId);
    
    return NextResponse.json({
      success: true,
      balances: {
        eth: balances.eth,
        token: balances.token
      }
    });

  } catch (error) {
    console.error('Error in balances API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch balances' },
      { status: 500 }
    );
  }
}
