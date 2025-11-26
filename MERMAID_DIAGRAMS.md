# APT Casino Monad - Mermaid Architecture Diagrams

## 🏗️ System Architecture Overview

```mermaid
graph TB
    subgraph Frontend["Frontend Layer"]
        A[Next.js App] --> B[React Components]
        B --> C[Three.js Games]
        B --> D[Material-UI]
        B --> E[RainbowKit + MetaMask Smart Accounts]
        E --> SA[Smart Account Detection]
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
    end
    
    subgraph Gaming["Gaming Network - Monad Testnet"]
        MT[Monad Testnet] --> MON[MON Token]
        MT --> DEP[Deposits/Withdrawals]
        MT --> SA_BATCH[Batch Transactions]
    end
    
    subgraph Entropy["Entropy Network - Arbitrum Sepolia"]
        AS[Arbitrum Sepolia] --> N[CasinoEntropyConsumer]
        N --> O[Pyth Entropy]
        O --> P[Pyth Network]
    end
    
    subgraph Data["Data Layer"]
        Q[PostgreSQL] --> R[User Data]
        S[Redis Cache] --> T[Session Data]
        S --> U[Game State]
        S --> SAC[Smart Account Cache]
    end
    
    A --> F
    B --> I
    I --> MT
    I --> AS
    I --> Q
    I --> S
    N --> I
    SA --> SAA
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
    
    U->>B: Access Application
    B->>N: Load App Router
    N->>P: Initialize Providers
    P->>W: Setup Wagmi Config
    W->>R: Initialize RainbowKit
    R->>P: Wallet UI Ready
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
    L -->|Monad Testnet| M[Connection Success]
    L -->|Wrong Network| N[Switch to Monad Testnet]
    
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

## �  Multi-Network Architecture (Monad + Arbitrum)

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
    
    subgraph MonadNet["Monad Testnet (Chain ID: 10143)"]
        MT[Monad Testnet] --> MON[MON Token]
        MON --> DEP[Deposit Contract]
        MON --> WITH[Withdraw Contract]
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
    participant MT as Monad Testnet
    participant API as API Route
    participant SC as Smart Contract (Arbitrum)
    participant PE as Pyth Entropy
    participant DB as Database
    
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
```

## 🏗️ Smart Contract Deployment Flow

```mermaid
flowchart TD
    A[Environment Setup] --> B[Load .env.local]
    B --> C[Hardhat Compilation]
    C --> D[Deploy Script]
    
    D --> E{Pyth Entropy Setup?}
    E -->|No| F[Configure Pyth Entropy]
    E -->|Yes| G[Use Existing Config]
    
    F --> H[Set Provider Address]
    G --> I[Deploy CasinoEntropyConsumer]
    H --> I
    
    I --> J[Verify on Arbiscan]
    J --> K[Set Treasury Address]
    K --> L[Save Deployment Info]
    
    L --> M[Test Entropy Function]
    M --> N{Test Success?}
    N -->|Yes| O[Deployment Complete]
    N -->|No| P[Debug & Retry]
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
    CashOut --> GameEnd
    MineTile --> GameEnd
    
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
    
    subgraph Physics["Physics Simulation"]
        H[Matter.js] --> I[Gravity]
        I --> J[Collision Detection]
        J --> K[Bounce Physics]
    end
    
    subgraph Visual["Visual Rendering"]
        L[Three.js] --> M[3D Ball]
        M --> N[Peg Animation]
        N --> O[Trail Effects]
    end
    
    B --> H
    E --> L
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
```

## 🔐 Security & Access Control

```mermaid
graph TB
    subgraph Access["Access Control Layers"]
        A[Public Functions] --> B[User Interface]
        C[Treasury Functions] --> D[Game Operations]
        E[Owner Functions] --> F[Admin Operations]
    end
    
    subgraph Contract["Smart Contract Security"]
        G[onlyTreasury Modifier] --> H[request]
        I[onlyOwner Modifier] --> J[updateTreasury]
        I --> K[updateEntropyConfig]
        I --> L[withdrawFees]
    end
    
    subgraph Frontend["Frontend Security"]
        M[Wallet Verification] --> N[Network Validation]
        N --> O[Transaction Signing]
        O --> P[Gas Estimation]
    end
    
    D --> G
    F --> I
    B --> M
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
    
    subgraph Persistence["Data Persistence"]
        O[PostgreSQL] --> P[User Data]
        O --> Q[Game History]
        R[Redis] --> S[Session Cache]
        R --> T[Game State]
    end
    
    D --> E
    E --> K
    K --> O
    K --> R
```

## 🔄 Request-Response Cycle

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API
    participant S as Smart Contract
    participant PE as Pyth Entropy
    participant D as Database
    
    U->>F: Game Action
    F->>A: API Request
    A->>S: Contract Call
    S->>PE: Entropy Request
    
    Note over PE: Generate Entropy
    
    PE->>S: entropyCallback
    S->>A: Event Emission
    A->>D: Store Result
    A->>F: Response
    F->>U: Update UI
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
    
    O --> P[Manual Testing]
    P --> Q{Ready for Prod?}
    Q -->|No| R[More Changes]
    Q -->|Yes| S[Production Deploy]
    
    R --> A
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
    
    subgraph Database["Database Metrics"]
        M[Query Performance] --> N[Connection Pool]
        N --> O[Cache Performance]
        O --> P[Storage Usage]
    end
    
    D --> Q[Monitoring Dashboard]
    H --> Q
    L --> Q
    P --> Q
```

## 🔮 Pyth Entropy Service Integration

```mermaid
graph TB
    subgraph Frontend["Frontend Layer"]
        A[Game Component] --> B[PythEntropyService]
        B --> C[API Call]
    end
    
    subgraph API["API Layer"]
        D[Next.js API Route] --> E[Pyth Entropy Service]
        E --> F[Hardhat Script]
    end
    
    subgraph Contract["Smart Contract Layer"]
        G[CasinoEntropyConsumer] --> H[request Function]
        H --> I[Pyth Entropy Contract]
    end
    
    subgraph Pyth["Pyth Network"]
        J[Pyth Provider] --> K[Entropy Generation]
        K --> L[Callback to Contract]
    end
    
    subgraph Processing["Result Processing"]
        M[Game Processors] --> N[MinesResultProcessor]
        M --> O[PlinkoResultProcessor]
        M --> P[RouletteResultProcessor]
        M --> Q[WheelResultProcessor]
    end
    
    C --> D
    F --> G
    I --> J
    L --> M
    N --> A
    O --> A
    P --> A
    Q --> A
```

## 🎯 User Journey Flow

```mermaid
journey
    title User Gaming Experience
    section Discovery
      Visit Website: 5: User
      Browse Games: 4: User
      Read About Fairness: 3: User
    section Onboarding
      Connect Wallet: 3: User
      Switch Network: 2: User
      Verify Connection: 4: User
    section Gaming
      Select Game: 5: User
      Place Bet: 4: User
      Wait for Result: 2: User
      See Outcome: 5: User
    section Continuation
      Play Again: 4: User
      Try Different Game: 3: User
      Cash Out: 4: User
```

This comprehensive set of Mermaid diagrams provides visual representations of all major architectural components and flows in the APT Casino application, making it easier to understand the complex interactions between different system layers. The diagrams now accurately reflect the current Pyth Entropy integration for random number generation instead of Pyth Entropy.
## 🎯 
Smart Account Gaming Benefits

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
    participant MT as Monad Testnet
    participant AS as Arbitrum Sepolia
    participant PE as Pyth Entropy
    
    Note over U,PE: Smart Account Batch Gaming Session
    
    U->>UI: Select Multiple Games
    UI->>SA: Prepare Batch Transaction
    
    rect rgb(200, 255, 200)
        Note over SA,MT: Batch Transaction on Monad
        SA->>MT: Batch Bet Transaction
        MT->>SA: Confirm All Bets
    end
    
    rect rgb(200, 200, 255)
        Note over AS,PE: Entropy Generation on Arbitrum
        UI->>AS: Request Entropy for All Games
        AS->>PE: Generate Multiple Random Numbers
        PE->>AS: Return Entropy Proofs
        AS->>UI: All Game Results
    end
    
    rect rgb(255, 200, 200)
        Note over SA,MT: Batch Payout on Monad
        UI->>SA: Process Batch Payouts
        SA->>MT: Batch Payout Transaction
        MT->>SA: Confirm All Payouts
    end
    
    SA->>UI: Update All Game States
    UI->>U: Display All Results
    
    Note over U,PE: Single transaction for multiple games!
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