import { dbPool } from '../config/database';
import { randomUUID } from 'crypto';

/**
 * ZetaChain Retry Queue Service
 * Manages retry logic for failed ZetaChain logging attempts with exponential backoff
 */
export class ZetaChainRetryService {
  constructor(zetaChainLogger) {
    this.zetaChainLogger = zetaChainLogger;
    this.retryIntervalId = null;
    this.isProcessing = false;
    this.maxRetries = 3;
    this.baseDelayMs = 1000; // 1 second base delay
  }

  /**
   * Add a failed logging attempt to the retry queue
   * @param {Object} gameData - Game data that failed to log
   * @returns {Promise<string>} Queue entry ID
   */
  async addToQueue(gameData) {
    try {
      const pool = dbPool.getPool();
      const entryId = randomUUID();

      const query = `
        INSERT INTO zetachain_retry_queue (
          id,
          game_data,
          attempts,
          last_attempt,
          error_message,
          status,
          created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
        RETURNING id, created_at
      `;

      const values = [
        entryId,
        JSON.stringify(gameData),
        0, // Initial attempts
        null, // No attempt yet
        null, // No error yet
        'pending'
      ];

      const result = await pool.query(query, values);

      console.log('📥 Added game to ZetaChain retry queue:', {
        entryId,
        gameType: gameData.gameType,
        playerAddress: gameData.playerAddress
      });

      return result.rows[0].id;

    } catch (error) {
      console.error('❌ Failed to add to retry queue:', error);
      throw new Error(`Failed to add to retry queue: ${error.message}`);
    }
  }

  /**
   * Process the retry queue with exponential backoff
   * @returns {Promise<Object>} Processing results
   */
  async processQueue() {
    if (this.isProcessing) {
      console.log('⏳ Queue processing already in progress, skipping...');
      return { processed: 0, succeeded: 0, failed: 0, skipped: true };
    }

    this.isProcessing = true;

    try {
      const pool = dbPool.getPool();

      // Get pending entries that are ready for retry (considering exponential backoff)
      const query = `
        SELECT id, game_data, attempts, last_attempt, error_message
        FROM zetachain_retry_queue
        WHERE status = 'pending'
        AND attempts < $1
        AND (
          last_attempt IS NULL
          OR last_attempt < NOW() - INTERVAL '1 second' * $2
        )
        ORDER BY created_at ASC
        LIMIT 50
      `;

      const result = await pool.query(query, [this.maxRetries, this.baseDelayMs / 1000]);
      const entries = result.rows;

      if (entries.length === 0) {
        console.log('✅ No entries in retry queue to process');
        this.isProcessing = false;
        return { processed: 0, succeeded: 0, failed: 0 };
      }

      console.log(`🔄 Processing ${entries.length} entries from retry queue...`);

      let succeeded = 0;
      let failed = 0;

      for (const entry of entries) {
        try {
          // Calculate exponential backoff delay
          const backoffDelay = this.calculateBackoffDelay(entry.attempts);
          const timeSinceLastAttempt = entry.last_attempt
            ? Date.now() - new Date(entry.last_attempt).getTime()
            : Infinity;

          // Skip if not enough time has passed since last attempt
          if (timeSinceLastAttempt < backoffDelay) {
            console.log(`⏰ Skipping entry ${entry.id}, backoff not elapsed (${Math.round((backoffDelay - timeSinceLastAttempt) / 1000)}s remaining)`);
            continue;
          }

          const gameData = JSON.parse(entry.game_data);

          console.log(`🔄 Retry attempt ${entry.attempts + 1}/${this.maxRetries} for entry ${entry.id}`);

          // Attempt to log to ZetaChain
          const txHash = await this.zetaChainLogger.logGameResult(gameData);

          // Success - update database and remove from queue
          await this.markAsSucceeded(entry.id, txHash);
          succeeded++;

          console.log(`✅ Retry succeeded for entry ${entry.id}, tx: ${txHash}`);

        } catch (error) {
          // Failure - increment attempts and update error
          const newAttempts = entry.attempts + 1;

          if (newAttempts >= this.maxRetries) {
            // Max retries reached - mark as permanently failed
            await this.markAsFailed(entry.id, error.message);
            failed++;
            console.error(`❌ Entry ${entry.id} permanently failed after ${this.maxRetries} attempts:`, error.message);
          } else {
            // Update attempt count and error message
            await this.updateAttempt(entry.id, newAttempts, error.message);
            console.warn(`⚠️ Retry attempt ${newAttempts}/${this.maxRetries} failed for entry ${entry.id}:`, error.message);
          }
        }
      }

      const processed = entries.length;

      console.log(`✅ Queue processing complete: ${processed} processed, ${succeeded} succeeded, ${failed} permanently failed`);

      this.isProcessing = false;

      return { processed, succeeded, failed };

    } catch (error) {
      console.error('❌ Error processing retry queue:', error);
      this.isProcessing = false;
      throw error;
    }
  }

  /**
   * Calculate exponential backoff delay
   * @param {number} attempts - Number of previous attempts
   * @returns {number} Delay in milliseconds
   */
  calculateBackoffDelay(attempts) {
    // Exponential backoff: baseDelay * 2^attempts
    // Attempt 0: 1s, Attempt 1: 2s, Attempt 2: 4s
    return this.baseDelayMs * Math.pow(2, attempts);
  }

  /**
   * Mark an entry as succeeded and remove from queue
   * @param {string} entryId - Queue entry ID
   * @param {string} txHash - Successful transaction hash
   */
  async markAsSucceeded(entryId, txHash) {
    try {
      const pool = dbPool.getPool();

      // Update status to succeeded
      const updateQuery = `
        UPDATE zetachain_retry_queue
        SET status = 'succeeded',
            tx_hash = $1,
            updated_at = NOW()
        WHERE id = $2
      `;

      await pool.query(updateQuery, [txHash, entryId]);

      // Optionally delete succeeded entries after a delay
      // For now, we'll keep them for audit purposes
      // They can be cleaned up by a separate maintenance job

    } catch (error) {
      console.error('❌ Failed to mark entry as succeeded:', error);
      throw error;
    }
  }

  /**
   * Mark an entry as permanently failed
   * @param {string} entryId - Queue entry ID
   * @param {string} errorMessage - Final error message
   */
  async markAsFailed(entryId, errorMessage) {
    try {
      const pool = dbPool.getPool();

      const query = `
        UPDATE zetachain_retry_queue
        SET status = 'failed',
            error_message = $1,
            updated_at = NOW()
        WHERE id = $2
      `;

      await pool.query(query, [errorMessage, entryId]);

      // TODO: Send alert to administrators about permanent failure

    } catch (error) {
      console.error('❌ Failed to mark entry as failed:', error);
      throw error;
    }
  }

  /**
   * Update attempt count and error message
   * @param {string} entryId - Queue entry ID
   * @param {number} attempts - New attempt count
   * @param {string} errorMessage - Error message from latest attempt
   */
  async updateAttempt(entryId, attempts, errorMessage) {
    try {
      const pool = dbPool.getPool();

      const query = `
        UPDATE zetachain_retry_queue
        SET attempts = $1,
            last_attempt = NOW(),
            error_message = $2,
            updated_at = NOW()
        WHERE id = $3
      `;

      await pool.query(query, [attempts, errorMessage, entryId]);

    } catch (error) {
      console.error('❌ Failed to update attempt:', error);
      throw error;
    }
  }

  /**
   * Get retry queue status for monitoring
   * @returns {Promise<Object>} Queue status information
   */
  async getQueueStatus() {
    try {
      const pool = dbPool.getPool();

      // Get queue statistics
      const statsQuery = `
        SELECT
          COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
          COUNT(*) FILTER (WHERE status = 'succeeded') as succeeded_count,
          COUNT(*) FILTER (WHERE status = 'failed') as failed_count,
          MIN(created_at) FILTER (WHERE status = 'pending') as oldest_pending,
          AVG(attempts) FILTER (WHERE status = 'pending') as avg_attempts
        FROM zetachain_retry_queue
      `;

      const statsResult = await pool.query(statsQuery);
      const stats = statsResult.rows[0];

      // Calculate failure rate (failed / total processed)
      const totalProcessed = parseInt(stats.succeeded_count) + parseInt(stats.failed_count);
      const failureRate = totalProcessed > 0
        ? (parseInt(stats.failed_count) / totalProcessed) * 100
        : 0;

      return {
        size: parseInt(stats.pending_count),
        succeeded: parseInt(stats.succeeded_count),
        failed: parseInt(stats.failed_count),
        oldestEntry: stats.oldest_pending ? new Date(stats.oldest_pending) : null,
        averageAttempts: parseFloat(stats.avg_attempts) || 0,
        failureRate: Math.round(failureRate * 100) / 100, // Round to 2 decimal places
        isProcessing: this.isProcessing,
        autoRetryEnabled: this.retryIntervalId !== null
      };

    } catch (error) {
      console.error('❌ Failed to get queue status:', error);
      throw new Error(`Failed to get queue status: ${error.message}`);
    }
  }

  /**
   * Start automatic retry processing at regular intervals
   * @param {number} intervalMs - Interval in milliseconds (default: 60000 = 1 minute)
   */
  startAutoRetry(intervalMs = 60000) {
    if (this.retryIntervalId) {
      console.log('⚠️ Auto-retry already running');
      return;
    }

    console.log(`🔄 Starting auto-retry with ${intervalMs}ms interval`);

    // Process immediately
    this.processQueue().catch(error => {
      console.error('❌ Error in initial queue processing:', error);
    });

    // Then process at regular intervals
    this.retryIntervalId = setInterval(() => {
      this.processQueue().catch(error => {
        console.error('❌ Error in scheduled queue processing:', error);
      });
    }, intervalMs);

    console.log('✅ Auto-retry started');
  }

  /**
   * Stop automatic retry processing
   */
  stopAutoRetry() {
    if (!this.retryIntervalId) {
      console.log('⚠️ Auto-retry not running');
      return;
    }

    console.log('🛑 Stopping auto-retry...');

    clearInterval(this.retryIntervalId);
    this.retryIntervalId = null;

    console.log('✅ Auto-retry stopped');
  }

  /**
   * Clean up old succeeded entries (maintenance)
   * @param {number} daysOld - Remove succeeded entries older than this many days
   * @returns {Promise<number>} Number of entries removed
   */
  async cleanupOldEntries(daysOld = 7) {
    try {
      const pool = dbPool.getPool();

      const query = `
        DELETE FROM zetachain_retry_queue
        WHERE status = 'succeeded'
        AND updated_at < NOW() - INTERVAL '${daysOld} days'
        RETURNING id
      `;

      const result = await pool.query(query);
      const deletedCount = result.rowCount;

      console.log(`🧹 Cleaned up ${deletedCount} old succeeded entries`);

      return deletedCount;

    } catch (error) {
      console.error('❌ Failed to cleanup old entries:', error);
      throw error;
    }
  }

  /**
   * Get failed entries for manual review
   * @param {number} limit - Maximum number of entries to return
   * @returns {Promise<Array>} Array of failed entries
   */
  async getFailedEntries(limit = 50) {
    try {
      const pool = dbPool.getPool();

      const query = `
        SELECT id, game_data, attempts, error_message, created_at, updated_at
        FROM zetachain_retry_queue
        WHERE status = 'failed'
        ORDER BY updated_at DESC
        LIMIT $1
      `;

      const result = await pool.query(query, [limit]);

      return result.rows.map(row => ({
        id: row.id,
        gameData: JSON.parse(row.game_data),
        attempts: row.attempts,
        errorMessage: row.error_message,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));

    } catch (error) {
      console.error('❌ Failed to get failed entries:', error);
      throw error;
    }
  }

  /**
   * Manually retry a specific failed entry
   * @param {string} entryId - Queue entry ID to retry
   * @returns {Promise<boolean>} True if retry succeeded
   */
  async manualRetry(entryId) {
    try {
      const pool = dbPool.getPool();

      // Get the entry
      const query = `
        SELECT id, game_data, attempts
        FROM zetachain_retry_queue
        WHERE id = $1
        AND status IN ('pending', 'failed')
      `;

      const result = await pool.query(query, [entryId]);

      if (result.rows.length === 0) {
        throw new Error('Entry not found or already succeeded');
      }

      const entry = result.rows[0];
      const gameData = JSON.parse(entry.game_data);

      console.log(`🔄 Manual retry for entry ${entryId}`);

      // Attempt to log
      const txHash = await this.zetaChainLogger.logGameResult(gameData);

      // Success - mark as succeeded
      await this.markAsSucceeded(entryId, txHash);

      console.log(`✅ Manual retry succeeded for entry ${entryId}, tx: ${txHash}`);

      return true;

    } catch (error) {
      console.error(`❌ Manual retry failed for entry ${entryId}:`, error);

      // Update error message
      const pool = dbPool.getPool();
      await pool.query(
        'UPDATE zetachain_retry_queue SET error_message = $1, updated_at = NOW() WHERE id = $2',
        [error.message, entryId]
      );

      throw error;
    }
  }
}

// Export singleton instance (will be initialized with logger when available)
let retryServiceInstance = null;

export function initializeRetryService(zetaChainLogger) {
  if (!retryServiceInstance) {
    retryServiceInstance = new ZetaChainRetryService(zetaChainLogger);
  }
  return retryServiceInstance;
}

export function getRetryService() {
  if (!retryServiceInstance) {
    throw new Error('Retry service not initialized. Call initializeRetryService() first.');
  }
  return retryServiceInstance;
}

export default ZetaChainRetryService;
