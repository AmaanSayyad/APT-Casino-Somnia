// Network Configuration
export const ARBITRUM_NETWORKS = {
  SEPOLIA: 'arbitrum-sepolia',
  MAINNET: 'arbitrum-one',
  DEVNET: 'arbitrum-devnet'
};

export const SOMNIA_NETWORKS = {
  TESTNET: 'somnia-testnet',
};

// Arbitrum Network URLs
export const ARBITRUM_NETWORK_URLS = {
  [ARBITRUM_NETWORKS.SEPOLIA]: "https://sepolia-rollup.arbitrum.io/rpc",
  [ARBITRUM_NETWORKS.MAINNET]: "https://arb1.arbitrum.io/rpc",
  [ARBITRUM_NETWORKS.DEVNET]: "http://localhost:8545"
};

// Arbitrum Faucet URLs
export const ARBITRUM_FAUCET_URLS = {
  [ARBITRUM_NETWORKS.SEPOLIA]: "https://faucet.triangleplatform.com/arbitrum/sepolia",
  [ARBITRUM_NETWORKS.DEVNET]: "http://localhost:8545"
};

// Arbitrum Explorer URLs
export const ARBITRUM_EXPLORER_URLS = {
  [ARBITRUM_NETWORKS.SEPOLIA]: "https://sepolia.arbiscan.io",
  [ARBITRUM_NETWORKS.MAINNET]: "https://arbiscan.io",
  [ARBITRUM_NETWORKS.DEVNET]: "http://localhost:8545"
};

// Somnia Network URLs
export const SOMNIA_NETWORK_URLS = {
  [SOMNIA_NETWORKS.TESTNET]: "https://dream-rpc.somnia.network",
};

// Somnia Explorer URLs
export const SOMNIA_EXPLORER_URLS = {
  [SOMNIA_NETWORKS.TESTNET]: "https://shannon-explorer.somnia.network",
};

// Default network (can be changed via environment variable)
export const DEFAULT_NETWORK = SOMNIA_NETWORKS.TESTNET;

// Somnia Contract Addresses
export const SOMNIA_CONTRACTS = {
  [SOMNIA_NETWORKS.TESTNET]: {
    treasury: process.env.NEXT_PUBLIC_SOMNIA_TREASURY_ADDRESS || "0xacA996A4d49e7Ed42dA68a20600F249BE6d024A4",
    gameLogger: process.env.NEXT_PUBLIC_SOMNIA_GAME_LOGGER_ADDRESS || "0x649A1a3cf745d60C98C12f3c404E09bdBb4151db",
    streams: process.env.NEXT_PUBLIC_SOMNIA_STREAMS_ADDRESS || "0x6AB397FF662e42312c003175DCD76EfF69D048Fc"
  }
};

// Casino Module Configuration
export const CASINO_MODULE_CONFIG = {
  [ARBITRUM_NETWORKS.SEPOLIA]: {
    moduleAddress: process.env.NEXT_PUBLIC_CASINO_MODULE_ADDRESS || "0x1234567890123456789012345678901234567890123456789012345678901234",
    moduleName: "casino",
    rouletteModule: "roulette",
    minesModule: "mines",
    wheelModule: "wheel"
  },
  [ARBITRUM_NETWORKS.MAINNET]: {
    moduleAddress: process.env.NEXT_PUBLIC_CASINO_MODULE_ADDRESS || "0x1234567890123456789012345678901234567890123456789012345678901234",
    moduleName: "casino",
    rouletteModule: "roulette",
    minesModule: "mines",
    wheelModule: "wheel"
  },
  [ARBITRUM_NETWORKS.DEVNET]: {
    moduleAddress: process.env.NEXT_PUBLIC_CASINO_MODULE_ADDRESS || "0x1234567890123456789012345678901234567890123456789012345678901234",
    moduleName: "casino",
    rouletteModule: "roulette",
    minesModule: "mines",
    wheelModule: "wheel"
  }
};

// Token Configuration
export const TOKEN_CONFIG = {
  ARB: {
    name: "Arbitrum ETH",
    symbol: "ARB",
    decimals: 18,
    type: "native"
  },
  ARB_ETH: {
    name: "Arbitrum ETH",
    symbol: "ARB",
    decimals: 18,
    type: "native"
  },
  STT: {
    name: "Somnia Testnet Token",
    symbol: "STT",
    decimals: 18,
    type: "native"
  }
};

// Network Information
export const NETWORK_INFO = {
  [ARBITRUM_NETWORKS.SEPOLIA]: {
    name: "Arbitrum Sepolia",
    chainId: 421614,
    nativeCurrency: TOKEN_CONFIG.ARB,
    explorer: ARBITRUM_EXPLORER_URLS[ARBITRUM_NETWORKS.SEPOLIA],
    faucet: ARBITRUM_FAUCET_URLS[ARBITRUM_NETWORKS.SEPOLIA]
  },
  [ARBITRUM_NETWORKS.MAINNET]: {
    name: "Arbitrum One",
    chainId: 42161,
    nativeCurrency: TOKEN_CONFIG.ARB,
    explorer: ARBITRUM_EXPLORER_URLS[ARBITRUM_NETWORKS.MAINNET]
  },
  [ARBITRUM_NETWORKS.DEVNET]: {
    name: "Arbitrum Devnet",
    chainId: 1337,
    nativeCurrency: TOKEN_CONFIG.ARB,
    explorer: ARBITRUM_EXPLORER_URLS[ARBITRUM_NETWORKS.DEVNET],
    faucet: ARBITRUM_FAUCET_URLS[ARBITRUM_NETWORKS.DEVNET]
  },
  [SOMNIA_NETWORKS.TESTNET]: {
    name: "Somnia Testnet",
    chainId: 50312,
    nativeCurrency: TOKEN_CONFIG.STT,
    explorer: SOMNIA_EXPLORER_URLS[SOMNIA_NETWORKS.TESTNET]
  }
};

// Export default configuration
export default {
  ARBITRUM_NETWORKS,
  ARBITRUM_NETWORK_URLS,
  ARBITRUM_FAUCET_URLS,
  ARBITRUM_EXPLORER_URLS,
  SOMNIA_NETWORKS,
  SOMNIA_NETWORK_URLS,
  SOMNIA_EXPLORER_URLS,
  SOMNIA_CONTRACTS,
  DEFAULT_NETWORK,
  CASINO_MODULE_CONFIG,
  TOKEN_CONFIG,
  NETWORK_INFO
}; 