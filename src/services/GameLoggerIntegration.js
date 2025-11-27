import { somniaGameLogger } from './SomniaGameLogger';
import { ethers } from 'ethers';

/**
 * Game Logger Integration Helper
 * Provides easy integration with game completion handlers
 */

/**
 * Log game result after game completion
 * Uses backend API with Treasury wallet for authorization
 * @param {Object} params - Game logging parameters
 * @returns {Promise<string|null>} Transaction hash or null if logging fails
 */
export async function logGameToSomnia({
  gameType,
  playerAddress,
  betAmount,
  result,
  payout,
  entropyProof,
  provider,
  signer
}) {
  try {
    // Validate required parameters
    if (!gameType || !playerAddress || betAmount === undefined || !result || payout === undefined) {
      console.warn('⚠️ Missing required parameters for game logging');
      return null;
    }

    console.log('📝 Logging game via backend API...');

    // Call backend API to log game with Treasury wallet
    const response = await fetch('/api/log-game', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        gameType,
        playerAddress,
        betAmount: betAmount.toString(),
        result,
        payout: payout.toString(),
        entropyProof: entropyProof || {
          requestId: ethers.ZeroHash,
          transactionHash: ''
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to log game');
    }

    const data = await response.json();

    console.log('✅ Game logged to Somnia:', {
      gameType,
      txHash: data.txHash,
      explorerUrl: data.explorerUrl
    });

    return data.txHash;

  } catch (error) {
    console.error('❌ Failed to log game to Somnia:', error);
    // Don't throw - logging failure shouldn't break the game
    return null;
  }
}

/**
 * Get player's game history from Somnia
 * @param {string} playerAddress - Player's address
 * @param {number} limit - Maximum number of games to fetch
 * @param {Object} provider - Ethers provider
 * @returns {Promise<Array>} Game history
 */
export async function getPlayerGameHistory(playerAddress, limit = 50, provider = null) {
  try {
    if (!playerAddress) {
      throw new Error('Player address is required');
    }

    // Initialize logger with provider if provided
    if (provider) {
      somniaGameLogger.setProviderAndSigner(provider, null);
    }

    const history = await somniaGameLogger.getGameHistory(playerAddress, limit);
    
    return history;

  } catch (error) {
    console.error('❌ Failed to get game history:', error);
    return [];
  }
}

/**
 * Get player's total game count
 * @param {string} playerAddress - Player's address
 * @param {Object} provider - Ethers provider
 * @returns {Promise<number>} Total games played
 */
export async function getPlayerGameCount(playerAddress, provider = null) {
  try {
    if (!playerAddress) {
      throw new Error('Player address is required');
    }

    // Initialize logger with provider if provided
    if (provider) {
      somniaGameLogger.setProviderAndSigner(provider, null);
    }

    const count = await somniaGameLogger.getPlayerGameCount(playerAddress);
    
    return count;

  } catch (error) {
    console.error('❌ Failed to get game count:', error);
    return 0;
  }
}

/**
 * Get contract statistics
 * @param {Object} provider - Ethers provider
 * @returns {Promise<Object>} Contract statistics
 */
export async function getGameLoggerStats(provider = null) {
  try {
    // Initialize logger with provider if provided
    if (provider) {
      somniaGameLogger.setProviderAndSigner(provider, null);
    }

    const stats = await somniaGameLogger.getStats();
    
    return stats;

  } catch (error) {
    console.error('❌ Failed to get stats:', error);
    return {
      totalGames: 0,
      totalBets: '0',
      totalPayouts: '0',
      gameTypeCounts: {
        roulette: 0,
        mines: 0,
        wheel: 0,
        plinko: 0
      }
    };
  }
}

/**
 * Subscribe to game result events
 * @param {Function} callback - Callback function for events
 * @param {Object} provider - Ethers provider
 * @returns {Function} Unsubscribe function
 */
export function subscribeToGameResults(callback, provider = null) {
  try {
    // Initialize logger with provider if provided
    if (provider) {
      somniaGameLogger.setProviderAndSigner(provider, null);
    }

    return somniaGameLogger.onGameResultLogged(callback);

  } catch (error) {
    console.error('❌ Failed to subscribe to game results:', error);
    return () => {}; // Return no-op unsubscribe function
  }
}

/**
 * Get transaction explorer URL
 * @param {string} txHash - Transaction hash
 * @returns {string} Explorer URL
 */
export function getTransactionExplorerUrl(txHash) {
  return somniaGameLogger.getTransactionUrl(txHash);
}

export default {
  logGameToSomnia,
  getPlayerGameHistory,
  getPlayerGameCount,
  getGameLoggerStats,
  subscribeToGameResults,
  getTransactionExplorerUrl
};

