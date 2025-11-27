import { useState, useEffect, useCallback } from 'react';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { ethers } from 'ethers';
import { 
  logGameToSomnia, 
  getPlayerGameHistory, 
  getPlayerGameCount,
  getGameLoggerStats,
  subscribeToGameResults,
  getTransactionExplorerUrl
} from '../services/GameLoggerIntegration';

/**
 * React hook for Somnia Game Logger
 * Provides easy access to game logging functionality
 */
export function useSomniaGameLogger() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  
  const [isLogging, setIsLogging] = useState(false);
  const [lastLogTxHash, setLastLogTxHash] = useState(null);
  const [error, setError] = useState(null);

  /**
   * Convert wagmi clients to ethers provider and signer
   */
  const getEthersProviderAndSigner = useCallback(async () => {
    if (!publicClient) {
      return { provider: null, signer: null };
    }

    // Create ethers provider from public client
    const provider = new ethers.BrowserProvider(window.ethereum);
    
    // Create signer if wallet is connected
    let signer = null;
    if (walletClient && isConnected) {
      signer = await provider.getSigner();
    }

    return { provider, signer };
  }, [publicClient, walletClient, isConnected]);

  /**
   * Log a game result to Somnia Testnet
   */
  const logGame = useCallback(async ({
    gameType,
    betAmount,
    result,
    payout,
    entropyProof
  }) => {
    if (!isConnected || !address) {
      setError('Wallet not connected');
      return null;
    }

    setIsLogging(true);
    setError(null);

    try {
      const { provider, signer } = await getEthersProviderAndSigner();

      if (!signer) {
        throw new Error('Signer not available');
      }

      const txHash = await logGameToSomnia({
        gameType,
        playerAddress: address,
        betAmount,
        result,
        payout,
        entropyProof,
        provider,
        signer
      });

      setLastLogTxHash(txHash);
      return txHash;

    } catch (err) {
      console.error('Failed to log game:', err);
      setError(err.message);
      return null;
    } finally {
      setIsLogging(false);
    }
  }, [address, isConnected, getEthersProviderAndSigner]);

  /**
   * Get player's game history
   */
  const getHistory = useCallback(async (limit = 50) => {
    if (!address) {
      return [];
    }

    try {
      const { provider } = await getEthersProviderAndSigner();
      return await getPlayerGameHistory(address, limit, provider);
    } catch (err) {
      console.error('Failed to get history:', err);
      return [];
    }
  }, [address, getEthersProviderAndSigner]);

  /**
   * Get player's total game count
   */
  const getGameCount = useCallback(async () => {
    if (!address) {
      return 0;
    }

    try {
      const { provider } = await getEthersProviderAndSigner();
      return await getPlayerGameCount(address, provider);
    } catch (err) {
      console.error('Failed to get game count:', err);
      return 0;
    }
  }, [address, getEthersProviderAndSigner]);

  /**
   * Get contract statistics
   */
  const getStats = useCallback(async () => {
    try {
      const { provider } = await getEthersProviderAndSigner();
      return await getGameLoggerStats(provider);
    } catch (err) {
      console.error('Failed to get stats:', err);
      return null;
    }
  }, [getEthersProviderAndSigner]);

  /**
   * Subscribe to game result events
   */
  const subscribeToEvents = useCallback((callback) => {
    const setupSubscription = async () => {
      try {
        const { provider } = await getEthersProviderAndSigner();
        return subscribeToGameResults(callback, provider);
      } catch (err) {
        console.error('Failed to subscribe to events:', err);
        return () => {};
      }
    };

    let unsubscribe = () => {};
    setupSubscription().then(unsub => {
      unsubscribe = unsub;
    });

    return () => unsubscribe();
  }, [getEthersProviderAndSigner]);

  /**
   * Get transaction explorer URL
   */
  const getExplorerUrl = useCallback((txHash) => {
    return getTransactionExplorerUrl(txHash);
  }, []);

  return {
    // State
    isLogging,
    lastLogTxHash,
    error,
    isConnected,
    address,
    
    // Functions
    logGame,
    getHistory,
    getGameCount,
    getStats,
    subscribeToEvents,
    getExplorerUrl
  };
}

export default useSomniaGameLogger;

