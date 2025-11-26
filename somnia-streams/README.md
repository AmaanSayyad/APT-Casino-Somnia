# Somnia Streams Integration - SomniaPredict

## Implementation Overview

SomniaPredict uses Somnia blockchain for real-time event monitoring through viem's public client. The system polls contract events and provides live updates across all connected users.

## Architecture

### Provider Setup
```typescript
// src/providers/somnia-streams-provider.tsx
const publicClient = createPublicClient({
  chain: somniaTestnet,
  transport: http(process.env.NEXT_PUBLIC_SOMNIA_RPC_URL)
});
```

The provider wraps the app and exposes `publicClient` and `isConnected` via React Context.

### Event Monitoring Hook
```typescript
// src/hooks/use-market-stream.ts
export function useMarketStream(options: UseMarketStreamOptions)
```

**Features:**
- Manual polling every 3 seconds for BetPlaced events
- watchContractEvent for MarketResolved and MarketCreated
- Global deduplication using Set to prevent duplicate notifications
- Fetches market details from contract for rich notifications
- Maintains last 50 events in local state

**Event Flow:**
1. Poll blockchain for new events (getContractEvents)
2. Check global Set for duplicates
3. Fetch market data if needed (getMarket)
4. Show toast notification with market title
5. Trigger callbacks (onBetPlaced, onMarketResolved, etc.)
6. Update local state

### Deduplication Strategy
```typescript
const globalProcessedEventIds = new Set<string>();
const eventId = `${blockNumber}-${logIndex}-${eventType}-${marketId}-${user}`;
```

Events are uniquely identified by block number, log index, and event data. This prevents duplicate notifications when multiple components use the hook.

### Data Sources

**Blockchain (via viem):**
- Market data (getMarket)
- Contract events (getContractEvents, watchContractEvent)
- Real-time monitoring

**Supabase:**
- Bet activity history (bet_activities table)
- Statistics (total bets, unique traders)
- Comments

### Statistics Hook
```typescript
// src/hooks/use-bet-stats.ts
export function useBetStats()
```

Fetches bet statistics from Supabase instead of blockchain for better performance:
- Total bet count via SQL COUNT
- Unique traders via DISTINCT user_address
- Auto-refresh every 30 seconds

## Usage Example

```typescript
// In a component
const { events, isStreaming, loadHistory } = useMarketStream({
  marketId: '1',
  onBetPlaced: (data) => {
    console.log('New bet:', data);
    refetchMarketData();
  }
});
```

## Performance Characteristics

- **Polling interval:** 3 seconds
- **Event detection delay:** 3-5 seconds across users
- **History loading:** Chunks of 1000 blocks
- **Deduplication:** O(1) Set lookup
- **Statistics:** Cached in Supabase, 30s refresh

## Key Files

- `src/providers/somnia-streams-provider.tsx` - Context provider
- `src/hooks/use-market-stream.ts` - Event monitoring
- `src/hooks/use-bet-stats.ts` - Statistics from Supabase
- `src/components/market/live-activity-feed.tsx` - UI component