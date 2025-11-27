/**
 * Fallback Somnia Streams Service
 * 
 * This service provides a fallback mechanism when WebSocket connections are not available.
 * It uses HTTP polling as an alternative to real-time WebSocket subscriptions.
 * 
 * Note: This is a temporary solution until WebSocket support is fully available on Somnia Testnet.
 */

import { createPublicClient, http, decodeEventLog } from 'viem';
import somniaTestnetConfig from '../config/somniaTestnetConfig.js';
import {
  GAME_RESULT_EVENT_SCHEMA,
  STREAMS_SUBSCRIPTION_CONFIG
} from '../config/somniaStreams.js';

/**
 * Fallback Streams Service using HTTP Polling
 */
export class FallbackStreamsService {
  constructor() {
    this.publicClient = null;
    this.isPolling = false;
    this.pollingInterval = null;
    this.lastProcessedBlock = null;
    this.eventCallbacks = [];
    this.errorCallbacks = [];
    this.gameLoggerAddress = null;
    
    console.log('🔧 FallbackStreamsService initialized (HTTP Polling Mode)');
  }

  /**
   * Initialize the service with HTTP transport
   */
  async initialize(gameLoggerAddress) {
    try {
      console.log('🔧 Initializing Fallback Streams Service...');
      
      this.publicClient = createPublicClient({
        chain: somniaTestnetConfig,
        transport: http(somniaTestnetConfig.rpcUrls.default.http[0])
      });

      this.gameLoggerAddress = gameLoggerAddress;
      
      // Get current block number
      this.lastProcessedBlock = await this.publicClient.getBlockNumber();
      
      console.log('✅ Fallback Streams Service initialized');
      console.log(`   Starting from block: ${this.lastProcessedBlock}`);
      
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Fallback Streams Service:', error);
      throw error;
    }
  }

  /**
   * Start polling for events
   */
  async startPolling(onGameResult, onError = null, intervalMs = 5000) {
    if (this.isPolling) {
      console.warn('⚠️ Already polling');
      return;
    }

    if (!this.publicClient) {
      throw new Error('Service not initialized. Call initialize() first.');
    }

    // Add callbacks
    if (onGameResult && !this.eventCallbacks.includes(onGameResult)) {
      this.eventCallbacks.push(onGameResult);
    }
    
    if (onError && !this.errorCallbacks.includes(onError)) {
      this.errorCallbacks.push(onError);
    }

    this.isPolling = true;
    console.log(`📡 Starting event polling (interval: ${intervalMs}ms)...`);

    // Start polling
    this.pollingInterval = setInterval(async () => {
      try {
        await this.pollForEvents();
      } catch (error) {
        console.error('❌ Polling error:', error);
        this.errorCallbacks.forEach(callback => {
          try {
            callback(error);
          } catch (err) {
            console.error('❌ Error in error callback:', err);
          }
        });
      }
    }, intervalMs);

    // Do initial poll
    await this.pollForEvents();
  }

  /**
   * Poll for new events
   */
  async pollForEvents() {
    try {
      const currentBlock = await this.publicClient.getBlockNumber();
      
      if (currentBlock <= this.lastProcessedBlock) {
        return; // No new blocks
      }

      // Get logs from last processed block to current block
      const logs = await this.publicClient.getLogs({
        address: this.gameLoggerAddress,
        event: {
          type: 'event',
          name: 'GameResultLogged',
          inputs: GAME_RESULT_EVENT_SCHEMA.params.map(p => ({
            name: p.name,
            type: p.paramType,
            indexed: p.isIndexed
          }))
        },
        fromBlock: this.lastProcessedBlock + 1n,
        toBlock: currentBlock
      });

      // Process each log
      for (const log of logs) {
        try {
          const parsedEvent = {
            player: log.args.player,
            gameType: log.args.gameType,
            betAmount: log.args.betAmount.toString(),
            payout: log.args.payout.toString(),
            entropyRequestId: log.args.entropyRequestId,
            timestamp: Number(log.args.timestamp)
          };

          console.log('📬 Game result event (polling):', parsedEvent);

          // Notify callbacks
          this.eventCallbacks.forEach(callback => {
            try {
              callback(parsedEvent);
            } catch (error) {
              console.error('❌ Error in event callback:', error);
            }
          });
        } catch (error) {
          console.error('❌ Error processing log:', error);
        }
      }

      this.lastProcessedBlock = currentBlock;
    } catch (error) {
      console.error('❌ Error polling for events:', error);
      throw error;
    }
  }

  /**
   * Stop polling
   */
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    this.isPolling = false;
    console.log('🔌 Stopped event polling');
  }

  /**
   * Check if currently polling
   */
  isActive() {
    return this.isPolling;
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
export const fallbackStreamsService = new FallbackStreamsService();
export default FallbackStreamsService;
