"use client";

import React, { useState, useEffect } from 'react';
import { parseEther, formatEther, parseUnits, formatUnits } from 'viem';
import { tradeCoin, TradeParameters } from '@zoralabs/coins-sdk';
import { useAccount, useWalletClient, usePublicClient, useConnect } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ArrowUpDown, AlertCircle, CheckCircle, Wallet, Settings, RefreshCw, ExternalLink } from 'lucide-react';
import { env } from '@/lib/env';

interface TradingCoinsProps {
  tokenAddress: string;
  tokenSymbol?: string;
  tokenName?: string;
  tokenDecimals?: number;
  tokenPrice?: number; // Precio del token en USD
  className?: string;
}

interface TradeState {
  sellType: 'eth' | 'erc20';
  buyType: 'eth' | 'erc20';
  sellAmount: string;
  slippage: number;
  isLoading: boolean;
  isConfirming: boolean;
  error: string | null;
  success: string | null;
  estimatedOutput: string | null;
  ethPrice: number | null;
  priceSource: string | null;
}

const SUPPORTED_TOKENS = {
  USDC: {
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    symbol: 'USDC',
    decimals: 6,
    name: 'USD Coin'
  },
  ZORA: {
    address: '0x7777777BaD8B6C8c7C4656ef6d1dbB3b5f6Bd7C7',
    symbol: 'ZORA',
    decimals: 18,
    name: 'ZORA'
  }
};

export default function TradingCoins({ 
  tokenAddress, 
  tokenSymbol = 'TOKEN', 
  tokenName = 'Token',
  tokenDecimals = 18,
  tokenPrice = 0.01, // Precio por defecto
  className = ''
}: TradingCoinsProps) {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { connect, connectors, isPending: isConnecting } = useConnect();
  
  console.log('🔍 TradingCoins - Token Price received:', tokenPrice);
  
  const [tradeState, setTradeState] = useState<TradeState>({
    sellType: 'eth',
    buyType: 'erc20',
    sellAmount: '',
    slippage: 0.05,
    isLoading: false,
    isConfirming: false,
    error: null,
    success: null,
    estimatedOutput: null,
    ethPrice: null,
    priceSource: null
  });

  const [balances, setBalances] = useState<{
    eth: string;
    token: string;
    usdc: string;
    zora: string;
  }>({
    eth: '0',
    token: '0',
    usdc: '0',
    zora: '0'
  });

  console.log('🔍 Current balances state:', balances);

  const [showSlippageSettings, setShowSlippageSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [slippageSaved, setSlippageSaved] = useState(false);

  // Fetch ETH price
  useEffect(() => {
    const fetchEthPrice = async () => {
      try {
        const response = await fetch('/api/price/eth');
        if (response.ok) {
          const data = await response.json();
          setTradeState(prev => ({
            ...prev,
            ethPrice: data.price,
            priceSource: data.source
          }));
        }
      } catch (error) {
        console.error('Error fetching ETH price:', error);
      }
    };

    fetchEthPrice();
    // Refresh price every 5 minutes
    const interval = setInterval(fetchEthPrice, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch balances from Etherscan API
  useEffect(() => {
    if (!address || !publicClient) return;

    const fetchBalances = async () => {
      try {
        console.log('🔍 Fetching balances from Etherscan API...');
        const response = await fetch(`/api/balances?userAddress=${address}&tokenAddress=${tokenAddress}&chainId=8453`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            const ethBalance = formatEther(data.balances.eth);
            const tokenBalance = formatUnits(data.balances.token, tokenDecimals);
            
            setBalances({
              eth: ethBalance,
              token: tokenBalance,
              usdc: '0',
              zora: '0'
            });
            
            console.log('✅ Balances updated from Etherscan:', { eth: ethBalance, token: tokenBalance });
            console.log('🔍 ETH Balance parsed:', parseFloat(ethBalance));
            console.log('🔍 Token Balance parsed:', parseFloat(tokenBalance));
            return;
          }
        }
        
        console.log('⚠️ Etherscan API failed, falling back to local fetching...');
        await fetchLocalBalances();
      } catch (error) {
        console.error('❌ Error fetching balances from Etherscan API:', error);
        await fetchLocalBalances();
      }
    };

    // Fallback function to fetch balances locally
    const fetchLocalBalances = async () => {
      try {
        console.log('🔍 Fetching balances locally...');
        const [ethBalance, tokenBalance] = await Promise.all([
          publicClient.getBalance({ address }),
          publicClient.readContract({
            address: tokenAddress as `0x${string}`,
            abi: [{
              name: 'balanceOf',
              type: 'function',
              stateMutability: 'view',
              inputs: [{ name: 'account', type: 'address' }],
              outputs: [{ name: '', type: 'uint256' }]
            }],
            functionName: 'balanceOf',
            args: [address]
          })
        ]);

        setBalances({
          eth: formatEther(ethBalance),
          token: formatUnits(tokenBalance, tokenDecimals),
          usdc: '0',
          zora: '0'
        });
        
        console.log('✅ Local balances updated');
      } catch (error) {
        console.error('❌ Error fetching local balances:', error);
      }
    };

    fetchBalances();
  }, [address, publicClient, tokenAddress, tokenDecimals]);

  // Calculate estimated output
  useEffect(() => {
    if (tradeState.sellAmount && tradeState.ethPrice && parseFloat(tradeState.sellAmount) > 0) {
      const sellAmount = parseFloat(tradeState.sellAmount);
      
      if (tradeState.sellType === 'eth') {
        // ETH to Token: Simple calculation (this would need actual DEX integration for real quotes)
        const ethValueUSD = sellAmount * tradeState.ethPrice;
        // Usar precio real del token
        const estimatedTokens = ethValueUSD / tokenPrice;
        setTradeState(prev => ({ ...prev, estimatedOutput: estimatedTokens.toFixed(4) }));
      } else if (tradeState.sellType === 'erc20') {
        // Token to ETH: Simple calculation
        const tokenValueUSD = sellAmount * tokenPrice; // Usar precio real del token
        const estimatedETH = tokenValueUSD / tradeState.ethPrice;
        setTradeState(prev => ({ ...prev, estimatedOutput: estimatedETH.toFixed(4) }));
      }
    } else {
      setTradeState(prev => ({ ...prev, estimatedOutput: null }));
    }
  }, [tradeState.sellAmount, tradeState.sellType, tradeState.ethPrice, tokenPrice]);

  const setMaxAmount = (percentage: number) => {
    const balance = tradeState.sellType === 'eth' ? balances.eth : balances.token;
    const maxAmount = (parseFloat(balance) * percentage / 100).toString();
    setTradeState(prev => ({ ...prev, sellAmount: maxAmount, error: null }));
  };

  const setMaxAmountETH = (percentage: number) => {
    const ethBalance = parseFloat(balances.eth);
    const maxAmount = (ethBalance * percentage / 100).toString();
    console.log(`🔍 ETH ${percentage}% - Balance: ${ethBalance}, Calculated: ${maxAmount}`);
    setTradeState(prev => ({ 
      ...prev, 
      sellType: 'eth',
      sellAmount: maxAmount, 
      error: null 
    }));
  };

  const setMaxAmountToken = (percentage: number) => {
    const tokenBalance = parseFloat(balances.token);
    const maxAmount = (tokenBalance * percentage / 100).toString();
    console.log(`🔍 Token ${percentage}% - Balance: ${tokenBalance}, Calculated: ${maxAmount}`);
    setTradeState(prev => ({ 
      ...prev, 
      sellType: 'erc20',
      sellAmount: maxAmount, 
      error: null 
    }));
  };

  const validateTrade = (): string | null => {
    if (!isConnected) return 'Please connect your wallet';
    if (!walletClient || !publicClient) return 'Wallet not ready';
    if (!tradeState.sellAmount || parseFloat(tradeState.sellAmount) <= 0) return 'Enter a valid amount';
    if (tradeState.slippage < 0 || tradeState.slippage >= 1) return 'Slippage must be between 0 and 99%';

    // Check balance
    const sellAmount = parseFloat(tradeState.sellAmount);
    if (tradeState.sellType === 'eth' && sellAmount > parseFloat(balances.eth)) {
      return 'Insufficient ETH balance';
    }
    if (tradeState.sellType === 'erc20') {
      const tokenBalance = parseFloat(balances.token);
      if (sellAmount > tokenBalance) {
        return `Insufficient ${truncateTokenSymbol(tokenSymbol)} balance`;
      }
    }

    return null;
  };

  // Function to manually refresh balances
  const refreshBalancesManually = async () => {
    if (!address || !publicClient) return;
    
    try {
      console.log('🔄 Manually refreshing balances...');
      const response = await fetch(`/api/balances?userAddress=${address}&tokenAddress=${tokenAddress}&chainId=8453`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const ethBalance = formatEther(data.balances.eth);
          const tokenBalance = formatUnits(data.balances.token, tokenDecimals);
          
          setBalances({
            eth: ethBalance,
            token: tokenBalance,
            usdc: '0',
            zora: '0'
          });
          
          console.log('✅ Balances manually refreshed:', { eth: ethBalance, token: tokenBalance });
        }
      }
    } catch (error) {
      console.error('❌ Error manually refreshing balances:', error);
    }
  };

  // Function to refresh balances after successful trade
  const refreshBalances = async () => {
    if (!address || !publicClient) return;
    
    try {
      console.log('🔄 Refreshing balances after trade...');
      const response = await fetch(`/api/balances?userAddress=${address}&tokenAddress=${tokenAddress}&chainId=8453`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const ethBalance = formatEther(data.balances.eth);
          const tokenBalance = formatUnits(data.balances.token, tokenDecimals);
          
          setBalances({
            eth: ethBalance,
            token: tokenBalance,
            usdc: '0',
            zora: '0'
          });
          
          console.log('✅ Balances refreshed after trade:', { eth: ethBalance, token: tokenBalance });
        }
      }
    } catch (error) {
      console.error('❌ Error refreshing balances after trade:', error);
    }
  };

  // Function to open transaction in Basescan
  const openTransactionInBasescan = () => {
    if (tradeState.success) {
      window.open(`https://basescan.org/tx/${tradeState.success}`, '_blank');
    }
  };

  // Function to start new trade
  const startNewTrade = () => {
    setShowSuccessMessage(false);
    setTradeState(prev => ({ 
      ...prev, 
      success: null,
      error: null,
      sellAmount: '',
      estimatedOutput: null,
      isLoading: false,
      isConfirming: false
    }));
  };

  // Save slippage settings to localStorage
  const saveSlippageSettings = () => {
    try {
      localStorage.setItem('trading-slippage', tradeState.slippage.toString());
      console.log('✅ Slippage settings saved:', tradeState.slippage);
      setSlippageSaved(true);
      setShowSlippageSettings(false);
      
      // Hide the saved indicator after 2 seconds
      setTimeout(() => {
        setSlippageSaved(false);
      }, 2000);
    } catch (error) {
      console.error('❌ Error saving slippage settings:', error);
    }
  };

  // Load slippage settings from localStorage on component mount
  useEffect(() => {
    try {
      const savedSlippage = localStorage.getItem('trading-slippage');
      if (savedSlippage) {
        const slippageValue = parseFloat(savedSlippage);
        if (!isNaN(slippageValue) && slippageValue >= 0 && slippageValue <= 1) {
          setTradeState(prev => ({ ...prev, slippage: slippageValue }));
          console.log('✅ Slippage settings loaded:', slippageValue);
        }
      }
    } catch (error) {
      console.error('❌ Error loading slippage settings:', error);
    }
  }, []);

  const executeTrade = async () => {
    const validationError = validateTrade();
    if (validationError) {
      setTradeState(prev => ({ ...prev, error: validationError }));
      return;
    }

    setTradeState(prev => ({ ...prev, isLoading: true, error: null, success: null }));

    try {
      if (!walletClient || !publicClient || !address) {
        throw new Error('Wallet not connected');
      }

      // Parse amount according to the token being sold
      const sellAmount = tradeState.sellType === 'eth' 
        ? parseEther(tradeState.sellAmount)  // ETH in wei
        : parseUnits(tradeState.sellAmount, tokenDecimals); // ERC20 tokens in smallest units

      // Validate user has sufficient balance
      if (tradeState.sellType === 'eth') {
        const ethBalance = parseFloat(balances.eth);
        const sellAmountFloat = parseFloat(tradeState.sellAmount);
        if (sellAmountFloat > ethBalance) {
          throw new Error(`Insufficient ETH balance. You have ${ethBalance.toFixed(4)} ETH but trying to sell ${sellAmountFloat} ETH`);
        }
      } else {
        const tokenBalance = parseFloat(balances.token);
        const sellAmountFloat = parseFloat(tradeState.sellAmount);
        if (sellAmountFloat > tokenBalance) {
          throw new Error(`Insufficient ${tokenSymbol} balance. You have ${tokenBalance.toFixed(4)} ${tokenSymbol} but trying to sell ${sellAmountFloat} ${tokenSymbol}`);
        }
      }

      // Validate amountIn according to documentation
      if (sellAmount <= BigInt(0)) {
        throw new Error('Amount in must be greater than 0');
      }

      // Validate slippage according to documentation
      if (tradeState.slippage >= 1.0) {
        throw new Error('Slippage must be less than 1, max 0.99');
      }
      
      // Ensure slippage is not too low for volatile tokens
      if (tradeState.slippage < 0.01) {
        console.log('⚠️ Warning: Very low slippage tolerance may cause transaction failures');
      }

      // Additional validation for token trades
      if (tradeState.sellType === 'erc20') {
        const sellAmountFloat = parseFloat(tradeState.sellAmount);
        if (sellAmountFloat < 0.000001) {
          throw new Error('Amount too small - Minimum amount is 0.000001 tokens');
        }
        
        // Check if amount is reasonable (not more than 50% of balance)
        const tokenBalance = parseFloat(balances.token);
        if (sellAmountFloat > tokenBalance * 0.5) {
          console.log('⚠️ Warning: Selling more than 50% of token balance may fail due to liquidity');
        }
        
        // Additional validation: ensure we're not trying to sell more than 90% of balance
        if (sellAmountFloat > tokenBalance * 0.9) {
          throw new Error(`Cannot sell more than 90% of token balance. You have ${tokenBalance.toFixed(4)} ${tokenSymbol}, trying to sell ${sellAmountFloat}`);
        }
        
        // Check for very large amounts that might cause issues
        if (sellAmountFloat > 1000000) {
          console.log('⚠️ Warning: Very large amount may cause transaction failures');
        }
      }

      console.log('🔍 Trade Parameters:', {
        sellType: tradeState.sellType,
        sellAmount: tradeState.sellAmount,
        parsedSellAmount: sellAmount.toString(),
        slippage: tradeState.slippage,
        tokenAddress,
        tokenDecimals,
        isETH: tradeState.sellType === 'eth',
        isERC20: tradeState.sellType === 'erc20',
        sellAmountWei: tradeState.sellType === 'eth' ? sellAmount.toString() : 'N/A',
        sellAmountTokens: tradeState.sellType === 'erc20' ? sellAmount.toString() : 'N/A',
        tokenBalance: balances.token,
        ethBalance: balances.eth,
        tokenPrice: tokenPrice
      });

      // Prepare trade parameters with referrer hookData
      const referrerAddress = env.NEXT_PUBLIC_PLATFORM_REFERRER_ADDRESS;
      const hookData = encodeReferrerHookData(referrerAddress);
      
      const tradeParameters: TradeParameters = {
        sell: tradeState.sellType === 'eth' 
          ? { type: 'eth' }
          : { type: 'erc20', address: tokenAddress as `0x${string}` },
        buy: tradeState.sellType === 'eth'
          ? { type: 'erc20', address: tokenAddress as `0x${string}` }
          : { type: 'eth' },
        amountIn: sellAmount,
        slippage: tradeState.slippage,
        sender: address,
        // Note: hookData is not part of TradeParameters interface
        // The referrer functionality may need to be implemented differently
      };

      console.log('🔍 Final Trade Parameters:', tradeParameters);
      console.log('🔍 Wallet Client Account:', walletClient.account);
      console.log('🔍 Address:', address);
      console.log('🔍 Using Account:', walletClient.account || address);
      console.log('🔗 Referrer Address:', referrerAddress);
      console.log('🔗 HookData:', hookData);

      console.log('🚀 Calling tradeCoin...');
      let receipt: any;
      
      // Try with different slippage strategies if first attempt fails
      const slippageStrategies = [
        { slippage: tradeState.slippage, validateTransaction: true },
        { slippage: Math.min(0.15, tradeState.slippage + 0.05), validateTransaction: true },
        { slippage: 0.15, validateTransaction: false },
        { slippage: 0.20, validateTransaction: false }
      ];
      
      let lastError: any = null;
      
      for (let i = 0; i < slippageStrategies.length; i++) {
        const strategy = slippageStrategies[i];
        
        try {
          console.log(`🔄 Attempt ${i + 1}/${slippageStrategies.length} with slippage: ${strategy.slippage}, validation: ${strategy.validateTransaction}`);
          
          const currentTradeParameters = {
            ...tradeParameters,
            slippage: strategy.slippage
          };
          
          receipt = await tradeCoin({
            tradeParameters: currentTradeParameters,
            walletClient,
            account: walletClient.account || address as `0x${string}`,
            publicClient,
            validateTransaction: strategy.validateTransaction
          });
          
          console.log(`✅ Trade successful on attempt ${i + 1}! Receipt:`, receipt);
          break; // Success, exit the loop
          
        } catch (attemptError: any) {
          console.log(`❌ Attempt ${i + 1} failed:`, attemptError.message);
          lastError = attemptError;
          
          // If this is the last attempt, throw the error
          if (i === slippageStrategies.length - 1) {
            throw lastError;
          }
          
          // Wait a bit before next attempt
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Wait for transaction confirmation before showing success
      console.log('⏳ Waiting for transaction confirmation...');
      
      // Update state to show confirming
      setTradeState(prev => ({ 
        ...prev, 
        isLoading: false, // Stop loading
        isConfirming: true, // Start confirming
        success: receipt.transactionHash
      }));
      
      const confirmedReceipt = await publicClient.waitForTransactionReceipt({
        hash: receipt.transactionHash,
        confirmations: 1
      });
      console.log('✅ Transaction confirmed! Confirmed receipt:', confirmedReceipt);

      setTradeState(prev => ({ 
        ...prev, 
        isLoading: false, 
        isConfirming: false, // Stop confirming
        success: receipt.transactionHash,
        sellAmount: ''
      }));

      // Show success message after confirmation
      setShowSuccessMessage(true);

      // Refresh balances after successful trade
      await refreshBalances();

    } catch (error: any) {
      console.error('❌ Trade Error:', error);
      console.error('❌ Error Details:', {
        message: error.message,
        code: error.code,
        name: error.name,
        stack: error.stack,
        cause: error.cause,
        details: error.details,
        data: error.data,
        reason: error.reason
      });
      
      let errorMessage = 'Trade failed';
      
      // Handle specific error types
      if (error.message?.includes('Quote failed')) {
        errorMessage = 'Quote failed - Unable to get price quote for this trade. Try adjusting slippage or amount.';
      } else if (error.message?.includes('ExecutionFailed')) {
        errorMessage = 'Transaction failed in contract - This could be due to insufficient liquidity, slippage, or token approval issues. Try reducing the amount or increasing slippage.';
        
        // Analyze the specific error
        if (error.data?.includes('commandIndex=0')) {
          errorMessage += ' The first command in the transaction failed, likely due to insufficient liquidity or slippage.';
        }
        
        // Suggest automatic adjustments
        const currentSlippage = tradeState.sellType === 'erc20' ? tradeState.slippage : tradeState.slippage;
        if (currentSlippage < 0.1) {
          console.log('💡 Suggesting higher slippage tolerance...');
          setTradeState(prev => ({ 
            ...prev, 
            slippage: Math.min(0.20, currentSlippage + 0.10) // Increase slippage by 10%
          }));
        }
        
        // Also suggest reducing amount if it's very large
        const sellAmountFloat = parseFloat(tradeState.sellAmount);
        if (sellAmountFloat > 1000) {
          console.log('💡 Suggesting smaller amount...');
          const suggestedAmount = (sellAmountFloat * 0.5).toString();
          setTradeState(prev => ({ 
            ...prev, 
            sellAmount: suggestedAmount
          }));
        }
      } else if (error.message?.includes('Execution reverted')) {
        errorMessage = 'Transaction failed - This could be due to insufficient liquidity, slippage, or token approval issues. Try reducing the amount or increasing slippage.';
        
        // Suggest automatic adjustments
        const currentSlippage = tradeState.slippage;
        if (currentSlippage < 0.1) {
          console.log('💡 Suggesting higher slippage tolerance...');
          setTradeState(prev => ({ 
            ...prev, 
            slippage: Math.min(0.15, currentSlippage + 0.05) // Increase slippage by 5%
          }));
        }
      } else if (error.message?.includes('insufficient')) {
        errorMessage = 'Insufficient balance for this trade';
      } else if (error.message?.includes('slippage')) {
        errorMessage = 'Price moved beyond slippage tolerance - Try increasing slippage tolerance';
      } else if (error.message?.includes('Amount in must be greater than 0')) {
        errorMessage = 'Amount must be greater than 0';
      } else if (error.message?.includes('Slippage must be less than 1')) {
        errorMessage = 'Slippage must be less than 99%';
      } else if (error.message?.includes('allowance')) {
        errorMessage = 'Insufficient token allowance - Please approve the token first';
      } else if (error.message?.includes('liquidity')) {
        errorMessage = 'Insufficient liquidity for this trade - Try a smaller amount';
      } else if (error.message?.includes('deadline')) {
        errorMessage = 'Transaction deadline exceeded - Please try again';
      } else if (error.message) {
        errorMessage = error.message;
      }

      setTradeState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage 
      }));
    }
  };

  const swapTokens = () => {
    setTradeState(prev => ({
      ...prev,
      sellType: prev.sellType === 'eth' ? 'erc20' : 'eth',
      sellAmount: '',
      error: null,
      success: null,
      isLoading: false,
      isConfirming: false
    }));
  };

  const getBalance = (type: 'eth' | 'erc20') => {
    if (type === 'eth') return balances.eth;
    return balances.token;
  };

  const formatBalance = (balance: string, decimals: number = 4) => {
    const num = parseFloat(balance);
    return num.toFixed(decimals);
  };

  const truncateTokenSymbol = (symbol: string, maxLength: number = 8) => {
    if (symbol.length <= maxLength) return symbol;
    return symbol.substring(0, maxLength) + '...';
  };

  // Function to encode referrer address as hookData
  const encodeReferrerHookData = (referrerAddress: string): `0x${string}` => {
    try {
      // Import abi from viem for encoding
      const { encodeAbiParameters } = require('viem');
      
      // Encode the referrer address as hookData
      const hookData = encodeAbiParameters(
        [{ name: 'referrer', type: 'address' }],
        [referrerAddress as `0x${string}`]
      );
      
      console.log('🔗 Encoded referrer hookData:', hookData);
      return hookData;
    } catch (error) {
      console.error('❌ Error encoding referrer hookData:', error);
      // Return empty bytes if encoding fails
      return '0x' as `0x${string}`;
    }
  };

  if (!isConnected) {
    return (
      <Card className={`border-orange-200 bg-orange-50 dark:bg-orange-900/20 ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
            <Wallet className="h-5 w-5" />
            Conectar Wallet de Farcaster
          </CardTitle>
          <CardDescription className="text-orange-700 dark:text-orange-300">
            Conecta tu wallet de Farcaster para poder hacer trading de tokens
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {connectors.map((connector) => (
              <Button
                key={connector.uid}
                onClick={() => connect({ connector })}
                disabled={isConnecting}
                className="w-full"
                variant="outline"
              >
                {isConnecting ? "Conectando..." : `Conectar con ${connector.name}`}
              </Button>
            ))}
          </div>
          <p className="text-xs text-orange-600 dark:text-orange-400 mt-4">
            Usa la wallet integrada de Farcaster para la mejor experiencia
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-5 w-5" />
            Trade
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshBalancesManually}
              className="h-8 w-8 p-0"
              title="Refresh Balances"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSlippageSettings(!showSlippageSettings)}
              className="h-8 w-8 p-0"
            >
              <Settings className="h-4 w-4" />
            </Button>
            {slippageSaved && (
              <div className="text-xs text-green-600 font-medium animate-pulse">
                ✓ Saved
              </div>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Slippage Settings Modal */}
        {showSlippageSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 max-w-md mx-4 border border-gray-700">
              <h3 className="text-lg font-semibold mb-4 text-white">Slippage Tolerance</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    Slippage: {(tradeState.slippage * 100).toFixed(1)}%
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="50"
                    step="0.1"
                    value={tradeState.slippage * 100}
                    onChange={(e) => setTradeState(prev => ({ 
                      ...prev, 
                      slippage: parseFloat(e.target.value) / 100 
                    }))}
                    className="w-full accent-blue-500"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>0.1%</span>
                    <span>50%</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {[0.01, 0.05, 0.1, 0.2].map((slippage) => (
                    <Button
                      key={slippage}
                      variant={tradeState.slippage === slippage ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTradeState(prev => ({ ...prev, slippage }))}
                      className={`flex-1 ${
                        tradeState.slippage === slippage 
                          ? 'bg-blue-600 hover:bg-blue-700' 
                          : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {slippage * 100}%
                    </Button>
                  ))}
                </div>
                <div className="bg-gray-700 rounded-lg p-3">
                  <div className="text-xs text-gray-300 space-y-1">
                    <div>• Lower slippage = less price impact, higher failure risk</div>
                    <div>• Higher slippage = more price impact, lower failure risk</div>
                    <div>• Recommended: 0.5% - 2% for stable tokens</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowSlippageSettings(false)}
                    variant="outline"
                    className="flex-1 bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={saveSlippageSettings}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    Save Settings
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success Message Overlay */}
        {showSuccessMessage && tradeState.success && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center">
              <div className="mb-4">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Trade Successful!</h3>
                <div className="mb-4">
                  <Button
                    onClick={openTransactionInBasescan}
                    variant="outline"
                    className="flex items-center gap-2 mx-auto border-0 bg-gray-100 hover:bg-gray-200 text-gray-700"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View TX
                  </Button>
                </div>
              </div>
              <div className="flex gap-2 justify-center">
                <Button
                  onClick={startNewTrade}
                  className="bg-green-600 hover:bg-green-700"
                >
                  New Trade
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowSuccessMessage(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('buy')}
            className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'buy'
                ? 'border-green-500 text-green-600 bg-green-50'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Buy
          </button>
          <button
            onClick={() => setActiveTab('sell')}
            className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'sell'
                ? 'border-red-500 text-red-600 bg-red-50'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Sell
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'buy' ? (
          /* Buy Tab Content */
          <div className="space-y-4">
            {/* ETH Balance Display */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-green-800">Your ETH Balance</span>
                {tradeState.ethPrice && (
                  <span className="text-xs text-green-600">
                    ${tradeState.ethPrice.toFixed(2)}/ETH
                  </span>
                )}
              </div>
              <div className="text-lg font-bold text-green-800">
                {formatBalance(balances.eth, 4)} ETH
              </div>
              {tradeState.ethPrice && (
                <div className="text-sm text-green-600">
                  ≈ ${(parseFloat(balances.eth) * tradeState.ethPrice).toFixed(2)} USD
                </div>
              )}
            </div>

            {/* ETH Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount to Spend (ETH)</label>
              <Input
                type="number"
                placeholder="0.0"
                value={tradeState.sellType === 'eth' ? tradeState.sellAmount : ''}
                onChange={(e) => {
                  setTradeState(prev => ({ 
                    ...prev, 
                    sellType: 'eth',
                    sellAmount: e.target.value, 
                    error: null 
                  }));
                }}
                className="text-lg"
              />
              
              {/* Percentage Buttons for ETH */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMaxAmountETH(20)}
                  className="flex-1"
                >
                  20%
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMaxAmountETH(50)}
                  className="flex-1"
                >
                  50%
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMaxAmountETH(90)}
                  className="flex-1"
                >
                  90%
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMaxAmountETH(100)}
                  className="flex-1"
                >
                  MAX
                </Button>
              </div>
            </div>

            {/* Token Output */}
            <div className="space-y-2">
              <label className="text-sm font-medium">You&apos;ll Receive</label>
              <div className="bg-gray-50 border rounded-lg p-4">
                <div className="text-lg font-bold text-gray-900">
                  {tradeState.estimatedOutput || '0.0'} {truncateTokenSymbol(tokenSymbol)}
                </div>
                {tradeState.ethPrice && tradeState.sellAmount && tradeState.estimatedOutput && (
                  <div className="text-sm text-gray-600">
                    ≈ ${(parseFloat(tradeState.estimatedOutput) * tokenPrice).toFixed(2)} USD
                  </div>
                )}
              </div>
            </div>

            {/* Buy Button */}
            <Button
              onClick={executeTrade}
              disabled={tradeState.isLoading || tradeState.isConfirming || !!validateTrade() || tradeState.sellType !== 'eth'}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {tradeState.isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Buying...
                </>
              ) : tradeState.isConfirming ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Confirming...
                </>
              ) : (
                `Buy ${truncateTokenSymbol(tokenSymbol)} with ETH`
              )}
            </Button>
          </div>
        ) : (
          /* Sell Tab Content */
          <div className="space-y-4">
            {/* Token Balance Display */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-red-800">Your {truncateTokenSymbol(tokenSymbol)} Balance</span>
                <span className="text-xs text-red-600">
                  Token Price: ${tokenPrice.toFixed(6)}
                </span>
              </div>
              <div className="text-lg font-bold text-red-800">
                {formatBalance(balances.token, 4)} {truncateTokenSymbol(tokenSymbol)}
              </div>
              <div className="text-sm text-red-600">
                ≈ ${(parseFloat(balances.token) * tokenPrice).toFixed(2)} USD
              </div>
            </div>

            {/* Token Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount to Sell ({truncateTokenSymbol(tokenSymbol)})</label>
              <Input
                type="number"
                placeholder="0.0"
                value={tradeState.sellType === 'erc20' ? tradeState.sellAmount : ''}
                onChange={(e) => {
                  setTradeState(prev => ({ 
                    ...prev, 
                    sellType: 'erc20',
                    sellAmount: e.target.value, 
                    error: null 
                  }));
                }}
                className="text-lg"
              />
              
              {/* Percentage Buttons for Token */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMaxAmountToken(20)}
                  className="flex-1"
                >
                  20%
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMaxAmountToken(50)}
                  className="flex-1"
                >
                  50%
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMaxAmountToken(90)}
                  className="flex-1"
                >
                  90%
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMaxAmountToken(100)}
                  className="flex-1"
                >
                  MAX
                </Button>
              </div>
            </div>

            {/* ETH Output */}
            <div className="space-y-2">
              <label className="text-sm font-medium">You&apos;ll Receive</label>
              <div className="bg-gray-50 border rounded-lg p-4">
                <div className="text-lg font-bold text-gray-900">
                  {tradeState.estimatedOutput || '0.0'} ETH
                </div>
                {tradeState.ethPrice && tradeState.sellAmount && tradeState.estimatedOutput && (
                  <div className="text-sm text-gray-600">
                    ≈ ${(parseFloat(tradeState.estimatedOutput) * tradeState.ethPrice).toFixed(2)} USD
                  </div>
                )}
              </div>
            </div>

            {/* Sell Button */}
            <Button
              onClick={executeTrade}
              disabled={tradeState.isLoading || tradeState.isConfirming || !!validateTrade() || tradeState.sellType !== 'erc20'}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              {tradeState.isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Selling...
                </>
              ) : tradeState.isConfirming ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Confirming...
                </>
              ) : (
                `Sell ${truncateTokenSymbol(tokenSymbol)} for ETH`
              )}
            </Button>
          </div>
        )}

        {/* Trading Info */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-sm">
              <img src="/icozora.png" alt="Zora" className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-blue-900 mb-1">
                Powered by Zora SDK
              </div>
              <div className="text-xs text-blue-700 space-y-1">
                <div>• Secure trading with EIP-2612 permit signatures</div>
                <div>• No separate approval transactions required</div>
                <div>• Built on Base network with optimized routing</div>
              </div>
            </div>
          </div>
        </div>

        {/* Error/Success Messages */}
        {tradeState.error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{tradeState.error}</AlertDescription>
          </Alert>
        )}

        {tradeState.success && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <Button
                onClick={openTransactionInBasescan}
                variant="link"
                className="p-0 h-auto text-green-600 hover:text-green-700"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                View TX
              </Button>
            </AlertDescription>
          </Alert>
        )}


        {/* Security Info */}
      </CardContent>
    </Card>
  );
}
