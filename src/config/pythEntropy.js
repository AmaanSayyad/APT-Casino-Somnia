/**
 * Pyth Entropy Configuration for Arbitrum Sepolia
 * Configuration for Pyth Network Entropy random number generation
 * 
 * IMPORTANT: Pyth Entropy remains on Arbitrum Sepolia for all games,
 * even though game logging and deposits/withdrawals happen on Somnia Testnet.
 */

export const PYTH_ENTROPY_CONFIG = {
  // Primary network - Arbitrum Sepolia (for entropy generation)
  NETWORK: {
    chainId: 421614,
    name: 'Arbitrum Sepolia',
    rpcUrl: process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC || 'https://sepolia-rollup.arbitrum.io/rpc',
    entropyContract: process.env.NEXT_PUBLIC_PYTH_ENTROPY_CONTRACT || '0x549ebba8036ab746611b4ffa1423eb0a4df61440',
    entropyProvider: process.env.NEXT_PUBLIC_PYTH_ENTROPY_PROVIDER || '0x6CC14824Ea2918f5De5C2f75A9Da968ad4BD6344',
    explorerUrl: process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_EXPLORER || 'https://sepolia.arbiscan.io',
    entropyExplorerUrl: 'https://entropy-explorer.pyth.network/?chain=arbitrum-sepolia&search=',
    currency: 'ETH',
    currencySymbol: 'ETH',
    currencyDecimals: 18
  },

  // Supported networks (for backward compatibility)
  NETWORKS: {
    'arbitrum-sepolia': {
      chainId: 421614,
      name: 'Arbitrum Sepolia',
      rpcUrl: process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC || 'https://sepolia-rollup.arbitrum.io/rpc',
      entropyContract: process.env.NEXT_PUBLIC_PYTH_ENTROPY_CONTRACT || '0x549ebba8036ab746611b4ffa1423eb0a4df61440',
      entropyProvider: process.env.NEXT_PUBLIC_PYTH_ENTROPY_PROVIDER || '0x6CC14824Ea2918f5De5C2f75A9Da968ad4BD6344',
      explorerUrl: process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_EXPLORER || 'https://sepolia.arbiscan.io',
      entropyExplorerUrl: 'https://entropy-explorer.pyth.network/?chain=arbitrum-sepolia&search=',
      currency: 'ETH',
      currencySymbol: 'ETH',
      currencyDecimals: 18
    }
  },

  // Default network
  DEFAULT_NETWORK: 'arbitrum-sepolia',

  // Game types supported
  GAME_TYPES: {
    MINES: 0,
    PLINKO: 1,
    ROULETTE: 2,
    WHEEL: 3
  },

  // Entropy request configuration
  REQUEST_CONFIG: {
    // Gas limit for entropy requests
    gasLimit: 500000,
    // Maximum gas price (in wei)
    maxGasPrice: '1000000000', // 1 gwei
    // Request timeout (in milliseconds)
    timeout: 30000,
    // Retry configuration
    maxRetries: 3,
    retryDelay: 1000
  },

  // Entropy Explorer configuration
  EXPLORER_CONFIG: {
    baseUrl: 'https://entropy-explorer.pyth.network',
    // Supported chains for explorer
    supportedChains: ['arbitrum-sepolia'],
    // Transaction link format
    transactionLinkFormat: 'https://entropy-explorer.pyth.network/tx/{txHash}',
    // Arbitrum Sepolia specific explorer
    arbitrumSepoliaUrl: 'https://entropy-explorer.pyth.network/?chain=arbitrum-sepolia&search='
  },

  /**
   * Get network configuration by chain ID or name
   * @param {string|number} network - Network name or chain ID
   * @returns {Object} Network configuration
   */
  getNetworkConfig(network) {
    // Always return Arbitrum Sepolia configuration for entropy
    if (typeof network === 'number' && network === 421614) {
      return this.NETWORK;
    }
    if (network === 'arbitrum-sepolia' || !network) {
      return this.NETWORK;
    }
    // Fallback to primary network (Arbitrum Sepolia)
    return this.NETWORK;
  },

  /**
   * Get entropy contract address for network
   * @param {string} network - Network name
   * @returns {string} Contract address
   */
  getEntropyContract(network) {
    // Always return Arbitrum Sepolia entropy contract
    return this.NETWORK.entropyContract;
  },

  /**
   * Get entropy provider address for network
   * @param {string} network - Network name
   * @returns {string} Provider address
   */
  getEntropyProvider(network) {
    // Always return Arbitrum Sepolia entropy provider
    return this.NETWORK.entropyProvider;
  },

  /**
   * Get explorer URL for transaction
   * @param {string} txHash - Transaction hash
   * @param {string} network - Network name
   * @returns {string} Explorer URL
   */
  getExplorerUrl(txHash, network) {
    const config = this.getNetworkConfig(network);
    return `${config.explorerUrl}/tx/${txHash}`;
  },

  /**
   * Get Entropy Explorer URL for transaction
   * @param {string} txHash - Transaction hash
   * @returns {string} Entropy Explorer URL
   */
  getEntropyExplorerUrl(txHash) {
    if (txHash) {
      return `https://entropy-explorer.pyth.network/?chain=arbitrum-sepolia&search=${txHash}`;
    }
    return this.NETWORK.entropyExplorerUrl;
  },

  /**
   * Validate network support
   * @param {string|number} network - Network name or chain ID
   * @returns {boolean} True if supported
   */
  isNetworkSupported(network) {
    if (typeof network === 'number') {
      return network === 421614; // Arbitrum Sepolia chain ID
    }
    return network === 'arbitrum-sepolia' || !network;
  },

  /**
   * Get all supported networks
   * @returns {Array} Array of network names
   */
  getSupportedNetworks() {
    return ['arbitrum-sepolia'];
  },

  /**
   * Get current network configuration
   * @returns {Object} Current network configuration
   */
  getCurrentNetwork() {
    return this.NETWORK;
  },

  /**
   * Check if current network is Arbitrum Sepolia
   * @returns {boolean} True if Arbitrum Sepolia
   */
  isArbitrumSepolia() {
    return true; // Always true since we only support Arbitrum Sepolia for entropy
  }
};

export default PYTH_ENTROPY_CONFIG;

