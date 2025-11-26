/**
 * Pyth Entropy Configuration for Monad Testnet
 * Configuration for Pyth Network Entropy random number generation
 */

export const PYTH_ENTROPY_CONFIG = {
  // Primary network - Monad Testnet
  NETWORK: {
    chainId: 10143,
    name: 'Monad Testnet',
    rpcUrl: process.env.NEXT_PUBLIC_MONAD_TESTNET_RPC || 'https://testnet-rpc.monad.xyz',
    entropyContract: process.env.NEXT_PUBLIC_MONAD_PYTH_ENTROPY_CONTRACT || '0x36825bf3fbdf5a29e2d5148bfe7dcf7b5639e320',
    entropyProvider: process.env.NEXT_PUBLIC_MONAD_PYTH_ENTROPY_PROVIDER || '0x6CC14824Ea2918f5De5C2f75A9Da968ad4BD6344',
    explorerUrl: process.env.NEXT_PUBLIC_MONAD_TESTNET_EXPLORER || 'https://testnet.monadexplorer.com',
    entropyExplorerUrl: 'https://entropy-explorer.pyth.network/?chain=monad-testnet&search=',
    currency: 'MON',
    currencySymbol: 'MON',
    currencyDecimals: 18
  },

  // Supported networks (for backward compatibility)
  NETWORKS: {
    'monad-testnet': {
      chainId: 10143,
      name: 'Monad Testnet',
      rpcUrl: process.env.NEXT_PUBLIC_MONAD_TESTNET_RPC || 'https://testnet-rpc.monad.xyz',
      entropyContract: process.env.NEXT_PUBLIC_MONAD_PYTH_ENTROPY_CONTRACT || '0x36825bf3fbdf5a29e2d5148bfe7dcf7b5639e320',
      entropyProvider: process.env.NEXT_PUBLIC_MONAD_PYTH_ENTROPY_PROVIDER || '0x6CC14824Ea2918f5De5C2f75A9Da968ad4BD6344',
      explorerUrl: process.env.NEXT_PUBLIC_MONAD_TESTNET_EXPLORER || 'https://testnet.monadexplorer.com',
      entropyExplorerUrl: 'https://entropy-explorer.pyth.network/?chain=monad-testnet&search=',
      currency: 'MON',
      currencySymbol: 'MON',
      currencyDecimals: 18
    }
  },

  // Default network
  DEFAULT_NETWORK: 'monad-testnet',

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
    supportedChains: ['monad-testnet'],
    // Transaction link format
    transactionLinkFormat: 'https://entropy-explorer.pyth.network/tx/{txHash}',
    // Monad Testnet specific explorer
    monadTestnetUrl: 'https://entropy-explorer.pyth.network/?chain=monad-testnet&search='
  },

  /**
   * Get network configuration by chain ID or name
   * @param {string|number} network - Network name or chain ID
   * @returns {Object} Network configuration
   */
  getNetworkConfig(network) {
    // Always return Monad Testnet configuration
    if (typeof network === 'number' && network === 10143) {
      return this.NETWORK;
    }
    if (network === 'monad-testnet' || !network) {
      return this.NETWORK;
    }
    // Fallback to primary network
    return this.NETWORK;
  },

  /**
   * Get entropy contract address for network
   * @param {string} network - Network name
   * @returns {string} Contract address
   */
  getEntropyContract(network) {
    // Always return Monad Testnet entropy contract
    return this.NETWORK.entropyContract;
  },

  /**
   * Get entropy provider address for network
   * @param {string} network - Network name
   * @returns {string} Provider address
   */
  getEntropyProvider(network) {
    // Always return Monad Testnet entropy provider
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
      return `https://entropy-explorer.pyth.network/?chain=monad-testnet&search=${txHash}`;
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
      return network === 10143; // Monad Testnet chain ID
    }
    return network === 'monad-testnet' || !network;
  },

  /**
   * Get all supported networks
   * @returns {Array} Array of network names
   */
  getSupportedNetworks() {
    return ['monad-testnet'];
  },

  /**
   * Get current network configuration
   * @returns {Object} Current network configuration
   */
  getCurrentNetwork() {
    return this.NETWORK;
  },

  /**
   * Check if current network is Monad Testnet
   * @returns {boolean} True if Monad Testnet
   */
  isMonadTestnet() {
    return true; // Always true since we only support Monad Testnet
  }
};

export default PYTH_ENTROPY_CONFIG;
