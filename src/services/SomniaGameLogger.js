import { ethers } from 'ethers';
import { SOMNIA_CONTRACTS, SOMNIA_NETWORKS, SOMNIA_EXPLORER_URLS } from '../config/contracts';
import somniaTestnetConfig from '../config/somniaTestnetConfig';

// Game Logger Contract ABI (minimal interface)
const GAME_LOGGER_ABI = [
  // Events
  'event GameResultLogged(bytes32 indexed logId, address indexed player, uint8 gameType, uint256 betAmount, uint256 payout, bytes32 entropyRequestId, string entropyTxHash, uint256 timestamp)',
  
  // Functions
  'function logGameResult(uint8 gameType, uint256 betAmount, bytes memory resultData, uint256 payout, bytes32 entropyRequestId, string memory entropyTxHash) external returns (bytes32 logId)',
  'function getGameLog(bytes32 logId) external view returns (tuple(bytes32 logId, address player, uint8 gameType, uint256 betAmount, bytes resultData, uint256 payout, bytes32 entropyRequestId, string entropyTxHash, uint256 timestamp, uint256 blockNumber))',
  'function getPlayerHistory(address player, uint256 limit) external view returns (bytes32[] memory)',
  'function getPlayerGameCount(address player) external view returns (uint256)',
  'function getTotalLogs() external view returns (uint256)',
  'function getStats() external view returns (uint256 totalGames, uint256 totalBets, uint256 totalPayouts, uint256 rouletteCount, uint256 minesCount, uint256 wheelCount, uint256 plinkoCount)',
  'function addAuthorizedLogger(address logger) external',
  'function isAuthorizedLogger(address logger) external view returns (bool)'
];

// Game type enum mapping
const GAME_TYPES = {
  ROULETTE: 0,
  MINES: 1,
  WHEEL: 2,
  PLINKO: 3
};

/**
 * Somnia Game Logger Service
 * Handles logging game results to Somnia Testnet blockchain
 */
export class SomniaGameLogger {
  constructor(provider = null, signer = null) {
    this.provider = provider;
    this.signer = signer;
    this.contract = null;
    this.network = SOMNIA_NETWORKS.TESTNET;
    this.contractAddress = SOMNIA_CONTRACTS[this.network].gameLogger;
    this.explorerUrl = SOMNIA_EXPLORER_URLS[this.network];
    
    if (this.provider && this.contractAddress) {
      this.initializeContract();
    }
  }

  /**
   * Initialize the contract instance
   */
  initializeContract() {
    try {
      if (!this.contractAddress || this.contractAddress === '0x0000000000000000000000000000000000000000') {
        throw new Error('Game Logger contract address not configured');
      }

      const signerOrProvider = this.signer || this.provider;
      this.contract = new ethers.Contract(
        this.contractAddress,
        GAME_LOGGER_ABI,
        signerOrProvider
      );

      console.log('✅ Somnia Game Logger initialized:', this.contractAddress);
    } catch (error) {
      console.error('❌ Failed to initialize Game Logger contract:', error);
      throw error;
    }
  }

  /**
   * Set provider and signer
   * @param {ethers.Provider} provider - Ethers provider
   * @param {ethers.Signer} signer - Ethers signer
   */
  setProviderAndSigner(provider, signer) {
    this.provider = provider;
    this.signer = signer;
    this.initializeContract();
  }

  /**
   * Log a game result to Somnia Testnet
   * @param {Object} gameData - Game result data
   * @returns {Promise<string>} Transaction hash
   */
  async logGameResult(gameData) {
    try {
      if (!this.contract) {
        throw new Error('Game Logger contract not initialized');
      }

      if (!this.signer) {
        throw new Error('Signer required to log game results');
      }

      const {
        gameType,
        playerAddress,
        betAmount,
        result,
        payout,
        entropyProof
      } = gameData;

      // Validate required fields
      this.validateGameData(gameData);

      // Convert game type to enum value
      const gameTypeEnum = GAME_TYPES[gameType.toUpperCase()];
      if (gameTypeEnum === undefined) {
        throw new Error(`Invalid game type: ${gameType}`);
      }

      // Encode result data
      const resultData = this.encodeResultData(result);

      // Convert amounts to wei
      const betAmountWei = ethers.parseEther(betAmount.toString());
      const payoutWei = ethers.parseEther(payout.toString());

      // Prepare entropy proof
      const entropyRequestId = entropyProof?.requestId || ethers.ZeroHash;
      const entropyTxHash = entropyProof?.transactionHash || '';

      console.log('📝 Logging game result to Somnia:', {
        gameType,
        betAmount: betAmountWei.toString(),
        payout: payoutWei.toString(),
        entropyRequestId,
        entropyTxHash
      });

      // Call contract function
      const tx = await this.contract.logGameResult(
        gameTypeEnum,
        betAmountWei,
        resultData,
        payoutWei,
        entropyRequestId,
        entropyTxHash
      );

      console.log('⏳ Transaction submitted:', tx.hash);

      // Wait for confirmation
      const receipt = await tx.wait();

      console.log('✅ Game result logged on Somnia:', {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      });

      return receipt.hash;

    } catch (error) {
      console.error('❌ Failed to log game result:', error);
      throw new Error(`Game logging failed: ${error.message}`);
    }
  }

  /**
   * Get game log by ID
   * @param {string} logId - Log identifier (bytes32)
   * @returns {Promise<Object>} Game log details
   */
  async getGameLog(logId) {
    try {
      if (!this.contract) {
        throw new Error('Game Logger contract not initialized');
      }

      const log = await this.contract.getGameLog(logId);

      return {
        logId: log.logId,
        player: log.player,
        gameType: this.getGameTypeName(log.gameType),
        betAmount: ethers.formatEther(log.betAmount),
        resultData: log.resultData,
        payout: ethers.formatEther(log.payout),
        entropyRequestId: log.entropyRequestId,
        entropyTxHash: log.entropyTxHash,
        timestamp: Number(log.timestamp),
        blockNumber: Number(log.blockNumber),
        explorerUrl: `${this.explorerUrl}/tx/${log.logId}`
      };

    } catch (error) {
      console.error('❌ Failed to get game log:', error);
      throw error;
    }
  }

  /**
   * Get player's game history from blockchain
   * @param {string} playerAddress - Player's address
   * @param {number} limit - Maximum number of logs to return (0 for all)
   * @returns {Promise<Array>} Array of game logs
   */
  async getGameHistory(playerAddress, limit = 50) {
    try {
      if (!this.contract) {
        throw new Error('Game Logger contract not initialized');
      }

      // Get log IDs for player
      const logIds = await this.contract.getPlayerHistory(playerAddress, limit);

      if (logIds.length === 0) {
        return [];
      }

      // Fetch details for each log
      const logs = await Promise.all(
        logIds.map(async (logId) => {
          try {
            return await this.getGameLog(logId);
          } catch (error) {
            console.error(`Failed to fetch log ${logId}:`, error);
            return null;
          }
        })
      );

      // Filter out failed fetches and return
      return logs.filter(log => log !== null);

    } catch (error) {
      console.error('❌ Failed to get game history:', error);
      throw error;
    }
  }

  /**
   * Get player's total game count
   * @param {string} playerAddress - Player's address
   * @returns {Promise<number>} Total games played
   */
  async getPlayerGameCount(playerAddress) {
    try {
      if (!this.contract) {
        throw new Error('Game Logger contract not initialized');
      }

      const count = await this.contract.getPlayerGameCount(playerAddress);
      return Number(count);

    } catch (error) {
      console.error('❌ Failed to get player game count:', error);
      throw error;
    }
  }

  /**
   * Get contract statistics
   * @returns {Promise<Object>} Contract statistics
   */
  async getStats() {
    try {
      if (!this.contract) {
        throw new Error('Game Logger contract not initialized');
      }

      const stats = await this.contract.getStats();

      return {
        totalGames: Number(stats.totalGames),
        totalBets: ethers.formatEther(stats.totalBets),
        totalPayouts: ethers.formatEther(stats.totalPayouts),
        gameTypeCounts: {
          roulette: Number(stats.rouletteCount),
          mines: Number(stats.minesCount),
          wheel: Number(stats.wheelCount),
          plinko: Number(stats.plinkoCount)
        }
      };

    } catch (error) {
      console.error('❌ Failed to get stats:', error);
      throw error;
    }
  }

  /**
   * Listen for GameResultLogged events
   * @param {Function} callback - Callback function for events
   * @returns {Function} Unsubscribe function
   */
  onGameResultLogged(callback) {
    try {
      if (!this.contract) {
        throw new Error('Game Logger contract not initialized');
      }

      const filter = this.contract.filters.GameResultLogged();
      
      const listener = (logId, player, gameType, betAmount, payout, entropyRequestId, entropyTxHash, timestamp, event) => {
        callback({
          logId,
          player,
          gameType: this.getGameTypeName(gameType),
          betAmount: ethers.formatEther(betAmount),
          payout: ethers.formatEther(payout),
          entropyRequestId,
          entropyTxHash,
          timestamp: Number(timestamp),
          transactionHash: event.transactionHash,
          blockNumber: event.blockNumber
        });
      };

      this.contract.on(filter, listener);

      // Return unsubscribe function
      return () => {
        this.contract.off(filter, listener);
      };

    } catch (error) {
      console.error('❌ Failed to set up event listener:', error);
      throw error;
    }
  }

  /**
   * Get transaction explorer URL
   * @param {string} txHash - Transaction hash
   * @returns {string} Explorer URL
   */
  getTransactionUrl(txHash) {
    return `${this.explorerUrl}/tx/${txHash}`;
  }

  /**
   * Validate game data
   * @param {Object} gameData - Game data to validate
   */
  validateGameData(gameData) {
    const { gameType, playerAddress, betAmount, result, payout } = gameData;

    if (!gameType) {
      throw new Error('Game type is required');
    }

    if (!playerAddress || !ethers.isAddress(playerAddress)) {
      throw new Error('Valid player address is required');
    }

    if (betAmount === undefined || betAmount === null || betAmount < 0) {
      throw new Error('Valid bet amount is required');
    }

    if (payout === undefined || payout === null || payout < 0) {
      throw new Error('Valid payout amount is required');
    }

    if (!result) {
      throw new Error('Game result is required');
    }
  }

  /**
   * Encode result data for storage
   * @param {Object} result - Game result object
   * @returns {string} Encoded bytes
   */
  encodeResultData(result) {
    try {
      // Convert result to JSON string and encode as bytes
      const jsonString = JSON.stringify(result);
      return ethers.toUtf8Bytes(jsonString);
    } catch (error) {
      console.error('Failed to encode result data:', error);
      return '0x';
    }
  }

  /**
   * Decode result data from storage
   * @param {string} resultData - Encoded bytes
   * @returns {Object} Decoded result object
   */
  decodeResultData(resultData) {
    try {
      if (!resultData || resultData === '0x') {
        return null;
      }
      const jsonString = ethers.toUtf8String(resultData);
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Failed to decode result data:', error);
      return null;
    }
  }

  /**
   * Get game type name from enum value
   * @param {number} gameTypeEnum - Game type enum value
   * @returns {string} Game type name
   */
  getGameTypeName(gameTypeEnum) {
    const names = ['ROULETTE', 'MINES', 'WHEEL', 'PLINKO'];
    return names[gameTypeEnum] || 'UNKNOWN';
  }

  /**
   * Check if address is authorized logger
   * @param {string} address - Address to check
   * @returns {Promise<boolean>} True if authorized
   */
  async isAuthorizedLogger(address) {
    try {
      if (!this.contract) {
        throw new Error('Game Logger contract not initialized');
      }

      return await this.contract.isAuthorizedLogger(address);
    } catch (error) {
      console.error('❌ Failed to check authorization:', error);
      return false;
    }
  }
}

// Export singleton instance (will be initialized when provider is available)
export const somniaGameLogger = new SomniaGameLogger();
export default SomniaGameLogger;
