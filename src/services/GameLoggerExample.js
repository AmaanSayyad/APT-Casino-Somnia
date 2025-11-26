/**
 * Example: How to integrate Somnia Game Logger in game pages
 * 
 * This file demonstrates the integration pattern for logging game results
 * to Somnia Testnet blockchain.
 */

// ============================================================================
// EXAMPLE 1: Using the React Hook (Recommended for React components)
// ============================================================================

/*
import { useSomniaGameLogger } from '@/hooks/useSomniaGameLogger';

function RouletteGame() {
  const { logGame, isLogging, lastLogTxHash, getExplorerUrl } = useSomniaGameLogger();
  
  const handleGameComplete = async (gameResult) => {
    // After game completes and you have the result
    const txHash = await logGame({
      gameType: 'ROULETTE',
      betAmount: gameResult.betAmount,  // in STT (e.g., "0.1")
      result: {
        winningNumber: gameResult.winningNumber,
        bets: gameResult.bets,
        // ... other result data
      },
      payout: gameResult.totalPayout,  // in STT (e.g., "0.5")
      entropyProof: {
        requestId: gameResult.entropyProof?.requestId,
        transactionHash: gameResult.entropyProof?.transactionHash
      }
    });
    
    if (txHash) {
      console.log('Game logged to Somnia:', getExplorerUrl(txHash));
      // Update UI to show transaction link
    }
  };
  
  return (
    // Your game UI
    <div>
      {isLogging && <p>Logging game result...</p>}
      {lastLogTxHash && (
        <a href={getExplorerUrl(lastLogTxHash)} target="_blank">
          View on Somnia Explorer
        </a>
      )}
    </div>
  );
}
*/

// ============================================================================
// EXAMPLE 2: Using the Service Directly (For non-React code)
// ============================================================================

/*
import { logGameToSomnia } from '@/services/GameLoggerIntegration';
import { ethers } from 'ethers';

async function logGameResult(gameData) {
  // Get provider and signer from your wallet connection
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const playerAddress = await signer.getAddress();
  
  const txHash = await logGameToSomnia({
    gameType: 'MINES',
    playerAddress,
    betAmount: '0.05',  // in STT
    result: {
      minePositions: [1, 5, 12, 18, 23],
      revealedPositions: [0, 2, 3],
      hitMine: false,
      // ... other result data
    },
    payout: '0.15',  // in STT
    entropyProof: {
      requestId: '0x123...',
      transactionHash: '0xabc...'
    },
    provider,
    signer
  });
  
  return txHash;
}
*/

// ============================================================================
// EXAMPLE 3: Integration in Existing Game Flow
// ============================================================================

/*
// In your game page (e.g., src/app/game/roulette/page.jsx)

import { useSomniaGameLogger } from '@/hooks/useSomniaGameLogger';

export default function RoulettePage() {
  const { logGame } = useSomniaGameLogger();
  
  // ... existing game state and logic
  
  const handleBetSubmit = async () => {
    // ... existing bet logic
    
    // After Pyth Entropy generates randomness and game completes
    pythEntropyService.generateRandom('ROULETTE', config).then(entropyResult => {
      // ... process game result
      
      const gameResult = {
        winningNumber,
        totalPayout,
        betAmount: totalBetAmount
      };
      
      // Log to Somnia (fire-and-forget, don't block game flow)
      logGame({
        gameType: 'ROULETTE',
        betAmount: totalBetAmount.toString(),
        result: {
          winningNumber,
          bets: allBets,
          winningBets,
          losingBets
        },
        payout: totalPayout.toString(),
        entropyProof: {
          requestId: entropyResult.entropyProof.requestId,
          transactionHash: entropyResult.entropyProof.transactionHash
        }
      }).then(txHash => {
        if (txHash) {
          console.log('✅ Game logged to Somnia:', txHash);
          // Optionally update betting history with Somnia tx hash
          setBettingHistory(prev => {
            const updated = [...prev];
            if (updated[0]) {
              updated[0].somniaTxHash = txHash;
            }
            return updated;
          });
        }
      }).catch(err => {
        console.error('Failed to log to Somnia:', err);
        // Don't break game flow if logging fails
      });
    });
  };
  
  return (
    // ... your game UI
  );
}
*/

// ============================================================================
// EXAMPLE 4: Displaying Game History with Somnia Links
// ============================================================================

/*
import { useSomniaGameLogger } from '@/hooks/useSomniaGameLogger';

function GameHistory() {
  const { getHistory, getExplorerUrl } = useSomniaGameLogger();
  const [history, setHistory] = useState([]);
  
  useEffect(() => {
    loadHistory();
  }, []);
  
  const loadHistory = async () => {
    const games = await getHistory(50); // Get last 50 games
    setHistory(games);
  };
  
  return (
    <div>
      <h2>Game History</h2>
      {history.map(game => (
        <div key={game.logId}>
          <p>Game: {game.gameType}</p>
          <p>Bet: {game.betAmount} STT</p>
          <p>Payout: {game.payout} STT</p>
          <p>Time: {new Date(game.timestamp * 1000).toLocaleString()}</p>
          <a href={game.explorerUrl} target="_blank">
            View on Somnia Explorer
          </a>
          {game.entropyTxHash && (
            <a href={`https://sepolia.arbiscan.io/tx/${game.entropyTxHash}`} target="_blank">
              View Entropy on Arbitrum
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
*/

// ============================================================================
// EXAMPLE 5: Real-time Event Subscription
// ============================================================================

/*
import { useSomniaGameLogger } from '@/hooks/useSomniaGameLogger';

function GlobalGameFeed() {
  const { subscribeToEvents } = useSomniaGameLogger();
  const [recentGames, setRecentGames] = useState([]);
  
  useEffect(() => {
    // Subscribe to all game result events
    const unsubscribe = subscribeToEvents((event) => {
      console.log('New game logged:', event);
      setRecentGames(prev => [event, ...prev].slice(0, 20));
    });
    
    return () => unsubscribe();
  }, [subscribeToEvents]);
  
  return (
    <div>
      <h2>Live Game Feed</h2>
      {recentGames.map(game => (
        <div key={game.transactionHash}>
          <p>{game.player} played {game.gameType}</p>
          <p>Bet: {game.betAmount} STT → Payout: {game.payout} STT</p>
        </div>
      ))}
    </div>
  );
}
*/

// ============================================================================
// INTEGRATION CHECKLIST
// ============================================================================

/*
To integrate Somnia Game Logger in your game:

1. Import the hook:
   import { useSomniaGameLogger } from '@/hooks/useSomniaGameLogger';

2. Use the hook in your component:
   const { logGame, isLogging, lastLogTxHash, getExplorerUrl } = useSomniaGameLogger();

3. After game completes, call logGame():
   - Pass gameType: 'ROULETTE' | 'MINES' | 'WHEEL' | 'PLINKO'
   - Pass betAmount as string (in STT)
   - Pass result object with game-specific data
   - Pass payout as string (in STT)
   - Pass entropyProof with requestId and transactionHash from Pyth Entropy

4. Handle the result:
   - txHash will be null if logging fails (don't break game flow)
   - Use getExplorerUrl(txHash) to get Somnia explorer link
   - Optionally store txHash in game history for display

5. Display transaction links in game history:
   - Use getExplorerUrl(txHash) for Somnia transaction
   - Use Arbitrum explorer for entropy transaction

6. Test the integration:
   - Play a game and verify transaction appears on Somnia explorer
   - Check that game history shows correct data
   - Verify entropy proof links to Arbitrum Sepolia
*/

export default {
  // This file is for documentation only
  // See examples above for integration patterns
};
