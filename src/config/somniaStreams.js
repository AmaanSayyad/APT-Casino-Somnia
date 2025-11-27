/**
 * Somnia Data Streams Configuration
 * 
 * This file contains configuration for Somnia Data Streams integration,
 * including event schema IDs and subscription settings.
 */

// Event Schema IDs
export const SOMNIA_STREAMS_EVENT_SCHEMAS = {
  GAME_RESULT_LOGGED: 'apt-casino-game-result-logged',
};

// Somnia Streams Protocol Address (from somnia-streams SDK)
export const SOMNIA_STREAMS_PROTOCOL_ADDRESS = '0x6AB397FF662e42312c003175DCD76EfF69D048Fc';

// Event Schema Definitions - MUST match the actual contract event signature!
export const GAME_RESULT_EVENT_SCHEMA = {
  params: [
    {
      name: 'logId',
      paramType: 'bytes32',
      isIndexed: true
    },
    {
      name: 'player',
      paramType: 'address',
      isIndexed: true
    },
    {
      name: 'gameType',
      paramType: 'uint8',
      isIndexed: false
    },
    {
      name: 'betAmount',
      paramType: 'uint256',
      isIndexed: false
    },
    {
      name: 'payout',
      paramType: 'uint256',
      isIndexed: false
    },
    {
      name: 'entropyRequestId',
      paramType: 'bytes32',
      isIndexed: false
    },
    {
      name: 'entropyTxHash',
      paramType: 'string',
      isIndexed: false
    },
    {
      name: 'timestamp',
      paramType: 'uint256',
      isIndexed: false
    }
  ],
  eventTopic: 'GameResultLogged(bytes32,address,uint8,uint256,uint256,bytes32,string,uint256)'
};

// Game type enum mapping (uint8 values from contract)
export const GAME_TYPE_NAMES = {
  0: 'ROULETTE',
  1: 'MINES',
  2: 'WHEEL',
  3: 'PLINKO'
};

// Subscription Configuration
export const STREAMS_SUBSCRIPTION_CONFIG = {
  // Whether to only push changes (vs all events)
  onlyPushChanges: false,
  
  // Reconnection settings
  reconnect: {
    enabled: true,
    maxAttempts: 5,
    delayMs: 3000,
    backoffMultiplier: 1.5
  },
  
  // Notification settings
  notification: {
    maxQueueSize: 50,
    displayDurationMs: 5000,
    maxConcurrent: 3
  }
};

// Export default configuration
export default {
  SOMNIA_STREAMS_EVENT_SCHEMAS,
  SOMNIA_STREAMS_PROTOCOL_ADDRESS,
  GAME_RESULT_EVENT_SCHEMA,
  STREAMS_SUBSCRIPTION_CONFIG
};

