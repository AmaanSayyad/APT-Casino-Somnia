# APT Casino - Somnia Testnet

A decentralized casino platform built on Somnia Testnet with Pyth Entropy for provably fair gaming and MetaMask Smart Accounts integration.

## 🎮 The Story Behind APT Casino

A few days ago, I was exploring transactions on Etherscan when I saw an advertisement for a popular centralized casino platform offering a 200% bonus on first deposits. I deposited 120 USDT and received 360 USDT in total balance in their custodial wallet.

When I started playing, I discovered I could only bet $1 per game and couldn't increase the amount. After contacting customer support, I learned I had been trapped by hidden "wager limits" tied to the bonus scheme. To withdraw my original deposit, I would need to play $12,300 worth of games!

In a desperate attempt to recover my funds, I played different games all night—roulette, mines, spin wheel—and lost everything.

This frustrating experience inspired APT Casino: a combination of GameFi, AI, and DeFi where users can enjoy casino games in a safe, secure, and transparent environment that doesn't scam its users.

## 🎯 The Problem

The traditional online gambling industry suffers from several issues:

- **Unfair Game Outcomes**: 99% of platforms manipulate game results, leading to unfair play
- **High Fees**: Exorbitant charges for deposits, withdrawals, and gameplay
- **Restrictive Withdrawal Policies**: Conditions that prevent users from accessing their funds
- **Misleading Bonus Schemes**: Trapping users with unrealistic wagering requirements
- **Lack of True Asset Ownership**: Centralized control over user funds
- **User Adoption Barriers**: Complexity of using wallets creates friction for web2 users
- **No Social Layer**: Lack of live streaming, community chat, and collaborative experiences

## 💡 Our Solution

APT Casino addresses these problems by offering:

- **Provably Fair Gaming**: Powered by Pyth Entropy

![commit_and_reveal](https://github.com/user-attachments/assets/cbb150e8-7d22-4903-9729-8ad00c20f1d5)


- **Multiple Games**: Wheel, Roulette, Plinko, and Mines with verifiable outcomes
- **MetaMask Smart Accounts**: Enhanced wallet experience with batch transactions
- **STT Token**: Native currency for Somnia Testnet
- **Flexible Withdrawal**: Unrestricted access to funds
- **Transparent Bonuses**: Clear terms without hidden traps
- **True Asset Ownership**: Decentralized asset management
- **Live Streaming Integration**: Built with Livepeer, enabling real-time game streams and tournaments
- **On-Chain Chat**: Supabase + Socket.IO with wallet-signed messages for verifiable player communication
- **Gasless Gaming Experience**: Treasury-sponsored transactions for seamless web2-like experience

## 🌟 Key Features

### 1. Smart Account Integration

- **Batch Transactions**: Multiple bets in one transaction
- **Delegated Gaming**: Authorize strategies to play on your behalf
- **Lower Gas Costs**: Optimized for frequent players
- **Enhanced Security**: Smart contract-based accounts

### 2. Provably Fair Gaming
<img width="1536" height="864" alt="355232251-6880e1cb-769c-4272-8b66-686a90abf3be" src="https://github.com/user-attachments/assets/98cefec7-18d6-4ede-92a9-0a237686f2cf" />

- **Pyth Entropy**: Cryptographically secure randomness
- **On-Chain Verification**: All game outcomes verifiable
- **Transparent Mechanics**: Open-source game logic

### 3. Multi-Chain Architecture

- **Gaming Network**: Somnia Testnet (Chain ID: 10143)
- **Entropy Network**: Arbitrum Sepolia (Chain ID: 421614)

### 4. Game Selection

- **Roulette**: European roulette with Smart Account batch betting
- **Mines**: Strategic mine-sweeping with delegated pattern betting
- **Plinko**: Physics-based ball drop with auto-betting features
- **Wheel**: Classic spinning wheel with multiple risk levels

### 5. Social Features

- **Live Streaming**: Integrated with Livepeer for real-time game streams and tournaments
- **On-Chain Chat**: Real-time communication with wallet-signed messages
- **Player Profiles**: NFT-based profiles with gaming history and achievements
- **Community Events**: Tournaments and collaborative gaming experiences

### 6. Web2 User Experience

- **Gasless Transactions**: Treasury-sponsored transactions eliminate gas fees
- **Seamless Onboarding**: Simplified wallet experience for web2 users
- **Familiar Interface**: Web2-like experience with web3 benefits

## 🚀 Getting Started

1. **Connect Wallet**: Connect your MetaMask wallet to Somnia Testnet
2. **Get Tokens**: Get STT tokens from the Somnia Testnet faucet
3. **Deposit**: Deposit STT to your treasury balance
4. **Play**: Start playing provably fair games!

### Network Configuration

Add Somnia Testnet to MetaMask:
- **Network Name**: Somnia Testnet
- **RPC URL**: `https://dream-rpc.somnia.network`
- **Chain ID**: `10143`
- **Currency Symbol**: `STT`
- **Block Explorer**: `https://shannon-explorer.somnia.network`

### Quick Setup

```bash
# Clone the repository
git clone <repository-url>
cd apt-casino

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run development server
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 🔷 Smart Account Features

APT Casino leverages MetaMask Smart Accounts for an enhanced gaming experience:

### Delegation Benefits:
- **Auto-Betting Strategies**: Delegate betting permissions to strategy contracts
- **Batch Gaming Sessions**: Play multiple games in a single transaction
- **Session-Based Gaming**: Set time-limited permissions for continuous play
- **Gasless Gaming**: Sponsored transactions for smoother experience

### Usage:
```javascript
// Create a delegation for auto-betting
const createAutoBetDelegation = async (maxBet, timeLimit, gameTypes) => {
  return delegationRegistry.createDelegation({
    delegatee: strategyContract,
    constraints: {
      maxAmount: maxBet,
      validUntil: timeLimit,
      allowedGames: gameTypes
    }
  });
};

// Execute batch bets through delegation
const executeBatchBets = async (bets) => {
  return delegationRegistry.executeDelegatedTransactions({
    delegationId,
    transactions: bets.map(bet => ({
      to: bet.gameContract,
      data: bet.data,
      value: bet.amount
    }))
  });
};
```

## 🏗 System Architecture Overview
<img width="1540" height="695" alt="Screenshot 2025-10-22 at 11 11 56 PM" src="https://github.com/user-attachments/assets/f8d4e99d-d31b-4a81-b924-5fc1d8dade78" />

```mermaid
graph TB
    subgraph Frontend["Frontend Layer"]
        A[Next.js App] --> B[React Components]
        B --> C[Three.js Games]
        B --> D[Material-UI]
        B --> E[RainbowKit + MetaMask Smart Accounts]
        E --> SA[Smart Account Detection]
        B --> LS[Livepeer Streaming]
        B --> CC[Community Chat]
    end
    
    subgraph State["State Management"]
        F[Redux Store] --> G[React Query]
        G --> H[Local State]
        H --> SAH[Smart Account Hook]
    end
    
    subgraph API["API Layer"]
        I[Next.js API Routes] --> J[Pyth Entropy Endpoints]
        I --> K[Deposit/Withdraw MON]
        I --> L[Game Logic]
        I --> SAA[Smart Account API]
        I --> SC[Socket.IO Chat]
        I --> LP[Livepeer API]
    end
    
    subgraph Gaming["Gaming Network - Somnia Testnet"]
        MT[Somnia Testnet] --> STT[STT Token]
        MT --> DEP[Deposits/Withdrawals]
        MT --> SA_BATCH[Batch Transactions]
        MT --> GAS[Gasless Transactions]
    end
    
    subgraph Entropy["Entropy Network - Arbitrum Sepolia"]
        AS[Arbitrum Sepolia] --> N[CasinoEntropyConsumer]
        N --> O[Pyth Entropy]
        O --> P[Pyth Network]
    end
    
    subgraph Data["Data Layer"]
        Q[PostgreSQL] --> R[User Data]
        Q --> CH[Chat History]
        Q --> PF[Player Profiles]
        S[Redis Cache] --> T[Session Data]
        S --> U[Game State]
        S --> SAC[Smart Account Cache]
        S --> LV[Live Streams]
    end
    
    subgraph Social["Social Layer"]
        LP[Livepeer] --> ST[Streaming]
        SB[Supabase] --> RT[Real-time Chat]
        SIO[Socket.IO] --> MS[Message Signing]
    end
    
    A --> F
    B --> I
    I --> MT
    I --> AS
    I --> Q
    I --> S
    N --> I
    SA --> SAA
    CC --> SC
    LS --> LP
    SC --> SB
    SC --> SIO
    LP --> ST
```

## 🔗 Wallet Connection & Smart Account Flow

```mermaid
flowchart TD
    A[User Clicks Connect] --> B{Wallet Available?}
    B -->|Yes| C[RainbowKit Modal]
    B -->|No| D[Install MetaMask Prompt]
    
    C --> E[Select Wallet Type]
    E --> F[MetaMask with Smart Accounts]
    E --> G[WalletConnect]
    E --> H[Coinbase Wallet]
    E --> I[Other Wallets]
    
    F --> K[Request Connection]
    G --> K
    H --> K
    I --> K
    
    K --> L{Network Check}
    L -->|Somnia Testnet| M[Connection Success]
    L -->|Wrong Network| N[Switch to Somnia Testnet]
    
    N --> O{User Approves?}
    O -->|Yes| M
    O -->|No| P[Connection Failed]
    
    M --> Q[Detect Account Type]
    Q --> R{Smart Account?}
    R -->|Yes| S[Enable Smart Features]
    R -->|No| T[Standard EOA Features]
    
    S --> U[Batch Transactions Available]
    S --> V[Enhanced Gaming Experience]
    T --> W[Standard Gaming Experience]
    
    U --> X[Update App State]
    V --> X
    W --> X
    X --> Y[Enable Game Features]
```

## 🔷 Smart Account Detection & Features

```mermaid
graph TB
    subgraph Detection["Account Detection"]
        A[Connected Wallet] --> B[Get Bytecode]
        B --> C{Has Contract Code?}
        C -->|Yes| D[Smart Account]
        C -->|No| E[EOA Account]
    end
    
    subgraph SmartFeatures["Smart Account Features"]
        D --> F[Batch Transactions]
        D --> G[Sponsored Transactions]
        D --> H[Session Keys]
        D --> I[Social Recovery]
    end
    
    subgraph CasinoFeatures["Casino Benefits"]
        F --> J[Multi-Bet in One TX]
        G --> K[Gasless Gaming]
        H --> L[Auto-Play Sessions]
        I --> M[Account Recovery]
    end
    
    subgraph EOAFeatures["EOA Features"]
        E --> N[Standard Transactions]
        E --> O[Manual Signing]
        N --> P[Single Bet per TX]
        O --> Q[Manual Confirmations]
    end
    
    subgraph UI["User Interface"]
        J --> R[Enhanced Game UI]
        K --> R
        L --> R
        P --> S[Standard Game UI]
        Q --> S
    end
```

## 🌐 Multi-Network Architecture (Somnia Testnet + Arbitrum)

```mermaid
graph TB
    subgraph User["User Layer"]
        U[User] --> W[MetaMask Wallet]
        W --> SA[Smart Account Detection]
    end
    
    subgraph Frontend["Frontend Application"]
        F[Next.js Casino] --> WC[Wallet Connection]
        WC --> NS[Network Switcher]
        NS --> GM[Game Manager]
    end
    
    subgraph Somnia TestnetNet["Somnia Testnet (Chain ID: 10143)"]
        MT[Somnia Testnet] --> STT[STT Token]
        STT --> DEP[Deposit Contract]
        STT --> WITH[Withdraw Contract]
        DEP --> TB[Treasury Balance]
        WITH --> TB
        
        subgraph SmartAccount["Smart Account Features"]
            BATCH[Batch Transactions]
            SPONSOR[Sponsored TX]
            SESSION[Session Keys]
        end
    end
    
    subgraph ArbitrumNet["Arbitrum Sepolia (Chain ID: 421614)"]
        AS[Arbitrum Sepolia] --> EC[Entropy Consumer]
        EC --> PE[Pyth Entropy Contract]
        PE --> PN[Pyth Network]
        
        subgraph EntropyFlow["Entropy Generation"]
            REQ[Request Entropy]
            GEN[Generate Random]
            PROOF[Cryptographic Proof]
        end
    end
    
    U --> F
    F --> MT
    F --> AS
    GM --> DEP
    GM --> EC
    SA --> BATCH
    REQ --> GEN
    GEN --> PROOF
    PROOF --> GM
```

## 🎲 Pyth Entropy Integration Architecture

```mermaid
graph LR
    subgraph Frontend["Frontend"]
        A[Game Component] --> B[Pyth Entropy Request]
    end
    
    subgraph Contract["Smart Contract"]
        C[CasinoEntropyConsumer] --> D[request]
        D --> E[Pyth Entropy Contract]
    end
    
    subgraph Pyth["Pyth Network"]
        F[Pyth Provider] --> G[Generate Entropy]
        G --> H[Entropy Proof]
    end
    
    subgraph Callback["Callback Flow"]
        I[entropyCallback] --> J[Update Game State]
        J --> K[Emit Events]
    end
    
    B --> C
    E --> F
    H --> I
    K --> A
```

## 🎮 Game Execution Flow (Smart Account Enhanced)

```mermaid
sequenceDiagram
    participant U as User
    participant SA as Smart Account
    participant UI as Game UI
    participant MT as Somnia Testnet
    participant API as API Route
    participant SC as Smart Contract (Arbitrum)
    participant PE as Pyth Entropy
    participant DB as Database
    participant LP as Livepeer
    
    U->>SA: Initiate Game Session
    SA->>UI: Check Account Type
    
    alt Smart Account
        UI->>SA: Enable Batch Features
        SA->>MT: Batch Bet Transactions
        MT->>UI: Confirm Batch
    else EOA Account
        UI->>MT: Single Bet Transaction
        MT->>UI: Confirm Single Bet
    end
    
    UI->>API: POST /api/generate-entropy
    API->>SC: request(userRandomNumber)
    SC->>PE: Request Entropy
    
    Note over PE: Generate Cryptographic Entropy
    
    PE->>SC: entropyCallback()
    SC->>API: Event: EntropyFulfilled
    API->>DB: Store Game Result
    
    alt Smart Account Batch
        API->>SA: Batch Results
        SA->>MT: Process Batch Payouts
        MT->>UI: Batch Payout Complete
    else Single Transaction
        API->>MT: Single Payout
        MT->>UI: Single Payout Complete
    end
    
    UI->>U: Display Outcome(s)
    
    opt Live Streaming Enabled
        U->>LP: Start Stream
        LP->>UI: Stream Available
        UI->>DB: Record Stream Data
    end
```

## 🎯 Smart Account Gaming Benefits

```mermaid
graph TB
    subgraph Traditional["Traditional EOA Gaming"]
        EOA[EOA Account] --> ST[Single Transactions]
        ST --> MF[Manual Confirmations]
        MF --> HG[Higher Gas Costs]
        HG --> SG[Slower Gaming]
    end
    
    subgraph SmartAccount["Smart Account Gaming"]
        SA[Smart Account] --> BT[Batch Transactions]
        SA --> SP[Sponsored Transactions]
        SA --> SK[Session Keys]
        SA --> SR[Social Recovery]
        
        BT --> MB[Multi-Bet in One TX]
        SP --> GL[Gasless Gaming]
        SK --> AP[Auto-Play Sessions]
        SR --> AS[Account Security]
    end
    
    subgraph CasinoGames["Casino Game Benefits"]
        MB --> PL[Plinko: Multi-Ball Drop]
        MB --> RT[Roulette: Multi-Number Bets]
        MB --> WH[Wheel: Continuous Play]
        MB --> MN[Mines: Pattern Betting]
        
        GL --> FP[Free Play Mode]
        AP --> ST_AUTO[Strategy Automation]
        AS --> RF[Risk-Free Recovery]
    end
    
    subgraph UserExperience["Enhanced UX"]
        PL --> FG[Faster Gaming]
        RT --> LG[Lower Costs]
        WH --> BG[Better Strategies]
        MN --> EG[Enhanced Security]
        
        FG --> HS[Higher Satisfaction]
        LG --> HS
        BG --> HS
        EG --> HS
    end
```

## 🔄 Smart Account Transaction Flow

```mermaid
sequenceDiagram
    participant U as User
    participant UI as Casino UI
    participant SA as Smart Account
    participant MT as Somnia Testnet
    participant AS as Arbitrum Sepolia
    participant PE as Pyth Entropy
    
    Note over U,PE: Smart Account Batch Gaming Session
    
    U->>UI: Select Multiple Games
    UI->>SA: Prepare Batch Transaction
    
    Note over SA,MT: Batch Transaction on Somnia Testnet
    SA->>MT: Batch Bet Transaction
    MT->>SA: Confirm All Bets
    
    Note over AS,PE: Entropy Generation on Arbitrum
    UI->>AS: Request Entropy for All Games
    AS->>PE: Generate Multiple Random Numbers
    PE->>AS: Return Entropy Proofs
    AS->>UI: All Game Results
    
    Note over SA,MT: Batch Payout on Somnia Testnet
    UI->>SA: Process Batch Payouts
    SA->>MT: Batch Payout Transaction
    MT->>SA: Confirm All Payouts
    
    SA->>UI: Update All Game States
    UI->>U: Display All Results
    
    Note over U,PE: Single transaction for multiple games!
```


## 🎯 Game Integration with Smart Accounts & Pyth Entropy

```mermaid
flowchart TD
    A[User Selects Game] --> B{Smart Account?}
    B -->|Yes| C[Enable Batch Features]
    B -->|No| D[Standard Gaming]
    
    C --> E[Prepare Multiple Bets]
    D --> F[Single Bet]
    
    E --> G[Batch Transaction]
    F --> H[Standard Transaction]
    
    G --> I[Pyth Entropy Request]
    H --> I
    
    I --> J[Generate Verifiable Random Numbers]
    J --> K[Process Game Outcomes]
    
    K --> L[Update Balances]
    L --> M[Display Results]
```

## 🔮 Future Roadmap

- **Mainnet Launch**: Deploying on mainnet for real-world use
- **Additional Games**: Expanding the game selection
- **Enhanced DeFi Features**: Staking, farming, yield strategies
- **Developer Platform**: Allowing third-party game development
- **Advanced Social Features**: Enhanced live streaming and chat capabilities
- **ROI Share Links**: Shareable proof-links for withdrawals that render dynamic cards on social platforms
- **Expanded Smart Account Features**: More delegation options
- **Tournament System**: Competitive gaming with leaderboards and prizes
- **Provably Fair**: All randomness verified on-chain via Pyth Entropy
- **Non-custodial**: Users maintain full control of their funds
- **Transparent**: All game logic and outcomes are verifiable

## 📡 Somnia Data Streams Integration

APT Casino leverages Somnia Data Streams for real-time game result notifications:

### Features
- **Real-time Notifications**: Instant updates when any player completes a game
- **Global Activity Feed**: See live gaming activity across the platform
- **WebSocket Subscriptions**: Efficient event streaming with automatic reconnection
- **On-Chain Verification**: All notifications linked to blockchain transactions

### How It Works

```mermaid
graph LR
    A[Game Completes] --> B[Log to Somnia]
    B --> C[Emit Event]
    C --> D[Data Streams]
    D --> E[All Clients]
    E --> F[Show Notification]
```

1. Player completes a game (Roulette, Mines, Wheel, or Plinko)
2. Game result is logged to Somnia Testnet blockchain
3. `GameResultLogged` event is emitted
4. Somnia Data Streams captures and broadcasts the event
5. All connected clients receive real-time notification
6. Notification displays game type, player, bet, and result

### Event Schema

```solidity
event GameResultLogged(
  address indexed player,
  string gameType,
  uint256 betAmount,
  uint256 payout,
  bytes32 entropyRequestId,
  uint256 timestamp
)
```

### Usage Example

```javascript
import { useSomniaStreams } from '@/hooks/useSomniaStreams';

function GameComponent() {
  const { subscribe, isConnected } = useSomniaStreams();
  
  useEffect(() => {
    const subscription = subscribe((notification) => {
      console.log('New game result:', notification);
      // Display notification to user
    });
    
    return () => subscription.unsubscribe();
  }, []);
}
```

For detailed integration guide, see [Somnia Streams Integration](./docs/SOMNIA_STREAMS_INTEGRATION.md).

## 🎮 Game Logger

All game results are permanently logged on Somnia Testnet blockchain:

### Features
- **Immutable Records**: All game outcomes stored on-chain
- **Verifiable History**: Transaction links for every game
- **Dual-Network Architecture**: Game logs on Somnia, entropy on Arbitrum
- **Automatic Logging**: Non-blocking, fire-and-forget logging

### Smart Contract

```solidity
contract SomniaGameLogger {
  function logGameResult(
    string memory gameType,
    uint256 betAmount,
    bytes memory resultData,
    uint256 payout,
    bytes32 entropyRequestId
  ) external returns (bytes32 logId);
}
```

### Integration

```javascript
import { useSomniaGameLogger } from '@/hooks/useSomniaGameLogger';

const { logGame, getExplorerUrl } = useSomniaGameLogger();

// After game completes
const txHash = await logGame({
  gameType: 'ROULETTE',
  betAmount: '1000000000000000000',
  result: gameResult,
  payout: '2000000000000000000',
  entropyProof: entropyResult.entropyProof
});

console.log('View on explorer:', getExplorerUrl(txHash));
```

For detailed integration guide, see [Game Logger Integration](./docs/GAME_LOGGER_INTEGRATION_GUIDE.md).

## 🚀 Deployment

### Prerequisites

- Node.js 18+ and npm
- MetaMask wallet with STT tokens
- Somnia Testnet RPC access

### Environment Variables

Create a `.env` file with the following:

```env
# Somnia Testnet Configuration
NEXT_PUBLIC_SOMNIA_RPC_URL=https://dream-rpc.somnia.network
NEXT_PUBLIC_SOMNIA_CHAIN_ID=10143
NEXT_PUBLIC_SOMNIA_EXPLORER_URL=https://shannon-explorer.somnia.network

# Arbitrum Sepolia (for Pyth Entropy)
NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc
NEXT_PUBLIC_ARBITRUM_SEPOLIA_CHAIN_ID=421614

# Contract Addresses (Somnia Testnet)
NEXT_PUBLIC_SOMNIA_TREASURY_ADDRESS=<your-treasury-address>
NEXT_PUBLIC_SOMNIA_GAME_LOGGER_ADDRESS=<your-game-logger-address>

# Contract Addresses (Arbitrum Sepolia)
NEXT_PUBLIC_PYTH_ENTROPY_ADDRESS=<pyth-entropy-address>
NEXT_PUBLIC_CASINO_ENTROPY_CONSUMER_ADDRESS=<your-entropy-consumer-address>

# Somnia Data Streams
NEXT_PUBLIC_SOMNIA_STREAMS_PROTOCOL_ADDRESS=0x6AB397FF662e42312c003175DCD76EfF69D048Fc
NEXT_PUBLIC_GAME_RESULT_EVENT_SCHEMA_ID=apt-casino-game-result-logged

# Private Keys (for deployment only, never commit!)
DEPLOYER_PRIVATE_KEY=<your-private-key>
```

### Smart Contract Deployment

```bash
# Deploy contracts to Somnia Testnet
npx hardhat run scripts/deploy-somnia-contracts.js --network somniaTestnet

# Verify deployment
node scripts/test-somnia-deployment.js
```

### Frontend Deployment

```bash
# Build the application
npm run build

# Deploy to Vercel
vercel deploy

# Or deploy to other platforms
npm run start
```

### Post-Deployment Steps

1. **Register Data Streams Schema**
   ```bash
   node scripts/register-game-result-schema.js
   ```

2. **Verify Schema Registration**
   ```bash
   node scripts/verify-schema-registration.js
   ```

3. **Test Game Logger**
   ```bash
   node scripts/verify-game-logger.js
   ```

4. **Test Data Streams**
   ```bash
   node scripts/test-somnia-streams.js
   ```

5. **Test All Games**
   ```bash
   node scripts/test-entropy-all-games.js
   ```

For detailed deployment guide, see [Deployment Summary](./deployments/SOMNIA_DEPLOYMENT_SUMMARY.md).

## 📚 Documentation

### Core Documentation
- [Somnia Streams Integration](./docs/SOMNIA_STREAMS_INTEGRATION.md) - Real-time event streaming
- [Game Logger Integration](./docs/GAME_LOGGER_INTEGRATION_GUIDE.md) - On-chain game logging
- [API Network Architecture](./docs/API_NETWORK_ARCHITECTURE.md) - Backend architecture
- [Global Notification System](./docs/GLOBAL_NOTIFICATION_SYSTEM.md) - Real-time notifications

### Quick Start Guides
- [Somnia Streams Quick Start](./docs/SOMNIA_STREAMS_QUICK_START.md)
- [Migration Guide](./MIGRATION_GUIDE.md) - Migrating from Monad to Somnia

### Service Documentation
- [Somnia Streams Service](./src/services/SOMNIA_STREAMS_SERVICE_README.md)
- [Game Logger Service](./src/services/GAME_LOGGER_README.md)

### Deployment Reports
- [Somnia Deployment Summary](./deployments/SOMNIA_DEPLOYMENT_SUMMARY.md)
- [Task Completion Reports](./deployments/)

## 🔧 Development

### Running Tests

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- SomniaGameLogger
npm test -- SomniaStreamsService

# Run with coverage
npm test -- --coverage
```

### Verification Scripts

```bash
# Verify Pyth Entropy (Arbitrum Sepolia)
node scripts/verify-pyth-entropy.js

# Verify Game Logger (Somnia Testnet)
node scripts/verify-game-logger.js

# Verify Data Streams
node scripts/test-somnia-streams.js

# Verify all games
node scripts/test-entropy-all-games.js

# Verify API routes
node scripts/verify-api-routes.js

# Verify game history
node scripts/verify-game-history-service.js
```

### Project Structure

```
apt-casino/
├── contracts/              # Smart contracts
│   ├── SomniaTreasury.sol
│   └── SomniaGameLogger.sol
├── src/
│   ├── app/               # Next.js pages
│   ├── components/        # React components
│   ├── config/            # Network and contract configs
│   ├── hooks/             # Custom React hooks
│   ├── services/          # Business logic services
│   └── utils/             # Utility functions
├── scripts/               # Deployment and verification scripts
├── docs/                  # Documentation
├── deployments/           # Deployment artifacts
└── somnia-streams/        # Somnia Streams SDK
```

## 🔗 Links

- **Live Demo**: [https://apt-casino-somnia-testnet.vercel.app](https://apt-casino-somnia-testnet.vercel.app)
- **Pitch Deck**: [https://www.figma.com/deck/VKHErF5fQr9JVOvjn9VWg3/APT-Casino-Somnia Testnet?node-id=1-1812&p=f&t=ayEzRDoZZrC2bNfR-1&scaling=min-zoom&content-scaling=fixed&page-id=0%3A1](https://www.figma.com/deck/VKHErF5fQr9JVOvjn9VWg3/APT-Casino-Somnia Testnet?node-id=1-1812&p=f&t=ayEzRDoZZrC2bNfR-1&scaling=min-zoom&content-scaling=fixed&page-id=0%3A1)
- **Somnia Testnet Explorer**: [https://shannon-explorer.somnia.network](https://shannon-explorer.somnia.network)
- **Arbitrum Sepolia Explorer**: [https://sepolia.arbiscan.io](https://sepolia.arbiscan.io)
