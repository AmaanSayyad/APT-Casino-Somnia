/**
 * React Hook for Somnia Data Streams
 * 
 * Provides easy integration with SomniaStreamsService for React components
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { somniaStreamsService } from '../services/SomniaStreamsService';
import { useWalletClient } from 'wagmi';

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

  /**
   * Initialize the Somnia Streams SDK
   */
  const initialize = useCallback(async () => {
    if (isInitialized || isConnectingRef.current) {
      return;
    }

    try {
      isConnectingRef.current = true;
      console.log('🔧 Initializing Somnia Streams...');
      
      await somniaStreamsService.initialize(walletClient);
      setIsInitialized(true);
      setError(null);
      
      console.log('✅ Somnia Streams initialized');
    } catch (err) {
      console.error('❌ Failed to initialize Somnia Streams:', err);
      setError(err);
      setIsInitialized(false);
    } finally {
      isConnectingRef.current = false;
    }
  }, [walletClient, isInitialized]);

  /**
   * Subscribe to game result events
   */
  const subscribe = useCallback(async () => {
    if (!isInitialized) {
      console.warn('⚠️ Cannot subscribe: SDK not initialized');
      return;
    }

    if (isConnected) {
      console.warn('⚠️ Already subscribed');
      return;
    }

    if (!onGameResult) {
      console.warn('⚠️ Cannot subscribe: No onGameResult callback provided');
      return;
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
    } catch (err) {
      console.error('❌ Failed to subscribe:', err);
      setError(err);
      setIsConnected(false);
    }
  }, [isInitialized, isConnected, onGameResult, onError]);

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
    if (autoConnect && !isInitialized && !isConnectingRef.current) {
      initialize();
    }
  }, [autoConnect, isInitialized, initialize]);

  /**
   * Auto-subscribe after initialization
   */
  useEffect(() => {
    if (autoConnect && isInitialized && !isConnected && onGameResult) {
      subscribe();
    }
  }, [autoConnect, isInitialized, isConnected, onGameResult, subscribe]);

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
