import { getCachedPrice, setCachedPrice, CACHE_KEYS, CACHE_TTL } from './priceCache';

interface ZoraPriceData {
  price: number;
  source: string;
  timestamp: string;
}

/**
 * Obtiene el precio actual de ZORA en USD
 * Usa cache para evitar consultas innecesarias
 */
export async function getZoraPrice(): Promise<number | null> {
  try {
    // Verificar cache primero
    const cachedData = await getCachedPrice(CACHE_KEYS.TOKEN_INFO('0x1111111111166b7FE7bd91427724B487980aFc69'));
    
    if (cachedData && cachedData.price) {
      return cachedData.price.usd;
    }

    // Si no hay cache, obtener precio de la API
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/token-info?address=0x1111111111166b7FE7bd91427724B487980aFc69&price=true`);
    
    if (!response.ok) {
      console.error('Error obteniendo precio de ZORA:', response.status);
      return null;
    }

    const data = await response.json();
    
    if (data.success && data.price) {
      // Guardar en cache por 20 segundos
      await setCachedPrice(CACHE_KEYS.TOKEN_INFO('0x1111111111166b7FE7bd91427724B487980aFc69'), data, CACHE_TTL.PRICES);
      
      return data.price.usd;
    }

    return null;
  } catch (error) {
    console.error('Error en getZoraPrice:', error);
    return null;
  }
}

/**
 * Convierte una cantidad de ZORA a USD
 * @param zoraAmount Cantidad en ZORA (como string o number)
 * @param zoraPrice Precio de ZORA en USD (opcional, se obtiene automáticamente si no se proporciona)
 * @returns Cantidad en USD o null si no se puede convertir
 */
export async function convertZoraToUSD(
  zoraAmount: string | number, 
  zoraPrice?: number
): Promise<number | null> {
  try {
    // Obtener precio de ZORA si no se proporciona
    const price = zoraPrice || await getZoraPrice();
    
    if (!price || price <= 0) {
      console.warn('No se pudo obtener precio válido de ZORA');
      return null;
    }

    // Convertir cantidad a número
    const amount = typeof zoraAmount === 'string' ? parseFloat(zoraAmount) : zoraAmount;
    
    if (isNaN(amount) || amount < 0) {
      console.warn('Cantidad de ZORA inválida:', zoraAmount);
      return null;
    }

    // Calcular valor en USD
    const usdValue = amount * price;
    
    console.log(`💰 Conversión ZORA a USD: ${amount} ZORA × $${price} = $${usdValue.toFixed(6)}`);
    
    return usdValue;
  } catch (error) {
    console.error('Error en convertZoraToUSD:', error);
    return null;
  }
}

/**
 * Convierte múltiples cantidades de ZORA a USD de forma eficiente
 * @param zoraAmounts Array de cantidades en ZORA
 * @returns Array de cantidades en USD
 */
export async function convertMultipleZoraToUSD(zoraAmounts: (string | number)[]): Promise<(number | null)[]> {
  try {
    // Obtener precio una sola vez para todas las conversiones
    const zoraPrice = await getZoraPrice();
    
    if (!zoraPrice || zoraPrice <= 0) {
      console.warn('No se pudo obtener precio válido de ZORA para conversiones múltiples');
      return zoraAmounts.map(() => null);
    }

    // Convertir todas las cantidades usando el mismo precio
    return zoraAmounts.map(amount => {
      const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
      
      if (isNaN(numAmount) || numAmount < 0) {
        return null;
      }
      
      return numAmount * zoraPrice;
    });
  } catch (error) {
    console.error('Error en convertMultipleZoraToUSD:', error);
    return zoraAmounts.map(() => null);
  }
}

/**
 * Detecta si una cantidad viene en ZORA basándose en el contexto del swap
 * @param swap Datos del swap de Graph
 * @returns true si la cantidad está en ZORA
 */
export function isZoraAmount(swap: any): boolean {
  try {
    // Verificar si alguno de los tokens es ZORA
    const zoraAddress = '0x1111111111166b7FE7bd91427724B487980aFc69';
    
    const token0IsZora = swap.token0?.id?.toLowerCase() === zoraAddress.toLowerCase();
    const token1IsZora = swap.token1?.id?.toLowerCase() === zoraAddress.toLowerCase();
    
    // Si amountUSD es muy pequeño o no existe, probablemente está en ZORA
    const amountUSD = parseFloat(swap.amountUSD || '0');
    const amount0 = parseFloat(swap.amount0 || '0');
    const amount1 = parseFloat(swap.amount1 || '0');
    
    // Si amountUSD es muy pequeño comparado con las cantidades de tokens
    if (amountUSD < 0.001 && (amount0 > 0 || amount1 > 0)) {
      return true;
    }
    
    return token0IsZora || token1IsZora;
  } catch (error) {
    console.error('Error en isZoraAmount:', error);
    return false;
  }
}
