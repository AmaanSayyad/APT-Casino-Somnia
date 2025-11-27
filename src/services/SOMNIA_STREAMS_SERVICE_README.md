# Somnia Streams Service

## Overview

The `SomniaStreamsService` provides WebSocket-based real-time event subscriptions to Somnia Data Streams for the APT Casino platform. It enables global notifications when game results are logged on-chain.

## Features

- ✅ WebSocket subscription to `GameResultLogged` events
- ✅ Automatic reconnection with exponential backoff
- ✅ Event data parsing and validation
- ✅ Multiple callback support
- ✅ Connection status monitoring
- ✅ Error handling and recovery

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Game Completion                           │
│  (Roulette, Mines, Wheel, Plinko)                          │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              SomniaGameLogger Contract                       │
│  - Logs game result on-chain                                │
│  - Emits GameResultLogged event                             │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│           Somnia Data Streams Protocol                       │
│  - Captures event emission                                  │
│  - Broadcasts to all subscribers via WebSocket              │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│           SomniaStreamsService (This Service)                │
│  - Subscribes to events                                     │
│  - Parses and validates event data                          │
│  - Handles reconnection automatically                       │
│  - Notifies registered callbacks                            │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Application Components                          │
│  - GlobalNotificationSystem                                 │
│  - Game History Components                                  │
│  - Live Activity Feeds                                      │
└─────────────────────────────────────────────────────────────┘
```

## Usage

### Basic Usage (Direct Service)

```javascript
import { somniaStreamsService } from '@/services/SomniaStreamsService';

// Initialize the service
await somniaStreamsService.initialize();

// Subscribe to game results
const subscription = await somniaStreamsService.subscribeToGameResults(
  (gameResult) => {
    console.log('Game result received:', gameResult);
    // Handle the event (show notification, update UI, etc.)
  },
  (error) => {
    console.error('Subscription error:', error);
  }
);

// Later, unsubscribe
await subscription.unsubscribe();
```

### React Hook Usage (Recommended)

```javascript
import { useSomniaStreams } from '@/hooks/useSomniaStreams';

function MyComponent() {
  const {
    isConnected,
    isInitialized,
    subscriptionId,
    error,
    reconnectionStatus,
    reconnect
  } = useSomniaStreams({
    onGameResult: (gameResult) => {
      console.log('Game result:', gameResult);
      // Show notification, update state, etc.
    },
    onError: (error) => {
      console.error('Stream error:', error);
    },
    autoConnect: true // Automatically connect on mount
  });

  return (
    <div>
      <p>Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
      {error && <p>Error: {error.message}</p>}
      {!isConnected && (
        <button onClick={reconnect}>Reconnect</button>
      )}
    </div>
  );
}
```

## Event Data Structure

When a game result is logged, subscribers receive the following data:

```typescript
interface GameResultEvent {
  player: string;           // Player's wallet address (0x...)
  gameType: string;         // Game type (ROULETTE, MINES, WHEEL, PLINKO)
  betAmount: string;        // Bet amount in wei
  payout: string;           // Payout amount in wei
  entropyRequestId: string; // Entropy request ID from Pyth
  timestamp: number;        // Unix timestamp
}
```

## Configuration

Configuration is managed in `src/config/somniaStreams.js`:

```javascript
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
```

## Reconnection Logic

The service implements automatic reconnection with exponential backoff:

1. **Initial Delay**: 3000ms (3 seconds)
2. **Backoff Multiplier**: 1.5x
3. **Max Attempts**: 5

**Calculated Delays:**
- Attempt 1: 3000ms
- Attempt 2: 4500ms
- Attempt 3: 6750ms
- Attempt 4: 10125ms
- Attempt 5: 15187.5ms

After 5 failed attempts, the service stops trying and logs an error. You can manually trigger reconnection using the `reconnect()` method.

## API Reference

### SomniaStreamsService

#### Methods

##### `initialize(walletClient?)`
Initialize the Somnia Streams SDK with WebSocket transport.

**Parameters:**
- `walletClient` (optional): Wallet client for authenticated operations

**Returns:** `Promise<void>`

##### `subscribeToGameResults(onGameResult, onError?)`
Subscribe to GameResultLogged events.

**Parameters:**
- `onGameResult`: Callback function for game result events
- `onError` (optional): Error callback

**Returns:** `Promise<{ subscriptionId: string, unsubscribe: () => void }>`

##### `unsubscribe()`
Unsubscribe from events and clean up.

**Returns:** `Promise<void>`

##### `reconnect()`
Manually trigger reconnection.

**Returns:** `Promise<void>`

##### `isSubscribed()`
Check if currently connected.

**Returns:** `boolean`

##### `getSubscriptionId()`
Get current subscription ID.

**Returns:** `string | null`

##### `getReconnectionStatus()`
Get reconnection status.

**Returns:** 
```typescript
{
  enabled: boolean;
  attempts: number;
  maxAttempts: number;
  isReconnecting: boolean;
}
```

##### `clearCallbacks()`
Clear all registered callbacks.

**Returns:** `void`

## Error Handling

The service handles various error scenarios:

### Connection Errors
- Automatically attempts reconnection with exponential backoff
- Notifies error callbacks
- Updates connection status

### Subscription Errors
- Logs detailed error information
- Triggers reconnection if enabled
- Maintains callback queue for reconnection

### Event Parsing Errors
- Validates event data structure
- Logs warnings for invalid data
- Continues processing other events

## Testing

### Unit Tests
Run unit tests with:
```bash
npm test -- src/services/__tests__/SomniaStreamsService.test.js
```

### Verification Script
Run the verification script:
```bash
node scripts/test-somnia-streams.js
```

### Manual Testing
1. Open the application in a browser
2. Connect wallet to Somnia Testnet
3. Play a game (triggers GameResultLogged event)
4. Verify notification appears
5. Test reconnection by temporarily disabling network

## Integration Examples

### Global Notification System

```javascript
import { useSomniaStreams } from '@/hooks/useSomniaStreams';
import { useNotifications } from '@/hooks/useNotifications';

function GlobalNotificationSystem() {
  const { showNotification } = useNotifications();
  
  useSomniaStreams({
    onGameResult: (gameResult) => {
      showNotification({
        type: 'game-result',
        player: gameResult.player,
        gameType: gameResult.gameType,
        betAmount: gameResult.betAmount,
        payout: gameResult.payout,
        timestamp: gameResult.timestamp
      });
    },
    autoConnect: true
  });
  
  return <NotificationContainer />;
}
```

### Live Activity Feed

```javascript
import { useSomniaStreams } from '@/hooks/useSomniaStreams';
import { useState } from 'react';

function LiveActivityFeed() {
  const [activities, setActivities] = useState([]);
  
  useSomniaStreams({
    onGameResult: (gameResult) => {
      setActivities(prev => [gameResult, ...prev].slice(0, 50));
    },
    autoConnect: true
  });
  
  return (
    <div>
      <h2>Live Activity</h2>
      {activities.map((activity, index) => (
        <ActivityCard key={index} activity={activity} />
      ))}
    </div>
  );
}
```

## Troubleshooting

### WebSocket Connection Failed
- Verify WebSocket URL in `somniaTestnetConfig.js`
- Check firewall settings
- Ensure network connectivity

### Events Not Received
- Verify GameLogger contract is emitting events
- Check event schema ID matches registration
- Ensure subscription is active
- Verify contract address is correct

### Reconnection Not Working
- Check reconnection is enabled in config
- Verify max attempts not exceeded
- Check console for error messages

## Related Documentation

- [Somnia Data Streams Integration Guide](../../README.md#-somnia-data-streams-integration-hackathon-focus)
- [Game Logger Integration](./GAME_LOGGER_README.md)
- [Somnia Testnet Configuration](../config/somniaTestnetConfig.js)

## Requirements Validation

This service fulfills the following requirements:

- ✅ **Requirement 5.2**: Receives and displays Data Streams events
- ✅ **Requirement 5.6**: Implements automatic reconnection logic

## Next Steps

1. **Task 13**: Create GlobalNotificationSystem component
2. **Integration**: Connect with game completion handlers
3. **Testing**: Verify end-to-end event flow
4. **Monitoring**: Add analytics for event tracking
