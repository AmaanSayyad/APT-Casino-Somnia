# Somnia Game Logger Service

## Overview

The Somnia Game Logger service provides on-chain logging of game results to Somnia Testnet blockchain. This ensures all game outcomes are verifiable and transparent, while maintaining Pyth Entropy generation on Arbitrum Sepolia for provably fair randomness.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Game Flow                                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Player places bet                                        │
│  2. Pyth Entropy generates randomness (Arbitrum Sepolia)    │
│  3. Game processes result using entropy                      │
│  4. Game result logged to Somnia Testnet                     │
│  5. Player sees result with both transaction links           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Components

### 1. SomniaGameLogger.js
Core service class that interacts with the SomniaGameLogger smart contract.

**Key Features:**
- Log game results to blockchain
- Retrieve game history
- Get player statistics
- Subscribe to real-time events
- Transaction explorer integration

### 2. GameLoggerIntegration.js
Helper functions for easy integration with game pages.

**Key Features:**
- Simplified API for logging games
- Error handling and fallbacks
- Provider/signer management
- History retrieval utilities

### 3. useSomniaGameLogger.js
React hook for seamless integration in React components.

**Key Features:**
- Automatic wallet connection handling
- State management for logging operations
- Easy-to-use API for React components
- Event subscription support

## Installation

The service is already integrated into the project. No additional installation required.

## Usage

### Basic Usage (React Hook)

```javascript
import { useSomniaGameLogger } from '@/hooks/useSomniaGameLogger';

function MyGame() {
  const { logGame, isLogging, lastLogTxHash, getExplorerUrl } = useSomniaGameLogger();
  
  const handleGameComplete = async (result) => {
    const txHash = await logGame({
      gameType: 'ROULETTE',
      betAmount: '0.1',
      result: { winningNumber: 17, bets: [...] },
      payout: '0.5',
      entropyProof: {
        requestId: '0x123...',
        transactionHash: '0xabc...'
      }
    });
    
    if (txHash) {
      console.log('Logged:', getExplorerUrl(txHash));
    }
  };
  
  return (
    <div>
      {isLogging && <p>Logging game...</p>}
      {lastLogTxHash && (
        <a href={getExplorerUrl(lastLogTxHash)}>View on Explorer</a>
      )}
    </div>
  );
}
```

### Advanced Usage (Direct Service)

```javascript
import { logGameToSomnia } from '@/services/GameLoggerIntegration';
import { ethers } from 'ethers';

async function logGame() {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  
  const txHash = await logGameToSomnia({
    gameType: 'MINES',
    playerAddress: address,
    betAmount: '0.05',
    result: { minePositions: [1, 5, 12], hitMine: false },
    payout: '0.15',
    entropyProof: { requestId: '0x...', transactionHash: '0x...' },
    provider,
    signer
  });
  
  return txHash;
}
```

## API Reference

### useSomniaGameLogger Hook

#### Returns
```typescript
{
  // State
  isLogging: boolean;
  lastLogTxHash: string | null;
  error: string | null;
  isConnected: boolean;
  address: string | undefined;
  
  // Functions
  logGame: (params: LogGameParams) => Promise<string | null>;
  getHistory: (limit?: number) => Promise<GameLog[]>;
  getGameCount: () => Promise<number>;
  getStats: () => Promise<Stats>;
  subscribeToEvents: (callback: Function) => () => void;
  getExplorerUrl: (txHash: string) => string;
}
```

#### logGame Parameters
```typescript
{
  gameType: 'ROULETTE' | 'MINES' | 'WHEEL' | 'PLINKO';
  betAmount: string;  // in STT (e.g., "0.1")
  result: object;     // game-specific result data
  payout: string;     // in STT (e.g., "0.5")
  entropyProof?: {
    requestId: string;
    transactionHash: string;
  };
}
```

### SomniaGameLogger Class

#### Methods

**logGameResult(gameData)**
- Logs a game result to Somnia Testnet
- Returns: Promise<string> - Transaction hash

**getGameLog(logId)**
- Retrieves a specific game log by ID
- Returns: Promise<GameLog>

**getGameHistory(playerAddress, limit)**
- Gets player's game history
- Returns: Promise<GameLog[]>

**getPlayerGameCount(playerAddress)**
- Gets total games played by player
- Returns: Promise<number>

**getStats()**
- Gets contract statistics
- Returns: Promise<Stats>

**onGameResultLogged(callback)**
- Subscribes to game result events
- Returns: Function (unsubscribe)

## Integration Guide

### Step 1: Import the Hook

```javascript
import { useSomniaGameLogger } from '@/hooks/useSomniaGameLogger';
```

### Step 2: Use in Component

```javascript
const { logGame, getExplorerUrl } = useSomniaGameLogger();
```

### Step 3: Log After Game Completes

```javascript
// After Pyth Entropy generates randomness and game processes result
pythEntropyService.generateRandom('ROULETTE', config).then(entropyResult => {
  // Process game result
  const gameResult = processGameResult(entropyResult);
  
  // Log to Somnia (non-blocking)
  logGame({
    gameType: 'ROULETTE',
    betAmount: totalBetAmount.toString(),
    result: gameResult,
    payout: totalPayout.toString(),
    entropyProof: {
      requestId: entropyResult.entropyProof.requestId,
      transactionHash: entropyResult.entropyProof.transactionHash
    }
  }).then(txHash => {
    if (txHash) {
      console.log('Game logged:', getExplorerUrl(txHash));
    }
  });
});
```

### Step 4: Display Transaction Links

```javascript
// In game history component
{game.somniaTxHash && (
  <a href={getExplorerUrl(game.somniaTxHash)} target="_blank">
    View on Somnia Explorer
  </a>
)}

{game.entropyProof?.transactionHash && (
  <a href={`https://sepolia.arbiscan.io/tx/${game.entropyProof.transactionHash}`} target="_blank">
    View Entropy on Arbitrum
  </a>
)}
```

## Game-Specific Result Formats

### Roulette
```javascript
result: {
  winningNumber: number,
  bets: Array<{type, value, amount}>,
  winningBets: Array<{...}>,
  losingBets: Array<{...}>
}
```

### Mines
```javascript
result: {
  minePositions: number[],
  revealedPositions: number[],
  hitMine: boolean,
  safeRevealed: number,
  currentMultiplier: number
}
```

### Wheel
```javascript
result: {
  winningSegment: number,
  multiplier: number,
  color: string
}
```

### Plinko
```javascript
result: {
  path: number[],
  finalBucket: number,
  multiplier: number
}
```

## Error Handling

The service is designed to fail gracefully:

1. **Logging Failures**: If logging fails, the game continues normally. The error is logged but doesn't break the game flow.

2. **Network Issues**: If Somnia network is unavailable, the service returns null and logs the error.

3. **Wallet Issues**: If wallet is not connected or signer is unavailable, appropriate error messages are returned.

4. **Contract Issues**: If contract is not deployed or address is invalid, initialization fails with clear error messages.

## Testing

### Manual Testing

1. Connect wallet to Somnia Testnet
2. Play a game (Roulette, Mines, Wheel, or Plinko)
3. Check console for logging confirmation
4. Verify transaction on Somnia explorer
5. Check game history shows correct data

### Verification

```javascript
// Get player's game count
const count = await getGameCount();
console.log('Total games:', count);

// Get game history
const history = await getHistory(10);
console.log('Recent games:', history);

// Get contract stats
const stats = await getStats();
console.log('Contract stats:', stats);
```

## Contract Information

**Contract Address**: `0x649A1a3cf745d60C98C12f3c404E09bdBb4151db`

**Network**: Somnia Testnet (Chain ID: 50312)

**Explorer**: https://shannon-explorer.somnia.network

**Contract Functions**:
- `logGameResult()` - Log a game result
- `getGameLog()` - Get specific game log
- `getPlayerHistory()` - Get player's history
- `getPlayerGameCount()` - Get player's game count
- `getStats()` - Get contract statistics

## Troubleshooting

### Issue: "Game Logger contract not initialized"
**Solution**: Ensure wallet is connected and provider is available.

### Issue: "Signer required to log game results"
**Solution**: Ensure wallet is connected and user has approved the connection.

### Issue: "Invalid game type"
**Solution**: Use one of: 'ROULETTE', 'MINES', 'WHEEL', 'PLINKO' (uppercase).

### Issue: "Transaction failed"
**Solution**: Check wallet has sufficient STT for gas fees.

### Issue: "Failed to get game history"
**Solution**: Ensure contract address is correct and network is Somnia Testnet.

## Best Practices

1. **Non-Blocking**: Always log games asynchronously without blocking game flow
2. **Error Handling**: Handle logging failures gracefully
3. **User Feedback**: Show logging status in UI
4. **Transaction Links**: Provide both Somnia and Arbitrum explorer links
5. **Gas Optimization**: Batch multiple operations when possible
6. **Event Subscription**: Use events for real-time updates

## Future Enhancements

- [ ] Batch logging for multiple games
- [ ] Off-chain caching for faster history retrieval
- [ ] Advanced filtering and search
- [ ] Game result verification tools
- [ ] Analytics dashboard
- [ ] Leaderboard integration

## Support

For issues or questions:
1. Check console logs for detailed error messages
2. Verify contract address and network configuration
3. Ensure wallet is connected to Somnia Testnet
4. Check Somnia explorer for transaction status

## Related Documentation

- [Somnia Testnet Configuration](../config/somniaTestnetConfig.js)
- [Contract Configuration](../config/contracts.js)
- [Pyth Entropy Service](./PythEntropyService.js)
- [Game History Service](./GameHistoryService.js)
