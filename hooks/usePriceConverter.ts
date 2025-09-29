import { useEthPrice } from '@/hooks/useEthPrice';

export function usePriceConverter() {
  const { ethPrice } = useEthPrice();

  const convertWethToUsd = (wethPrice: number): number | null => {
    if (!ethPrice) return null;
    return wethPrice * ethPrice.price;
  };

  const formatPrice = (price: number, currency: string): string => {
    if (currency === 'USD') {
      return `$${price.toFixed(6)}`;
    } else if (currency === 'WETH') {
      const usdPrice = convertWethToUsd(price);
      if (usdPrice !== null) {
        return `$${usdPrice.toFixed(6)}`;
      }
      return `${price.toFixed(8)} WETH`;
    }
    return `${price.toFixed(6)} ${currency}`;
  };

  const getUsdPrice = (price: number, currency: string): number | null => {
    if (currency === 'USD') {
      return price;
    } else if (currency === 'WETH') {
      return convertWethToUsd(price);
    }
    return null;
  };

  return {
    convertWethToUsd,
    formatPrice,
    getUsdPrice,
    ethPrice: ethPrice?.price || null
  };
}
