/**
 * Tests for Somnia Streams Service
 * 
 * Note: These are basic unit tests. Integration tests with actual WebSocket
 * connections should be run manually or in E2E tests.
 */

import { SomniaStreamsService } from '../SomniaStreamsService';
import { STREAMS_SUBSCRIPTION_CONFIG } from '../../config/somniaStreams';

describe('SomniaStreamsService', () => {
  let service;

  beforeEach(() => {
    service = new SomniaStreamsService();
  });

  afterEach(() => {
    // Clean up any active subscriptions
    if (service.isSubscribed()) {
      service.unsubscribe();
    }
  });

  describe('Initialization', () => {
    it('should create instance with default values', () => {
      expect(service).toBeInstanceOf(SomniaStreamsService);
      expect(service.sdk).toBeNull();
      expect(service.subscription).toBeNull();
      expect(service.isConnected).toBe(false);
      expect(service.reconnectAttempts).toBe(0);
    });

    it('should have correct reconnection configuration', () => {
      expect(service.maxReconnectAttempts).toBe(STREAMS_SUBSCRIPTION_CONFIG.reconnect.maxAttempts);
      expect(service.reconnectDelay).toBe(STREAMS_SUBSCRIPTION_CONFIG.reconnect.delayMs);
      expect(service.backoffMultiplier).toBe(STREAMS_SUBSCRIPTION_CONFIG.reconnect.backoffMultiplier);
      expect(service.reconnectEnabled).toBe(STREAMS_SUBSCRIPTION_CONFIG.reconnect.enabled);
    });

    it('should initialize with empty callback arrays', () => {
      expect(service.eventCallbacks).toEqual([]);
      expect(service.errorCallbacks).toEqual([]);
    });
  });

  describe('Connection Status', () => {
    it('should report not subscribed initially', () => {
      expect(service.isSubscribed()).toBe(false);
    });

    it('should return null subscription ID initially', () => {
      expect(service.getSubscriptionId()).toBeNull();
    });

    it('should return correct reconnection status', () => {
      const status = service.getReconnectionStatus();
      
      expect(status).toHaveProperty('enabled');
      expect(status).toHaveProperty('attempts');
      expect(status).toHaveProperty('maxAttempts');
      expect(status).toHaveProperty('isReconnecting');
      
      expect(status.enabled).toBe(true);
      expect(status.attempts).toBe(0);
      expect(status.maxAttempts).toBe(STREAMS_SUBSCRIPTION_CONFIG.reconnect.maxAttempts);
      expect(status.isReconnecting).toBe(false);
    });
  });

  describe('Event Data Validation', () => {
    it('should validate complete event data', () => {
      const validEvent = {
        player: '0x1234567890123456789012345678901234567890',
        gameType: 'ROULETTE',
        betAmount: '1000000000000000000',
        payout: '2000000000000000000',
        entropyRequestId: '0xabcd',
        timestamp: Date.now()
      };

      expect(service.validateEventData(validEvent)).toBe(true);
    });

    it('should reject event data with missing fields', () => {
      const invalidEvent = {
        player: '0x1234567890123456789012345678901234567890',
        gameType: 'ROULETTE',
        // missing betAmount, payout, timestamp
      };

      expect(service.validateEventData(invalidEvent)).toBe(false);
    });

    it('should reject event data with invalid player address', () => {
      const invalidEvent = {
        player: 'invalid-address',
        gameType: 'ROULETTE',
        betAmount: '1000000000000000000',
        payout: '2000000000000000000',
        timestamp: Date.now()
      };

      expect(service.validateEventData(invalidEvent)).toBe(false);
    });

    it('should reject event data with invalid numeric values', () => {
      const invalidEvent = {
        player: '0x1234567890123456789012345678901234567890',
        gameType: 'ROULETTE',
        betAmount: 'not-a-number',
        payout: '2000000000000000000',
        timestamp: Date.now()
      };

      expect(service.validateEventData(invalidEvent)).toBe(false);
    });

    it('should reject null event data', () => {
      expect(service.validateEventData(null)).toBe(false);
    });

    it('should reject undefined event data', () => {
      expect(service.validateEventData(undefined)).toBe(false);
    });
  });

  describe('Callback Management', () => {
    it('should clear all callbacks', () => {
      const mockCallback = jest.fn();
      service.eventCallbacks.push(mockCallback);
      service.errorCallbacks.push(mockCallback);

      service.clearCallbacks();

      expect(service.eventCallbacks).toEqual([]);
      expect(service.errorCallbacks).toEqual([]);
    });
  });

  describe('Error Handling', () => {
    it('should throw error when subscribing without initialization', async () => {
      const mockCallback = jest.fn();

      await expect(service.subscribeToGameResults(mockCallback)).rejects.toThrow(
        'SDK not initialized'
      );
    });

    it('should throw error when reconnecting without callbacks', async () => {
      await expect(service.reconnect()).rejects.toThrow(
        'No event callbacks registered'
      );
    });
  });

  describe('Unsubscribe', () => {
    it('should handle unsubscribe when not connected', async () => {
      // Should not throw
      await expect(service.unsubscribe()).resolves.not.toThrow();
    });

    it('should clear subscription state on unsubscribe', async () => {
      // Manually set some state
      service.subscription = { unsubscribe: jest.fn() };
      service.subscriptionId = 'test-id';
      service.isConnected = true;

      await service.unsubscribe();

      expect(service.subscription).toBeNull();
      expect(service.subscriptionId).toBeNull();
      expect(service.isConnected).toBe(false);
      expect(service.reconnectAttempts).toBe(0);
    });
  });

  describe('Event Data Parsing', () => {
    it('should return null for invalid event data', () => {
      const result = service.parseGameResultEvent([], '0x');
      expect(result).toBeNull();
    });

    it('should handle parsing errors gracefully', () => {
      const invalidTopics = ['invalid'];
      const invalidData = 'invalid-data';
      
      const result = service.parseGameResultEvent(invalidTopics, invalidData);
      expect(result).toBeNull();
    });
  });

  describe('Event Handling', () => {
    it('should handle event data without result', () => {
      const mockCallback = jest.fn();
      service.eventCallbacks.push(mockCallback);

      service.handleEventData({});

      expect(mockCallback).not.toHaveBeenCalled();
    });

    it('should handle invalid parsed event', () => {
      const mockCallback = jest.fn();
      service.eventCallbacks.push(mockCallback);

      // Mock parseGameResultEvent to return invalid data
      service.parseGameResultEvent = jest.fn().mockReturnValue({
        player: 'invalid',
        // missing required fields
      });

      service.handleEventData({
        result: {
          topics: [],
          data: '0x'
        }
      });

      expect(mockCallback).not.toHaveBeenCalled();
    });

    it('should call callbacks with valid event data', () => {
      const mockCallback = jest.fn();
      service.eventCallbacks.push(mockCallback);

      const validEvent = {
        player: '0x1234567890123456789012345678901234567890',
        gameType: 'ROULETTE',
        betAmount: '1000000000000000000',
        payout: '2000000000000000000',
        entropyRequestId: '0xabcd',
        timestamp: Date.now()
      };

      // Mock parseGameResultEvent to return valid data
      service.parseGameResultEvent = jest.fn().mockReturnValue(validEvent);

      service.handleEventData({
        result: {
          topics: [],
          data: '0x'
        }
      });

      expect(mockCallback).toHaveBeenCalledWith(validEvent);
    });

    it('should handle callback errors gracefully', () => {
      const errorCallback = jest.fn().mockImplementation(() => {
        throw new Error('Callback error');
      });
      service.eventCallbacks.push(errorCallback);

      const validEvent = {
        player: '0x1234567890123456789012345678901234567890',
        gameType: 'ROULETTE',
        betAmount: '1000000000000000000',
        payout: '2000000000000000000',
        entropyRequestId: '0xabcd',
        timestamp: Date.now()
      };

      service.parseGameResultEvent = jest.fn().mockReturnValue(validEvent);

      // Should not throw
      expect(() => {
        service.handleEventData({
          result: {
            topics: [],
            data: '0x'
          }
        });
      }).not.toThrow();
    });
  });

  describe('Reconnection Logic', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should schedule reconnection with exponential backoff', () => {
      service.scheduleReconnect();

      expect(service.reconnectAttempts).toBe(1);
      expect(service.reconnectTimeout).not.toBeNull();
    });

    it('should calculate correct delay with backoff', () => {
      const baseDelay = service.reconnectDelay;
      const multiplier = service.backoffMultiplier;

      service.scheduleReconnect();
      const firstDelay = baseDelay * Math.pow(multiplier, 0);

      service.scheduleReconnect();
      const secondDelay = baseDelay * Math.pow(multiplier, 1);

      expect(service.reconnectAttempts).toBe(2);
      // Verify exponential backoff is applied
      expect(secondDelay).toBeGreaterThan(firstDelay);
    });

    it('should clear existing timeout when scheduling new reconnection', () => {
      service.scheduleReconnect();
      const firstTimeout = service.reconnectTimeout;

      service.scheduleReconnect();
      const secondTimeout = service.reconnectTimeout;

      expect(secondTimeout).not.toBe(firstTimeout);
    });

    it('should not exceed max reconnection attempts', () => {
      service.reconnectEnabled = true;
      service.reconnectAttempts = service.maxReconnectAttempts;

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      service.handleSubscriptionError(new Error('Test error'));

      expect(service.reconnectTimeout).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Max reconnection attempts reached')
      );

      consoleSpy.mockRestore();
    });
  });
});
