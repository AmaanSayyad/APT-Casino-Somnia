/**
 * Tests for Somnia Game Logger Service
 * 
 * Note: These are basic unit tests. Integration tests require actual
 * blockchain connection and should be run manually.
 */

import { SomniaGameLogger } from '../SomniaGameLogger';
import { ethers } from 'ethers';

describe('SomniaGameLogger', () => {
  let logger;

  beforeEach(() => {
    logger = new SomniaGameLogger();
  });

  describe('Initialization', () => {
    it('should create instance without provider', () => {
      expect(logger).toBeInstanceOf(SomniaGameLogger);
      expect(logger.contract).toBeNull();
    });

    it('should have correct contract address', () => {
      expect(logger.contractAddress).toBeDefined();
      expect(logger.contractAddress).toMatch(/^0x[a-fA-F0-9]{40}$/);
    });

    it('should have correct explorer URL', () => {
      expect(logger.explorerUrl).toBeDefined();
      expect(logger.explorerUrl).toContain('somnia');
    });
  });

  describe('Game Type Mapping', () => {
    it('should map game type names to enum values', () => {
      expect(logger.getGameTypeName(0)).toBe('ROULETTE');
      expect(logger.getGameTypeName(1)).toBe('MINES');
      expect(logger.getGameTypeName(2)).toBe('WHEEL');
      expect(logger.getGameTypeName(3)).toBe('PLINKO');
    });

    it('should return UNKNOWN for invalid enum', () => {
      expect(logger.getGameTypeName(99)).toBe('UNKNOWN');
    });
  });

  describe('Data Validation', () => {
    it('should validate required game data fields', () => {
      const invalidData = {
        gameType: 'ROULETTE',
        // missing playerAddress
        betAmount: '0.1',
        result: {},
        payout: '0.5'
      };

      expect(() => logger.validateGameData(invalidData)).toThrow('Valid player address is required');
    });

    it('should validate Ethereum address format', () => {
      const invalidData = {
        gameType: 'ROULETTE',
        playerAddress: 'invalid-address',
        betAmount: '0.1',
        result: {},
        payout: '0.5'
      };

      expect(() => logger.validateGameData(invalidData)).toThrow('Valid player address is required');
    });

    it('should validate bet amount', () => {
      const invalidData = {
        gameType: 'ROULETTE',
        playerAddress: '0x1234567890123456789012345678901234567890',
        betAmount: -1,
        result: {},
        payout: '0.5'
      };

      expect(() => logger.validateGameData(invalidData)).toThrow('Valid bet amount is required');
    });

    it('should validate payout amount', () => {
      const invalidData = {
        gameType: 'ROULETTE',
        playerAddress: '0x1234567890123456789012345678901234567890',
        betAmount: '0.1',
        result: {},
        payout: -1
      };

      expect(() => logger.validateGameData(invalidData)).toThrow('Valid payout amount is required');
    });

    it('should validate result data', () => {
      const invalidData = {
        gameType: 'ROULETTE',
        playerAddress: '0x1234567890123456789012345678901234567890',
        betAmount: '0.1',
        result: null,
        payout: '0.5'
      };

      expect(() => logger.validateGameData(invalidData)).toThrow('Game result is required');
    });

    it('should pass validation with valid data', () => {
      const validData = {
        gameType: 'ROULETTE',
        playerAddress: '0x1234567890123456789012345678901234567890',
        betAmount: '0.1',
        result: { winningNumber: 17 },
        payout: '0.5'
      };

      expect(() => logger.validateGameData(validData)).not.toThrow();
    });
  });

  describe('Result Data Encoding/Decoding', () => {
    it('should encode result data to bytes', () => {
      const result = { winningNumber: 17, bets: [] };
      const encoded = logger.encodeResultData(result);
      
      expect(encoded).toBeDefined();
      expect(typeof encoded).toBe('object'); // Uint8Array
    });

    it('should decode result data from bytes', () => {
      const result = { winningNumber: 17, bets: [] };
      const encoded = logger.encodeResultData(result);
      const decoded = logger.decodeResultData(encoded);
      
      expect(decoded).toEqual(result);
    });

    it('should handle empty result data', () => {
      const decoded = logger.decodeResultData('0x');
      expect(decoded).toBeNull();
    });

    it('should handle invalid result data gracefully', () => {
      const decoded = logger.decodeResultData('invalid');
      expect(decoded).toBeNull();
    });
  });

  describe('Transaction URL Generation', () => {
    it('should generate correct explorer URL', () => {
      const txHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      const url = logger.getTransactionUrl(txHash);
      
      expect(url).toContain('somnia');
      expect(url).toContain(txHash);
      expect(url).toMatch(/^https?:\/\//);
    });
  });

  describe('Error Handling', () => {
    it('should throw error when logging without contract', async () => {
      const gameData = {
        gameType: 'ROULETTE',
        playerAddress: '0x1234567890123456789012345678901234567890',
        betAmount: '0.1',
        result: { winningNumber: 17 },
        payout: '0.5'
      };

      await expect(logger.logGameResult(gameData)).rejects.toThrow('Game Logger contract not initialized');
    });

    it('should throw error when getting history without contract', async () => {
      await expect(logger.getGameHistory('0x1234567890123456789012345678901234567890')).rejects.toThrow('Game Logger contract not initialized');
    });

    it('should throw error when getting stats without contract', async () => {
      await expect(logger.getStats()).rejects.toThrow('Game Logger contract not initialized');
    });
  });
});

describe('Game Logger Integration', () => {
  describe('logGameToSomnia', () => {
    it('should return null when missing required parameters', async () => {
      const { logGameToSomnia } = require('../GameLoggerIntegration');
      
      const result = await logGameToSomnia({
        gameType: 'ROULETTE',
        // missing other required fields
      });
      
      expect(result).toBeNull();
    });
  });

  describe('getPlayerGameHistory', () => {
    it('should return empty array when player address is missing', async () => {
      const { getPlayerGameHistory } = require('../GameLoggerIntegration');
      
      const result = await getPlayerGameHistory(null);
      
      expect(result).toEqual([]);
    });
  });

  describe('getPlayerGameCount', () => {
    it('should return 0 when player address is missing', async () => {
      const { getPlayerGameCount } = require('../GameLoggerIntegration');
      
      const result = await getPlayerGameCount(null);
      
      expect(result).toBe(0);
    });
  });
});

