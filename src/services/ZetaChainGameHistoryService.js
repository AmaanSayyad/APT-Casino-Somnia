import { Pool } from 'pg';
import {
  getZetaChainExplorerUrl,
  getZetaChainTransactionUrl
} from '../config/zetachainConfig.js';

/**
 * ZetaChain Game History Service
 * Handles saving and retrieving ZetaChain-specific game transaction data
 * This service is completely separate from the Somnia history service
 */
export class ZetaChainGameHistoryService {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://postgres:casino123@localhost:5432/casino_vrf',
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    this.isInitialized = false;
    this.explorerUrl = getZetaChainExplorerUrl();
  }

  /**
   * Initialize the service
   */
  async initialize() {
    try {
      // Test database connection
      await this.pool.query('SELECT 1');
      this.isInitialized = true;
      console.log('✅ ZetaChain Game History Service initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize ZetaChain Game History Service:', error);
      throw error;
    }
  }

  /**
   * Save game result with ZetaChain transaction data
   * @param {Object} gameData - Game result data with ZetaChain transaction
   * @returns {Promise<Object>} Saved game result
   */
  async saveGameResult(gameData) {
    this.ensureInitialized();

    try {
      const {
        gameResultId,
        userAddress,
        gameType,
        zetachainTxHash,
        zetachainBlockNumber,
        zetachainLogId
      } = gameData;

      // Validate required fields
      if (!userAddress || !gameType) {
        throw new Error('Missing required game data fields');
      }

      // Validate Ethereum address
      if (!/^0x[a-fA-F0-9]{40}$/.test(userAddress)) {
        throw new Error('Invalid Ethereum address format');
      }

      // Validate game type
      if (!['MINES', 'PLINKO', 'ROULETTE', 'WHEEL'].includes(gameType)) {
        throw new Error('Invalid game type');
      }

      // Validate ZetaChain transaction hash if provided
      if (zetachainTxHash && !/^0x[a-fA-F0-9]{64}$/.test(zetachainTxHash)) {
        throw new Error('Invalid ZetaChain transaction hash format');
      }

      // If gameResultId is provided, update existing record
      if (gameResultId) {
        const updateQuery = `
          UPDATE game_results
          SET 
            zetachain_tx_hash = $1,
            zetachain_block_number = $2,
            updated_at = NOW()
          WHERE id = $3
          RETURNING *
        `;

        const updateValues = [
          zetachainTxHash || null,
          zetachainBlockNumber || null,
          gameResultId
        ];

        const result = await this.pool.query(updateQuery, updateValues);

        if (result.rows.length === 0) {
          throw new Error(`Game result with ID ${gameResultId} not found`);
        }

        const savedGame = result.rows[0];

        console.log(`✅ ZetaChain transaction data updated for game ${gameResultId}:`, {
          zetachainTxHash: savedGame.zetachain_tx_hash,
          zetachainBlockNumber: savedGame.zetachain_block_number
        });

        return this.formatGameResult(savedGame);
      }

      // If no gameResultId, this is an error - we should always update existing records
      throw new Error('gameResultId is required. ZetaChain transactions should be added to existing game results.');

    } catch (error) {
      console.error('❌ Failed to save ZetaChain game result:', error);
      throw error;
    }
  }

  /**
   * Get user's game history with ZetaChain transaction data
   * @param {string} userAddress - User's Ethereum address
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Game history with ZetaChain transactions
   */
  async getUserHistory(userAddress, options = {}) {
    this.ensureInitialized();

    try {
      const {
        gameType,
        limit = 50,
        offset = 0,
        onlyZetaChain = false
      } = options;

      // Build query
      let query = `
        SELECT 
          gr.id,
          gr.user_address,
          gr.game_type,
          gr.game_config,
          gr.result_data,
          gr.bet_amount,
          gr.payout_amount,
          gr.zetachain_tx_hash,
          gr.zetachain_block_number,
          gr.created_at,
          -- Calculate profit/loss
          CASE 
            WHEN gr.payout_amount > 0 THEN (gr.payout_amount - gr.bet_amount)
            ELSE -gr.bet_amount
          END as profit_loss
        FROM game_results gr
        WHERE gr.user_address = $1
      `;

      const queryParams = [userAddress];
      let paramIndex = 2;

      // Filter for only games with ZetaChain transactions
      if (onlyZetaChain) {
        query += ` AND gr.zetachain_tx_hash IS NOT NULL`;
      }

      // Add game type filter
      if (gameType) {
        query += ` AND gr.game_type = $${paramIndex}`;
        queryParams.push(gameType);
        paramIndex++;
      }

      // Add ordering and pagination
      query += ` ORDER BY gr.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      queryParams.push(limit, offset);

      const result = await this.pool.query(query, queryParams);

      // Process results
      const games = result.rows.map(row => this.formatGameResult(row));

      return {
        games,
        total: games.length,
        hasMore: games.length === limit
      };

    } catch (error) {
      console.error('❌ Failed to get ZetaChain user history:', error);
      throw error;
    }
  }

  /**
   * Get recent games with ZetaChain transactions
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Recent games
   */
  async getRecentGames(options = {}) {
    this.ensureInitialized();

    try {
      const { 
        limit = 100, 
        gameType,
        onlyZetaChain = true
      } = options;

      let query = `
        SELECT 
          gr.id,
          gr.user_address,
          gr.game_type,
          gr.bet_amount,
          gr.payout_amount,
          gr.zetachain_tx_hash,
          gr.zetachain_block_number,
          gr.created_at,
          CASE 
            WHEN gr.payout_amount > gr.bet_amount THEN 'win'
            ELSE 'loss'
          END as result
        FROM game_results gr
        WHERE 1=1
      `;

      const queryParams = [];
      let paramIndex = 1;

      // Filter for only games with ZetaChain transactions
      if (onlyZetaChain) {
        query += ` AND gr.zetachain_tx_hash IS NOT NULL`;
      }

      if (gameType) {
        query += ` AND gr.game_type = $${paramIndex}`;
        queryParams.push(gameType);
        paramIndex++;
      }

      query += ` ORDER BY gr.created_at DESC LIMIT $${paramIndex}`;
      queryParams.push(limit);

      const result = await this.pool.query(query, queryParams);

      return result.rows.map(row => ({
        id: row.id,
        userAddress: row.user_address,
        gameType: row.game_type,
        betAmount: row.bet_amount,
        payoutAmount: row.payout_amount,
        result: row.result,
        zetachainTransaction: row.zetachain_tx_hash ? {
          transactionHash: row.zetachain_tx_hash,
          blockNumber: row.zetachain_block_number,
          explorerUrl: getZetaChainTransactionUrl(row.zetachain_tx_hash),
          network: 'zetachain-testnet'
        } : null,
        createdAt: row.created_at
      }));

    } catch (error) {
      console.error('❌ Failed to get recent ZetaChain games:', error);
      throw error;
    }
  }

  /**
   * Get ZetaChain logging statistics
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Statistics
   */
  async getZetaChainStats(options = {}) {
    this.ensureInitialized();

    try {
      const { timeframe = '30 days' } = options;

      const query = `
        SELECT 
          COUNT(*) as total_games,
          COUNT(*) FILTER (WHERE zetachain_tx_hash IS NOT NULL) as zetachain_logged,
          COUNT(*) FILTER (WHERE zetachain_tx_hash IS NULL) as not_logged,
          game_type
        FROM game_results
        WHERE created_at > NOW() - INTERVAL '${timeframe}'
        GROUP BY game_type
      `;

      const result = await this.pool.query(query);

      const stats = {
        totalGames: 0,
        zetachainLogged: 0,
        notLogged: 0,
        successRate: 0,
        gameTypeBreakdown: {}
      };

      let totalGames = 0;
      let totalLogged = 0;

      result.rows.forEach(row => {
        const gameType = row.game_type;
        const games = parseInt(row.total_games);
        const logged = parseInt(row.zetachain_logged);
        const notLogged = parseInt(row.not_logged);

        totalGames += games;
        totalLogged += logged;

        stats.gameTypeBreakdown[gameType] = {
          totalGames: games,
          zetachainLogged: logged,
          notLogged: notLogged,
          successRate: games > 0 ? ((logged / games) * 100).toFixed(2) : 0
        };
      });

      stats.totalGames = totalGames;
      stats.zetachainLogged = totalLogged;
      stats.notLogged = totalGames - totalLogged;
      stats.successRate = totalGames > 0 ? ((totalLogged / totalGames) * 100).toFixed(2) : 0;

      return stats;

    } catch (error) {
      console.error('❌ Failed to get ZetaChain stats:', error);
      throw error;
    }
  }

  /**
   * Get games pending ZetaChain logging
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Games without ZetaChain transactions
   */
  async getPendingZetaChainLogs(options = {}) {
    this.ensureInitialized();

    try {
      const { limit = 100, olderThan = '5 minutes' } = options;

      const query = `
        SELECT 
          gr.id,
          gr.user_address,
          gr.game_type,
          gr.bet_amount,
          gr.payout_amount,
          gr.result_data,
          gr.created_at
        FROM game_results gr
        WHERE gr.zetachain_tx_hash IS NULL
        AND gr.created_at < NOW() - INTERVAL '${olderThan}'
        ORDER BY gr.created_at ASC
        LIMIT $1
      `;

      const result = await this.pool.query(query, [limit]);

      return result.rows.map(row => ({
        id: row.id,
        userAddress: row.user_address,
        gameType: row.game_type,
        betAmount: row.bet_amount,
        payoutAmount: row.payout_amount,
        resultData: JSON.parse(row.result_data),
        createdAt: row.created_at
      }));

    } catch (error) {
      console.error('❌ Failed to get pending ZetaChain logs:', error);
      throw error;
    }
  }

  /**
   * Format game result with ZetaChain transaction details
   * @param {Object} row - Database row
   * @returns {Object} Formatted game result
   */
  formatGameResult(row) {
    const game = {
      id: row.id,
      userAddress: row.user_address,
      gameType: row.game_type,
      gameConfig: row.game_config ? JSON.parse(row.game_config) : null,
      resultData: row.result_data ? JSON.parse(row.result_data) : null,
      betAmount: row.bet_amount,
      payoutAmount: row.payout_amount,
      profitLoss: row.profit_loss,
      createdAt: row.created_at,
      isWin: row.payout_amount > row.bet_amount
    };

    // Add ZetaChain transaction details if available
    if (row.zetachain_tx_hash) {
      game.zetachainTransaction = {
        transactionHash: row.zetachain_tx_hash,
        blockNumber: row.zetachain_block_number,
        explorerUrl: getZetaChainTransactionUrl(row.zetachain_tx_hash),
        network: 'zetachain-testnet',
        verificationNote: 'Universal game log on ZetaChain - click to verify cross-chain'
      };
    }

    return game;
  }

  /**
   * Ensure service is initialized
   */
  ensureInitialized() {
    if (!this.isInitialized) {
      throw new Error('ZetaChain Game History Service not initialized. Call initialize() first.');
    }
  }

  /**
   * Close database connection
   */
  async close() {
    await this.pool.end();
    this.isInitialized = false;
  }
}

// Export singleton instance
export const zetaChainGameHistory = new ZetaChainGameHistoryService();
export default zetaChainGameHistory;
