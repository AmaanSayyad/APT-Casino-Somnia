/**
 * React Hook for Somnia Data Streams
 * 
 * Provides easy integration with SomniaStreamsService for React components
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { somniaStreamsService } from '../services/SomniaStreamsService';
import { useWalletClient } from 'wagmi';
import { SOMNIA_CONTRACTS, SOMNIA_NETWORKS } from '../config/contracts';

/**
 * useSomniaStreams Hook
 * 
 * Manages Somnia Data Streams subscription lifecycle in React components
 * 
 * @param {Object} options - Configuration options
 * @param {Function} options.onGameResult - Callback for game result events
 * @param {Function} options.onError - Optional error callback
 * @param {boolean} options.autoConnect - Auto-connect on mount (default: true)
 * @returns {Object} Streams state and control functions
 */
export function useSomniaStreams({
  onGameResult,
  onError,
  autoConnect = true
} = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [subscriptionId, setSubscriptionId] = useState(null);
  const [error, setError] = useState(null);
  const [reconnectionStatus, setReconnectionStatus] = useState({
    enabled: true,
    attempts: 0,
    maxAttempts: 5,
    isReconnecting: false
  });

  const { data: walletClient } = useWalletClient();
  const subscriptionRef = useRef(null);
  const isConnectingRef = useRef(false);
  const isInitializedRef = useRef(false);

  /**
   * Initialize the Somnia Streams SDK
   */
  const initialize = useCallback(async () => {
    // Check if service is already initialized (handles Fast Refresh)
    if (somniaStreamsService.sdk !== null) {
      console.log('✅ SDK already initialized, syncing state...');
      isInitializedRef.current = true;
      setIsInitialized(true);
      return true;
    }
    
    // Check if already in the process of initializing
    if (isConnectingRef.current) {
      console.log('⚠️ Already initializing, please wait...');
      return false;
    }

    try {
      isConnectingRef.current = true;
      
      // Get GameLogger address from config
      const gameLoggerAddress = SOMNIA_CONTRACTS[SOMNIA_NETWORKS.TESTNET]?.gameLogger;
      
      if (!gameLoggerAddress) {
        throw new Error('GameLogger address not found in config. Check NEXT_PUBLIC_SOMNIA_GAME_LOGGER_ADDRESS in .env');
      }
      
      console.log('🔧 Initializing Somnia Streams...');
      console.log('   GameLogger:', gameLoggerAddress);
      
      await somniaStreamsService.initialize(walletClient, gameLoggerAddress);
      
      // Update both ref and state
      isInitializedRef.current = true;
      setIsInitialized(true);
      setError(null);
      
      console.log('✅ Somnia Streams initialized successfully');
      return true;
    } catch (err) {
      console.error('❌ Failed to initialize Somnia Streams:', err);
      setError(err);
      isInitializedRef.current = false;
      setIsInitialized(false);
      return false;
    } finally {
      isConnectingRef.current = false;
    }
  }, [walletClient]);

  /**
   * Subscribe to game result events
   */
  const subscribe = useCallback(async () => {
    // Check both ref and service state for SDK initialization
    if (!isInitializedRef.current || somniaStreamsService.sdk === null) {
      console.warn('⚠️ Cannot subscribe: SDK not initialized yet. Waiting...');
      return false;
    }

    if (isConnected) {
      console.warn('⚠️ Already subscribed');
      return true;
    }

    if (!onGameResult) {
      console.warn('⚠️ Cannot subscribe: No onGameResult callback provided');
      return false;
    }

    try {
      console.log('📡 Subscribing to game results...');
      
      const subscription = await somniaStreamsService.subscribeToGameResults(
        onGameResult,
        (err) => {
          setError(err);
          setIsConnected(false);
          if (onError) {
            onError(err);
          }
        }
      );

      subscriptionRef.current = subscription;
      setSubscriptionId(subscription.subscriptionId);
      setIsConnected(true);
      setError(null);

      console.log('✅ Subscribed to game results');
      return true;
    } catch (err) {
      console.error('❌ Failed to subscribe:', err);
      setError(err);
      setIsConnected(false);
      return false;
    }
  }, [isConnected, onGameResult, onError]);

  /**
   * Unsubscribe from events
   */
  const unsubscribe = useCallback(async () => {
    if (!isConnected) {
      return;
    }

    try {
      console.log('🔌 Unsubscribing from game results...');
      
      await somniaStreamsService.unsubscribe();
      
      subscriptionRef.current = null;
      setSubscriptionId(null);
      setIsConnected(false);
      
      console.log('✅ Unsubscribed from game results');
    } catch (err) {
      console.error('❌ Failed to unsubscribe:', err);
      setError(err);
    }
  }, [isConnected]);

  /**
   * Manually trigger reconnection
   */
  const reconnect = useCallback(async () => {
    try {
      console.log('🔄 Manually reconnecting...');
      
      await somniaStreamsService.reconnect();
      
      const newSubscriptionId = somniaStreamsService.getSubscriptionId();
      setSubscriptionId(newSubscriptionId);
      setIsConnected(true);
      setError(null);
      
      console.log('✅ Reconnected successfully');
    } catch (err) {
      console.error('❌ Failed to reconnect:', err);
      setError(err);
      setIsConnected(false);
    }
  }, []);

  /**
   * Update reconnection status periodically
   */
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      const status = somniaStreamsService.getReconnectionStatus();
      setReconnectionStatus(status);
    }, 1000);

    return () => clearInterval(interval);
  }, [isConnected]);

  /**
   * Auto-connect on mount if enabled
   */
  useEffect(() => {
    let mounted = true;
    let retryTimeout = null;
    
    const initAndSubscribe = async () => {
      if (!autoConnect || !onGameResult) {
        console.log('⏭️ Skipping auto-connect: autoConnect=', autoConnect, ', onGameResult=', !!onGameResult);
        return;
      }
      
      // Skip if already connecting
      if (isConnectingRef.current) {
        console.log('⏭️ Already connecting, skipping...');
        return;
      }
      
      try {
        // Check BOTH ref AND actual service state (handles Fast Refresh)
        const sdkActuallyReady = somniaStreamsService.sdk !== null;
        
        // Initialize if not actually initialized (service check is source of truth)
        if (!sdkActuallyReady) {
          console.log('🔄 Starting initialization...');
          // Reset ref if service was reloaded
          isInitializedRef.current = false;
          
          const success = await initialize();
          
          if (!success) {
            console.warn('⚠️ Initialization failed, will retry in 3 seconds...');
            if (mounted) {
              retryTimeout = setTimeout(() => {
                if (mounted) initAndSubscribe();
              }, 3000);
            }
            return;
          }
          
          if (!mounted) {
            console.log('⏭️ Component unmounted during initialization');
            return;
          }
        } else {
          // Service already initialized (maybe from another component)
          isInitializedRef.current = true;
          if (!isInitialized) {
            setIsInitialized(true);
          }
        }
        
        // Subscribe after initialization is confirmed
        if (somniaStreamsService.sdk !== null && !isConnected && mounted) {
          console.log('🔄 Starting subscription...');
          const subscribed = await subscribe();
          
          if (!subscribed && mounted) {
            console.warn('⚠️ Subscription failed, will retry in 3 seconds...');
            retryTimeout = setTimeout(() => {
              if (mounted) initAndSubscribe();
            }, 3000);
          }
        }
      } catch (err) {
        console.error('❌ Failed to initialize game notifications:', err);
        if (mounted) {
          retryTimeout = setTimeout(() => {
            if (mounted) initAndSubscribe();
          }, 3000);
        }
      }
    };
    
    initAndSubscribe();
    
    return () => {
      mounted = false;
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, [autoConnect, onGameResult, initialize, subscribe, isConnected, isInitialized]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (isConnected) {
        unsubscribe();
      }
    };
  }, [isConnected, unsubscribe]);

  return {
    // State
    isInitialized,
    isConnected,
    subscriptionId,
    error,
    reconnectionStatus,

    // Actions
    initialize,
    subscribe,
    unsubscribe,
    reconnect
  };
}

export default useSomniaStreams;

