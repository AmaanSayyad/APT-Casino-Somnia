"use client";
import { useState, useEffect, useCallback } from 'react';
import { useAccount, useBalance, usePublicClient, useWalletClient } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { SOMNIA_CONTRACTS, SOMNIA_NETWORKS } from '@/config/contracts';

const TREASURY_ADDRESS = SOMNIA_CONTRACTS[SOMNIA_NETWORKS.TESTNET].treasury;
const GAME_LOGGER_ADDRESS = SOMNIA_CONTRACTS[SOMNIA_NETWORKS.TESTNET].gameLogger;

const formatSTTAmount = (amount) => {
  try {
    return formatEther(BigInt(amount));
  } catch (error) {
    console.error('Error formatting STT amount:', error);
    return '0';
  }
};

const parseSTTAmount = (amount) => {
  try {
    return parseEther(amount.toString()).toString();
  } catch (error) {
    console.error('Error parsing STT amount:', error);
    return '0';
  }
};

export const useSomniaCasino = () => {
  const { address: account, isConnected: connected, chain } = useAccount();
  const { data: balanceData } = useBalance({
    address: account,
    watch: true,
  });
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  
  const [balance, setBalance] = useState('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Update balance when wallet connects or balance changes
  useEffect(() => {
    if (connected && account && balanceData) {
      setBalance(formatEther(balanceData.value));
    } else {
      setBalance('0');
    }
  }, [connected, account, balanceData]);

  const updateBalance = useCallback(async () => {
    if (!account || !publicClient) return;
    
    try {
      setLoading(true);
      const balance = await publicClient.getBalance({ address: account });
      setBalance(formatEther(balance));
    } catch (error) {
      console.error('Error fetching balance:', error);
      setBalance('0');
    } finally {
      setLoading(false);
    }
  }, [account, publicClient]);

  // Deposit function - sends STT to treasury contract
  const deposit = useCallback(async (amount) => {
    if (!connected || !account || !walletClient) {
      throw new Error('Wallet not connected');
    }

    try {
      setLoading(true);
      setError(null);

      const value = parseEther(amount.toString());
      
      // Send transaction to treasury contract
      const hash = await walletClient.sendTransaction({
        to: TREASURY_ADDRESS,
        value,
        account,
        chain,
      });

      console.log('Deposit transaction sent:', hash);

      // Wait for transaction confirmation
      if (publicClient) {
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        console.log('Deposit transaction confirmed:', receipt);
      }
      
      // Update balance after transaction
      await updateBalance();
      
      return hash;
    } catch (error) {
      console.error('Deposit failed:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [connected, account, walletClient, publicClient, chain, updateBalance]);

  // Withdraw function - requests withdrawal from treasury via API
  const withdraw = useCallback(async (amount) => {
    if (!connected || !account) {
      throw new Error('Wallet not connected');
    }

    try {
      setLoading(true);
      setError(null);

      console.log('Withdrawal requested:', { amount, account });
      
      // Call the withdraw API endpoint
      const response = await fetch('/api/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAddress: account,
          amount: amount
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Withdrawal failed');
      }

      console.log('Withdrawal successful:', result);
      
      // Update balance after transaction
      await updateBalance();
      
      return result.transactionHash;
    } catch (error) {
      console.error('Withdrawal failed:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [connected, account, updateBalance]);

  // Roulette game functions
  const placeRouletteBet = useCallback(async (betType, betValue, amount, numbers = []) => {
    if (!connected || !account) {
      throw new Error('Wallet not connected');
    }

    try {
      setLoading(true);
      setError(null);

      // Mock transaction for demo - in production this would interact with game contract
      const mockTxHash = '0x' + Math.random().toString(16).substr(2, 64);
      
      console.log('Roulette bet placed:', {
        betType,
        betValue,
        amount: parseSTTAmount(amount),
        numbers,
        account
      });
      
      // Update balance after transaction
      await updateBalance();
      
      return mockTxHash;
    } catch (error) {
      console.error('Roulette bet failed:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [connected, account, updateBalance]);

  const getRouletteGameState = useCallback(async () => {
    try {
      // Mock game state for demo
      return {
        isActive: false,
        currentRound: 1,
        lastResult: null
      };
    } catch (error) {
      console.error('Error getting roulette game state:', error);
      return null;
    }
  }, []);

  // Mines game functions
  const startMinesGame = useCallback(async (betAmount, minesCount, tilesToReveal) => {
    if (!connected || !account) {
      throw new Error('Wallet not connected');
    }

    try {
      setLoading(true);
      setError(null);

      // Mock transaction for demo
      const mockTxHash = '0x' + Math.random().toString(16).substr(2, 64);
      
      console.log('Mines game started:', {
        betAmount: parseSTTAmount(betAmount),
        minesCount,
        tilesToReveal,
        account
      });
      
      // Update balance after transaction
      await updateBalance();
      
      return mockTxHash;
    } catch (error) {
      console.error('Mines game start failed:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [connected, account, updateBalance]);

  const revealMinesTile = useCallback(async (gameId, tileIndex) => {
    if (!connected || !account) {
      throw new Error('Wallet not connected');
    }

    try {
      setLoading(true);
      setError(null);

      // Mock transaction for demo
      const mockTxHash = '0x' + Math.random().toString(16).substr(2, 64);
      
      console.log('Mines tile revealed:', { gameId, tileIndex, account });
      
      return mockTxHash;
    } catch (error) {
      console.error('Mines tile reveal failed:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [connected, account]);

  const cashoutMinesGame = useCallback(async (gameId) => {
    if (!connected || !account) {
      throw new Error('Wallet not connected');
    }

    try {
      setLoading(true);
      setError(null);

      // Mock transaction for demo
      const mockTxHash = '0x' + Math.random().toString(16).substr(2, 64);
      
      console.log('Mines cashout:', { gameId, account });
      
      // Update balance after transaction
      await updateBalance();
      
      return mockTxHash;
    } catch (error) {
      console.error('Mines cashout failed:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [connected, account, updateBalance]);

  // Wheel game functions
  const spinWheel = useCallback(async (betAmount, segments) => {
    if (!connected || !account) {
      throw new Error('Wallet not connected');
    }

    try {
      setLoading(true);
      setError(null);

      // Mock transaction for demo
      const mockTxHash = '0x' + Math.random().toString(16).substr(2, 64);
      
      console.log('Wheel spin:', {
        betAmount: parseSTTAmount(betAmount),
        segments,
        account
      });
      
      // Update balance after transaction
      await updateBalance();
      
      return mockTxHash;
    } catch (error) {
      console.error('Wheel spin failed:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [connected, account, updateBalance]);

  // Plinko game functions
  const dropPlinkoBall = useCallback(async (betAmount, risk) => {
    if (!connected || !account) {
      throw new Error('Wallet not connected');
    }

    try {
      setLoading(true);
      setError(null);

      // Mock transaction for demo
      const mockTxHash = '0x' + Math.random().toString(16).substr(2, 64);
      
      console.log('Plinko ball dropped:', {
        betAmount: parseSTTAmount(betAmount),
        risk,
        account
      });
      
      // Update balance after transaction
      await updateBalance();
      
      return mockTxHash;
    } catch (error) {
      console.error('Plinko drop failed:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [connected, account, updateBalance]);

  // General casino functions
  const getCasinoBalance = useCallback(async () => {
    try {
      if (!publicClient) return "0";
      
      const balance = await publicClient.getBalance({ address: TREASURY_ADDRESS });
      return formatEther(balance);
    } catch (error) {
      console.error('Error getting casino balance:', error);
      return "0";
    }
  }, [publicClient]);

  const getGameHistory = useCallback(async (gameType, limit = 10) => {
    try {
      // Mock game history for demo
      return Array.from({ length: limit }, (_, i) => ({
        id: `game_${i}`,
        type: gameType,
        betAmount: (Math.random() * 100).toFixed(2),
        result: Math.random() > 0.5 ? 'win' : 'loss',
        timestamp: new Date(Date.now() - i * 60000).toISOString()
      }));
    } catch (error) {
      console.error('Error getting game history:', error);
      return [];
    }
  }, []);

  return {
    // State
    balance,
    loading,
    error,
    
    // Wallet state
    connected,
    account,
    
    // Functions
    updateBalance,
    deposit,
    withdraw,
    
    // Game functions
    placeRouletteBet,
    getRouletteGameState,
    startMinesGame,
    revealMinesTile,
    cashoutMinesGame,
    spinWheel,
    dropPlinkoBall,
    getCasinoBalance,
    getGameHistory,
    
    // Utility functions
    formatSTTAmount,
    parseSTTAmount,
  };
};

