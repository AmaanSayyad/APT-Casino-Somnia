# APT Casino Somnia - Mermaid Architecture Diagrams

## 🏗️ System Architecture Overview

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
        I --> K[Deposit/Withdraw STT]
        I --> L[Game Logic]
        I --> SAA[Smart Account API]
        I --> SC[Socket.IO Chat]
        I --> LP[Livepeer API]
    end
    
    subgraph Gaming["Gaming Network - Somnia Testnet"]
        ST[Somnia Testnet] --> STT[STT Token]
        ST --> DEP[Treasury Deposits]
        ST --> SA_BATCH[Batch Transactions]
        ST --> GL[Game Logger Contract]
    end
    
    subgraph DataStreams["Somnia Data Streams"]
        GL --> SDS[SDS Protocol]
        SDS --> WS[WebSocket Subscriptions]
        WS --> RT[Real-time Notifications]
    end
    
    subgraph Entropy["Entropy Network - Arbitrum Sepolia"]
        AS[Arbitrum Sepolia] --> N[CasinoEntropyConsumer]
        N --> O[Pyth Entropy]
        O --> P[Pyth Network]
    end
    
    subgraph Data["Data Layer"]
        Q[PostgreSQL] --> R[User Data]
        Q --> CH[Chat History]
        S[Redis Cache] --> T[Session Data]
        S --> U[Game State]
        S --> SAC[Smart Account Cache]
    end
    
    A --> F
    B --> I
    I --> ST
    I --> AS
    I --> Q
    I --> S
    N --> I
    SA --> SAA
    RT --> B
```

## 🔄 Application Bootstrap Flow

```mermaid
sequenceDiagram
    participant U as User
    participant B as Browser
    participant N as Next.js
    participant P as Providers
    participant W as Wagmi
    participant R as RainbowKit
    participant SDS as Somnia Data Streams
    
    U->>B: Access Application
    B->>N: Load App Router
    N->>P: Initialize Providers
    P->>W: Setup Wagmi Config
    W->>R: Initialize RainbowKit
    R->>P: Wallet UI Ready
    P->>SDS: Initialize Data Streams
    SDS->>P: WebSocket Connected
    P->>N: Providers Ready
    N->>B: Render Application
    B->>U: Display UI
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
    Y --> Z[Subscribe to Data Streams]
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

## 🌐 Multi-Network Architecture (Somnia + Arbitrum)

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
    
    subgraph SomniaNet["Somnia Testnet (Chain ID: 50312)"]
        ST[Somnia Testnet] --> STT[STT Token]
        STT --> DEP[Treasury Contract]
        STT --> WITH[Withdraw Contract]
        DEP --> TB[Treasury Balance]
        WITH --> TB
        
        subgraph GameLogging["Game Logging"]
            GL[SomniaGameLogger]
            GL --> EVENT[GameResultLogged Event]
        end
        
        subgraph SmartAccount["Smart Account Features"]
            BATCH[Batch Transactions]
            SPONSOR[Sponsored TX]
            SESSION[Session Keys]
        end
    end
    
    subgraph SomniaStreams["Somnia Data Streams"]
        EVENT --> SDS[SDS Protocol]
        SDS --> WS[WebSocket]
        WS --> BROADCAST[Real-time Broadcast]
        BROADCAST --> CLIENTS[All Connected Clients]
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
    F --> ST
    F --> AS
    GM --> DEP
    GM --> EC
    SA --> BATCH
    REQ --> GEN
    GEN --> PROOF
    PROOF --> GM
    GM --> GL
```

## 📡 Somnia Data Streams Architecture

```mermaid
graph TB
    subgraph GameExecution["Game Execution"]
        A[Player Plays Game] --> B[Entropy Generated]
        B --> C[Game Result Calculated]
        C --> D[Backend API Call]
    end
    
    subgraph SomniaTestnet["Somnia Testnet"]
        D --> E[Treasury Signs Transaction]
        E --> F[GameLogger Contract]
        F --> G[GameResultLogged Event]
    end
    
    subgraph SomniaDataStreams["Somnia Data Streams Protocol"]
        G --> H[SDS Protocol Contract]
        H --> I[Event Schema Registry]
        I --> J[WebSocket / HTTP Polling]
    end
    
    subgraph ClientApps["Client Applications"]
        J --> K[All Connected Browsers]
        K --> L[GlobalNotificationSystem]
        L --> M[Real-time UI Updates]
    end
```

## 🔄 Somnia Data Streams Event Flow

```mermaid
sequenceDiagram
    participant Player
    participant Game
    participant API
    participant Treasury
    participant GameLogger
    participant SDS as Somnia Data Streams
    participant AllClients

    Player->>Game: Complete Game
    Game->>API: POST /api/log-game
    API->>Treasury: Sign with Private Key
    Treasury->>GameLogger: logGameResult()
    GameLogger->>GameLogger: Store Game Data
    GameLogger->>SDS: Emit GameResultLogged Event
    
    Note over SDS: Event captured by SDS Protocol
    
    SDS->>AllClients: Broadcast Event (Real-time < 1s)
    AllClients->>AllClients: Show Notification Instantly
    
    Note over AllClients: All users see live activity!
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

## 🎮 Game Execution Flow with Data Streams

```mermaid
sequenceDiagram
    participant U as User
    participant SA as Smart Account
    participant UI as Game UI
    participant ST as Somnia Testnet
    participant API as API Route
    participant SC as Smart Contract (Arbitrum)
    participant PE as Pyth Entropy
    participant GL as Game Logger
    participant SDS as Somnia Data Streams
    participant AC as All Clients
    
    U->>SA: Initiate Game Session
    SA->>UI: Check Account Type
    
    alt Smart Account
        UI->>SA: Enable Batch Features
        SA->>ST: Batch Bet Transactions
        ST->>UI: Confirm Batch
    else EOA Account
        UI->>ST: Single Bet Transaction
        ST->>UI: Confirm Single Bet
    end
    
    UI->>API: POST /api/generate-entropy
    API->>SC: request(userRandomNumber)
    SC->>PE: Request Entropy
    
    Note over PE: Generate Cryptographic Entropy
    
    PE->>SC: entropyCallback()
    SC->>API: Event: EntropyFulfilled
    
    API->>GL: logGameResult()
    GL->>SDS: Emit GameResultLogged
    SDS->>AC: Real-time Broadcast
    
    alt Smart Account Batch
        API->>SA: Batch Results
        SA->>ST: Process Batch Payouts
        ST->>UI: Batch Payout Complete
    else Single Transaction
        API->>ST: Single Payout
        ST->>UI: Single Payout Complete
    end
    
    UI->>U: Display Outcome(s)
    AC->>AC: Show Notification to All Players
```

## 🏗️ Smart Contract Deployment Flow

```mermaid
flowchart TD
    A[Environment Setup] --> B[Load .env.local]
    B --> C[Hardhat Compilation]
    C --> D[Deploy Script]
    
    D --> E{Deploy to Somnia?}
    E -->|Yes| F[Deploy SomniaTreasury]
    F --> G[Deploy SomniaGameLogger]
    G --> H[Register SDS Schema]
    
    D --> I{Deploy to Arbitrum?}
    I -->|Yes| J[Configure Pyth Entropy]
    J --> K[Deploy CasinoEntropyConsumer]
    K --> L[Set Treasury Address]
    
    H --> M[Verify Contracts on Explorer]
    L --> M
    M --> N[Save Deployment Info]
    
    N --> O[Test Functions]
    O --> P{All Tests Pass?}
    P -->|Yes| Q[Deployment Complete]
    P -->|No| R[Debug & Retry]
```

## 🎯 Game-Specific Flows

### Mines Game Flow
```mermaid
stateDiagram-v2
    [*] --> GridSetup
    GridSetup --> BetPlacement
    BetPlacement --> EntropyRequest
    EntropyRequest --> MineGeneration
    MineGeneration --> GameActive
    
    GameActive --> TileClick
    TileClick --> SafeTile: Safe
    TileClick --> MineTile: Mine Hit
    
    SafeTile --> ContinueGame: Continue
    SafeTile --> CashOut: Cash Out
    
    ContinueGame --> GameActive
    CashOut --> LogToSDS
    MineTile --> LogToSDS
    
    LogToSDS --> GameEnd
    GameEnd --> [*]
```

### Plinko Game Flow
```mermaid
graph TD
    A[Drop Ball] --> B[Physics Engine]
    B --> C[Pyth Entropy]
    C --> D[Peg Collisions]
    D --> E[Ball Path Calculation]
    E --> F[Multiplier Zone]
    F --> G[Payout Calculation]
    G --> H[Log to SDS]
    
    subgraph Physics["Physics Simulation"]
        I[Matter.js] --> J[Gravity]
        J --> K[Collision Detection]
        K --> L[Bounce Physics]
    end
    
    subgraph Visual["Visual Rendering"]
        M[Three.js] --> N[3D Ball]
        N --> O[Peg Animation]
        O --> P[Trail Effects]
    end
    
    subgraph Broadcast["Real-time Broadcast"]
        H --> Q[Somnia Data Streams]
        Q --> R[All Connected Clients]
    end
    
    B --> I
    E --> M
```

### Roulette Game Flow
```mermaid
flowchart LR
    A[Place Bets] --> B[Multiple Bet Types]
    B --> C[Red/Black]
    B --> D[Odd/Even]
    B --> E[Numbers]
    B --> F[Columns/Dozens]
    
    C --> G[Spin Wheel]
    D --> G
    E --> G
    F --> G
    
    G --> H[Pyth Entropy Random 0-36]
    H --> I[Determine Winners]
    I --> J[Calculate Payouts]
    J --> K[Update Balances]
    K --> L[Log to SDS]
    L --> M[Broadcast to All Clients]
```

## 🔐 Security & Access Control

```mermaid
graph TB
    subgraph Access["Access Control Layers"]
        A[Public Functions] --> B[User Interface]
        C[Treasury Functions] --> D[Game Operations]
        E[Owner Functions] --> F[Admin Operations]
    end
    
    subgraph SomniaContract["Somnia Testnet Contracts"]
        G[SomniaTreasury] --> H[deposit/withdraw]
        I[SomniaGameLogger] --> J[logGameResult]
        J --> K[onlyAuthorized Modifier]
    end
    
    subgraph ArbitrumContract["Arbitrum Contracts"]
        L[onlyTreasury Modifier] --> M[request]
        N[onlyOwner Modifier] --> O[updateTreasury]
        N --> P[updateEntropyConfig]
        N --> Q[withdrawFees]
    end
    
    subgraph Frontend["Frontend Security"]
        R[Wallet Verification] --> S[Network Validation]
        S --> T[Transaction Signing]
        T --> U[Gas Estimation]
    end
    
    D --> G
    D --> I
    F --> N
    B --> R
```

## 📊 Data Flow Architecture

```mermaid
graph LR
    subgraph Actions["User Actions"]
        A[Connect Wallet] --> B[Select Game]
        B --> C[Place Bet]
        C --> D[Game Interaction]
    end
    
    subgraph State["State Management"]
        E[Redux Store] --> F[Global State]
        G[React Query] --> H[Server State]
        I[Local State] --> J[Component State]
    end
    
    subgraph API["API Layer"]
        K[Next.js Routes] --> L[Pyth Entropy Endpoints]
        K --> M[Game Logic]
        K --> N[User Management]
    end
    
    subgraph Blockchain["Blockchain Layer"]
        O[Somnia Testnet] --> P[Treasury]
        O --> Q[Game Logger]
        R[Arbitrum Sepolia] --> S[Entropy Consumer]
    end
    
    subgraph Streaming["Somnia Data Streams"]
        Q --> T[SDS Protocol]
        T --> U[WebSocket Broadcast]
        U --> V[All Clients]
    end
    
    D --> E
    E --> K
    K --> O
    K --> R
    V --> E
```

## 🔄 Request-Response Cycle with Data Streams

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API
    participant ST as Somnia Testnet
    participant AS as Arbitrum Sepolia
    participant PE as Pyth Entropy
    participant SDS as Somnia Data Streams
    participant AC as All Clients
    
    U->>F: Game Action
    F->>A: API Request
    A->>AS: Request Entropy
    AS->>PE: Generate Random
    
    Note over PE: Generate Entropy
    
    PE->>AS: entropyCallback
    AS->>A: Entropy Result
    A->>ST: Log Game Result
    ST->>SDS: Emit Event
    
    par Broadcast to All
        SDS->>AC: Real-time Notification
    and Response to User
        A->>F: Response
        F->>U: Update UI
    end
```

## 🔧 Development Workflow

```mermaid
flowchart TD
    A[Local Development] --> B[Hot Reload]
    B --> C[Component Changes]
    C --> D[Contract Changes]
    
    D --> E[Hardhat Compile]
    E --> F[Local Testing]
    F --> G{Tests Pass?}
    
    G -->|No| H[Fix Issues]
    H --> E
    G -->|Yes| I[Commit Changes]
    
    I --> J[Push to GitHub]
    J --> K[CI/CD Pipeline]
    K --> L[Automated Tests]
    
    L --> M{All Tests Pass?}
    M -->|No| N[Fix & Retry]
    M -->|Yes| O[Deploy to Staging]
    
    O --> P[Test SDS Integration]
    P --> Q[Manual Testing]
    Q --> R{Ready for Prod?}
    R -->|No| S[More Changes]
    R -->|Yes| T[Production Deploy]
    
    S --> A
    N --> A
```

## 📈 Performance Monitoring

```mermaid
graph LR
    subgraph Frontend["Frontend Metrics"]
        A[Page Load Time] --> B[Bundle Size]
        B --> C[User Interactions]
        C --> D[Error Rates]
    end
    
    subgraph API["API Metrics"]
        E[Response Time] --> F[Throughput]
        F --> G[Error Rates]
        G --> H[Cache Hit Ratio]
    end
    
    subgraph Blockchain["Blockchain Metrics"]
        I[Gas Usage] --> J[Transaction Time]
        J --> K[Pyth Entropy Latency]
        K --> L[Success Rates]
    end
    
    subgraph DataStreams["Somnia Data Streams Metrics"]
        M[WebSocket Latency] --> N[Event Throughput]
        N --> O[Broadcast Success]
        O --> P[Connection Stability]
    end
    
    subgraph Database["Database Metrics"]
        Q[Query Performance] --> R[Connection Pool]
        R --> S[Cache Performance]
        S --> T[Storage Usage]
    end
    
    D --> U[Monitoring Dashboard]
    H --> U
    L --> U
    P --> U
    T --> U
```

## 🔮 Somnia Data Streams Service Architecture

```mermaid
graph TB
    subgraph Service["SomniaStreamsService"]
        A[Initialize SDK] --> B{WebSocket Available?}
        B -->|Yes| C[WebSocket Mode]
        B -->|No| D[HTTP Polling Mode]
        
        C --> E[Real-time Events < 1s]
        D --> F[5-Second Polling]
    end
    
    subgraph EventProcessing["Event Processing"]
        E --> G[Parse Game Result]
        F --> G
        G --> H[Validate Event]
        H --> I[Deduplicate]
        I --> J[Format Notification]
    end
    
    subgraph Callbacks["Event Callbacks"]
        J --> K[onGameResult]
        K --> L[Update UI State]
        L --> M[Show Notification]
    end
    
    subgraph Recovery["Connection Recovery"]
        N[Connection Lost] --> O[Exponential Backoff]
        O --> P{Retry Count < 5?}
        P -->|Yes| Q[Reconnect]
        P -->|No| R[Fallback to Polling]
        Q --> B
        R --> D
    end
```

## 🎯 User Journey Flow

```mermaid
journey
    title User Gaming Experience with Real-time Updates
    section Discovery
      Visit Website: 5: User
      Browse Games: 4: User
      Read About Fairness: 3: User
    section Onboarding
      Connect Wallet: 3: User
      Switch to Somnia Testnet: 2: User
      Verify Connection: 4: User
      Subscribe to Data Streams: 4: System
    section Gaming
      Select Game: 5: User
      Place Bet: 4: User
      Wait for Entropy: 2: User
      See Outcome: 5: User
      Receive SDS Notification: 5: System
    section Social
      See Other Players' Results: 4: User
      Real-time Activity Feed: 5: System
      Community Engagement: 4: User
    section Continuation
      Play Again: 4: User
      Try Different Game: 3: User
      Cash Out: 4: User
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

## 🔄 Smart Account Transaction Flow with SDS

```mermaid
sequenceDiagram
    participant U as User
    participant UI as Casino UI
    participant SA as Smart Account
    participant ST as Somnia Testnet
    participant GL as Game Logger
    participant SDS as Somnia Data Streams
    participant AS as Arbitrum Sepolia
    participant PE as Pyth Entropy
    participant AC as All Clients
    
    Note over U,AC: Smart Account Batch Gaming Session
    
    U->>UI: Select Multiple Games
    UI->>SA: Prepare Batch Transaction
    
    rect rgb(200, 255, 200)
        Note over SA,ST: Batch Transaction on Somnia Testnet
        SA->>ST: Batch Bet Transaction
        ST->>SA: Confirm All Bets
    end
    
    rect rgb(200, 200, 255)
        Note over AS,PE: Entropy Generation on Arbitrum
        UI->>AS: Request Entropy for All Games
        AS->>PE: Generate Multiple Random Numbers
        PE->>AS: Return Entropy Proofs
        AS->>UI: All Game Results
    end
    
    rect rgb(255, 255, 200)
        Note over GL,SDS: Real-time Broadcast via SDS
        UI->>GL: Log All Game Results
        GL->>SDS: Emit GameResultLogged Events
        SDS->>AC: Broadcast to All Connected Clients
    end
    
    rect rgb(255, 200, 200)
        Note over SA,ST: Batch Payout on Somnia Testnet
        UI->>SA: Process Batch Payouts
        SA->>ST: Batch Payout Transaction
        ST->>SA: Confirm All Payouts
    end
    
    SA->>UI: Update All Game States
    UI->>U: Display All Results
    AC->>AC: Show Notifications to All Players
    
    Note over U,AC: Single transaction for multiple games with real-time updates!
```

## 📊 Performance Comparison: EOA vs Smart Account

```mermaid
graph LR
    subgraph Metrics["Performance Metrics"]
        subgraph EOA_Perf["EOA Performance"]
            E1[1 Game = 1 TX]
            E2[Manual Confirmations]
            E3[Higher Gas per Game]
            E4[Slower UX]
        end
        
        subgraph SA_Perf["Smart Account Performance"]
            S1[5 Games = 1 TX]
            S2[Batch Confirmations]
            S3[Optimized Gas]
            S4[Faster UX]
        end
    end
    
    subgraph Comparison["Direct Comparison"]
        subgraph Time["Time Efficiency"]
            T1[EOA: 5 minutes for 5 games]
            T2[Smart Account: 1 minute for 5 games]
        end
        
        subgraph Cost["Cost Efficiency"]
            C1[EOA: 5x Gas Costs]
            C2[Smart Account: 1.2x Gas Cost]
        end
        
        subgraph UX["User Experience"]
            U1[EOA: 5 Confirmations]
            U2[Smart Account: 1 Confirmation]
        end
    end
    
    E1 --> T1
    S1 --> T2
    E3 --> C1
    S3 --> C2
    E2 --> U1
    S2 --> U2
```

## 📡 Complete Data Streams Integration

```mermaid
graph TB
    subgraph Frontend["Frontend Layer"]
        A[useSomniaStreams Hook] --> B[GlobalNotificationSystem]
        B --> C[Toast Notifications]
        B --> D[Activity Feed]
    end
    
    subgraph Service["SomniaStreamsService"]
        E[SDK Initialization] --> F[Schema Registration]
        F --> G[Event Subscription]
        G --> H[Event Processing]
    end
    
    subgraph Config["Configuration"]
        I[Schema ID: apt-casino-game-result-logged]
        J[Contract: SomniaGameLogger]
        K[Protocol: 0x6AB397FF...048Fc]
    end
    
    subgraph EventTypes["Event Types"]
        L[ROULETTE] --> M[Game Result Event]
        N[MINES] --> M
        O[PLINKO] --> M
        P[WHEEL] --> M
    end
    
    subgraph Delivery["Event Delivery"]
        Q[WebSocket Primary] --> R{Connected?}
        R -->|Yes| S[Real-time < 1s]
        R -->|No| T[HTTP Polling 5s]
    end
    
    A --> E
    H --> B
    I --> G
    J --> G
    M --> H
    S --> C
    T --> C
```

This comprehensive set of Mermaid diagrams provides visual representations of all major architectural components and flows in the APT Casino Somnia application, featuring:

- **Somnia Testnet** - Main gaming network (Chain ID: 50312)
- **Somnia Data Streams** - Real-time event broadcasting
- **Pyth Entropy** - Cryptographically secure randomness on Arbitrum Sepolia
- **Smart Account Integration** - Enhanced gaming with batch transactions
- **Real-time Notifications** - Live activity feed for all connected players
