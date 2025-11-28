/**
 * Database Migration: Create ZetaChain Retry Queue Table
 * 
 * This script creates the zetachain_retry_queue table for managing
 * failed ZetaChain logging attempts with retry logic.
 */

const { Pool } = require('pg');
require('dotenv').config();

async function createRetryQueueTable() {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'casino_vrf',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });

  try {
    console.log('🚀 Starting ZetaChain retry queue table migration...');

    // Create the retry queue table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS zetachain_retry_queue (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        game_data JSONB NOT NULL,
        attempts INTEGER DEFAULT 0,
        last_attempt TIMESTAMP,
        error_message TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        tx_hash VARCHAR(66),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        CONSTRAINT valid_status CHECK (status IN ('pending', 'succeeded', 'failed'))
      );
    `;

    await pool.query(createTableQuery);
    console.log('✅ Created zetachain_retry_queue table');

    // Create indexes for performance
    const createIndexes = [
      {
        name: 'idx_retry_status',
        query: 'CREATE INDEX IF NOT EXISTS idx_retry_status ON zetachain_retry_queue(status);'
      },
      {
        name: 'idx_retry_created',
        query: 'CREATE INDEX IF NOT EXISTS idx_retry_created ON zetachain_retry_queue(created_at);'
      },
      {
        name: 'idx_retry_last_attempt',
        query: 'CREATE INDEX IF NOT EXISTS idx_retry_last_attempt ON zetachain_retry_queue(last_attempt);'
      },
      {
        name: 'idx_retry_attempts',
        query: 'CREATE INDEX IF NOT EXISTS idx_retry_attempts ON zetachain_retry_queue(attempts);'
      }
    ];

    for (const index of createIndexes) {
      await pool.query(index.query);
      console.log(`✅ Created index: ${index.name}`);
    }

    // Verify table creation
    const verifyQuery = `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'zetachain_retry_queue'
      ORDER BY ordinal_position;
    `;

    const result = await pool.query(verifyQuery);
    console.log('\n📊 Table structure:');
    console.table(result.rows);

    console.log('\n✅ Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run migration if executed directly
if (require.main === module) {
  createRetryQueueTable()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { createRetryQueueTable };
