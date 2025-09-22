import { env } from './env';

const ETHERSCAN_BASE_URL = 'https://api.etherscan.io/v2/api';

interface EtherscanResponse {
  status: string;
  message: string;
  result: string;
}

/**
 * Obtiene el balance de ETH de una dirección usando Etherscan API
 * @param address - Dirección de la wallet
 * @param chainId - ID de la cadena (8453 para Base)
 * @returns Balance en wei como string
 */
export async function getETHBalance(address: string, chainId: number = 8453): Promise<string> {
  try {
    console.log('🔑 Using Etherscan API Key:', env.ETHERSCAN_API_KEY ? 'Present' : 'Missing');
    const url = `${ETHERSCAN_BASE_URL}?module=account&action=balance&address=${address}&chainid=${chainId}&apikey=${env.ETHERSCAN_API_KEY}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: EtherscanResponse = await response.json();
    
    if (data.status === '1' && data.message === 'OK') {
      return data.result;
    } else {
      throw new Error(`Etherscan API error: ${data.message}`);
    }
  } catch (error) {
    console.error('Error fetching ETH balance:', error);
    throw error;
  }
}

/**
 * Obtiene el balance de un token ERC20 usando Etherscan API
 * @param contractAddress - Dirección del contrato del token
 * @param userAddress - Dirección de la wallet del usuario
 * @param chainId - ID de la cadena (8453 para Base)
 * @returns Balance en unidades más pequeñas del token como string
 */
export async function getTokenBalance(
  contractAddress: string, 
  userAddress: string, 
  chainId: number = 8453
): Promise<string> {
  try {
    console.log('🔑 Using Etherscan API Key for token balance:', env.ETHERSCAN_API_KEY ? 'Present' : 'Missing');
    const url = `${ETHERSCAN_BASE_URL}?module=account&action=tokenbalance&contractaddress=${contractAddress}&address=${userAddress}&chainid=${chainId}&apikey=${env.ETHERSCAN_API_KEY}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: EtherscanResponse = await response.json();
    
    if (data.status === '1' && data.message === 'OK') {
      return data.result;
    } else {
      throw new Error(`Etherscan API error: ${data.message}`);
    }
  } catch (error) {
    console.error('Error fetching token balance:', error);
    throw error;
  }
}

/**
 * Obtiene ambos balances (ETH y token) en una sola llamada
 * @param userAddress - Dirección de la wallet del usuario
 * @param tokenAddress - Dirección del contrato del token
 * @param chainId - ID de la cadena (8453 para Base)
 * @returns Objeto con balances de ETH y token
 */
export async function getBalances(
  userAddress: string, 
  tokenAddress: string, 
  chainId: number = 8453
): Promise<{ eth: string; token: string }> {
  try {
    const [ethBalance, tokenBalance] = await Promise.all([
      getETHBalance(userAddress, chainId),
      getTokenBalance(tokenAddress, userAddress, chainId)
    ]);
    
    return {
      eth: ethBalance,
      token: tokenBalance
    };
  } catch (error) {
    console.error('Error fetching balances:', error);
    throw error;
  }
}
