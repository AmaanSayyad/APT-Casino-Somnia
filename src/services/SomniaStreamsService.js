/**
 * Somnia Data Streams Service
 * 
 * Handles WebSocket subscriptions to Somnia Data Streams for real-time
 * game result notifications across all connected clients.
 * 
 * Requirements: 5.2, 5.6
 */

import { createPublicClient, webSocket, decodeEventLog } from 'viem';
import { SDK } from '../../somnia-streams/dist/index.js';
import somniaTestnetConfig from '../config/somniaTestnetConfig.js';
import {
  SOMNIA_STREAMS_EVENT_SCHEMAS,
  GAME_RESULT_EVENT_SCHEMA,
  GAME_TYPE_NAMES,
  STREAMS_SUBSCRIPTION_CONFIG
} from '../config/somniaStreams.js';
import { fallbackStreamsService } from './SomniaStreamsService.fallback.js';

/**
 * SomniaStreamsService Class
 * 
 * Manages WebSocket subscriptions to GameResultLogged events on Somnia Testnet
 * and provides automatic reconnection logic.
 */
export class SomniaStreamsService {
  constructor() {
    this.sdk = null;
    this.subscription = null;
    this.subscriptionId = null;
    this.isConnected = false;
    this.isInitializing = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = STREAMS_SUBSCRIPTION_CONFIG.reconnect.maxAttempts;
    this.reconnectDelay = STREAMS_SUBSCRIPTION_CONFIG.reconnect.delayMs;
    this.backoffMultiplier = STREAMS_SUBSCRIPTION_CONFIG.reconnect.backoffMultiplier;
    this.reconnectEnabled = STREAMS_SUBSCRIPTION_CONFIG.reconnect.enabled;
    this.reconnectTimeout = null;
    this.eventCallbacks = [];
    this.errorCallbacks = [];
    this.useFallback = false;
    this.gameLoggerAddress = null;
    
    console.log('🔧 SomniaStreamsService constructed');
  }

  /**
   * Check if SDK is initialized
   * @returns {boolean}
   */
  isReady() {
    return this.sdk !== null && !this.isInitializing;
  }

  /**
   * Initialize the Somnia Streams SDK with WebSocket transport
   * @param {Object} walletClient - Optional wallet client for authenticated operations
   * @returns {Promise<void>}
   */
  async initialize(walletClient = null, gameLoggerAddress = null) {
    // Prevent concurrent initialization
    if (this.isInitializing) {
      console.log('⚠️ Already initializing, waiting...');
      // Wait for current initialization to complete
      while (this.isInitializing) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return;
    }

    // Skip if already initialized
    if (this.sdk !== null) {
      console.log('✅ SDK already initialized');
      return;
    }

    try {
      this.isInitializing = true;
      console.log('🔧 Initializing Somnia Streams SDK...');
      console.log(`   WebSocket URL: ${somniaTestnetConfig.rpcUrls.default.webSocket[0]}`);
      
      this.gameLoggerAddress = gameLoggerAddress;
      
      // Try WebSocket first
      try {
        // Create public client with WebSocket transport for subscriptions
        const publicClient = createPublicClient({
          chain: somniaTestnetConfig,
          transport: webSocket(somniaTestnetConfig.rpcUrls.default.webSocket[0], {
            timeout: 5000, // 5 second timeout
            retryCount: 0, // Don't retry, fail fast
            retryDelay: 0
          })
        });

        // Test the WebSocket connection with timeout
        const connectionPromise = publicClient.getChainId();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('WebSocket connection timeout')), 5000)
        );
        
        const chainId = await Promise.race([connectionPromise, timeoutPromise]);
        console.log(`✅ WebSocket connection established (Chain ID: ${chainId})`);

        // Initialize SDK
        const clientConfig = {
          public: publicClient
        };

        if (walletClient) {
          clientConfig.wallet = walletClient;
        }

        this.sdk = new SDK(clientConfig);
        this.useFallback = false;
        
        console.log('✅ Somnia Streams SDK initialized with WebSocket transport');
      } catch (wsError) {
        // Suppress WebSocket errors in console (expected behavior)
        console.info('ℹ️ WebSocket not available, using HTTP polling mode');
        
        // Initialize fallback service
        if (!gameLoggerAddress) {
          console.error('❌ GameLogger address is required for fallback mode');
          console.error('   Please provide gameLoggerAddress parameter to initialize()');
          throw new Error('GameLogger address required for fallback mode. Check NEXT_PUBLIC_SOMNIA_GAME_LOGGER_ADDRESS in .env');
        }
        
        await fallbackStreamsService.initialize(gameLoggerAddress);
        this.useFallback = true;
        this.sdk = { _fallback: true }; // Dummy SDK object to pass initialization check
        
        console.log('✅ HTTP Polling Mode initialized');
        console.log(`   Polling interval: 5 seconds`);
        console.log(`   GameLogger: ${gameLoggerAddress.slice(0, 10)}...${gameLoggerAddress.slice(-8)}`);
      }
      
      this.isInitializing = false;
    } catch (error) {
      this.isInitializing = false;
      console.error('❌ Failed to initialize Somnia Streams:', error);
      throw new Error(`Initialization failed: ${error.message}`);
    }
  }

  /**
   * Subscribe to GameResultLogged events
   * @param {Function} onGameResult - Callback function for game result events
   * @param {Function} onError - Optional error callback
   * @returns {Promise<Object>} Subscription object with unsubscribe function
   */
  async subscribeToGameResults(onGameResult, onError = null) {
    try {
      if (!this.sdk) {
        throw new Error('SDK not initialized. Call initialize() first.');
      }

      // Add callbacks to arrays for reconnection
      if (onGameResult && !this.eventCallbacks.includes(onGameResult)) {
        this.eventCallbacks.push(onGameResult);
      }
      
      if (onError && !this.errorCallbacks.includes(onError)) {
        this.errorCallbacks.push(onError);
      }

      // Use fallback if WebSocket is not available
      if (this.useFallback) {
        await fallbackStreamsService.startPolling(onGameResult, onError, 5000);
        
        this.isConnected = true;
        this.subscriptionId = 'http-polling';
        
        console.log('✅ Subscribed to game events (HTTP polling)');
        
        return {
          subscriptionId: this.subscriptionId,
          unsubscribe: () => this.unsubscribe()
        };
      }

      // Subscribe to the event via WebSocket
      const subscription = await this.sdk.streams.subscribe({
        somniaStreamsEventId: SOMNIA_STREAMS_EVENT_SCHEMAS.GAME_RESULT_LOGGED,
        ethCalls: [], // No additional ETH calls needed
        context: '', // No context needed
        onlyPushChanges: STREAMS_SUBSCRIPTION_CONFIG.onlyPushChanges,
        onData: (data) => {
          this.handleEventData(data);
        },
        onError: (error) => {
          this.handleSubscriptionError(error);
        }
      });

      if (!subscription) {
        throw new Error('Failed to create subscription - SDK returned undefined. This usually means the WebSocket transport is not properly configured or the schema ID is invalid. Check browser console for SDK errors.');
      }

      this.subscription = subscription;
      this.subscriptionId = subscription.subscriptionId;
      this.isConnected = true;
      this.reconnectAttempts = 0; // Reset reconnect attempts on successful connection

      console.log('✅ Successfully subscribed to GameResultLogged events:', {
        subscriptionId: this.subscriptionId,
        eventSchema: SOMNIA_STREAMS_EVENT_SCHEMAS.GAME_RESULT_LOGGED
      });

      return {
        subscriptionId: this.subscriptionId,
        unsubscribe: () => this.unsubscribe()
      };

    } catch (error) {
      console.error('❌ Failed to subscribe to game results:', error);
      
      // Attempt reconnection if enabled
      if (this.reconnectEnabled && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.scheduleReconnect();
      }
      
      throw new Error(`Subscription failed: ${error.message}`);
    }
  }

  /**
   * Handle incoming event data from subscription
   * @param {Object} data - Raw event data from subscription
   * @private
   */
  handleEventData(data) {
    try {
      const { result } = data;
      
      if (!result) {
        console.warn('⚠️ Received event data without result');
        return;
      }

      const { topics, data: eventData } = result;

      // Parse the event using viem's decodeEventLog
      const parsedEvent = this.parseGameResultEvent(topics, eventData);

      if (!parsedEvent) {
        console.warn('⚠️ Failed to parse event data');
        return;
      }

      // Validate parsed event
      if (!this.validateEventData(parsedEvent)) {
        console.warn('⚠️ Invalid event data received:', parsedEvent);
        return;
      }

      console.log('📬 Game result event received:', {
        player: parsedEvent.player,
        gameType: parsedEvent.gameType,
        betAmount: parsedEvent.betAmount,
        payout: parsedEvent.payout
      });

      // Notify all registered callbacks
      this.eventCallbacks.forEach(callback => {
        try {
          callback(parsedEvent);
        } catch (error) {
          console.error('❌ Error in event callback:', error);
        }
      });

    } catch (error) {
      console.error('❌ Error handling event data:', error);
    }
  }

  /**
   * Parse GameResultLogged event data
   * @param {Array} topics - Event topics
   * @param {string} data - Event data
   * @returns {Object|null} Parsed event data
   * @private
   */
  parseGameResultEvent(topics, data) {
    try {
      // Create ABI for decoding
      const eventAbi = [{
        type: 'event',
        name: 'GameResultLogged',
        inputs: GAME_RESULT_EVENT_SCHEMA.params.map(p => ({
          name: p.name,
          type: p.paramType,
          indexed: p.isIndexed
        }))
      }];

      // Decode the event log
      const decoded = decodeEventLog({
        abi: eventAbi,
        topics,
        data
      });

      // Convert gameType from uint8 to string name
      const gameTypeNum = Number(decoded.args.gameType);
      const gameTypeName = GAME_TYPE_NAMES[gameTypeNum] || `UNKNOWN_${gameTypeNum}`;

      // Extract and format the event arguments
      return {
        logId: decoded.args.logId,
        player: decoded.args.player,
        gameType: gameTypeName,
        betAmount: decoded.args.betAmount.toString(),
        payout: decoded.args.payout.toString(),
        entropyRequestId: decoded.args.entropyRequestId,
        entropyTxHash: decoded.args.entropyTxHash,
        timestamp: Number(decoded.args.timestamp)
      };

    } catch (error) {
      console.error('❌ Failed to parse event:', error);
      return null;
    }
  }

  /**
   * Validate event data structure
   * @param {Object} eventData - Parsed event data
   * @returns {boolean} True if valid
   * @private
   */
  validateEventData(eventData) {
    if (!eventData) return false;

    const requiredFields = ['player', 'gameType', 'betAmount', 'payout', 'timestamp'];
    
    for (const field of requiredFields) {
      if (eventData[field] === undefined || eventData[field] === null) {
        console.warn(`⚠️ Missing required field: ${field}`);
        return false;
      }
    }

    // Validate player address format (basic check)
    if (typeof eventData.player !== 'string' || !eventData.player.startsWith('0x')) {
      console.warn('⚠️ Invalid player address format');
      return false;
    }

    // Validate numeric fields
    if (isNaN(Number(eventData.betAmount)) || isNaN(Number(eventData.payout))) {
      console.warn('⚠️ Invalid numeric values in event data');
      return false;
    }

    return true;
  }

  /**
   * Handle subscription errors
   * @param {Error} error - Error object
   * @private
   */
  handleSubscriptionError(error) {
    console.error('❌ Subscription error:', error);

    this.isConnected = false;

    // Notify error callbacks
    this.errorCallbacks.forEach(callback => {
      try {
        callback(error);
      } catch (err) {
        console.error('❌ Error in error callback:', err);
      }
    });

    // Attempt reconnection if enabled
    if (this.reconnectEnabled && this.reconnectAttempts < this.maxReconnectAttempts) {
      this.scheduleReconnect();
    } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached. Giving up.');
    }
  }

  /**
   * Schedule automatic reconnection with exponential backoff
   * @private
   */
  scheduleReconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectAttempts++;
    
    // Calculate delay with exponential backoff
    const delay = this.reconnectDelay * Math.pow(this.backoffMultiplier, this.reconnectAttempts - 1);

    console.log(`🔄 Scheduling reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);

    this.reconnectTimeout = setTimeout(async () => {
      try {
        console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
        
        // Re-subscribe with existing callbacks
        if (this.eventCallbacks.length > 0) {
          await this.subscribeToGameResults(this.eventCallbacks[0]);
        }
      } catch (error) {
        console.error('❌ Reconnection attempt failed:', error);
      }
    }, delay);
  }

  /**
   * Unsubscribe from events and clean up
   * @returns {Promise<void>}
   */
  async unsubscribe() {
    try {
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
      }

      if (this.useFallback) {
        fallbackStreamsService.stopPolling();
      } else if (this.subscription && this.subscription.unsubscribe) {
        await this.subscription.unsubscribe();
      }

      this.subscription = null;
      this.subscriptionId = null;
      this.isConnected = false;
      this.reconnectAttempts = 0;

    } catch (error) {
      console.error('❌ Error during unsubscribe:', error);
      throw error;
    }
  }

  /**
   * Check if currently connected
   * @returns {boolean} Connection status
   */
  isSubscribed() {
    return this.isConnected && this.subscription !== null;
  }

  /**
   * Get current subscription ID
   * @returns {string|null} Subscription ID
   */
  getSubscriptionId() {
    return this.subscriptionId;
  }

  /**
   * Get reconnection status
   * @returns {Object} Reconnection status
   */
  getReconnectionStatus() {
    return {
      enabled: this.reconnectEnabled,
      attempts: this.reconnectAttempts,
      maxAttempts: this.maxReconnectAttempts,
      isReconnecting: this.reconnectTimeout !== null
    };
  }

  /**
   * Manually trigger reconnection
   * @returns {Promise<void>}
   */
  async reconnect() {
    console.log('🔄 Manual reconnection triggered');
    
    // Clear any pending reconnection
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    // Reset attempts for manual reconnection
    this.reconnectAttempts = 0;

    // Unsubscribe first
    await this.unsubscribe();

    // Re-subscribe with existing callbacks
    if (this.eventCallbacks.length > 0) {
      await this.subscribeToGameResults(this.eventCallbacks[0]);
    } else {
      throw new Error('No event callbacks registered. Cannot reconnect.');
    }
  }

  /**
   * Clear all callbacks
   */
  clearCallbacks() {
    this.eventCallbacks = [];
    this.errorCallbacks = [];
  }
}

// Export singleton instance
export const somniaStreamsService = new SomniaStreamsService();
export default SomniaStreamsService;

